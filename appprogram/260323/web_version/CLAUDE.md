<!-- Created: 2026-03-23 11:59 -->
# CLAUDE.md — Web Version

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Overview

Browser-based handwritten digit recognition app.
- **Backend**: Python Flask — serves the API and static files, runs ML inference.
- **Frontend**: Vanilla HTML/CSS/JavaScript — `<canvas>` drawing, fetch API for inference.
- **Model**: scikit-learn MLPClassifier trained on MNIST (shared logic with desktop version).

## Environment

- **Python**: `C:\Users\403_29\AppData\Local\Programs\Python\Python311\python.exe` (3.11.9)
- **TensorFlow is NOT available** — CPU lacks AVX/AVX2. Use scikit-learn only.

## Running

```bash
# Install dependencies
pip install flask scikit-learn numpy Pillow

# Start the development server
python app.py
# Then open http://localhost:5000 in a browser
```

## Installing dependencies

```bash
pip install flask scikit-learn numpy Pillow
```

## Planned Architecture

```
web_version/
├── app.py              # Flask app — routes and inference API
├── model.py            # MNIST loader, training, preprocess_canvas (shared logic)
├── mnist_mlp.pkl       # Trained model (auto-generated)
├── mnist_data/         # Cached MNIST .gz files (auto-downloaded)
└── static/
    ├── index.html      # Single-page UI
    ├── style.css       # Styles
    └── app.js          # Canvas drawing + fetch calls to /predict
```

### API

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/predict` | `{ "image": "<base64 PNG>" }` | `{ "digit": 6, "confidence": 97.3, "probs": [...] }` |
| GET  | `/`        | —    | Serves `index.html` |

### Preprocessing

The `/predict` endpoint receives a base64-encoded PNG from the browser canvas,
decodes it to a PIL grayscale image, and passes it through the same
`preprocess_canvas()` pipeline used in the desktop version
(bounding-box crop → 20px resize → 28×28 center-of-mass placement).

### Frontend canvas

- Black 280×280 `<canvas>`, white brush on `mousemove` + `touchmove`.
- On "Recognize" click: export canvas via `canvas.toDataURL('image/png')`,
  POST to `/predict`, render result and confidence bars.
- "Clear" resets the canvas with `clearRect`.
