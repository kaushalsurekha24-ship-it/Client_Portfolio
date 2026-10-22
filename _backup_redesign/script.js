/**
 * ELENA VANCE — PREMIUM DIGITAL MARKETING PORTFOLIO CONTROLLER
 * ─────────────────────────────────────────────────────────────
 * Features:
 *   • Scroll-driven hero portrait animation (240 high-res frames)
 *   • Synchronized cinematic zoom (1.00x → 1.08x)
 *   • Subtle pointer parallax for elegant depth
 *   • Signature Growth Signal SVG drawing path synced to progress
 *   • Dual quality tier detection (4K Master / Full HD WebP)
 *   • Natural page scroll handoff (zero scroll-hijacking)
 *   • Staggered narrative milestone card reveals
 *   • Mobile drawer navigation & strategic contact form handling
 */

document.addEventListener('DOMContentLoaded', () => {
  const FRAME_COUNT = 240;

  // DOM Elements
  const canvas = document.getElementById('scroll-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const scrollTrack = document.getElementById('scroll-track');
  const stickyViewport = document.getElementById('sticky-viewport');
  const preloader = document.getElementById('preloader');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const frameCounter = document.getElementById('frame-counter');
  const scrollStatusText = document.getElementById('scroll-status-text');
  const qualityToggleBtn = document.getElementById('quality-toggle-btn');
  const qualityBtnLabel = document.getElementById('quality-btn-label');
  const heroIntroOverlay = document.getElementById('hero-intro-overlay');

  // Growth Signal SVG & Nodes
  const growthSignalPath = document.getElementById('growth-signal-path');
  const node1 = document.getElementById('node-1');
  const node2 = document.getElementById('node-2');
  const node3 = document.getElementById('node-3');

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
    if (qualityBtnLabel) {
      qualityBtnLabel.textContent = is4K ? '4K Master (2160p)' : 'Full HD (1080p)';
    }
  }

  updateQualityUI();

  // ==========================================================================
  // 2. FRAME CACHE & ASSET RESOLUTION
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
    if (isCanvasReady && lastRenderedIndex !== -1) {
      renderFrame(lastRenderedIndex);
    }
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });

  // ==========================================================================
  // 4. PRECISION FRAME RENDERING (ASPECT RATIO CONTAIN)
  // ==========================================================================
  function renderFrame(index) {
    if (index === lastRenderedIndex && isCanvasReady) return;

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

    const scale = Math.min(cw / imgWidth, ch / imgHeight);
    const drawWidth = Math.round(imgWidth * scale);
    const drawHeight = Math.round(imgHeight * scale);
    const drawX = Math.round((cw - drawWidth) / 2);
    const drawY = Math.round((ch - drawHeight) / 2);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(imgToDraw, drawX, drawY, drawWidth, drawHeight);

    lastRenderedIndex = index;

    if (frameCounter) {
      const displayNum = String(index + 1).padStart(3, '0');
      frameCounter.textContent = `${displayNum} / ${String(FRAME_COUNT).padStart(3, '0')}`;
    }
  }

  // ==========================================================================
  // 5. PROGRESSIVE PRELOADING SYSTEM
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

    if (loadedCount >= Math.floor(FRAME_COUNT * 0.12)) {
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
    await loadSingleFrame(0, tier);
    isCanvasReady = true;
    resizeCanvas();
    renderFrame(0);

    // Preload strategic keyframes
    const keyframes = [];
    const step = 10;
    for (let i = 0; i < FRAME_COUNT; i += step) {
      if (i !== 0) keyframes.push(i);
    }
    await Promise.all(keyframes.map((idx) => loadSingleFrame(idx, tier)));

    // Stream remaining frames in batches
    const remaining = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      if (!frames[i]) remaining.push(i);
    }

    const batchSize = 10;
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
  // 6. SCROLL PROGRESS ENGINE & MOTION SYNCHRONIZATION
  // ==========================================================================
  const MAX_ZOOM = 0.08;         // Restrained, elegant zoom (1.00x → 1.08x)
  const FRAME_LERP = 0.12;       // Responsive frame lerp
  const ZOOM_LERP = 0.08;        // Slower, cinematic zoom glide
  const PARALLAX_MAX = 8;        // Subtle depth shift in px

  let targetProgress = 0;
  let currentProgress = 0;
  let currentZoom = 1.0;

  // Pointer movement parallax
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = ((e.clientX / window.innerWidth) - 0.5) * PARALLAX_MAX * 2;
    targetMouseY = ((e.clientY / window.innerHeight) - 0.5) * PARALLAX_MAX * 2;
  }, { passive: true });

  // Calculate natural scroll progress through the hero track
  function calculateScrollProgress() {
    if (!scrollTrack) return 0;
    const rect = scrollTrack.getBoundingClientRect();
    const trackHeight = scrollTrack.offsetHeight - window.innerHeight;
    if (trackHeight <= 0) return 0;

    const progress = Math.max(0, Math.min(1, -rect.top / trackHeight));
    return progress;
  }

  // Update targetProgress on page scroll (native, frictionless)
  window.addEventListener('scroll', () => {
    targetProgress = calculateScrollProgress();
  }, { passive: true });

  // Smoothstep easing for cinematic curve
  function smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  function getTargetZoom(progress) {
    return 1.0 + smoothstep(progress) * MAX_ZOOM;
  }

  // Update Growth Signal SVG path & pulse nodes
  let pathLength = 0;
  if (growthSignalPath) {
    try {
      pathLength = growthSignalPath.getTotalLength();
      growthSignalPath.style.strokeDasharray = pathLength;
      growthSignalPath.style.strokeDashoffset = pathLength;
    } catch (e) {
      pathLength = 2000;
    }
  }

  function updateGrowthSignal(progress) {
    if (growthSignalPath && pathLength > 0) {
      const offset = pathLength * (1 - progress);
      growthSignalPath.style.strokeDashoffset = offset;
    }

    if (node1) {
      if (progress >= 0.12) node1.classList.add('active');
      else node1.classList.remove('active');
    }
    if (node2) {
      if (progress >= 0.42) node2.classList.add('active');
      else node2.classList.remove('active');
    }
    if (node3) {
      if (progress >= 0.72) node3.classList.add('active');
      else node3.classList.remove('active');
    }
  }

  // Update Narrative Milestones
  function updateMilestones(progress) {
    // Hero intro overlay: visible at top, fades out gracefully as user scrolls
    if (heroIntroOverlay) {
      if (progress <= 0.04) {
        heroIntroOverlay.classList.remove('faded');
      } else {
        heroIntroOverlay.classList.add('faded');
      }
    }

    if (m1) {
      if (progress >= 0.12 && progress < 0.36) m1.classList.add('active');
      else m1.classList.remove('active');
    }
    if (m2) {
      if (progress >= 0.36 && progress < 0.62) m2.classList.add('active');
      else m2.classList.remove('active');
    }
    if (m3) {
      if (progress >= 0.62 && progress < 0.86) m3.classList.add('active');
      else m3.classList.remove('active');
    }
    if (m4) {
      if (progress >= 0.86) m4.classList.add('active');
      else m4.classList.remove('active');
    }
  }

  // Status Pill Indicator Text
  function updateStatusPill(progress) {
    if (!scrollStatusText) return;
    if (progress <= 0.04) {
      scrollStatusText.textContent = 'Scroll to Scrub';
    } else if (progress >= 0.96) {
      scrollStatusText.textContent = 'Explore Below';
    } else {
      scrollStatusText.textContent = 'Scrubbing Timeline';
    }
  }

  // ==========================================================================
  // 7. 60 FPS RENDER LOOP
  // ==========================================================================
  function renderLoop() {
    if (!isCanvasReady) {
      requestAnimationFrame(renderLoop);
      return;
    }

    // Lerp progress smoothly
    const frameDelta = targetProgress - currentProgress;
    if (Math.abs(frameDelta) > 0.0002) {
      currentProgress += frameDelta * FRAME_LERP;
    } else {
      currentProgress = targetProgress;
    }

    // Map progress to frame index
    const frameIndex = Math.round(currentProgress * (FRAME_COUNT - 1));
    const clampedIndex = Math.max(0, Math.min(FRAME_COUNT - 1, frameIndex));
    renderFrame(clampedIndex);

    // Lerp cinematic zoom
    const targetZoom = getTargetZoom(currentProgress);
    const zoomDelta = targetZoom - currentZoom;
    if (Math.abs(zoomDelta) > 0.00005) {
      currentZoom += zoomDelta * ZOOM_LERP;
    } else {
      currentZoom = targetZoom;
    }

    // Lerp pointer parallax
    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;

    // Apply combined transform to canvas
    const roundedZoom = Math.round(currentZoom * 100000) / 100000;
    canvas.style.transform = `translate(calc(-50% + ${mouseX.toFixed(2)}px), calc(-50% + ${mouseY.toFixed(2)}px)) scale(${roundedZoom})`;

    // Update synced graphics & UI
    updateGrowthSignal(currentProgress);
    updateMilestones(currentProgress);
    updateStatusPill(currentProgress);

    requestAnimationFrame(renderLoop);
  }

  // Reset to top when clicking status pill
  const scrollPill = document.getElementById('scroll-pill');
  if (scrollPill) {
    scrollPill.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================================================
  // 8. MOBILE MENU DRAWER & INTERACTIONS
  // ==========================================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isActive = mobileNavDrawer.classList.toggle('active');
      const menuIcon = document.getElementById('menu-icon');
      if (menuIcon) {
        menuIcon.className = isActive ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });

    mobileNavDrawer.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('active');
        const menuIcon = document.getElementById('menu-icon');
        if (menuIcon) menuIcon.className = 'fa-solid fa-bars';
      });
    });
  }

  // ==========================================================================
  // 9. STRATEGIC INQUIRY FORM HANDLER
  // ==========================================================================
  const contactForm = document.getElementById('strategic-contact-form');
  const formStatusMsg = document.getElementById('form-status-msg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        if (formStatusMsg) {
          formStatusMsg.className = 'form-status-msg error';
          formStatusMsg.textContent = 'Please fill out all required fields before submitting.';
        }
        return;
      }

      const submitBtn = document.getElementById('submit-inquiry-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Transmitting Inquiry...</span> <i class="fa-solid fa-circle-notch fa-spin"></i>';
      }

      setTimeout(() => {
        if (formStatusMsg) {
          formStatusMsg.className = 'form-status-msg success';
          formStatusMsg.textContent = `Thank you, ${name}! Your strategic inquiry has been received. Elena will respond within 24 business hours.`;
        }
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Send Strategic Inquiry</span> <i class="fa-solid fa-paper-plane"></i>';
        }
      }, 700);
    });
  }

  // Copy email chip
  const copyEmailChip = document.getElementById('copy-email-chip');
  if (copyEmailChip) {
    copyEmailChip.addEventListener('click', (e) => {
      const emailText = 'elena@marketingpro.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(emailText);
        const span = copyEmailChip.querySelector('span');
        if (span) {
          const original = span.textContent;
          span.textContent = 'Email Copied!';
          setTimeout(() => { span.textContent = original; }, 2000);
        }
      }
    });
  }

  // Fallback preloader timeout
  setTimeout(hidePreloader, 3000);

  // Initialize
  targetProgress = calculateScrollProgress();
  currentProgress = targetProgress;
  preloadImages();
  resizeCanvas();
  updateMilestones(currentProgress);
  updateGrowthSignal(currentProgress);

  requestAnimationFrame(renderLoop);
});
