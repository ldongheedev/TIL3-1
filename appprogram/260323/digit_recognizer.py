"""
Handwritten Digit Recognition using MNIST Dataset
==================================================
Dependencies: scikit-learn, numpy, Pillow  (tkinter is built-in)
Install:  pip install scikit-learn numpy Pillow
"""

import tkinter as tk
from tkinter import font as tkFont
import numpy as np
from PIL import Image, ImageDraw, ImageOps
import os
import sys
import pickle
import struct
import urllib.request
import gzip

# ─────────────────────────────────────────────
# 1. MNIST data loader (pure Python, no TF)
# ─────────────────────────────────────────────

MNIST_URLS = {
    "train_images": "https://storage.googleapis.com/cvdf-datasets/mnist/train-images-idx3-ubyte.gz",
    "train_labels": "https://storage.googleapis.com/cvdf-datasets/mnist/train-labels-idx1-ubyte.gz",
    "test_images":  "https://storage.googleapis.com/cvdf-datasets/mnist/t10k-images-idx3-ubyte.gz",
    "test_labels":  "https://storage.googleapis.com/cvdf-datasets/mnist/t10k-labels-idx1-ubyte.gz",
}

def _download_mnist(data_dir="mnist_data"):
    """Download MNIST binary files if not already cached."""
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
        magic, n, rows, cols = struct.unpack(">IIII", f.read(16))
        data = np.frombuffer(f.read(), dtype=np.uint8)
    return data.reshape(n, rows * cols).astype(np.float32) / 255.0

def _read_labels(gz_path):
    with gzip.open(gz_path, "rb") as f:
        magic, n = struct.unpack(">II", f.read(8))
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
# 2. Build / load the classifier
# ─────────────────────────────────────────────

MODEL_FILE = "mnist_mlp.pkl"

def build_and_train_model():
    """Train MLP on MNIST. Saves to disk and reloads on next run."""
    from sklearn.neural_network import MLPClassifier

    if os.path.exists(MODEL_FILE):
        print(f"[INFO] Loading saved model from '{MODEL_FILE}' ...")
        with open(MODEL_FILE, "rb") as f:
            model = pickle.load(f)
        return model

    x_train, y_train, x_test, y_test = load_mnist()

    print("[INFO] Training MLP classifier (about 2-4 minutes) ...")
    model = MLPClassifier(
        hidden_layer_sizes=(512, 256),  # larger network for better accuracy
        activation="relu",
        solver="adam",
        learning_rate_init=0.001,
        max_iter=50,                    # enough iterations to converge
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
# 3. Image preprocessing (MNIST-compatible)
# ─────────────────────────────────────────────

def preprocess_canvas(pil_image: Image.Image):
    """
    Convert a 280x280 grayscale canvas image into the 28x28
    format that matches MNIST.

    Steps:
      1. Crop to the bounding box of the drawn pixels
      2. Resize so the longer side is 20px (keep aspect ratio, float precision)
      3. Pad to 20x20
      4. Place in a 28x28 frame centered by center of mass
      5. Normalise to [0, 1] and flatten to (1, 784)

    Returns:
      arr_flat : np.ndarray shape (1, 784)  — input for the model
      frame    : np.ndarray shape (28, 28)  — for debug preview
    """
    arr = np.array(pil_image, dtype=np.float32)

    # --- Step 1: bounding box crop ---
    rows = np.any(arr > 0, axis=1)
    cols = np.any(arr > 0, axis=0)
    if not rows.any():
        empty = np.zeros((28, 28), dtype=np.float32)
        return empty.reshape(1, -1), empty

    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    cropped = arr[rmin:rmax+1, cmin:cmax+1]

    # --- Step 2: resize longest side → 20px (float, no uint8 truncation) ---
    h, w = cropped.shape
    scale = 20.0 / max(h, w)
    new_h = max(1, int(round(h * scale)))
    new_w = max(1, int(round(w * scale)))

    # Use PIL with float-safe conversion: scale to [0,255], resize, scale back
    img_pil = Image.fromarray((cropped).astype(np.uint8))
    img_pil = img_pil.resize((new_w, new_h), Image.LANCZOS)
    arr_resized = np.array(img_pil, dtype=np.float32) / 255.0

    # --- Step 3: pad to exactly 20x20 ---
    arr20 = np.zeros((20, 20), dtype=np.float32)
    r_off = (20 - new_h) // 2
    c_off = (20 - new_w) // 2
    arr20[r_off:r_off+new_h, c_off:c_off+new_w] = arr_resized

    # --- Step 4: center of mass placement in 28x28 ---
    frame = np.zeros((28, 28), dtype=np.float32)
    ys, xs = np.indices(arr20.shape)
    mass = arr20.sum()
    if mass > 0:
        cy = int(round((ys * arr20).sum() / mass))
        cx = int(round((xs * arr20).sum() / mass))
    else:
        cy, cx = 10, 10

    row_off = 14 - cy
    col_off = 14 - cx

    r0  = max(0,  row_off);  r1  = r0  + 20
    c0  = max(0,  col_off);  c1  = c0  + 20
    sr0 = max(0, -row_off);  sr1 = sr0 + (r1 - r0)
    sc0 = max(0, -col_off);  sc1 = sc0 + (c1 - c0)

    frame[r0:r1, c0:c1] = arr20[sr0:sr1, sc0:sc1]

    return frame.reshape(1, -1), frame

# ─────────────────────────────────────────────
# 4. GUI drawing application
# ─────────────────────────────────────────────

class DigitRecognizerApp:
    """
    tkinter window with a black canvas.
    Draw a digit with the mouse, click 'Recognize' to classify it.
    """

    CANVAS_SIZE  = 280
    BRUSH_RADIUS = 13

    def __init__(self, root: tk.Tk, model):
        self.root  = root
        self.model = model

        self.root.title("Handwritten Digit Recognizer  |  MNIST MLP")
        self.root.resizable(False, False)
        self.root.configure(bg="#1e1e1e")

        self.pil_image = Image.new("L", (self.CANVAS_SIZE, self.CANVAS_SIZE), 0)
        self.draw_ctx  = ImageDraw.Draw(self.pil_image)

        self._build_ui()

    # ── UI ──────────────────────────────────────────────────────────

    def _build_ui(self):
        BG      = "#1e1e1e"
        FG      = "#ffffff"
        ACCENT  = "#4fc3f7"
        BTN_REC = "#1565c0"
        BTN_CLR = "#424242"

        title_font = tkFont.Font(family="Helvetica", size=13, weight="bold")
        pred_font  = tkFont.Font(family="Helvetica", size=22, weight="bold")
        btn_font   = tkFont.Font(family="Helvetica", size=12, weight="bold")

        tk.Label(self.root, text="Draw a digit (0-9) then click Recognize",
                 font=title_font, bg=BG, fg=FG).pack(pady=(14, 4))

        self.canvas = tk.Canvas(self.root,
                                width=self.CANVAS_SIZE,
                                height=self.CANVAS_SIZE,
                                bg="black", cursor="crosshair",
                                highlightbackground=ACCENT,
                                highlightthickness=2)
        self.canvas.pack(padx=18)
        self.canvas.bind("<B1-Motion>",     self._on_drag)
        self.canvas.bind("<ButtonPress-1>", self._on_drag)

        self.pred_var = tk.StringVar(value="--")
        tk.Label(self.root, textvariable=self.pred_var,
                 font=pred_font, bg=BG, fg=ACCENT).pack(pady=(10, 2))

        # Confidence bars
        bar_frame = tk.Frame(self.root, bg=BG)
        bar_frame.pack(padx=18, pady=(0, 6), fill="x")

        self.bar_canvases = []
        bar_font2 = tkFont.Font(family="Helvetica", size=9)
        for digit in range(10):
            row = tk.Frame(bar_frame, bg=BG)
            row.pack(fill="x", pady=1)
            tk.Label(row, text=str(digit), width=2, anchor="e",
                     font=bar_font2, bg=BG, fg=FG).pack(side="left")
            bc = tk.Canvas(row, height=14, bg="#2a2a2a",
                           highlightthickness=0)
            bc.pack(side="left", fill="x", expand=True, padx=(4, 0))
            self.bar_canvases.append(bc)

        # 28x28 preview — shows exactly what the model sees
        preview_frame = tk.Frame(self.root, bg=BG)
        preview_frame.pack(pady=(0, 4))
        tk.Label(preview_frame, text="Model input (28x28):",
                 font=tkFont.Font(family="Helvetica", size=9),
                 bg=BG, fg="#aaaaaa").pack(side="left", padx=(0, 6))
        self.preview_canvas = tk.Canvas(preview_frame,
                                        width=84, height=84,
                                        bg="black", highlightthickness=1,
                                        highlightbackground="#555555")
        self.preview_canvas.pack(side="left")

        btn_frame = tk.Frame(self.root, bg=BG)
        btn_frame.pack(pady=(4, 16))

        tk.Button(btn_frame, text="Recognize",
                  font=btn_font, bg=BTN_REC, fg="white",
                  padx=16, pady=6, relief="flat",
                  command=self._recognize).pack(side="left", padx=10)

        tk.Button(btn_frame, text="Clear",
                  font=btn_font, bg=BTN_CLR, fg="white",
                  padx=16, pady=6, relief="flat",
                  command=self._clear).pack(side="left", padx=10)

    # ── Drawing ─────────────────────────────────────────────────────

    def _on_drag(self, event):
        r = self.BRUSH_RADIUS
        x, y = event.x, event.y
        self.canvas.create_oval(x-r, y-r, x+r, y+r,
                                fill="white", outline="white")
        self.draw_ctx.ellipse([x-r, y-r, x+r, y+r], fill=255)

    def _clear(self):
        self.canvas.delete("all")
        self.draw_ctx.rectangle(
            [0, 0, self.CANVAS_SIZE, self.CANVAS_SIZE], fill=0)
        self.pred_var.set("--")
        self.preview_canvas.delete("all")
        for bc in self.bar_canvases:
            bc.delete("all")

    # ── Inference ───────────────────────────────────────────────────

    def _recognize(self):
        arr_flat, frame28 = preprocess_canvas(self.pil_image)

        if arr_flat.max() < 0.05:
            self.pred_var.set("Draw first!")
            return

        # --- Update 28x28 preview (3x zoom = 84x84) ---
        self._draw_preview(frame28)

        digit = int(self.model.predict(arr_flat)[0])
        probs = self.model.predict_proba(arr_flat)[0]
        conf  = float(probs[digit]) * 100

        self.pred_var.set(f"Digit: {digit}   ({conf:.1f}%)")

        self.root.update_idletasks()
        for i, prob in enumerate(probs):
            bc = self.bar_canvases[i]
            bc.delete("all")
            w = bc.winfo_width()
            bar_w = max(1, int(w * prob))
            color = "#4fc3f7" if i == digit else "#555555"
            bc.create_rectangle(0, 0, bar_w, 14, fill=color, outline="")
            bc.create_text(w - 4, 7, text=f"{prob*100:.1f}%",
                           anchor="e", fill="white",
                           font=("Helvetica", 9))

    def _draw_preview(self, frame28: np.ndarray):
        """Render the 28x28 float array onto the 84x84 preview canvas."""
        ZOOM = 3
        self.preview_canvas.delete("all")
        for r in range(28):
            for c in range(28):
                v = int(frame28[r, c] * 255)
                if v > 0:
                    color = f"#{v:02x}{v:02x}{v:02x}"
                    x0, y0 = c * ZOOM, r * ZOOM
                    self.preview_canvas.create_rectangle(
                        x0, y0, x0+ZOOM, y0+ZOOM,
                        fill=color, outline="")

# ─────────────────────────────────────────────
# 5. Entry point
# ─────────────────────────────────────────────

def main():
    try:
        import sklearn
    except ImportError:
        print("[ERROR] scikit-learn not installed.")
        print("        Run: pip install scikit-learn numpy Pillow")
        sys.exit(1)

    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Delete old under-trained model so we retrain with better settings
    if os.path.exists(MODEL_FILE):
        # Check if it was trained with the old (20-iter) settings by verifying
        # that the model has enough layers; if not, remove and retrain.
        with open(MODEL_FILE, "rb") as f:
            old_model = pickle.load(f)
        if old_model.hidden_layer_sizes != (512, 256):
            print("[INFO] Old model detected, retraining with improved settings ...")
            os.remove(MODEL_FILE)

    model = build_and_train_model()

    root = tk.Tk()
    app  = DigitRecognizerApp(root, model)
    root.mainloop()


if __name__ == "__main__":
    main()
