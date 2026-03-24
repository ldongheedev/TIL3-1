// Created: 2026-03-23 12:05
/**
 * Frontend logic for Handwritten Digit Recognizer.
 *
 * - Mouse + touch drawing on a 280x280 black canvas
 * - On "Recognize": POST canvas image (base64 PNG) to /predict
 * - Render predicted digit, confidence bars, and 28x28 model-input preview
 */

const drawCanvas   = document.getElementById("drawCanvas");
const previewCanvas = document.getElementById("previewCanvas");
const resultEl     = document.getElementById("result");
const barsEl       = document.getElementById("bars");
const btnRecognize = document.getElementById("btnRecognize");
const btnClear     = document.getElementById("btnClear");

const ctx     = drawCanvas.getContext("2d");
const prevCtx = previewCanvas.getContext("2d");

const BRUSH_RADIUS = 13;
let isDrawing = false;

// ─────────────────────────────────────────────
// Canvas setup
// ─────────────────────────────────────────────

ctx.fillStyle = "#000";
ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
ctx.strokeStyle = "#fff";
ctx.fillStyle   = "#fff";
ctx.lineCap     = "round";
ctx.lineJoin    = "round";

// Build confidence bar rows (0-9)
for (let i = 0; i < 10; i++) {
  const row = document.createElement("div");
  row.className = "bar-row";
  row.innerHTML = `
    <span class="bar-label">${i}</span>
    <div class="bar-track">
      <div class="bar-fill" id="bar-${i}"></div>
      <span class="bar-pct" id="pct-${i}"></span>
    </div>`;
  barsEl.appendChild(row);
}

// ─────────────────────────────────────────────
// Drawing helpers
// ─────────────────────────────────────────────

function getPos(e) {
  const rect = drawCanvas.getBoundingClientRect();
  const scaleX = drawCanvas.width  / rect.width;
  const scaleY = drawCanvas.height / rect.height;
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top)  * scaleY,
  };
}

function drawDot(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
}

// Mouse events
drawCanvas.addEventListener("mousedown",  (e) => { isDrawing = true;  drawDot(...Object.values(getPos(e))); });
drawCanvas.addEventListener("mousemove",  (e) => { if (isDrawing) drawDot(...Object.values(getPos(e))); });
drawCanvas.addEventListener("mouseup",    ()  => { isDrawing = false; });
drawCanvas.addEventListener("mouseleave", ()  => { isDrawing = false; });

// Touch events (mobile support)
drawCanvas.addEventListener("touchstart", (e) => { e.preventDefault(); isDrawing = true;  drawDot(...Object.values(getPos(e))); }, { passive: false });
drawCanvas.addEventListener("touchmove",  (e) => { e.preventDefault(); if (isDrawing) drawDot(...Object.values(getPos(e))); },   { passive: false });
drawCanvas.addEventListener("touchend",   ()  => { isDrawing = false; });

// ─────────────────────────────────────────────
// Clear
// ─────────────────────────────────────────────

function clearAll() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

  prevCtx.fillStyle = "#000";
  prevCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

  resultEl.textContent = "--";

  for (let i = 0; i < 10; i++) {
    document.getElementById(`bar-${i}`).style.width = "0%";
    document.getElementById(`bar-${i}`).classList.remove("active");
    document.getElementById(`pct-${i}`).textContent = "";
  }
}

btnClear.addEventListener("click", clearAll);

// ─────────────────────────────────────────────
// Recognize
// ─────────────────────────────────────────────

btnRecognize.addEventListener("click", async () => {
  const imageData = drawCanvas.toDataURL("image/png");

  btnRecognize.disabled = true;
  btnRecognize.textContent = "...";

  try {
    const res  = await fetch("/predict", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ image: imageData }),
    });

    const data = await res.json();

    if (data.error) {
      resultEl.textContent = data.error;
      return;
    }

    // Show prediction
    resultEl.textContent = `Digit: ${data.digit}  (${data.confidence}%)`;

    // Update confidence bars
    data.probs.forEach((prob, i) => {
      const pct  = (prob * 100).toFixed(1);
      const fill = document.getElementById(`bar-${i}`);
      const label = document.getElementById(`pct-${i}`);
      fill.style.width = `${prob * 100}%`;
      fill.classList.toggle("active", i === data.digit);
      label.textContent = `${pct}%`;
    });

    // Request 28x28 preview from server and draw it
    drawPreview(data.preview);

  } catch (err) {
    resultEl.textContent = "Error — is the server running?";
    console.error(err);
  } finally {
    btnRecognize.disabled = false;
    btnRecognize.textContent = "Recognize";
  }
});

// ─────────────────────────────────────────────
// 28x28 preview renderer
// ─────────────────────────────────────────────

function drawPreview(flat28) {
  if (!flat28) return;
  const ZOOM = 3;
  prevCtx.fillStyle = "#000";
  prevCtx.fillRect(0, 0, 84, 84);

  for (let r = 0; r < 28; r++) {
    for (let c = 0; c < 28; c++) {
      const v = Math.round(flat28[r * 28 + c] * 255);
      if (v > 0) {
        prevCtx.fillStyle = `rgb(${v},${v},${v})`;
        prevCtx.fillRect(c * ZOOM, r * ZOOM, ZOOM, ZOOM);
      }
    }
  }
}
