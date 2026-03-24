# Created: 2026-03-23 12:05
"""
Shared ML logic: MNIST loader, model training, and image preprocessing.
Used by app.py (Flask backend).
"""

import os
import gzip
import struct
import pickle
import urllib.request

import numpy as np
from PIL import Image

# ─────────────────────────────────────────────
# MNIST data loader
# ─────────────────────────────────────────────

MNIST_URLS = {
    "train_images": "https://storage.googleapis.com/cvdf-datasets/mnist/train-images-idx3-ubyte.gz",
    "train_labels": "https://storage.googleapis.com/cvdf-datasets/mnist/train-labels-idx1-ubyte.gz",
    "test_images":  "https://storage.googleapis.com/cvdf-datasets/mnist/t10k-images-idx3-ubyte.gz",
    "test_labels":  "https://storage.googleapis.com/cvdf-datasets/mnist/t10k-labels-idx1-ubyte.gz",
}

def _download_mnist(data_dir="mnist_data"):
    os.makedirs(data_dir, exist_ok=True)
    paths = {}
    for name, url in MNIST_URLS.items():
        gz_path = os.path.join(data_dir, os.path.basename(url))
        if not os.path.exists(gz_path):
            print(f"  Downloading {name} ...")
            urllib.request.urlretrieve(url, gz_path)
        paths[name] = gz_path
    return paths

def _read_images(gz_path):
    with gzip.open(gz_path, "rb") as f:
        _, n, rows, cols = struct.unpack(">IIII", f.read(16))
        data = np.frombuffer(f.read(), dtype=np.uint8)
    return data.reshape(n, rows * cols).astype(np.float32) / 255.0

def _read_labels(gz_path):
    with gzip.open(gz_path, "rb") as f:
        _, n = struct.unpack(">II", f.read(8))
        data = np.frombuffer(f.read(), dtype=np.uint8)
    return data.astype(np.int32)

def load_mnist():
    print("[INFO] Loading MNIST dataset ...")
    paths = _download_mnist()
    x_train = _read_images(paths["train_images"])
    y_train = _read_labels(paths["train_labels"])
    x_test  = _read_images(paths["test_images"])
    y_test  = _read_labels(paths["test_labels"])
    print(f"  train: {x_train.shape}, test: {x_test.shape}")
    return x_train, y_train, x_test, y_test

# ─────────────────────────────────────────────
# Model
# ─────────────────────────────────────────────

MODEL_FILE = "mnist_mlp.pkl"

def load_or_train_model():
    """Load saved model or train from scratch. Returns sklearn MLPClassifier."""
    from sklearn.neural_network import MLPClassifier

    # Reuse trained model from parent directory if available and web's own is missing
    parent_model = os.path.join(os.path.dirname(__file__), "..", "mnist_mlp.pkl")
    if not os.path.exists(MODEL_FILE) and os.path.exists(parent_model):
        print(f"[INFO] Copying model from parent directory ...")
        import shutil
        shutil.copy(parent_model, MODEL_FILE)

    if os.path.exists(MODEL_FILE):
        print(f"[INFO] Loading saved model from '{MODEL_FILE}' ...")
        with open(MODEL_FILE, "rb") as f:
            model = pickle.load(f)
        if getattr(model, "hidden_layer_sizes", None) != (512, 256):
            print("[INFO] Outdated model detected, retraining ...")
            os.remove(MODEL_FILE)
        else:
            return model

    x_train, y_train, x_test, y_test = load_mnist()
    print("[INFO] Training MLP classifier (2-4 minutes) ...")
    model = MLPClassifier(
        hidden_layer_sizes=(512, 256),
        activation="relu",
        solver="adam",
        learning_rate_init=0.001,
        max_iter=50,
        tol=1e-4,
        random_state=42,
        verbose=True,
    )
    model.fit(x_train, y_train)
    acc = model.score(x_test, y_test)
    print(f"[INFO] Test accuracy: {acc * 100:.2f}%")
    with open(MODEL_FILE, "wb") as f:
        pickle.dump(model, f)
    print(f"[INFO] Model saved to '{MODEL_FILE}'")
    return model

# ─────────────────────────────────────────────
# Preprocessing
# ─────────────────────────────────────────────

def preprocess_canvas(pil_image: Image.Image):
    """
    Convert an arbitrary-size grayscale PIL image to MNIST-compatible (1, 784).

    Pipeline:
      1. Bounding-box crop
      2. Aspect-ratio resize so longest side = 20px
      3. Pad to 20x20
      4. Center-of-mass placement inside 28x28 frame
      5. Normalise to [0, 1], flatten to (1, 784)

    Returns (arr_flat, frame28):
      arr_flat : np.ndarray (1, 784)  - model input
      frame28  : np.ndarray (28, 28) - debug preview
    """
    arr = np.array(pil_image.convert("L"), dtype=np.float32)

    rows = np.any(arr > 0, axis=1)
    cols = np.any(arr > 0, axis=0)
    if not rows.any():
        empty = np.zeros((28, 28), dtype=np.float32)
        return empty.reshape(1, -1), empty

    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    cropped = arr[rmin:rmax+1, cmin:cmax+1]

    h, w = cropped.shape
    scale = 20.0 / max(h, w)
    new_h = max(1, int(round(h * scale)))
    new_w = max(1, int(round(w * scale)))

    img_pil = Image.fromarray(cropped.astype(np.uint8))
    img_pil = img_pil.resize((new_w, new_h), Image.LANCZOS)
    arr_resized = np.array(img_pil, dtype=np.float32) / 255.0

    arr20 = np.zeros((20, 20), dtype=np.float32)
    r_off = (20 - new_h) // 2
    c_off = (20 - new_w) // 2
    arr20[r_off:r_off+new_h, c_off:c_off+new_w] = arr_resized

    frame = np.zeros((28, 28), dtype=np.float32)
    ys, xs = np.indices(arr20.shape)
    mass = arr20.sum()
    cy = int(round((ys * arr20).sum() / mass)) if mass > 0 else 10
    cx = int(round((xs * arr20).sum() / mass)) if mass > 0 else 10

    row_off = 14 - cy
    col_off = 14 - cx
    r0  = max(0,  row_off);  r1  = r0  + 20
    c0  = max(0,  col_off);  c1  = c0  + 20
    sr0 = max(0, -row_off);  sr1 = sr0 + (r1 - r0)
    sc0 = max(0, -col_off);  sc1 = sc0 + (c1 - c0)
    frame[r0:r1, c0:c1] = arr20[sr0:sr1, sc0:sc1]

    return frame.reshape(1, -1), frame
