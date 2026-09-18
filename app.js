// Optimized WebP list of frames for Create_a_cinematic__realistic_video_20260917081853_frames
const FALLBACK_FRAMES = [
  "frame_001.webp","frame_002.webp","frame_003.webp","frame_004.webp","frame_005.webp",
  "frame_006.webp","frame_007.webp","frame_008.webp","frame_009.webp","frame_010.webp",
  "frame_011.webp","frame_012.webp","frame_013.webp","frame_014.webp","frame_015.webp",
  "frame_016.webp","frame_017.webp","frame_018.webp","frame_019.webp","frame_020.webp",
  "frame_021.webp","frame_022.webp","frame_023.webp","frame_024.webp","frame_025.webp",
  "frame_026.webp","frame_027.webp","frame_028.webp","frame_029.webp","frame_030.webp",
  "frame_031.webp","frame_032.webp","frame_033.webp","frame_034.webp","frame_035.webp",
  "frame_036.webp","frame_037.webp","frame_038.webp","frame_039.webp","frame_040.webp",
  "frame_041.webp","frame_042.webp","frame_043.webp","frame_044.webp","frame_045.webp",
  "frame_046.webp","frame_047.webp","frame_048.webp","frame_049.webp","frame_050.webp",
  "frame_051.webp","frame_052.webp","frame_053.webp","frame_054.webp","frame_055.webp",
  "frame_056.webp","frame_057.webp","frame_058.webp","frame_059.webp","frame_060.webp",
  "frame_061.webp","frame_062.webp","frame_063.webp","frame_064.webp","frame_065.webp",
  "frame_066.webp","frame_067.webp","frame_068.webp","frame_069.webp","frame_070.webp",
  "frame_071.webp","frame_072.webp","frame_073.webp","frame_074.webp","frame_075.webp",
  "frame_076.webp","frame_077.webp","frame_078.webp","frame_079.webp","frame_080.webp",
  "frame_081.webp","frame_082.webp","frame_083.webp","frame_084.webp","frame_085.webp",
  "frame_086.webp","frame_087.webp","frame_088.webp","frame_089.webp","frame_090.webp",
  "frame_091.webp","frame_092.webp","frame_093.webp","frame_094.webp","frame_095.webp",
  "frame_096.webp","frame_097.webp","frame_098.webp","frame_099.webp","frame_100.webp",
  "frame_101.webp","frame_102.webp","frame_103.webp","frame_104.webp","frame_105.webp",
  "frame_106.webp","frame_107.webp","frame_108.webp","frame_109.webp","frame_110.webp",
  "frame_111.webp","frame_112.webp","frame_113.webp","frame_114.webp","frame_115.webp",
  "frame_116.webp","frame_117.webp","frame_118.webp","frame_119.webp","frame_120.webp",
  "frame_121.webp","frame_122.webp","frame_123.webp","frame_124.webp","frame_125.webp",
  "frame_126.webp","frame_127.webp","frame_129.webp","frame_130.webp","frame_131.webp"
];

let frameFiles = FALLBACK_FRAMES;
let totalFrames = frameFiles.length;
const BASE_PATH = './frames/';

const canvas = document.getElementById('cinema-canvas');
const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');

let loadedImages = [];
let loadedCount = 0;
let targetFrame = 0;
let currentFrame = 0;
let lastRenderedIndex = -1;
const LERP_FACTOR = 0.14;
const FRAME_WIDTH = 1920;
const FRAME_HEIGHT = 1080;

let cachedMaxScroll = 0;

function recalculateMaxScroll() {
  const docHeight = Math.max(
    document.body ? document.body.scrollHeight : 0,
    document.documentElement ? document.documentElement.scrollHeight : 0,
    document.body ? document.body.offsetHeight : 0,
    document.documentElement ? document.documentElement.offsetHeight : 0
  );
  const vpHeight = document.documentElement ? document.documentElement.clientHeight : window.innerHeight;
  cachedMaxScroll = Math.max(1, docHeight - vpHeight);
}

// Fixed 1920x1080 canvas buffer paired with CSS object-fit: cover
// This prevents mobile address-bar collapse from clearing the canvas or distorting the aspect ratio
function setupCanvas() {
  if (!canvas || !ctx) return;
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  recalculateMaxScroll();

  if (lastRenderedIndex >= 0) {
    const img = getClosestLoadedFrame(lastRenderedIndex);
    if (img) drawImageCover(img);
  }
}

if (canvas && ctx) {
  setupCanvas();
  window.addEventListener('resize', recalculateMaxScroll, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(recalculateMaxScroll, 150), { passive: true });
}

// Draw image covering 1920x1080 canvas buffer without distortion
function drawImageCover(img) {
  if (!img || !img.complete || img.naturalWidth === 0 || !ctx) return;
  ctx.drawImage(img, 0, 0, FRAME_WIDTH, FRAME_HEIGHT);
}

// Fallback to nearest neighbor frame during fast scrubbing
function getClosestLoadedFrame(index) {
  if (loadedImages[index] && loadedImages[index].complete && loadedImages[index].naturalWidth > 0) {
    return loadedImages[index];
  }
  for (let offset = 1; offset < totalFrames; offset++) {
    const prev = index - offset;
    if (prev >= 0 && loadedImages[prev] && loadedImages[prev].complete && loadedImages[prev].naturalWidth > 0) {
      return loadedImages[prev];
    }
    const next = index + offset;
    if (next < totalFrames && loadedImages[next] && loadedImages[next].complete && loadedImages[next].naturalWidth > 0) {
      return loadedImages[next];
    }
  }
  return null;
}

// Scroll position mapper & Navigation Active Pill
function updateTarget() {
  if (!cachedMaxScroll) recalculateMaxScroll();
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const progress = Math.max(0, Math.min(1, scrollY / (cachedMaxScroll || 1)));
  targetFrame = progress * (totalFrames - 1);

  // Buffer upcoming frames around the user's scroll direction
  bufferWindowAround(Math.round(targetFrame), 14);

  // Navbar subtle blur background toggle on scroll
  if (navbar) {
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Update active pill indicator based on scroll section
  const sections = document.querySelectorAll('section[id]');
  let currentSection = 'overview';
  sections.forEach(sec => {
    const top = sec.offsetTop - 200;
    if (scrollY >= top) {
      currentSection = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  if (mobileNavLinks.length > 0 && sections.length > 0) {
    mobileNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection}` || href === `index.html#${currentSection}`) {
        link.classList.add('active');
      } else if (href && href.includes('#')) {
        link.classList.remove('active');
      }
    });
  }
}

window.addEventListener('scroll', updateTarget, { passive: true });

// Momentum interpolation loop for video frames
function animate() {
  const diff = targetFrame - currentFrame;
  if (Math.abs(diff) > 0.001) {
    currentFrame += diff * LERP_FACTOR;
  } else {
    currentFrame = targetFrame;
  }

  const frameIndex = Math.min(totalFrames - 1, Math.max(0, Math.round(currentFrame)));
  if (frameIndex !== lastRenderedIndex) {
    const img = getClosestLoadedFrame(frameIndex);
    if (img) {
      drawImageCover(img);
      lastRenderedIndex = frameIndex;
    }
  }

  requestAnimationFrame(animate);
}

let frameStatus = new Uint8Array(totalFrames); // 0=unrequested, 1=loading, 2=loaded, 3=error

function loadSingleFrame(index, priorityHigh = false) {
  if (index < 0 || index >= totalFrames || frameStatus[index] !== 0) return;
  frameStatus[index] = 1;

  const filename = frameFiles[index];
  const img = new Image();
  if (priorityHigh && 'fetchPriority' in img) {
    img.fetchPriority = 'high';
  }

  const onReady = () => {
    frameStatus[index] = 2;
    loadedImages[index] = img;
    loadedCount++;

    // Instantly render first frame as soon as it arrives
    if (index === 0 && lastRenderedIndex === -1) {
      drawImageCover(img);
      lastRenderedIndex = 0;
    }

    if (loaderBar) {
      // Progress bar reflects hero readiness (first 8 frames) for immediate feedback
      const heroTarget = Math.min(8, totalFrames);
      const heroCount = loadedImages.slice(0, heroTarget).filter(Boolean).length;
      const pct = Math.min(100, Math.round((heroCount / heroTarget) * 100));
      loaderBar.style.width = `${pct}%`;
      if (heroCount >= heroTarget) {
        setTimeout(() => {
          if (loader) loader.classList.add('hidden');
        }, 150);
      }
    }
  };

  img.onload = () => {
    if ('decode' in img) {
      img.decode().then(onReady).catch(onReady);
    } else {
      onReady();
    }
  };

  img.onerror = () => {
    // Graceful fallback to .jpg if .webp somehow fails to load
    if (filename.endsWith('.webp')) {
      const jpgFallback = filename.replace(/\.webp$/i, '.jpg');
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        loadedImages[index] = fallbackImg;
        frameStatus[index] = 2;
        loadedCount++;
      };
      fallbackImg.onerror = () => {
        frameStatus[index] = 3;
        loadedCount++;
      };
      fallbackImg.src = BASE_PATH + jpgFallback;
    } else {
      frameStatus[index] = 3;
      loadedCount++;
    }
  };

  img.src = BASE_PATH + filename;
}

// Proactively buffer a window of frames around the active scrub position
function bufferWindowAround(centerIndex, radius = 12) {
  const start = Math.max(0, centerIndex - 4);
  const end = Math.min(totalFrames - 1, centerIndex + radius);
  for (let i = start; i <= end; i++) {
    if (frameStatus[i] === 0) {
      loadSingleFrame(i);
    }
  }
}

// Preload priority hero frames, then buffer ahead during scroll & idle
function preloadFrames() {
  if (!canvas || !ctx) return;
  loadedImages = new Array(totalFrames);
  frameStatus = new Uint8Array(totalFrames);
  loadedCount = 0;
  if (loader) loader.classList.remove('hidden');
  if (loaderBar) loaderBar.style.width = '0%';

  // Phase 1: Immediately fetch the first 8 frames to guarantee instant hero render and smooth start
  const heroFrames = Math.min(8, totalFrames);
  for (let i = 0; i < heroFrames; i++) {
    loadSingleFrame(i, i === 0);
  }

  // Phase 2: Progressively buffer upcoming frames using requestIdleCallback / throttled idle
  let idlePtr = heroFrames;
  function scheduleIdleBuffer() {
    if (idlePtr >= totalFrames) return;
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(() => cb({ timeRemaining: () => 15 }), 120));
    idleCallback((deadline) => {
      while ((deadline.timeRemaining() > 4 || deadline.didTimeout) && idlePtr < totalFrames) {
        if (frameStatus[idlePtr] === 0) {
          loadSingleFrame(idlePtr);
        }
        idlePtr++;
      }
      if (idlePtr < totalFrames) {
        setTimeout(scheduleIdleBuffer, 120);
      }
    }, { timeout: 1000 });
  }

  // Delay idle queue slightly so initial DOM, fonts, and critical assets have 100% bandwidth
  setTimeout(scheduleIdleBuffer, 400);
}

// ===================================================
// SLEEK INTERACTIVE CURSOR ANIMATION
// ===================================================
function initCustomCursor() {
  // Respect coarse pointer / mobile touch devices
  if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;

  let dot = document.getElementById('cursor-dot');
  let ring = document.getElementById('cursor-ring');

  if (!dot) {
    dot = document.createElement('div');
    dot.id = 'cursor-dot';
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
  }
  if (!ring) {
    ring = document.createElement('div');
    ring.id = 'cursor-ring';
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);
  }

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      dot.classList.add('visible');
      ring.classList.add('visible');
      ringX = mouseX;
      ringY = mouseY;
    }

    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    isVisible = false;
    dot.classList.remove('visible');
    ring.classList.remove('visible');
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    dot.classList.add('visible');
    ring.classList.add('visible');
  });

  window.addEventListener('mousedown', () => {
    ring.classList.add('is-active');
  });

  window.addEventListener('mouseup', () => {
    ring.classList.remove('is-active');
  });

  // Butter-smooth lerp loop for the glowing trailing ring
  const RING_LERP = 0.18;
  function renderCursor() {
    if (isVisible) {
      ringX += (mouseX - ringX) * RING_LERP;
      ringY += (mouseY - ringY) * RING_LERP;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover detection for all interactive elements
  const interactiveSelector = 'a, button, input, select, textarea, .contact-info-card, .pricing-card, .tier-card, .btn-choose-plan, .btn-contact, .ask-whatsapp-btn, .curr-btn, .social-icon, .btn-start-project, .btn-send-message, .hamburger-btn, .mobile-nav-link, .mobile-drawer-close, .mobile-btn-contact, .mobile-btn-whatsapp, .btn-primary-cta, .btn-secondary-cta, .hero-badge, .philo-card, .phone-tab-btn, .phone-avatar-wrap, .phone-start-project-btn, .modal-action-btn, .modal-close-btn, .btn-whatsapp-direct';

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      ring.classList.add('is-hovering');
      dot.classList.add('is-hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      ring.classList.remove('is-hovering');
      dot.classList.remove('is-hovering');
    }
  });
}

// ===================================================
// MOBILE NAVIGATION DRAWER CONTROLLER
// ===================================================
function initMobileNav() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const closeBtn = document.getElementById('mobile-drawer-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const mainContent = document.querySelector('main');

  if (!hamburgerBtn || !drawer) return;

  function openMenu() {
    drawer.classList.add('is-open');
    hamburgerBtn.classList.add('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
    if (mainContent) mainContent.setAttribute('inert', '');
  }

  function closeMenu() {
    drawer.classList.remove('is-open');
    hamburgerBtn.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
    if (mainContent) mainContent.removeAttribute('inert');
  }

  function toggleMenu() {
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Auto-close menu when clicking any link
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu if viewport resized to desktop (> 900px)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && drawer.classList.contains('is-open')) {
      closeMenu();
    }
  }, { passive: true });
}

// ===================================================
// SERVICES PRICING TIMELINE & EXPRESS LAUNCH CONTROLLER
// ===================================================
function initPricingTimelineToggle() {
  const deliveryToggle = document.getElementById('delivery-toggle');
  if (!deliveryToggle) return;

  const labelStandard = document.getElementById('toggle-label-standard');
  const labelExpress = document.getElementById('toggle-label-express');
  const priorityBanner = document.getElementById('express-priority-banner');
  const bannerText = document.getElementById('priority-banner-text');
  const pricingCards = document.querySelectorAll('.pricing-card[data-plan-key]');
  if (pricingCards.length === 0) return;

  // Ensure default is Standard Timeline when navigating to services section
  deliveryToggle.checked = false;

  function updatePrices(isExpress, animate = true) {
    // Update toggle label active states
    if (labelStandard) labelStandard.classList.toggle('active', !isExpress);
    if (labelExpress) labelExpress.classList.toggle('active', isExpress);

    // Update Priority Guarantee Banner
    if (priorityBanner) {
      priorityBanner.classList.toggle('is-active', isExpress);
    }
    if (bannerText) {
      if (isExpress) {
        bannerText.innerHTML = '<strong>⚡ Top Priority Production:</strong> Developer prioritizes Express Launch orders at the top of the production queue ahead of other existing orders.';
      } else {
        bannerText.innerHTML = '<strong>Standard Delivery:</strong> Dedicated milestone-based development with scheduled review cycles.';
      }
    }

    pricingCards.forEach(card => {
      const priceAmountEl = card.querySelector('[data-price-bdt]');
      const priceUsdEl = card.querySelector('[data-price-usd]');
      const expressPillEl = card.querySelector('[data-express-pill]');
      const timelinePillEl = card.querySelector('[data-timeline-pill]');
      const timelineTextEl = card.querySelector('[data-timeline-text]');

      const stdNum = parseInt(card.getAttribute('data-std-num') || '0', 10);
      const expNum = parseInt(card.getAttribute('data-exp-num') || '0', 10);
      const targetNum = isExpress ? expNum : stdNum;
      const startNum = isExpress ? stdNum : expNum;

      const stdUsd = card.getAttribute('data-std-usd') || '';
      const expUsd = card.getAttribute('data-exp-usd') || '';
      const stdTime = card.getAttribute('data-std-time') || '';
      const expTime = card.getAttribute('data-exp-time') || '';

      // Animate price amount
      if (priceAmountEl) {
        if (animate) {
          animateNumber(priceAmountEl, startNum, targetNum, 350);
        } else {
          priceAmountEl.textContent = `Tk ${targetNum.toLocaleString()}`;
        }
      }

      // Update USD subtext
      if (priceUsdEl) {
        priceUsdEl.textContent = `(${isExpress ? expUsd : stdUsd})`;
        priceUsdEl.classList.toggle('highlight', isExpress);
      }

      // Update Express Delta badge
      if (expressPillEl) {
        expressPillEl.classList.toggle('visible', isExpress);
      }

      // Update Timeline pill
      if (timelinePillEl) {
        timelinePillEl.classList.toggle('is-express', isExpress);
      }
      if (timelineTextEl) {
        timelineTextEl.textContent = isExpress ? expTime : stdTime;
      }
    });
  }

  function animateNumber(element, start, end, duration = 350) {
    const startTime = performance.now();
    element.classList.add('price-animating');
    setTimeout(() => element.classList.remove('price-animating'), duration + 60);

    function frame(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      const currentVal = Math.round(start + (end - start) * ease);
      element.textContent = `Tk ${currentVal.toLocaleString()}`;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        element.textContent = `Tk ${end.toLocaleString()}`;
      }
    }
    requestAnimationFrame(frame);
  }

  // Event listener for toggle switch
  deliveryToggle.addEventListener('change', () => {
    updatePrices(deliveryToggle.checked, true);
  });

  // Clicking labels toggles switch directly
  if (labelStandard) {
    labelStandard.addEventListener('click', () => {
      if (deliveryToggle.checked) {
        deliveryToggle.checked = false;
        updatePrices(false, true);
      }
    });
  }
  if (labelExpress) {
    labelExpress.addEventListener('click', () => {
      if (!deliveryToggle.checked) {
        deliveryToggle.checked = true;
        updatePrices(true, true);
      }
    });
  }

  // Initial setup without animation
  updatePrices(false, false);
}

/**
 * Plan Detail Page Timeline & Pricing Toggle (LAUNCH / SCALE / DOMINATE)
 */
function initPlanTierToggle() {
  const deliveryToggle = document.getElementById('plan-delivery-toggle') || document.getElementById('delivery-toggle');
  const tierCards = document.querySelectorAll('.tier-card[data-std-bdt]');
  if (tierCards.length === 0) return;

  let currentCurrency = 'bdt';
  let isExpress = false;

  const labelStandard = document.getElementById('toggle-label-standard');
  const labelExpress = document.getElementById('toggle-label-express');
  const priorityBanner = document.getElementById('express-priority-banner');
  const bannerText = document.getElementById('priority-banner-text');
  const currBtns = document.querySelectorAll('.curr-btn');

  if (deliveryToggle) {
    deliveryToggle.checked = false;
  }

  function renderPlanTiers(animate = false) {
    // Update toggle labels
    if (labelStandard) labelStandard.classList.toggle('active', !isExpress);
    if (labelExpress) labelExpress.classList.toggle('active', isExpress);

    // Update Priority Banner
    if (priorityBanner) {
      priorityBanner.classList.toggle('is-active', isExpress);
    }
    if (bannerText) {
      const expressMsg = bannerText.getAttribute('data-express-msg') || '<strong>⚡ Top Priority Production:</strong> Developer prioritizes Express Launch orders at the top of the production queue ahead of other existing orders.';
      const standardMsg = bannerText.getAttribute('data-standard-msg') || '<strong>Standard Delivery:</strong> Dedicated milestone-based development with scheduled review cycles.';
      bannerText.innerHTML = isExpress ? expressMsg : standardMsg;
    }

    tierCards.forEach(card => {
      const priceEl = card.querySelector('[data-tier-price]');
      const expressPill = card.querySelector('[data-express-pill]');
      const timelinePill = card.querySelector('[data-tier-timeline]');
      const timelineText = card.querySelector('[data-timeline-text]');
      const actionBtn = card.querySelector('.btn-tier');

      const stdBdt = card.getAttribute('data-std-bdt') || '';
      const expBdt = card.getAttribute('data-exp-bdt') || '';
      const stdUsd = card.getAttribute('data-std-usd') || '';
      const expUsd = card.getAttribute('data-exp-usd') || '';

      const stdTime = card.getAttribute('data-std-time') || '';
      const expTime = card.getAttribute('data-exp-time') || '';

      const extraBdt = card.getAttribute('data-extra-bdt') || '+Tk 10,000 Express';
      const extraUsd = card.getAttribute('data-extra-usd') || '+$100 USD Express';

      let targetPrice = '';
      if (currentCurrency === 'usd') {
        targetPrice = isExpress ? (expUsd || stdUsd) : stdUsd;
      } else {
        targetPrice = isExpress ? (expBdt || stdBdt) : stdBdt;
      }

      if (priceEl) {
        if (animate) {
          priceEl.classList.add('price-animating');
          setTimeout(() => priceEl.classList.remove('price-animating'), 350);
        }
        priceEl.textContent = targetPrice;
      }

      if (expressPill) {
        expressPill.textContent = currentCurrency === 'usd' ? extraUsd : extraBdt;
        expressPill.classList.toggle('visible', isExpress);
      }

      if (timelinePill) {
        timelinePill.classList.toggle('is-express', isExpress);
      }
      if (timelineText) {
        timelineText.textContent = isExpress ? expTime : stdTime;
      }

      // Update WhatsApp action link
      if (actionBtn) {
        const baseMsg = card.getAttribute('data-wa-base') || '';
        if (baseMsg) {
          const planTimelineTag = isExpress ? ' (Express Priority - ' + (currentCurrency === 'usd' ? expUsd : expBdt) + ')' : ' (Standard Timeline - ' + (currentCurrency === 'usd' ? stdUsd : stdBdt) + ')';
          const fullMsg = encodeURIComponent(baseMsg + planTimelineTag);
          actionBtn.href = `https://wa.me/8801700620388?text=${fullMsg}`;
        }
      }
    });
  }

  // Currency Switcher
  currBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCurrency = btn.getAttribute('data-curr') || 'bdt';
      renderPlanTiers(false);
    });
  });

  // Timeline Switcher
  if (deliveryToggle) {
    deliveryToggle.addEventListener('change', () => {
      isExpress = deliveryToggle.checked;
      renderPlanTiers(true);
    });
  }

  if (labelStandard) {
    labelStandard.addEventListener('click', () => {
      if (deliveryToggle && deliveryToggle.checked) {
        deliveryToggle.checked = false;
        isExpress = false;
        renderPlanTiers(true);
      }
    });
  }

  if (labelExpress) {
    labelExpress.addEventListener('click', () => {
      if (deliveryToggle && !deliveryToggle.checked) {
        deliveryToggle.checked = true;
        isExpress = true;
        renderPlanTiers(true);
      }
    });
  }

  // Initial render
  renderPlanTiers(false);
}

// ===================================================
// PULSE FROSTED GLASS SLIDING NAVIGATION
// ===================================================
function initSlidingNav() {
  const navPill = document.querySelector('.nav-pill');
  if (!navPill) return;

  const links = Array.from(navPill.querySelectorAll('.nav-link'));
  if (!links.length) return;

  navPill.classList.add('has-indicator');

  let indicator = navPill.querySelector('.nav-indicator-pill');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'nav-indicator-pill';
    indicator.setAttribute('aria-hidden', 'true');
    navPill.appendChild(indicator);
  }

  function getTargetActiveLink() {
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // 1. Contact page
    if (pathname.includes('contact')) {
      const match = links.find(l => {
        const txt = l.textContent.trim().toLowerCase();
        const href = (l.getAttribute('href') || '').toLowerCase();
        return txt.includes('contact') || href.includes('contact');
      });
      if (match) return match;
    }

    // 2. Services / Pricing / Plan pages
    if (pathname.includes('services') || pathname.includes('pricing') || pathname.includes('plan-')) {
      const match = links.find(l => {
        const txt = l.textContent.trim().toLowerCase();
        const href = (l.getAttribute('href') || '').toLowerCase();
        return txt.includes('service') || href.includes('service') || href.includes('pricing');
      });
      if (match) return match;
    }

    // 3. Home / Index page with hash
    if (hash === '#process') {
      const match = links.find(l => {
        const txt = l.textContent.trim().toLowerCase();
        const href = (l.getAttribute('href') || '').toLowerCase();
        return txt.includes('process') || href.includes('process');
      });
      if (match) return match;
    }

    // 4. Default home / overview
    if (pathname === '/' || pathname.endsWith('/index.html') || pathname.endsWith('/index') || pathname === '') {
      const match = links.find(l => {
        const txt = l.textContent.trim().toLowerCase();
        const href = (l.getAttribute('href') || '').toLowerCase();
        return txt.includes('overview') || href.includes('overview');
      });
      if (match) return match;
    }

    // 5. Fallback: check class 'active'
    const preActive = links.find(l => l.classList.contains('active'));
    if (preActive) return preActive;

    return links[0];
  }

  function getLinkMetrics(link) {
    const pillRect = navPill.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    return {
      left: Math.round(linkRect.left - pillRect.left),
      width: Math.round(linkRect.width)
    };
  }

  function moveToLink(link, instant = false) {
    if (!link) return;
    const { left, width } = getLinkMetrics(link);
    if (instant) {
      indicator.classList.add('no-transition');
    } else {
      indicator.classList.remove('no-transition');
    }
    indicator.style.transform = `translate3d(${left}px, 0, 0)`;
    indicator.style.width = `${width}px`;
    indicator.classList.add('is-active');

    if (instant) {
      void indicator.offsetWidth; // force reflow
      indicator.classList.remove('no-transition');
    }
  }

  let currentActiveLink = getTargetActiveLink();

  function setActiveLink(link, animatePill = true) {
    if (!link) return;
    currentActiveLink = link;
    links.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Sync mobile drawer navigation
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const linkText = link.textContent.trim().toLowerCase();
    mobileLinks.forEach(m => {
      const mText = m.textContent.trim().toLowerCase();
      if (mText.includes(linkText) || linkText.includes(mText)) {
        m.classList.add('active');
      } else {
        m.classList.remove('active');
      }
    });

    if (animatePill) {
      moveToLink(link, false);
    }
  }

  // Cross-page redirect animation
  const SESSION_KEY = 'monospec_nav_active_idx';
  const SESSION_TIME_KEY = 'monospec_nav_timestamp';
  let prevIndex = -1;
  try {
    const prevIndexStr = sessionStorage.getItem(SESSION_KEY);
    const prevTimestamp = parseInt(sessionStorage.getItem(SESSION_TIME_KEY) || '0', 10);
    const isRecentRedirect = (Date.now() - prevTimestamp) < 4000;
    if (isRecentRedirect && prevIndexStr !== null) {
      prevIndex = parseInt(prevIndexStr, 10);
    }
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_TIME_KEY);
  } catch (err) {
    // sessionStorage may fail in private mode
  }

  const targetActive = currentActiveLink || links[0];
  const targetIndex = links.indexOf(targetActive);

  if (prevIndex >= 0 && prevIndex < links.length && prevIndex !== targetIndex) {
    // Start at previous link position instantly, then glide smoothly to target link!
    moveToLink(links[prevIndex], true);
    setActiveLink(targetActive, false);
    requestAnimationFrame(() => {
      setTimeout(() => {
        moveToLink(targetActive, false);
      }, 35);
    });
  } else {
    setActiveLink(targetActive, false);
    moveToLink(targetActive, true);
    indicator.classList.add('is-active');
  }

  // Hover & Click behaviors
  links.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
      try {
        sessionStorage.setItem(SESSION_KEY, idx.toString());
        sessionStorage.setItem(SESSION_TIME_KEY, Date.now().toString());
      } catch (err) {}

      const href = link.getAttribute('href') || '';
      if (href.startsWith('#')) {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          if (history.pushState) {
            history.pushState(null, '', href);
          }
          setActiveLink(link, true);
        }
      }
    });

    link.addEventListener('mouseenter', () => {
      moveToLink(link, false);
    });
  });

  navPill.addEventListener('mouseleave', () => {
    moveToLink(currentActiveLink, false);
  });

  // Scroll spy for index.html (Overview vs Philosophy vs Work)
  const overviewSec = document.getElementById('overview');
  const processSec = document.getElementById('process');
  const workSec = document.getElementById('work');
  if (overviewSec && processSec) {
    const overviewLink = links.find(l => l.textContent.trim().toLowerCase().includes('overview'));
    const processLink = links.find(l => l.textContent.trim().toLowerCase().includes('process') || l.textContent.trim().toLowerCase().includes('philosophy'));
    const workLink = links.find(l => l.textContent.trim().toLowerCase().includes('work') || l.textContent.trim().toLowerCase().includes('selected'));

    let isTicking = false;
    window.addEventListener('scroll', () => {
      if (!isTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          const processTop = processSec.offsetTop - 280;
          const workTop = workSec ? workSec.offsetTop - 280 : Infinity;
          if (scrollY >= workTop && workLink) {
            if (currentActiveLink !== workLink) {
              setActiveLink(workLink, true);
            }
          } else if (scrollY >= processTop && processLink) {
            if (currentActiveLink !== processLink) {
              setActiveLink(processLink, true);
            }
          } else if (overviewLink) {
            if (currentActiveLink !== overviewLink) {
              setActiveLink(overviewLink, true);
            }
          }
          isTicking = false;
        });
        isTicking = true;
      }
    }, { passive: true });
  }

  // Window resize & orientation handlers
  window.addEventListener('resize', () => {
    if (currentActiveLink) moveToLink(currentActiveLink, true);
  }, { passive: true });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (currentActiveLink) moveToLink(currentActiveLink, true);
    }, 150);
  }, { passive: true });
}

// ===================================================
// INTERACTIVE PHONE VIEWPORT SIMULATOR
// ===================================================
function initInteractivePhoneMockup() {
  const phoneViewport = document.getElementById('phone-scroll-viewport');
  const tabs = document.querySelectorAll('.phone-tab-btn');
  const tabPanes = document.querySelectorAll('.phone-tab-pane');
  const avatarBtn = document.getElementById('phone-avatar-trigger');
  const tooltip = document.getElementById('phone-micro-tooltip');
  const phoneStartBtns = document.querySelectorAll('.phone-start-project-btn');

  if (!phoneViewport) return;

  // 1. Interactive Tabs Switching
  tabs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetTab = btn.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      tabPanes.forEach(pane => {
        if (pane.id === `phone-pane-${targetTab}`) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  // 2. Profile Avatar Click/Tap Tooltip Toggle
  let tooltipTimer = null;
  if (avatarBtn && tooltip) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = tooltip.classList.contains('is-visible');
      if (isVisible) {
        tooltip.classList.remove('is-visible');
        tooltip.setAttribute('aria-hidden', 'true');
        if (tooltipTimer) clearTimeout(tooltipTimer);
      } else {
        tooltip.classList.add('is-visible');
        tooltip.setAttribute('aria-hidden', 'false');
        if (tooltipTimer) clearTimeout(tooltipTimer);
        tooltipTimer = setTimeout(() => {
          tooltip.classList.remove('is-visible');
          tooltip.setAttribute('aria-hidden', 'true');
        }, 3200);
      }
    });

    // Close tooltip when clicking outside inside phone
    phoneViewport.addEventListener('click', (e) => {
      if (!avatarBtn.contains(e.target) && tooltip.classList.contains('is-visible')) {
        tooltip.classList.remove('is-visible');
        tooltip.setAttribute('aria-hidden', 'true');
        if (tooltipTimer) clearTimeout(tooltipTimer);
      }
    });
  }

  // 3. Functional "Start Project" Button Inside Mobile UI
  phoneStartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Try opening inquiry modal first if available
      const modal = document.getElementById('project-inquiry-modal');
      if (modal && typeof window.openProjectInquiryModal === 'function') {
        window.openProjectInquiryModal();
      } else {
        // Smooth scroll to contact section
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = 'contact.html';
        }
      }
    });
  });

  // 4. Smooth Mousewheel Scroll Containment inside Phone Viewport
  // Prevents scrolling the main outer page until reaching boundary
  phoneViewport.addEventListener('wheel', (e) => {
    const atTop = phoneViewport.scrollTop <= 0;
    const atBottom = phoneViewport.scrollTop + phoneViewport.clientHeight >= phoneViewport.scrollHeight - 1;
    if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
      e.stopPropagation();
    }
  }, { passive: false });
}

// ===================================================
// PROJECT INQUIRY MODAL CONTROLLER
// ===================================================
function initProjectInquiryModal() {
  const modal = document.getElementById('project-inquiry-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const closeBtn = document.getElementById('modal-close-btn');
  const triggers = document.querySelectorAll('.open-inquiry-trigger');

  if (!modal) return;

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  }

  window.openProjectInquiryModal = openModal;
  window.closeProjectInquiryModal = closeModal;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      // If href is #contact, open modal
      const href = trigger.getAttribute('href');
      if (href === '#contact') {
        e.preventDefault();
        openModal();
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

// Initialize sequence
function init() {
  initCustomCursor();
  initMobileNav();
  initSlidingNav();
  initPricingTimelineToggle();
  initPlanTierToggle();
  initInteractivePhoneMockup();
  initProjectInquiryModal();

  if (canvas && ctx) {
    updateTarget();
    preloadFrames();
    requestAnimationFrame(animate);
  }
}

// Start when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

