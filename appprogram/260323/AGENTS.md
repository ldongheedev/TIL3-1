<!-- Created: 2026-03-23 12:30 -->
# AGENTS.md

Universal agent instructions for this project.
Works with Claude Code, Cursor, Copilot, Gemini CLI, Aider, and other AI coding tools.

## Project

Handwritten digit recognition app — two independently runnable versions:
- `desktop_version/` — Python tkinter GUI
- `web_version/`     — Flask API + browser canvas

Tech: Python 3.11 · scikit-learn MLP · Pillow · Flask · vanilla JS/HTML/CSS

## Setup

```bash
pip install scikit-learn numpy Pillow flask
```

## Run

```bash
# Desktop (GUI window)
python desktop_version/digit_recognizer.py

# Web (opens at http://localhost:5000)
python web_version/app.py
```

## Key Constraints

- **No TensorFlow or PyTorch** — CPU lacks AVX2 instructions; use scikit-learn only.
- All code and comments must be written in English.
- Every new file must have a creation date/time comment at the top.

## Architecture

### Shared ML pipeline (`preprocess_canvas`)
Converts drawn image → MNIST-compatible 28×28 input:
1. Bounding-box crop
2. Aspect-ratio resize (longest side = 20 px)
3. Pad to 20×20
4. Center-of-mass placement in 28×28 frame
5. Normalize [0,1], flatten to (1, 784)
Keep float32 throughout — do NOT cast to uint8 before resizing.

### Model
`sklearn.neural_network.MLPClassifier(hidden_layer_sizes=(512, 256))`
Saved to `mnist_mlp.pkl`. Validate architecture on load; delete file to retrain.

### Web API
- `GET  /`        → serves `static/index.html`
- `POST /predict` → body: `{"image": "<base64 PNG>"}` → `{"digit", "confidence", "probs", "preview"}`
