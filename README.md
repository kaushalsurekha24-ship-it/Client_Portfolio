# Digital Marketing Portfolio — 4K & Full HD Cinematic Animation

A responsive digital marketing portfolio website for **Elena Vance (Digital Marketing Professional & Growth Strategist)** featuring a continuous 24fps cinematic hero animation with synced narrative milestones.

---

## 🔍 Root Cause Analysis of Previous Pixelation & Blur

During detailed forensic inspection of the codebase and source assets, several root causes were identified and fixed:

1. **Severe Lossy Re-Compression by Ezgif**:
   - The original Google Flow generation was exported via `ezgif.com` into JPEG frames (`ezgif-frame-001.jpg` to `300.jpg`) with an average file size of only **~38 KB per 1080p frame**.
   - This introduced heavy 8×8 Discrete Cosine Transform (DCT) block artifacts, ringing around purple marketing graphics, and color chroma subsampling (4:2:0).
2. **Frame Rate Conversion & Stutter Cadence (58 Duplicate Frames)**:
   - Ezgif converted the 24fps source video to 30fps without interpolation, duplicating 1 frame every 5 frames (~20% duplicate rate). This caused repeated micro-stutters and frozen frames during animation.
3. **No 4K Asset Tier for High-Density Displays**:
   - On 4K monitors (3840×2160), 1440p displays, and Retina/high-DPI laptop displays (DPR 1.5× – 2.0×), the 1080p 38KB frames were being stretched up to 4× their native pixel density.
4. **CSS Mask Compositing Blurriness**:
   - In [`style.css`](style.css), `.scroll-canvas` had `mask-image: radial-gradient(...)` applied. In Chromium-based browsers, applying a CSS mask directly to an active `<canvas>` causes the GPU compositing engine to rasterize and soften/blur the output buffer.
5. **Canvas Backing Resolution & Resampling Quality**:
   - Canvas context previously lacked `ctx.imageSmoothingQuality = 'high'`, resulting in low-quality bilinear resampling when drawing frames.


---


## 🎨 Growth Signal Brand Identity Preserved

The original brand identity and color palette are maintained:
- **Warm white**: `#F7F6F3`
- **Pure white**: `#FFFFFF`
- **Deep purple**: `#321447`
- **Rich plum**: `#49245F`
- **Charcoal**: `#29252D`
- **Muted lavender**: `#C9B8D9`

All narrative milestones, KPI badges, typography (`Outfit` & `Plus Jakarta Sans`), and layout structures remain intact.

---

## 🚀 How to Run Locally

Start a local HTTP server:

```powershell
python -m http.server 8080
```

Open your browser to `http://localhost:8080/index.html`.
