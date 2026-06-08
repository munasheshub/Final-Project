# AI Fraud Detection Integration — Architecture Diagram

```
═══════════════════════════════════════════════════════════════════════════════════════
                    CERTIFYCHAIN AI FRAUD DETECTION — REQUEST FLOW
═══════════════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ANGULAR WEB APP (localhost:4200)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │  Step 1  │──▶│  Step 2  │──▶│  Step 3  │──▶│ Step 3.5 │──▶│  Step 4  │    │
│  │ Student  │   │  Details │   │   PDF    │   │    AI    │   │Blockchain│    │
│  │Selection │   │  Form    │   │  Upload  │   │Screening │   │  Tx Sign │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
│                                       │              │               │          │
│                                       │              │               │          │
│                              IPFS Upload             │               │          │
│                            (via backend)             │               │          │
│                                       │              │               │          │
└───────────────────────────────────────┼──────────────┼───────────────┼──────────┘
                                        │              │               │
                    ┌───────────────────┘              │               │
                    │                                  │               │
                    ▼                                  ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    .NET 10 BACKEND API (localhost:7270)                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  POST /api/ipfs/upload         POST /api/certificates/analyse-image             │
│  ─────────────────────         ──────────────────────────────────               │
│  Request: multipart/form-data   Request: multipart/form-data (IFormFile)        │
│  Response: { cid: "Qm..." }    ┌────────────────────────────────────┐          │
│                                 │  AiFraudDetectionService            │          │
│                                 │  ─────────────────────────         │          │
│                                 │  1. Read file bytes                 │          │
│                                 │  2. Convert to base64              │          │
│                                 │  3. POST to Python AI service      │          │
│                                 └──────────────┬─────────────────────┘          │
│                                                │                                │
│  POST /api/certificates/issue-with-screening   │   POST /api/certificates       │
│  ────────────────────────────────────────────  │   ────────────────────────     │
│  (Full flow: AI + decision gate + issuance)    │   (Normal issuance)            │
│                                                │                                │
└────────────────────────────────────────────────┼────────────────────────────────┘
                                                 │
                           HTTP POST (JSON)       │
                           Timeout: 30s           │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                 PYTHON FastAPI AI SERVICE (localhost:8000)                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  POST /api/ai/detect                                                            │
│  ────────────────────                                                           │
│  Request:  { "image_base64": "<base64>", "filename": "cert.pdf" }               │
│                                                                                 │
│  Pipeline: ┌──────────┐    ┌───────────────┐    ┌──────────────┐               │
│            │  Decode  │───▶│  ResNet50V2   │───▶│   XGBoost    │               │
│            │  Base64  │    │  (2048 feats) │    │  Classifier  │               │
│            └──────────┘    └───────────────┘    └──────┬───────┘               │
│                                    │                    │                        │
│                            ┌───────▼───────┐           │                        │
│                            │  Handcrafted  │           │                        │
│                            │  Features (5) │───────────┤                        │
│                            └───────────────┘           │                        │
│                                                        ▼                        │
│  Response: {                                                                    │
│    "fraud_probability": 0.87,                                                   │
│    "risk_level": "HIGH",                                                        │
│    "verdict": "FRAUD DETECTED",                                                 │
│    "action": "Certificate blocked — institution notified",                      │
│    "inference_ms": 195,                                                         │
│    "forgery_type": "text_alteration",                                           │
│    "handcrafted_features": {                                                    │
│      "noise_level": 22.4, "edge_density": 14.2,                                │
│      "colour_uniformity": 48.1, "brightness_entropy": 1.9,                     │
│      "ratio_deviation": 0.03                                                    │
│    }                                                                            │
│  }                                                                              │
│                                                                                 │
│  GET /health → { "status": "ok", "model_loaded": true }                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════════════
                          DECISION GATE (in .NET Backend)
═══════════════════════════════════════════════════════════════════════════════════════

                         AI Result Received
                                │
                    ┌───────────┴───────────┐
                    │                       │
            fraud_probability          verdict ==
                    │              "AI_SERVICE_UNAVAILABLE"
                    │                       │
         ┌──────────┼──────────┐            ▼
         │          │          │     ┌──────────────┐
         ▼          ▼          ▼     │  PROCEED +   │
   ┌──────────┐ ┌────────┐ ┌────┐   │  WARNING     │
   │  ≥ 0.70  │ │0.30-0.7│ │<0.3│   │  HTTP 200    │
   │  BLOCKED │ │FLAGGED │ │PASS│   └──────────────┘
   └────┬─────┘ └───┬────┘ └─┬──┘
        │            │        │
        ▼            ▼        ▼
┌──────────────┐ ┌─────────────────┐ ┌──────────────────────────────────┐
│  HTTP 422    │ │    HTTP 202     │ │          HTTP 200                │
│──────────────│ │─────────────────│ │──────────────────────────────────│
│{             │ │{                │ │ Proceed to normal flow:          │
│ blocked:true │ │ blocked: false  │ │                                  │
│ verdict:     │ │ flagged: true   │ │  ┌────────────┐  ┌───────────┐  │
│  "FRAUD      │ │ requires_review:│ │  │IPFS Upload │─▶│ Ethereum  │  │
│   DETECTED"  │ │  true           │ │  │(Pinata)    │  │Blockchain │  │
│ fraud_prob:  │ │ ai_log_id: guid │ │  └────────────┘  └───────────┘  │
│  0.87        │ │ message: "..."  │ │                                  │
│ forgery_type:│ │}                │ │ Response: { data, ai_score: 0.12 │
│  "text_alt.."│ │                 │ │            ai_log_id: guid }     │
│ ai_log_id:   │ │                 │ │                                  │
│  guid        │ │                 │ │                                  │
│}             │ │                 │ │                                  │
└──────────────┘ └────────┬────────┘ └──────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   AiDetectionLog      │
              │   (SQL Server)        │
              │───────────────────────│
              │ + FraudProbability     │
              │ + RiskLevel           │
              │ + Verdict             │
              │ + ForgeryType         │
              │ + HandcraftedFeatures │
              │ + ReviewOutcome: null │
              │   (pending review)    │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  HUMAN REVIEW QUEUE   │
              │  /certificates/ai-flags│
              │───────────────────────│
              │  POST /api/certificates│
              │  /review/{aiLogId}    │
              │                       │
              │  Outcomes:            │
              │  • CONFIRMED_FRAUD    │
              │    → permanently      │
              │      blocked          │
              │  • FALSE_POSITIVE     │
              │    → proceed to       │
              │      issuance         │
              └───────────────────────┘


═══════════════════════════════════════════════════════════════════════════════════════
                         DATABASE WRITE POINTS
═══════════════════════════════════════════════════════════════════════════════════════

  ① AiDetectionLog record created (every AI scan)
     → Table: AiDetectionLogs
     → Filtered by TenantId (multi-tenancy)

  ② Certificate record created (only if CLEARED or FALSE_POSITIVE review)
     → Table: Certificates
     → Status: Verified (after blockchain confirmation)

  ③ AiDetectionLog updated (when human reviews)
     → ReviewedByUserId, ReviewedAt, ReviewOutcome set


═══════════════════════════════════════════════════════════════════════════════════════
                         INFRASTRUCTURE DIAGRAM
═══════════════════════════════════════════════════════════════════════════════════════

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │   Angular    │     │  .NET API    │     │  Python AI   │     │  SQL Server  │
  │  (Netlify /  │────▶│  (Render /   │────▶│  (Docker /   │     │  (site4now)  │
  │  localhost)  │     │  localhost)  │     │  localhost)  │     │              │
  └──────────────┘     └──────┬───────┘     └──────────────┘     └──────────────┘
                              │                                          ▲
                              │         ┌──────────────┐                 │
                              ├────────▶│  Pinata IPFS │                 │
                              │         └──────────────┘                 │
                              │                                          │
                              │         ┌──────────────┐                 │
                              ├────────▶│  Ethereum    │                 │
                              │         │  Sepolia     │                 │
                              │         └──────────────┘                 │
                              │                                          │
                              └──────────────────────────────────────────┘
                                         EF Core (SQL)
```
