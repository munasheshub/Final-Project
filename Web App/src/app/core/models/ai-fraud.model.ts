// src/app/core/models/ai-fraud.model.ts

export interface HandcraftedFeatures {
  noise_level: number;
  edge_density: number;
  colour_uniformity: number;
  brightness_entropy: number;
  ratio_deviation: number;
  [key: string]: number;
}

export interface AiFraudResult {
  fraud_probability: number;
  risk_level: string;
  verdict: string;
  action: string;
  inference_ms: number;
  forgery_type: string;
  handcrafted_features: HandcraftedFeatures;
}

export interface AiFlagRecord {
  aiLogId: string;
  studentName: string;
  institutionName: string;
  fraudProbability: number;
  riskLevel: string;
  forgeryType: string;
  createdAt: string;
}

export interface AiFlagPagedResult {
  items: AiFlagRecord[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AiLogRecord {
  id: string;
  certificateHash: string;
  studentName: string;
  institutionName: string;
  fraudProbability: number;
  riskLevel: string;
  verdict: string;
  forgeryType: string;
  inferenceMs: number;
  createdAt: string;
  reviewOutcome: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
}

export interface AiLogPagedResult {
  data: AiLogRecord[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AiDashboardStats {
  totalScanned: number;
  fraudDetected: number;
  flaggedForReview: number;
  cleared: number;
  averageScore: number;
  dailyScans: { date: string; count: number }[];
}
