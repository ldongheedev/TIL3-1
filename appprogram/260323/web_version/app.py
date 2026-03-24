# Created: 2026-03-23 12:05
"""
Flask backend for the handwritten digit recognition web app.

Routes:
  GET  /          -> serves index.html
  POST /predict   -> { "image": "<base64 PNG>" }
                  <- { "digit": int, "confidence": float, "probs": [float x10] }
"""

import os
import base64
import io

from flask import Flask, request, jsonify, send_from_directory
from PIL import Image

# Change working directory to this file's location so model/data paths resolve correctly
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from model import load_or_train_model, preprocess_canvas

app = Flask(__name__, static_folder="static")

# Load model once at startup
print("[INFO] Initializing model ...")
MODEL = load_or_train_model()
print("[INFO] Model ready. Starting server ...")


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accepts a base64-encoded PNG drawn on the browser canvas.
    Returns predicted digit, confidence, and all 10 class probabilities.
    """
    data = request.get_json()
    if not data or "image" not in data:
        return jsonify({"error": "Missing 'image' field"}), 400

    # Decode base64 PNG -> PIL grayscale image
    img_data = data["image"]
    if img_data.startswith("data:image"):
        img_data = img_data.split(",", 1)[1]

    img_bytes = base64.b64decode(img_data)
    pil_img   = Image.open(io.BytesIO(img_bytes)).convert("L")

    arr_flat, frame28 = preprocess_canvas(pil_img)

    if arr_flat.max() < 0.05:
        return jsonify({"error": "Empty canvas"}), 400

    digit   = int(MODEL.predict(arr_flat)[0])
    probs   = MODEL.predict_proba(arr_flat)[0].tolist()
    conf    = round(probs[digit] * 100, 1)
    preview = frame28.flatten().tolist()   # 784 float values for the browser preview

    return jsonify({"digit": digit, "confidence": conf, "probs": probs, "preview": preview})


if __name__ == "__main__":
    app.run(debug=False, port=5000)
