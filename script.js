/**
 * SAKINA MURTAZA SAIFEE — DIGITAL MARKETING EXPERT
 * Portfolio Controller & Interactive Motion Engine
 * ─────────────────────────────────────────────────────────────
 * Features:
 *   • Scroll-driven hero portrait animation (Original 240 frames preserved)
 *   • Synchronized cinematic zoom (1.00x → 1.08x)
 *   • Subtle pointer parallax on ambient background
 *   • Signature Growth Signal SVG drawing path synced to progress
 *   • Automatic high-fidelity device asset resolution
 *   • Natural page scroll handoff (zero scroll-hijacking)
 *   • Narrative milestone card reveals
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
  // 1. RESPONSIVE QUALITY TIER SELECTION (AUTOMATIC & SILENT)
  // ==========================================================================
  function detectInitialQualityTier() {
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

  // ==========================================================================
  // 2. FRAME CACHE & ASSET RESOLUTION (ORIGINAL 240 FRAMES)
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

  // ==========================================================================
  // 6. SCROLL PROGRESS ENGINE & MOTION SYNCHRONIZATION
  // ==========================================================================
  const MAX_ZOOM = 0.08;         // Restrained, elegant zoom (1.00x → 1.08x)
  const FRAME_LERP = 0.12;       // Responsive frame tracking
  const ZOOM_LERP = 0.08;        // Slower, cinematic zoom glide
  const PARALLAX_MAX = 6;        // Subtle decorative depth shift

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

  // Update targetProgress on page scroll (native, frictionless) & navbar transparency
  const navbar = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  }

  window.addEventListener('scroll', () => {
    targetProgress = calculateScrollProgress();
    handleNavbarScroll();
  }, { passive: true });

  handleNavbarScroll();

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

    // Apply transform to canvas
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
  // 9. MOBILE MENU DRAWER & INTERACTIONS
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
  // 10. INTERACTIVE PROJECT FILTER BAR
  // ==========================================================================
  const filterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.case-study-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterValue = btn.getAttribute('data-filter');
      projectCards.forEach((card) => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.classList.remove('filtered-out');
        } else {
          card.classList.add('filtered-out');
        }
      });
    });
  });

  // ==========================================================================
  // 11. INTERACTIVE SCOPE DETAIL ACCORDIONS
  // ==========================================================================
  const scopeToggleBtns = document.querySelectorAll('.btn-toggle-scope');
  scopeToggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const drawer = document.getElementById(targetId);
      if (!drawer) return;

      const isOpen = drawer.classList.toggle('open');
      btn.classList.toggle('active', isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  // ==========================================================================
  // 12. DELIVERABLE MOCKUP TAB SWITCHES
  // ==========================================================================
  const mockupSwitchBtns = document.querySelectorAll('.mockup-switch-btn');
  mockupSwitchBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-tab-group');
      const targetPanelId = btn.getAttribute('data-tab-target');

      // Deactivate siblings in this tab group
      document.querySelectorAll(`.mockup-switch-btn[data-tab-group="${group}"]`).forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Switch panels in the corresponding parent mockup frame
      const parentFrame = btn.closest('.visual-mockup-frame');
      if (parentFrame) {
        parentFrame.querySelectorAll('.mockup-tab-panel').forEach((panel) => {
          panel.classList.remove('active');
        });
        const targetPanel = parentFrame.querySelector(`#${targetPanelId}`);
        if (targetPanel) targetPanel.classList.add('active');
      }
    });
  });

  // ==========================================================================
  // 13. INTERACTIVE 3D BOOK HOVER PERSPECTIVE (Controlled & Subtle)
  // ==========================================================================
  const bookStage = document.getElementById('book-3d-stage');
  const bookCard = document.getElementById('book-3d-card');
  if (bookStage && bookCard) {
    let rafId = null;

    bookStage.addEventListener('mousemove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = bookStage.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
        // Subtle, controlled tilt: resting at -12deg Y / 4deg X
        const rotateY = -12 + x * 12; // ranges between -18deg and -6deg
        const rotateX = 4 - y * 8;   // ranges between 0deg and 8deg
        bookCard.style.transform = `rotateY(${rotateY.toFixed(1)}deg) rotateX(${rotateX.toFixed(1)}deg) scale(1.02)`;
      });
    });

    bookStage.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      bookCard.style.transform = 'rotateY(-12deg) rotateX(4deg) scale(1)';
    });
  }

  // ==========================================================================
  // 14. INTERACTIVE CORE BOOK PILLARS TABS
  // ==========================================================================
  const pillarBtns = document.querySelectorAll('.pillar-tab-btn');
  const pillarPanels = document.querySelectorAll('.pillar-desc-panel');

  pillarBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      pillarBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const pillarId = btn.getAttribute('data-pillar-id');
      pillarPanels.forEach((panel) => panel.classList.remove('active'));
      const activePanel = document.getElementById(`pillar-panel-${pillarId}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  // ==========================================================================
  // 15. CENTERED BACK TO TOP BUTTON
  // ==========================================================================
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================================================
  // 16. STRATEGIC CONTACT FORM HANDLER (WHATSAPP & EMAIL CHANNELS)
  // ==========================================================================
  /**
   * PORTFOLIO CONTACT & ENQUIRY CONFIGURATION
   * Architected for strict validation, spam defence, and reliable delivery.
   * Settings are clearly separated for seamless future client handoff.
   */
  const CONTACT_CONFIG = {
    // ------------------------------------------------------------------------
    // 1. PUBLIC_CONTACT_DETAILS (Display-only credentials shown across the site)
    // ------------------------------------------------------------------------
    public: {
      phoneDisplay: '+91 93711 15252',
      phoneRaw: '+919371115252',
      location: 'Jalgaon, Maharashtra, India'
    },

    // ------------------------------------------------------------------------
    // 2. WHATSAPP_INQUIRY_NUMBER (Recipient number for WhatsApp enquiries)
    // Current testing recipient: +91 8999160463 (Stored in international format: 918999160463)
    // For future client handoff: Replace only this number string.
    // ------------------------------------------------------------------------
    whatsappNumber: '918999160463', // Testing number: +91 8999160463

    // ------------------------------------------------------------------------
    // 3. INQUIRY_EMAIL_CONFIGURATION (Form delivery provider)
    // Web3Forms provides serverless, rate-limited email delivery for static sites.
    // Provider documentation: https://docs.web3forms.com
    // Web3Forms uses a public client-side access key designed specifically for static frontends.
    // ------------------------------------------------------------------------
    emailProvider: 'web3forms', // 'web3forms' or 'formspree'
    web3formsAccessKey: '5197087c-a0fe-426c-818d-b71ab9402632',
    formspreeEndpoint: '', // Optional alternative endpoint

    // ------------------------------------------------------------------------
    // 4. VALIDATION & SECURITY CONSTRAINTS
    // ------------------------------------------------------------------------
    allowedServices: [
      'Social Media Management',
      'Graphic Design & Creatives',
      'Performance Marketing',
      'Content Creation & Reels',
      'Digital Branding',
      'Comprehensive Marketing Consultation'
    ],
    limits: {
      minNameLength: 2,
      maxNameLength: 100,
      minMessageLength: 10,
      maxMessageLength: 3000,
      maxBrandLength: 120,
      maxContactLength: 120,
      cooldownSeconds: 20 // Client-side anti-spam rate limiting between requests
    }
  };

  const contactForm = document.getElementById('strategic-contact-form');
  const formStatusMsg = document.getElementById('form-status-msg');
  const submitWhatsAppBtn = document.getElementById('submit-whatsapp-btn');
  const submitEmailBtn = document.getElementById('submit-email-btn') || document.getElementById('submit-inquiry-btn');
  const messageInput = document.getElementById('contact-message');
  const charCounter = document.getElementById('char-counter');

  // Submission lock and rate-limiting timestamp
  let isSubmitting = false;
  let lastSubmitTimestamp = 0;

  // Real-time character counter for Message
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const currentLength = messageInput.value.length;
      charCounter.textContent = `${currentLength} / ${CONTACT_CONFIG.limits.maxMessageLength}`;
      if (currentLength > CONTACT_CONFIG.limits.maxMessageLength * 0.9) {
        charCounter.classList.add('near-limit');
      } else {
        charCounter.classList.remove('near-limit');
      }
    });
  }

  // Field-specific accessible error management
  function setFieldError(fieldId, errorText) {
    const inputEl = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (inputEl) {
      inputEl.classList.add('has-error');
      inputEl.setAttribute('aria-invalid', 'true');
    }
    if (errorEl) {
      errorEl.textContent = errorText;
      errorEl.classList.add('visible');
    }
  }

  function clearFieldError(fieldId) {
    const inputEl = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (inputEl) {
      inputEl.classList.remove('has-error');
      inputEl.removeAttribute('aria-invalid');
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  function clearAllFieldErrors() {
    ['contact-name', 'contact-phone', 'contact-service', 'contact-brand', 'contact-message'].forEach(clearFieldError);
  }

  // Attach live clear on user input/change
  ['contact-name', 'contact-phone', 'contact-service', 'contact-brand', 'contact-message'].forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (el) {
      el.addEventListener('input', () => clearFieldError(fieldId));
      el.addEventListener('change', () => clearFieldError(fieldId));
    }
  });

  // Safe status message renderer (strictly prevents DOM XSS by avoiding unsafe innerHTML with untrusted strings)
  function setStatusMessage(type, content) {
    if (!formStatusMsg) return;
    formStatusMsg.textContent = '';
    formStatusMsg.className = type ? `form-status-msg active ${type}` : 'form-status-msg active';

    if (typeof content === 'string') {
      formStatusMsg.textContent = content;
    } else if (content instanceof Node) {
      formStatusMsg.appendChild(content);
    }
  }

  // Helper to retrieve and trim form data
  function getContactFormData() {
    const nameInput = document.getElementById('contact-name');
    const phoneInput = document.getElementById('contact-phone');
    const serviceInput = document.getElementById('contact-service');
    const brandInput = document.getElementById('contact-brand');
    const msgInput = document.getElementById('contact-message');
    const botcheckInput = document.getElementById('contact-botcheck');

    return {
      name: nameInput ? nameInput.value.trim() : '',
      phone: phoneInput ? phoneInput.value.trim() : '',
      service: serviceInput ? serviceInput.value.trim() : '',
      brand: brandInput ? brandInput.value.trim() : '',
      message: msgInput ? msgInput.value.trim() : '',
      botcheck: botcheckInput ? botcheckInput.value.trim() : ''
    };
  }

  // Comprehensive client-side validation
  function validateContactForm(data) {
    clearAllFieldErrors();
    let isValid = true;
    let firstInvalidField = null;

    // 0. Anti-spam honeypot check (hidden field)
    if (data.botcheck && data.botcheck.length > 0) {
      return { isValid: false, isBot: true };
    }

    // 1. Name validation
    if (!data.name) {
      setFieldError('contact-name', 'Please enter your full name.');
      isValid = false;
      firstInvalidField = firstInvalidField || 'contact-name';
    } else if (data.name.length < CONTACT_CONFIG.limits.minNameLength) {
      setFieldError('contact-name', `Name must be at least ${CONTACT_CONFIG.limits.minNameLength} characters.`);
      isValid = false;
      firstInvalidField = firstInvalidField || 'contact-name';
    } else if (data.name.length > CONTACT_CONFIG.limits.maxNameLength) {
      setFieldError('contact-name', `Name cannot exceed ${CONTACT_CONFIG.limits.maxNameLength} characters.`);
      isValid = false;
      firstInvalidField = firstInvalidField || 'contact-name';
    } else if (/[\u0000-\u001F\u007F]/.test(data.name)) {
      setFieldError('contact-name', 'Name contains invalid control characters.');
      isValid = false;
      firstInvalidField = firstInvalidField || 'contact-name';
    }

    // 2. Phone / Email validation
    if (!data.phone) {
      setFieldError('contact-phone', 'Please enter your phone number or email address.');
      isValid = false;
      firstInvalidField = firstInvalidField || 'contact-phone';
    } else if (data.phone.length > CONTACT_CONFIG.limits.maxContactLength) {
      setFieldError('contact-phone', `Contact cannot exceed ${CONTACT_CONFIG.limits.maxContactLength} characters.`);
      isValid = false;
      firstInvalidField = firstInvalidField || 'contact-phone';
    } else if (data.phone.includes('@')) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(data.phone)) {
        setFieldError('contact-phone', 'Please enter a valid email address (e.g. name@example.com).');
        isValid = false;
        firstInvalidField = firstInvalidField || 'contact-phone';
      }
    } else {
      const digitsOnly = data.phone.replace(/\D/g, '');
      const validPhoneChars = /^[+]?[\d\s\-().]{7,25}$/;
      if (!validPhoneChars.test(data.phone) || digitsOnly.length < 7 || digitsOnly.length > 15) {
        setFieldError('contact-phone', 'Please enter a valid phone number (min 7 digits) or valid email address.');
        isValid = false;
        firstInvalidField = firstInvalidField || 'contact-phone';
      }
    }

    // 3. Service validation (strict whitelist)
    if (!data.service || !CONTACT_CONFIG.allowedServices.includes(data.service)) {
      setFieldError('contact-service', 'Please select a valid service option from the list.');
      isValid = false;
      firstInvalidField = firstInvalidField || 'contact-service';
    }

    // 4. Brand / Business validation (optional)
    if (data.brand && data.brand.length > CONTACT_CONFIG.limits.maxBrandLength) {
      setFieldError('contact-brand', `Brand name cannot exceed ${CONTACT_CONFIG.limits.maxBrandLength} characters.`);
      isValid = false;
      firstInvalidField = firstInvalidField || 'contact-brand';
    }

    // 5. Message validation
    if (!data.message) {
      setFieldError('contact-message', 'Please describe your project or requirements.');
      isValid = false;
      firstInvalidField = firstInvalidField || 'contact-message';
    } else if (data.message.length < CONTACT_CONFIG.limits.minMessageLength) {
      setFieldError('contact-message', `Please provide more detail (minimum ${CONTACT_CONFIG.limits.minMessageLength} characters).`);
      isValid = false;
      firstInvalidField = firstInvalidField || 'contact-message';
    } else if (data.message.length > CONTACT_CONFIG.limits.maxMessageLength) {
      setFieldError('contact-message', `Message cannot exceed ${CONTACT_CONFIG.limits.maxMessageLength} characters.`);
      isValid = false;
      firstInvalidField = firstInvalidField || 'contact-message';
    }

    if (!isValid && firstInvalidField) {
      const el = document.getElementById(firstInvalidField);
      if (el) el.focus();
    }

    return { isValid, isBot: false };
  }

  // ==========================================
  // CHANNEL A: WHATSAPP DIRECT SEND
  // ==========================================
  function handleWhatsAppSubmit() {
    if (isSubmitting) return;

    const data = getContactFormData();
    const validation = validateContactForm(data);
    if (!validation.isValid) {
      if (validation.isBot) {
        setStatusMessage('error', 'Unable to process submission.');
      }
      return;
    }

    // Format plain-text enquiry with clear structure
    let text = `Hello! I would like to inquire about digital marketing services:\n\n` +
      `• Name: ${data.name}\n` +
      `• Contact: ${data.phone}\n` +
      `• Service: ${data.service}\n`;

    if (data.brand) {
      text += `• Brand / Business: ${data.brand}\n`;
    }

    text += `\n• Project Details & Requirements:\n${data.message}`;

    const encodedMessage = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodedMessage}`;

    // Safe DOM status notification (Zero innerHTML on user inputs)
    const frag = document.createDocumentFragment();
    const p1 = document.createElement('div');
    p1.textContent = 'Opening WhatsApp with your enquiry pre-filled...';
    frag.appendChild(p1);

    const small = document.createElement('small');
    small.style.display = 'inline-block';
    small.style.marginTop = '4px';
    small.textContent = 'If WhatsApp did not open automatically, ';

    const directLink = document.createElement('a');
    directLink.href = whatsappUrl;
    directLink.target = '_blank';
    directLink.rel = 'noopener noreferrer';
    directLink.style.textDecoration = 'underline';
    directLink.style.fontWeight = 'bold';
    directLink.style.color = 'inherit';
    directLink.textContent = 'click here to open WhatsApp';

    small.appendChild(directLink);
    small.appendChild(document.createTextNode('. (Note: Please press Send inside WhatsApp to deliver your message).'));
    frag.appendChild(small);

    setStatusMessage('success', frag);

    // Button animation feedback
    if (submitWhatsAppBtn) {
      const origContent = submitWhatsAppBtn.innerHTML;
      submitWhatsAppBtn.disabled = true;
      submitWhatsAppBtn.innerHTML = '<span>Opening WhatsApp...</span> <i class="fa-brands fa-whatsapp fa-bounce"></i>';
      setTimeout(() => {
        submitWhatsAppBtn.disabled = false;
        submitWhatsAppBtn.innerHTML = origContent;
      }, 1500);
    }

    // Cross-platform launch
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      const newWin = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        window.location.href = whatsappUrl;
      }
    }
  }

  // ==========================================
  // CHANNEL B: EMAIL ENQUIRY SUBMISSION
  // ==========================================
  async function handleEmailSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    const data = getContactFormData();
    const validation = validateContactForm(data);
    if (!validation.isValid) {
      if (validation.isBot) {
        setStatusMessage('error', 'Unable to process submission.');
      }
      return;
    }

    // Rate-limiting check (cooldown)
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastSubmitTimestamp) / 1000);
    if (elapsedSeconds < CONTACT_CONFIG.limits.cooldownSeconds) {
      const waitTime = CONTACT_CONFIG.limits.cooldownSeconds - elapsedSeconds;
      setStatusMessage('error', `Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before submitting another enquiry.`);
      return;
    }

    // Verify email provider configuration
    const hasWeb3FormsKey = Boolean(CONTACT_CONFIG.web3formsAccessKey && CONTACT_CONFIG.web3formsAccessKey.trim());
    const hasFormspree = Boolean(CONTACT_CONFIG.formspreeEndpoint && CONTACT_CONFIG.formspreeEndpoint.trim());

    if (!hasWeb3FormsKey && !hasFormspree) {
      const frag = document.createDocumentFragment();
      const strong = document.createElement('strong');
      strong.textContent = 'Email service is not yet configured.';
      frag.appendChild(strong);
      frag.appendChild(document.createElement('br'));
      const infoSpan = document.createElement('span');
      infoSpan.textContent = 'Please configure your Web3Forms Access Key or Formspree endpoint in script.js under CONTACT_CONFIG.';
      frag.appendChild(infoSpan);
      frag.appendChild(document.createElement('br'));
      const altSpan = document.createElement('span');
      altSpan.style.display = 'inline-block';
      altSpan.style.marginTop = '6px';
      altSpan.textContent = 'In the meantime, please click "Send via WhatsApp" to deliver your enquiry immediately.';
      frag.appendChild(altSpan);
      setStatusMessage('error', frag);
      return;
    }

    // Lock submission & update button state
    isSubmitting = true;
    if (submitWhatsAppBtn) submitWhatsAppBtn.disabled = true;
    const activeBtn = submitEmailBtn;
    let origContent = '';
    if (activeBtn) {
      origContent = activeBtn.innerHTML;
      activeBtn.disabled = true;
      activeBtn.innerHTML = '<span>Transmitting Email...</span> <i class="fa-solid fa-circle-notch fa-spin"></i>';
    }

    setStatusMessage('', 'Transmitting your enquiry to our verified email inbox...');

    try {
      if (CONTACT_CONFIG.emailProvider === 'web3forms' && hasWeb3FormsKey) {
        const emailMatch = data.phone.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const emailValue = emailMatch ? emailMatch[0] : (data.phone.includes('@') ? data.phone : undefined);
        const phoneValue = !emailMatch && !data.phone.includes('@') ? data.phone : undefined;

        const payload = {
          access_key: CONTACT_CONFIG.web3formsAccessKey.trim(),
          name: data.name,
          email: emailValue,
          phone: phoneValue,
          contact_number: data.phone,
          service: data.service,
          brand: data.brand || 'Not Specified',
          message: data.message,
          from_name: data.name,
          subject: `Portfolio Enquiry: ${data.name} — ${data.service}`,
          botcheck: data.botcheck || undefined
        };

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const resData = await response.json().catch(() => ({}));

        if (response.ok && resData.success === true) {
          lastSubmitTimestamp = Date.now();
          setStatusMessage('success', `Thank you, ${data.name}! Your enquiry has been delivered successfully. We will respond within 24 business hours.`);
          if (contactForm) contactForm.reset();
          if (charCounter) charCounter.textContent = `0 / ${CONTACT_CONFIG.limits.maxMessageLength}`;
        } else {
          const providerMsg = (resData && typeof resData.message === 'string') ? resData.message : 'Email delivery provider reported an error.';
          throw new Error(providerMsg);
        }
      } else if (hasFormspree) {
        const response = await fetch(CONTACT_CONFIG.formspreeEndpoint.trim(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: data.name,
            contact: data.phone,
            service: data.service,
            brand: data.brand || 'Not Specified',
            message: data.message
          })
        });

        if (response.ok) {
          lastSubmitTimestamp = Date.now();
          setStatusMessage('success', `Thank you, ${data.name}! Your enquiry has been delivered to our email inbox. We will respond within 24 business hours.`);
          if (contactForm) contactForm.reset();
          if (charCounter) charCounter.textContent = `0 / ${CONTACT_CONFIG.limits.maxMessageLength}`;
        } else {
          const resErr = await response.json().catch(() => ({}));
          throw new Error(resErr.error || 'Formspree rejected the submission.');
        }
      }
    } catch (err) {
      console.error('Email submission error:', err);
      // Safe error rendering without innerHTML on error text
      const frag = document.createDocumentFragment();
      const strongErr = document.createElement('strong');
      strongErr.textContent = 'Delivery Notice: ';
      frag.appendChild(strongErr);
      const safeErrText = (err && typeof err.message === 'string') ? err.message : 'Unable to connect to email provider.';
      frag.appendChild(document.createTextNode(safeErrText));
      frag.appendChild(document.createElement('br'));
      const fallbackNotice = document.createElement('span');
      fallbackNotice.style.display = 'inline-block';
      fallbackNotice.style.marginTop = '4px';
      fallbackNotice.textContent = 'Please use Send via WhatsApp to ensure your message is received immediately.';
      frag.appendChild(fallbackNotice);
      setStatusMessage('error', frag);
      // Preserves visitor inputs on failure so user does not lose their typed message
    } finally {
      isSubmitting = false;
      if (submitWhatsAppBtn) submitWhatsAppBtn.disabled = false;
      if (activeBtn) {
        activeBtn.disabled = false;
        activeBtn.innerHTML = origContent;
      }
    }
  }

  // Event Listeners
  if (submitWhatsAppBtn) {
    submitWhatsAppBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleWhatsAppSubmit();
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleEmailSubmit(e);
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

  // ==========================================================================
  // 17. SCROLL REVEAL & STAGGERED MOTION ENGINE (SECTIONS 2-7)
  // ==========================================================================
  const revealTargets = document.querySelectorAll(`
    .section-header,
    .about-grid > *,
    .service-card,
    .case-study-card,
    .method-step,
    .author-showcase-grid > *,
    .dignitary-card,
    .speaking-box,
    .book-pillars-box,
    .resume-editorial-layout,
    .resume-section-card,
    .achievement-card,
    .achievement-card-luxury,
    .contact-form-wrapper,
    .contact-links-pills
  `);

  revealTargets.forEach((el) => {
    el.classList.add('reveal-item');
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('revealed'));
  }

  // ==========================================================================
  // 18. ACHIEVEMENT PHOTO LIGHTBOX MODAL CONTROLLER
  // ==========================================================================
  const lightboxModal = document.getElementById('achievement-lightbox');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxVenue = document.getElementById('lightbox-venue');
  const lightboxDialog = lightboxModal ? lightboxModal.querySelector('.lightbox-dialog-window') : null;

  function syncLightboxDialogSize() {
    if (!lightboxDialog || !lightboxImg || !lightboxImg.src || !lightboxImg.naturalWidth) return;

    const nw = lightboxImg.naturalWidth;
    const nh = lightboxImg.naturalHeight;
    const ratio = nw / nh; // e.g. 1024 / 859 ≈ 1.192

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const maxAllowedWidth = Math.min(vw * 0.94, 940);
    const targetImgHeight = Math.min(vh * 0.66, 680);

    let exactWidth = targetImgHeight * ratio;

    if (exactWidth > maxAllowedWidth) {
      exactWidth = maxAllowedWidth;
    }
    if (exactWidth < 380 && maxAllowedWidth >= 380) {
      exactWidth = Math.min(460, maxAllowedWidth);
    }

    lightboxDialog.style.width = `${Math.round(exactWidth)}px`;
    lightboxDialog.style.maxWidth = `${Math.round(exactWidth)}px`;
  }

  function openAchievementLightbox(frame) {
    if (!lightboxModal || !frame) return;
    const imgEl = frame.querySelector('.achieve-img');
    const cat = frame.getAttribute('data-caption-cat') || 'Achievement Milestone';
    const title = frame.getAttribute('data-caption-title') || 'Sakina Murtaza Saifee';
    const desc = frame.getAttribute('data-caption-desc') || '';
    const venue = frame.getAttribute('data-caption-venue') || '';

    const isNewspaper = frame.classList.contains('contain-mode') || (imgEl && imgEl.classList.contains('photo-contain'));
    const mediaViewport = lightboxModal.querySelector('.lightbox-media-viewport');
    if (mediaViewport) {
      mediaViewport.style.background = isNewspaper ? '#FFFFFF' : '#0F0415';
    }

    if (imgEl && imgEl.src && !imgEl.classList.contains('img-fallback-active')) {
      lightboxImg.src = imgEl.src;
      lightboxImg.alt = imgEl.alt || title;
      lightboxImg.style.display = 'block';

      if (lightboxImg.complete && lightboxImg.naturalWidth) {
        syncLightboxDialogSize();
      } else {
        lightboxImg.onload = syncLightboxDialogSize;
      }
    } else {
      // If photo is pending import, set placeholder or descriptive preview
      lightboxImg.src = imgEl ? imgEl.src : '';
      lightboxImg.alt = title;
      if (lightboxDialog) {
        lightboxDialog.style.width = '';
        lightboxDialog.style.maxWidth = '900px';
      }
    }

    if (lightboxCategory) lightboxCategory.textContent = cat;
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDesc) lightboxDesc.textContent = desc;
    if (lightboxVenue) {
      lightboxVenue.textContent = '';
      if (venue) {
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-location-dot';
        lightboxVenue.appendChild(icon);
        lightboxVenue.appendChild(document.createTextNode(' ' + venue));
        lightboxVenue.style.display = 'inline-flex';
      } else {
        lightboxVenue.style.display = 'none';
      }
    }

    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeAchievementLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Attach click listeners to all achievement zoom buttons and photo frames
  const photoFrames = document.querySelectorAll('.achieve-photo-frame');
  photoFrames.forEach((frame) => {
    const zoomBtn = frame.querySelector('.photo-zoom-overlay');
    if (zoomBtn) {
      zoomBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openAchievementLightbox(frame);
      });
    }

    // Allow clicking the photo aspect box
    const aspectBox = frame.querySelector('.photo-aspect-box');
    if (aspectBox) {
      aspectBox.addEventListener('click', () => {
        openAchievementLightbox(frame);
      });
    }
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeAchievementLightbox);
  }
  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', closeAchievementLightbox);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeAchievementLightbox();
    }
  });

  window.addEventListener('resize', () => {
    if (lightboxModal && lightboxModal.classList.contains('active')) {
      syncLightboxDialogSize();
    }
  });

  requestAnimationFrame(renderLoop);
});
