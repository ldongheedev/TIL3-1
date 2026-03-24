<!-- Created: 2026-03-23 11:59 -->
# CLAUDE.md — Desktop Version

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Overview

Standalone desktop GUI application for handwritten digit recognition.
Built with **tkinter** (GUI) + **scikit-learn** (MLP classifier) + **Pillow** (image processing).

## Environment

- **Python**: `C:\Users\403_29\AppData\Local\Programs\Python\Python311\python.exe` (3.11.9)
- **pythonw** (no console): `C:\Users\403_29\AppData\Local\Programs\Python\Python311\pythonw.exe`
- **TensorFlow is NOT available** — CPU lacks AVX/AVX2. Use scikit-learn only.

## Running

```bash
# Development (with console output)
python digit_recognizer.py

# Production (no console window)
pythonw digit_recognizer.py
```

## Installing dependencies

```bash
pip install scikit-learn numpy Pillow
```

## Architecture

All logic lives in `digit_recognizer.py`, divided into 5 sections:

1. **MNIST loader** — pure-Python IDX parser; downloads `.gz` files from Google Storage into `mnist_data/` on first run.

2. **Model** (`build_and_train_model`) — `MLPClassifier(hidden_layer_sizes=(512, 256))`, ~98.5% accuracy. Serialized to `mnist_mlp.pkl`; auto-reloaded on next run. On startup, architecture is validated and retraining is triggered if the saved model is outdated.

3. **`preprocess_canvas(pil_image)`** — converts 280×280 mouse-drawn PIL image to MNIST-compatible 28×28:
   - Bounding-box crop → aspect-ratio resize to 20px max side → pad to 20×20 → center-of-mass placement in 28×28 frame.
   - Returns `(1, 784)` model input and `(28, 28)` preview array.
   - Keep all resize operations in float32 — never convert to uint8 before resizing.

4. **`DigitRecognizerApp`** — tkinter GUI:
   - 280×280 canvas with brush radius 13px.
   - Dual-buffer: strokes written to both `tk.Canvas` (display) and a `PIL.Image` (inference).
   - Confidence bars per digit (0–9) + 84×84 debug preview (3× zoom of the 28×28 input).

5. **`main()`** — validates sklearn, sets working directory, loads/trains model, starts `tk.Tk()`.

## Key files

| File | Purpose |
|---|---|
| `digit_recognizer.py` | Entire application |
| `mnist_mlp.pkl` | Trained model (auto-generated, ~15 MB) |
| `mnist_data/` | Cached MNIST `.gz` files (auto-downloaded) |
| `run.bat` | Double-click launcher (uses pythonw, no console) |
