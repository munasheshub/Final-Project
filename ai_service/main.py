# ai_service/main.py
# ═══════════════════════════════════════════════════════════════
# CertifyChain AI Fraud Detection Microservice
# ═══════════════════════════════════════════════════════════════
# Run with: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# Production: uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
# ═══════════════════════════════════════════════════════════════

import os
import sys
import time
import base64
import warnings
from contextlib import asynccontextmanager

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
warnings.filterwarnings("ignore")

import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ═══════════════════════════════════════════════════════════════
# REQUEST / RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════

class DetectionRequest(BaseModel):
    image_base64: str
    filename: str


class HandcraftedFeatures(BaseModel):
    noise_level: float
    edge_density: float
    colour_uniformity: float
    brightness_entropy: float
    ratio_deviation: float


class DetectionResponse(BaseModel):
    fraud_probability: float
    risk_level: str
    verdict: str
    action: str
    inference_ms: int
    forgery_type: str
    handcrafted_features: HandcraftedFeatures


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


# ═══════════════════════════════════════════════════════════════
# GLOBAL STATE
# ═══════════════════════════════════════════════════════════════

models = {
    "resnet": None,
    "xgboost": None,
    "loaded": False
}


# ═══════════════════════════════════════════════════════════════
# MODEL LOADING (at startup)
# ═══════════════════════════════════════════════════════════════

def load_models():
    """Load ResNet50V2 and XGBoost model at startup."""
    import tensorflow as tf
    tf.get_logger().setLevel("ERROR")
    from tensorflow.keras.applications import ResNet50V2
    import xgboost as xgb

    print("Loading ResNet50V2 feature extractor...")
    resnet = ResNet50V2(
        weights="imagenet",
        include_top=False,
        pooling="avg",
        input_shape=(224, 224, 3)
    )
    resnet.trainable = False
    models["resnet"] = resnet

    # Load trained XGBoost classifier
    xgb_model_path = os.environ.get("XGBOOST_MODEL_PATH", "xgboost_model.json")
    if os.path.exists(xgb_model_path):
        print(f"Loading XGBoost model from {xgb_model_path}...")
        clf = xgb.XGBClassifier()
        clf.load_model(xgb_model_path)
        models["xgboost"] = clf
    else:
        print(f"WARNING: XGBoost model not found at {xgb_model_path}. Using feature-based heuristic.")
        models["xgboost"] = None

    models["loaded"] = True
    print("Models loaded successfully.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models once at startup using FastAPI lifespan event."""
    load_models()
    yield
    # Cleanup on shutdown (if needed)
    models["resnet"] = None
    models["xgboost"] = None


# ═══════════════════════════════════════════════════════════════
# INFERENCE PIPELINE
# ═══════════════════════════════════════════════════════════════

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Load and preprocess image to 224x224x3 numpy array.
    Supports PNG, JPEG, and PDF (first page extracted)."""
    import io

    # Try opening as image first
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()  # Verify it's a valid image
        img = Image.open(io.BytesIO(image_bytes))  # Re-open after verify
    except Exception:
        # If PIL can't open it, assume PDF and convert first page to image
        try:
            import fitz  # PyMuPDF
            pdf_doc = fitz.open(stream=image_bytes, filetype="pdf")
            page = pdf_doc[0]
            pix = page.get_pixmap(dpi=150)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            pdf_doc.close()
        except Exception as e:
            raise ValueError(f"Cannot process file as image or PDF: {e}")

    img = img.convert("RGB")
    img = img.resize((224, 224), Image.LANCZOS)
    return np.array(img)


def compute_handcrafted_features(image_array: np.ndarray) -> dict:
    """Compute 5 handcrafted document forensics features."""
    from PIL import ImageFilter
    from scipy.stats import entropy

    pil_img = Image.fromarray(image_array.astype(np.uint8))
    gray = np.array(pil_img.convert("L")).astype(np.float64)

    # 1. Noise level
    noise_level = float(np.std(gray - np.roll(gray, 1, axis=0)))

    # 2. Edge density
    edges = np.array(pil_img.filter(ImageFilter.FIND_EDGES).convert("L")).astype(np.float64)
    edge_density = float(np.mean(edges))

    # 3. Colour uniformity
    channel_stds = [np.std(image_array[:, :, c].astype(np.float64)) for c in range(3)]
    colour_uniformity = float(np.mean(channel_stds))

    # 4. Brightness entropy
    hist, _ = np.histogram(gray, bins=64, range=(0, 256), density=True)
    hist = hist + 1e-12
    brightness_entropy = float(entropy(hist, base=2))

    # 5. Ratio deviation
    h, w = image_array.shape[:2]
    ratio_deviation = float(abs((w / h) - 0.707))

    return {
        "noise_level": round(noise_level, 2),
        "edge_density": round(edge_density, 2),
        "colour_uniformity": round(colour_uniformity, 2),
        "brightness_entropy": round(brightness_entropy, 2),
        "ratio_deviation": round(ratio_deviation, 4)
    }


def run_inference(image_array: np.ndarray) -> tuple[float, dict]:
    """Run the full ResNet50V2 + XGBoost inference pipeline.
    
    Returns:
        (fraud_probability, handcrafted_features_dict)
    """
    from tensorflow.keras.applications.resnet_v2 import preprocess_input

    # Extract CNN features
    batch = np.expand_dims(image_array, axis=0)
    preprocessed = preprocess_input(batch.astype(np.float32))
    cnn_features = models["resnet"].predict(preprocessed, verbose=0)

    # Extract handcrafted features
    hc_features = compute_handcrafted_features(image_array)
    hc_array = np.array([[
        hc_features["noise_level"],
        hc_features["edge_density"],
        hc_features["colour_uniformity"],
        hc_features["brightness_entropy"],
        hc_features["ratio_deviation"]
    ]])

    # Combine features (2048 CNN + 5 handcrafted = 2053)
    combined = np.hstack([cnn_features, hc_array])

    # Predict with XGBoost
    if models["xgboost"] is not None:
        fraud_probability = float(models["xgboost"].predict_proba(combined)[0][1])
    else:
        # Heuristic fallback when XGBoost model is not available
        # Use handcrafted features to estimate fraud probability
        noise_score = min(hc_features["noise_level"] / 50.0, 1.0)
        edge_score = min(hc_features["edge_density"] / 30.0, 1.0)
        fraud_probability = float((noise_score * 0.4 + edge_score * 0.3 +
                                   (1.0 - hc_features["brightness_entropy"] / 6.0) * 0.3))
        fraud_probability = max(0.0, min(1.0, fraud_probability))

    return fraud_probability, hc_features


def classify_result(fraud_probability: float, hc_features: dict) -> DetectionResponse:
    """Classify the fraud probability into risk levels and build response."""
    if fraud_probability >= 0.70:
        risk_level = "HIGH"
        verdict = "FRAUD DETECTED"
        action = "Certificate blocked — institution notified"
        forgery_type = determine_forgery_type(hc_features)
    elif fraud_probability >= 0.30:
        risk_level = "MEDIUM"
        verdict = "REVIEW REQUIRED"
        action = "Certificate flagged for human review"
        forgery_type = determine_forgery_type(hc_features) if fraud_probability >= 0.50 else "suspicious_patterns"
    else:
        risk_level = "LOW"
        verdict = "LEGITIMATE"
        action = "Certificate cleared for issuance"
        forgery_type = "none"

    return DetectionResponse(
        fraud_probability=round(fraud_probability, 4),
        risk_level=risk_level,
        verdict=verdict,
        action=action,
        inference_ms=0,  # Will be set by the endpoint
        forgery_type=forgery_type,
        handcrafted_features=HandcraftedFeatures(**hc_features)
    )


def determine_forgery_type(features: dict) -> str:
    """Determine the most likely forgery type based on handcrafted features."""
    noise = features["noise_level"]
    edge = features["edge_density"]
    colour = features["colour_uniformity"]
    entropy_val = features["brightness_entropy"]

    if noise > 30 and edge > 20:
        return "text_alteration"
    elif colour > 60 and entropy_val < 3.0:
        return "stamp_forgery"
    elif noise > 25:
        return "image_splicing"
    elif edge > 18:
        return "digital_manipulation"
    else:
        return "unknown_tampering"


# ═══════════════════════════════════════════════════════════════
# FASTAPI APPLICATION
# ═══════════════════════════════════════════════════════════════

app = FastAPI(
    title="CertifyChain AI Fraud Detection Service",
    description="ResNet50V2 + XGBoost pipeline for detecting forged academic certificates.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware — allow the .NET backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://localhost:5001",
        "https://localhost:7270",
        "https://certfiychain.onrender.com",
        "http://localhost:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint. Returns model loading status."""
    return HealthResponse(
        status="ok" if models["loaded"] else "loading",
        model_loaded=models["loaded"]
    )


@app.post("/api/ai/detect", response_model=DetectionResponse)
async def detect_fraud(request: DetectionRequest):
    """
    Analyse a certificate image for fraud indicators.
    
    Accepts a base64-encoded image, runs it through the ResNet50V2 + XGBoost
    pipeline, and returns fraud probability with detailed feature analysis.
    """
    if not models["loaded"]:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded yet. Please wait for startup to complete."
        )

    try:
        # Decode base64 image
        image_bytes = base64.b64decode(request.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data")

    # Run inference with timing
    start_time = time.time()

    image_array = preprocess_image(image_bytes)
    fraud_probability, hc_features = run_inference(image_array)
    response = classify_result(fraud_probability, hc_features)

    inference_ms = int((time.time() - start_time) * 1000)
    response.inference_ms = inference_ms

    return response
