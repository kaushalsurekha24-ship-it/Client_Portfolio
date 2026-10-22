/**
 * CINEMATIC SCROLL-DRIVEN ZOOM + FRAME ANIMATION CONTROLLER
 * ─────────────────────────────────────────────────────────────
 * 240-frame hero animation driven by mouse wheel / touch input:
 *
 *   Wheel UP   → Zoom IN  + Play frames FORWARD
 *   Wheel DOWN → Zoom OUT + Reverse frames BACKWARD
 *
 * Design principles:
 *   • Restrained, elegant zoom (1.0x → 1.08x) — cinematic, not aggressive
 *   • Dual-lerp system: fast frame tracking + slower cinematic zoom
 *   • Velocity accumulation with momentum decay for fluid fast-scroll
 *   • Immediate direction reversal without restart
 *   • Hold frame & zoom when scroll stops
 *   • Smooth handoff to normal page scroll at progress boundaries
 *
 * Preserved from existing codebase:
 *   • Dual quality tier detection (4K / FHD)
 *   • Progressive keyframe preloading with batch streaming
 *   • High-DPI canvas backing store with bicubic resampling
 *   • Narrative milestone card synchronization
 *   • All HTML structure and CSS styling untouched
 */

document.addEventListener('DOMContentLoaded', () => {
  const FRAME_COUNT = 240;
  const canvas = document.getElementById('scroll-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const scrollTrack = document.getElementById('scroll-track');
  const stickyViewport = document.getElementById('sticky-viewport');
  const preloader = document.getElementById('preloader');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const frameCounter = document.getElementById('frame-counter');
  const scrollStatusText = document.getElementById('scroll-status-text');
  const qualityBadge = document.getElementById('quality-badge');
  const qualityToggleBtn = document.getElementById('quality-toggle-btn');
  const qualityBtnLabel = document.getElementById('quality-btn-label');

  // Narrative Milestone Cards
  const m1 = document.getElementById('milestone-1');
  const m2 = document.getElementById('milestone-2');
  const m3 = document.getElementById('milestone-3');
  const m4 = document.getElementById('milestone-4');

  // Footer Year
  const yearElem = document.getElementById('current-year');
  if (yearElem) yearElem.textContent = new Date().getFullYear();

  // ==========================================================================
  // 1. RESPONSIVE QUALITY TIER SELECTION
  // ==========================================================================
  function detectInitialQualityTier() {
    const saved = localStorage.getItem('elena_portfolio_quality');
    if (saved === '4k' || saved === 'fhd') return saved;

    const dpr = window.devicePixelRatio || 1;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const screenPixels = Math.max(window.screen.width, window.screen.height) * dpr;
    const viewportPixels = Math.max(window.innerWidth, window.innerHeight) * dpr;

    if (!isMobile && (screenPixels >= 2500 || viewportPixels >= 2500)) {
      return '4k';
    }
    return 'fhd';
  }

  let currentTier = detectInitialQualityTier();

  function updateQualityUI() {
    const is4K = currentTier === '4k';
    if (qualityBadge) {
      qualityBadge.textContent = is4K ? '4K MASTER' : 'FULL HD WEB';
      qualityBadge.style.color = is4K ? '#7e22ce' : '#2563eb';
      qualityBadge.style.background = is4K ? 'rgba(126, 34, 206, 0.08)' : 'rgba(37, 99, 235, 0.08)';
      qualityBadge.style.borderColor = is4K ? 'rgba(126, 34, 206, 0.25)' : 'rgba(37, 99, 235, 0.25)';
    }
    if (qualityBtnLabel) {
      qualityBtnLabel.textContent = is4K ? '4K Master (3840×2160)' : 'Full HD (1920×1080)';
    }
  }

  updateQualityUI();

  // ==========================================================================
  // 2. FRAME CACHE & ASSET URL RESOLUTION
  // ==========================================================================
  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let lastRenderedIndex = -1;
  let isCanvasReady = false;

  function getFrameUrl(index, tier = currentTier) {
    const num = String(index + 1).padStart(3, '0');
    const folder = tier === '4k' ? 'frames-4k' : 'frames-fhd';
    return `${folder}/frame-${num}.webp`;
  }

  function getFallbackFrameUrl(index, tier = currentTier) {
    const num = String(index + 1).padStart(3, '0');
    const folder = tier === '4k' ? 'frames-4k' : 'frames-fhd';
    return `${folder}/frame-${num}.jpg`;
  }

  // ==========================================================================
  // 3. CANVAS HIGH-DPI SIZING & PIXEL MAPPING
  // ==========================================================================
  let dpr = window.devicePixelRatio || 1;
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;

    const backingWidth = Math.round(viewportWidth * dpr);
    const backingHeight = Math.round(viewportHeight * dpr);

    if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
      canvas.width = backingWidth;
      canvas.height = backingHeight;
    }

    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    lastRenderedIndex = -1;
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });

  // ==========================================================================
  // 4. PRECISION FRAME RENDERING (ASPECT RATIO CONTAIN)
  // ==========================================================================
  function renderFrame(index) {
    if (index === lastRenderedIndex && isCanvasReady) return;

    // Find requested frame or fallback to nearest loaded neighbor
    let imgToDraw = frames[index];
    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      for (let offset = 1; offset < FRAME_COUNT; offset++) {
        const left = frames[index - offset];
        if (left && left.complete && left.naturalWidth > 0) { imgToDraw = left; break; }
        const right = frames[index + offset];
        if (right && right.complete && right.naturalWidth > 0) { imgToDraw = right; break; }
      }
    }

    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const imgWidth = imgToDraw.naturalWidth;
    const imgHeight = imgToDraw.naturalHeight;

    // Aspect-ratio contain in native physical buffer space
    const scale = Math.min(cw / imgWidth, ch / imgHeight);
    const drawWidth = Math.round(imgWidth * scale);
    const drawHeight = Math.round(imgHeight * scale);
    const drawX = Math.round((cw - drawWidth) / 2);
    const drawY = Math.round((ch - drawHeight) / 2);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(imgToDraw, drawX, drawY, drawWidth, drawHeight);

    lastRenderedIndex = index;

    // Update frame counter pill
    if (frameCounter) {
      const displayNum = String(index + 1).padStart(3, '0');
      frameCounter.textContent = `${displayNum} / ${String(FRAME_COUNT).padStart(3, '0')}`;
    }
  }

  // ==========================================================================
  // 5. INTELLIGENT PROGRESSIVE PRELOADING
  // ==========================================================================
  function loadSingleFrame(index, tier = currentTier) {
    return new Promise((resolve) => {
      if (frames[index] && frames[index].complete && frames[index].naturalWidth > 0) {
        resolve(frames[index]);
        return;
      }
      const img = new Image();
      img.src = getFrameUrl(index, tier);

      const onSuccess = () => {
        frames[index] = img;
        loadedCount++;
        updateLoadProgress();
        resolve(img);
      };

      img.onload = () => {
        if ('decode' in img) {
          img.decode().then(onSuccess).catch(onSuccess);
        } else {
          onSuccess();
        }
      };

      img.onerror = () => {
        // Fallback to JPEG if WebP is unsupported
        const fallbackImg = new Image();
        fallbackImg.src = getFallbackFrameUrl(index, tier);
        fallbackImg.onload = () => {
          frames[index] = fallbackImg;
          loadedCount++;
          updateLoadProgress();
          resolve(fallbackImg);
        };
        fallbackImg.onerror = () => {
          loadedCount++;
          updateLoadProgress();
          resolve(null);
        };
      };
    });
  }

  function updateLoadProgress() {
    const pct = Math.floor((loadedCount / FRAME_COUNT) * 100);
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `${pct}%`;

    // Hide preloader once 15%+ keyframes are buffered
    if (loadedCount >= Math.floor(FRAME_COUNT * 0.15)) {
      hidePreloader();
    }
  }

  let preloaderHidden = false;
  function hidePreloader() {
    if (preloaderHidden) return;
    preloaderHidden = true;
    if (preloader) preloader.classList.add('hidden');
  }

  async function preloadImages(tier = currentTier) {
    // 1. Immediately load & decode Frame 1 for instant display
    await loadSingleFrame(0, tier);
    isCanvasReady = true;
    resizeCanvas();
    renderFrame(0);

    // 2. Preload 20 strategic keyframes evenly spaced
    const keyframes = [];
    const step = 12; // 240 / 12 = 20 keyframes
    for (let i = 0; i < FRAME_COUNT; i += step) {
      if (i !== 0) keyframes.push(i);
    }
    await Promise.all(keyframes.map((idx) => loadSingleFrame(idx, tier)));

    // 3. Stream remaining frames in batches of 8
    const remaining = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      if (!frames[i]) remaining.push(i);
    }

    const batchSize = 8;
    for (let b = 0; b < remaining.length; b += batchSize) {
      const batch = remaining.slice(b, b + batchSize);
      await Promise.all(batch.map((idx) => loadSingleFrame(idx, tier)));
    }

    hidePreloader();
  }

  // Quality Tier Switcher
  if (qualityToggleBtn) {
    qualityToggleBtn.addEventListener('click', () => {
      const newTier = currentTier === '4k' ? 'fhd' : '4k';
      currentTier = newTier;
      localStorage.setItem('elena_portfolio_quality', newTier);
      updateQualityUI();

      for (let i = 0; i < FRAME_COUNT; i++) { frames[i] = null; }
      loadedCount = 0;
      lastRenderedIndex = -1;
      preloadImages(currentTier);
    });
  }

  // ==========================================================================
  // 6. CINEMATIC WHEEL-DRIVEN ZOOM + FRAME ENGINE
  // ==========================================================================
  //
  // Interaction model:
  //   Wheel UP   (deltaY < 0) → progress ↑ → Zoom IN  + Frames FORWARD
  //   Wheel DOWN (deltaY > 0) → progress ↓ → Zoom OUT + Frames REVERSE
  //
  // Boundary transitions:
  //   progress = 0 + scroll down → normal page scroll to footer
  //   At footer + scroll up to top → re-enter animation zone
  //
  // ─── Tuning Constants ─────────────────────────────────────────────────────
  //
  const WHEEL_SENSITIVITY = 0.00035;  // Progress per wheel pixel (tuned for precision)
  const MAX_ZOOM = 0.08;              // Restrained cinematic zoom: 1.00x → 1.08x
  const FRAME_LERP = 0.14;            // Frame tracking lerp — responsive, low-lag
  const ZOOM_LERP = 0.08;             // Zoom lerp — slower, cinematic glide
  const VELOCITY_DECAY = 0.92;        // Momentum decay per frame (0.92 = gentle coast)
  const VELOCITY_THRESHOLD = 0.00002; // Stop applying velocity below this
  const MIN_DELTA_TO_LOCK = 0.0001;   // Minimum wheel input to capture scroll

  // ─── State ────────────────────────────────────────────────────────────────
  let targetProgress = 0;       // Raw target from accumulated input (0 → 1)
  let currentProgress = 0;      // Lerped value driving frame selection
  let currentZoom = 1.0;        // Lerped zoom scale driving CSS transform
  let velocity = 0;             // Accumulated momentum for fluid fast-scroll
  let lastWheelTime = 0;        // Timestamp of last wheel event
  let isAnimationActive = false; // Whether the animation zone is capturing input

  // Touch state
  let touchStartY = 0;
  let lastTouchY = 0;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function isAtPageTop() {
    return window.scrollY <= 2;
  }

  // Smoothstep easing for cinematic zoom curve
  function smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  // Compute the target zoom from progress (with smoothstep easing)
  function getTargetZoom(progress) {
    return 1.0 + smoothstep(progress) * MAX_ZOOM;
  }

  // ─── WHEEL EVENT ──────────────────────────────────────────────────────────

  document.addEventListener('wheel', (e) => {
    if (!isCanvasReady) return;

    const now = performance.now();
    const timeSinceLast = now - lastWheelTime;
    lastWheelTime = now;

    // Normalize deltaY across browsers (pixel vs line vs page modes)
    let normalizedDelta = e.deltaY;
    if (e.deltaMode === 1) normalizedDelta *= 40;  // Line mode → pixels
    if (e.deltaMode === 2) normalizedDelta *= 800;  // Page mode → pixels

    // Case 1: Animation is already active (progress > 0)
    if (targetProgress > MIN_DELTA_TO_LOCK) {
      e.preventDefault();

      // Accumulate with velocity for momentum
      const progressDelta = -normalizedDelta * WHEEL_SENSITIVITY;
      targetProgress += progressDelta;
      targetProgress = Math.max(0, Math.min(1, targetProgress));

      // Add to velocity for momentum coasting
      velocity += progressDelta * 0.3;

      isAnimationActive = true;
      return;
    }

    // Case 2: At page top, scrolling UP → enter animation zone
    if (isAtPageTop() && normalizedDelta < 0) {
      e.preventDefault();

      const progressDelta = -normalizedDelta * WHEEL_SENSITIVITY;
      targetProgress += progressDelta;
      targetProgress = Math.max(0, Math.min(1, targetProgress));
      velocity += progressDelta * 0.3;

      isAnimationActive = true;
      return;
    }

    // Case 3: progress ≈ 0 + scrolling DOWN → allow normal page scroll to footer
    isAnimationActive = false;

  }, { passive: false });

  // ─── TOUCH EVENTS (Mobile) ────────────────────────────────────────────────

  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    lastTouchY = touchStartY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isCanvasReady) return;

    const currentTouchY = e.touches[0].clientY;
    const fingerDelta = lastTouchY - currentTouchY; // positive = finger moved UP
    lastTouchY = currentTouchY;

    // On touch: finger swipe UP = zoom in = increase progress
    const progressDelta = fingerDelta * WHEEL_SENSITIVITY * 1.8;

    if (targetProgress > MIN_DELTA_TO_LOCK) {
      e.preventDefault();
      targetProgress += progressDelta;
      targetProgress = Math.max(0, Math.min(1, targetProgress));
      velocity += progressDelta * 0.2;
      isAnimationActive = true;
      return;
    }

    if (isAtPageTop() && fingerDelta > 0) {
      e.preventDefault();
      targetProgress += progressDelta;
      targetProgress = Math.max(0, Math.min(1, targetProgress));
      velocity += progressDelta * 0.2;
      isAnimationActive = true;
    }
  }, { passive: false });

  // ─── KEYBOARD (Frame-by-frame inspection) ─────────────────────────────────

  window.addEventListener('keydown', (e) => {
    const step = 1 / FRAME_COUNT;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      targetProgress = Math.min(1, targetProgress + step);
      velocity = 0; // Cancel momentum for precise stepping
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      targetProgress = Math.max(0, targetProgress - step);
      velocity = 0;
    }
  });

  // ─── NARRATIVE MILESTONES ─────────────────────────────────────────────────

  function updateMilestones(progress) {
    if (m1) {
      if (progress >= 0.0 && progress < 0.25) m1.classList.add('active');
      else m1.classList.remove('active');
    }
    if (m2) {
      if (progress >= 0.25 && progress < 0.50) m2.classList.add('active');
      else m2.classList.remove('active');
    }
    if (m3) {
      if (progress >= 0.50 && progress < 0.75) m3.classList.add('active');
      else m3.classList.remove('active');
    }
    if (m4) {
      if (progress >= 0.75) m4.classList.add('active');
      else m4.classList.remove('active');
    }
  }

  // ─── STATUS PILL UI ───────────────────────────────────────────────────────

  function updateStatusPill(progress) {
    const iconI = document.getElementById('playback-icon-i');

    if (progress <= 0.003) {
      if (scrollStatusText) scrollStatusText.textContent = 'Scroll to Explore';
      if (iconI) iconI.className = 'fa-solid fa-angles-up';
    } else if (progress >= 0.997) {
      if (scrollStatusText) scrollStatusText.textContent = 'Scroll Down to Continue';
      if (iconI) iconI.className = 'fa-solid fa-angles-down';
    } else {
      if (scrollStatusText) scrollStatusText.textContent = 'Exploring';
      if (iconI) iconI.className = 'fa-solid fa-clapperboard';
    }
  }

  // ==========================================================================
  // 7. CINEMATIC DUAL-LERP RENDER LOOP (60 FPS)
  // ==========================================================================
  //
  // Two independent lerps running at different speeds:
  //   • Frame lerp (FRAME_LERP = 0.14) — responsive, low perceived lag
  //   • Zoom lerp  (ZOOM_LERP  = 0.08) — slower, cinematic glide
  //
  // This separation makes the frame tracking feel snappy while the zoom
  // floats gracefully, creating that premium Apple-style feel.
  //

  function renderLoop() {
    if (!isCanvasReady) {
      requestAnimationFrame(renderLoop);
      return;
    }

    // ── Apply momentum velocity ──
    if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
      targetProgress += velocity;
      targetProgress = Math.max(0, Math.min(1, targetProgress));
      velocity *= VELOCITY_DECAY; // Decay toward zero
    } else {
      velocity = 0;
    }

    // ── Lerp frame progress (fast, responsive) ──
    const frameDelta = targetProgress - currentProgress;
    if (Math.abs(frameDelta) > 0.0003) {
      currentProgress += frameDelta * FRAME_LERP;
    } else {
      currentProgress = targetProgress;
    }

    // ── Map progress → frame index ──
    const frameIndex = Math.round(currentProgress * (FRAME_COUNT - 1));
    const clampedIndex = Math.max(0, Math.min(FRAME_COUNT - 1, frameIndex));
    renderFrame(clampedIndex);

    // ── Lerp zoom (slower, cinematic) ──
    const targetZoom = getTargetZoom(currentProgress);
    const zoomDelta = targetZoom - currentZoom;
    if (Math.abs(zoomDelta) > 0.00005) {
      currentZoom += zoomDelta * ZOOM_LERP;
    } else {
      currentZoom = targetZoom;
    }

    // ── Apply zoom transform to canvas ──
    // Round to 6 decimal places to avoid sub-pixel jitter
    const roundedZoom = Math.round(currentZoom * 1000000) / 1000000;
    canvas.style.transform = `translate(-50%, -50%) scale(${roundedZoom})`;

    // ── Update UI ──
    updateMilestones(currentProgress);
    updateStatusPill(currentProgress);

    requestAnimationFrame(renderLoop);
  }

  // ─── Scroll pill: click to reset or preview ───────────────────────────────

  const scrollPill = document.getElementById('scroll-pill');
  if (scrollPill) {
    scrollPill.addEventListener('click', () => {
      velocity = 0;
      if (targetProgress > 0.01) {
        targetProgress = 0;
      }
    });
  }

  // ─── Fallback preloader timeout ───────────────────────────────────────────
  setTimeout(hidePreloader, 3500);

  // ==========================================================================
  // INITIALIZE
  // ==========================================================================
  preloadImages();
  resizeCanvas();
  updateMilestones(0);

  // Set initial status
  if (scrollStatusText) scrollStatusText.textContent = 'Scroll to Explore';
  const iconI = document.getElementById('playback-icon-i');
  if (iconI) iconI.className = 'fa-solid fa-angles-up';

  requestAnimationFrame(renderLoop);
});
