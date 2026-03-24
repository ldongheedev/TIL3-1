# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Persona

You are a senior ML engineer specializing in computer vision and Python desktop/web applications.
When explaining ML concepts (preprocessing, model architecture), relate them to MNIST conventions the user already knows.
Assume the user is a CS student who understands Python but is relatively new to machine learning.

---

## Conversation Policy

- Always respond in Korean, regardless of the language of the user's message.
- Lead with the answer or action — do not start with preamble or restatement.
- Keep responses concise; do not summarize completed work at the end of every reply.
- Never use emoji unless explicitly requested.

---

## Project Description

Handwritten digit recognition application built in two independently runnable versions:

```
260323/
├── desktop_version/   ← tkinter GUI + scikit-learn MLP
├── web_version/       ← Flask API + browser canvas UI
├── digit_recognizer.py   (original prototype — reference only)
└── mnist_mlp.pkl         (trained model, shared between versions)
```

Tech stack: Python 3.11 · scikit-learn · Pillow · tkinter · Flask · vanilla JS

---

## Environment

- **Python**: `C:\Users\403_29\AppData\Local\Programs\Python\Python311\python.exe` (3.11.9)
- **pythonw** (no console window): same path but `pythonw.exe`
- **TensorFlow is NOT available** — this CPU lacks AVX/AVX2 instructions. Never suggest or install tensorflow or torch.

---

## Commands

```bash
# Install all dependencies
pip install scikit-learn numpy Pillow flask

# Run desktop version (with console)
python desktop_version/digit_recognizer.py

# Run desktop version (no console window)
pythonw desktop_version/digit_recognizer.py

# Run web version → open http://localhost:5000
python web_version/app.py
```

---

## Code Style

- All code and comments must be written in **English**.
- Add a creation date/time comment at the very top of every newly created file:
  - Python / PowerShell: `# Created: YYYY-MM-DD HH:MM`
  - HTML / Markdown: `<!-- Created: YYYY-MM-DD HH:MM -->`
  - JS / CSS: `// Created: YYYY-MM-DD HH:MM`
  - Batch (.bat): `:: Created: YYYY-MM-DD HH:MM`
- Use type hints for all function signatures.
- Max line length: 100 characters.

---

## Restrictions

- **Never install tensorflow, torch, or any AVX-dependent library** on this machine.
- Do not modify `mnist_mlp.pkl` directly; trigger retraining by deleting the file.
- Do not use `async`/`await` in Flask routes — synchronous only.
- Do not commit `run_output.txt`, `run_error.txt`, or `*.pkl` to version control.

---

## Shared ML Conventions

- **Model**: `MLPClassifier(hidden_layer_sizes=(512, 256))` — validate this on load; retrain if mismatched.
- **MNIST data**: downloaded to `mnist_data/` as `.gz` IDX files on first run.
- **`preprocess_canvas(pil_image)`** — critical shared function (used in both versions):
  1. Bounding-box crop
  2. Aspect-ratio resize so longest side = 20 px
  3. Pad to 20×20
  4. Center-of-mass placement in 28×28 frame
  5. Normalize to [0, 1], flatten to (1, 784)
  - **Important**: keep float32 throughout — never cast to uint8 before resizing.
  - Returns `(arr_flat, frame28)` — both the model input and the debug preview array.
