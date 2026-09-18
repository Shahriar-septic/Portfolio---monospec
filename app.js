// Fallback list of frames for Create_a_cinematic__realistic_video_20260917081853_frames
const FALLBACK_FRAMES = [
  "frame_001.jpg","frame_002.jpg","frame_003.jpg","frame_004.jpg","frame_005.jpg",
  "frame_006.jpg","frame_007.jpg","frame_008.jpg","frame_009.jpg","frame_010.jpg",
  "frame_011.jpg","frame_012.jpg","frame_013.jpg","frame_014.jpg","frame_015.jpg",
  "frame_016.jpg","frame_017.jpg","frame_018.jpg","frame_019.jpg","frame_020.jpg",
  "frame_021.jpg","frame_022.jpg","frame_023.jpg","frame_024.jpg","frame_025.jpg",
  "frame_026.jpg","frame_027.jpg","frame_028.jpg","frame_029.jpg","frame_030.jpg",
  "frame_031.jpg","frame_032.jpg","frame_033.jpg","frame_034.jpg","frame_035.jpg",
  "frame_036.jpg","frame_037.jpg","frame_038.jpg","frame_039.jpg","frame_040.jpg",
  "frame_041.jpg","frame_042.jpg","frame_043.jpg","frame_044.jpg","frame_045.jpg",
  "frame_046.jpg","frame_047.jpg","frame_048.jpg","frame_049.jpg","frame_050.jpg",
  "frame_051.jpg","frame_052.jpg","frame_053.jpg","frame_054.jpg","frame_055.jpg",
  "frame_056.jpg","frame_057.jpg","frame_058.jpg","frame_059.jpg","frame_060.jpg",
  "frame_061.jpg","frame_062.jpg","frame_063.jpg","frame_064.jpg","frame_065.jpg",
  "frame_066.jpg","frame_067.jpg","frame_068.jpg","frame_069.jpg","frame_070.jpg",
  "frame_071.jpg","frame_072.jpg","frame_073.jpg","frame_074.jpg","frame_075.jpg",
  "frame_076.jpg","frame_077.jpg","frame_078.jpg","frame_079.jpg","frame_080.jpg",
  "frame_081.jpg","frame_082.jpg","frame_083.jpg","frame_084.jpg","frame_085.jpg",
  "frame_086.jpg","frame_087.jpg","frame_088.jpg","frame_089.jpg","frame_090.jpg",
  "frame_091.jpg","frame_092.jpg","frame_093.jpg","frame_094.jpg","frame_095.jpg",
  "frame_096.jpg","frame_097.jpg","frame_098.jpg","frame_099.jpg","frame_100.jpg",
  "frame_101.jpg","frame_102.jpg","frame_103.jpg","frame_104.jpg","frame_105.jpg",
  "frame_106.jpg","frame_107.jpg","frame_108.jpg","frame_109.jpg","frame_110.jpg",
  "frame_111.jpg","frame_112.jpg","frame_113.jpg","frame_114.jpg","frame_115.jpg",
  "frame_116.jpg","frame_117.jpg","frame_118.jpg","frame_119.jpg","frame_120.jpg",
  "frame_121.jpg","frame_122.jpg","frame_123.jpg","frame_124.jpg","frame_125.jpg",
  "frame_126.jpg","frame_127.jpg","frame_129.jpg","frame_130.jpg","frame_131.jpg"
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

// Preload all frames in memory with priority for the hero section
function preloadFrames() {
  if (!canvas || !ctx) return;
  loadedImages = new Array(totalFrames);
  loadedCount = 0;
  if (loader) loader.classList.remove('hidden');
  if (loaderBar) loaderBar.style.width = '0%';

  function onFrameReady(index, img) {
    loadedImages[index] = img;
    loadedCount++;

    // Instantly render first frame as soon as it arrives
    if (index === 0 && lastRenderedIndex === -1) {
      drawImageCover(img);
      lastRenderedIndex = 0;
    }

    const pct = Math.round((loadedCount / totalFrames) * 100);
    if (loaderBar) loaderBar.style.width = `${pct}%`;

    if (loadedCount === totalFrames) {
      setTimeout(() => {
        if (loader) loader.classList.add('hidden');
      }, 250);
    }
  }

  function loadSingleFrame(index) {
    const filename = frameFiles[index];
    const img = new Image();

    img.onload = () => {
      if ('decode' in img) {
        img.decode()
          .then(() => onFrameReady(index, img))
          .catch(() => onFrameReady(index, img));
      } else {
        onFrameReady(index, img);
      }
    };

    img.onerror = () => {
      console.warn('Failed to load frame:', filename);
      loadedCount++;
    };

    img.src = BASE_PATH + filename;
  }

  // Phase 1: Load the first 24 frames immediately for instant, smooth hero interaction
  const immediateFrames = Math.min(24, totalFrames);
  for (let i = 0; i < immediateFrames; i++) {
    loadSingleFrame(i);
  }

  // Phase 2: Progressively queue the remaining frames in small batches so network isn't clogged
  let nextBatchStart = immediateFrames;
  const batchSize = 16;
  function loadNextBatch() {
    if (nextBatchStart >= totalFrames) return;
    const batchEnd = Math.min(nextBatchStart + batchSize, totalFrames);
    for (let i = nextBatchStart; i < batchEnd; i++) {
      loadSingleFrame(i);
    }
    nextBatchStart = batchEnd;
    if (nextBatchStart < totalFrames) {
      setTimeout(loadNextBatch, 50);
    }
  }
  setTimeout(loadNextBatch, 80);
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
  const interactiveSelector = 'a, button, input, select, textarea, .contact-info-card, .pricing-card, .tier-card, .btn-choose-plan, .btn-contact, .ask-whatsapp-btn, .curr-btn, .social-icon, .btn-start-project, .btn-send-message, .hamburger-btn, .mobile-nav-link, .mobile-drawer-close, .mobile-btn-contact, .mobile-btn-whatsapp';

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

// Initialize sequence
function init() {
  initCustomCursor();
  initMobileNav();
  initPricingTimelineToggle();
  initPlanTierToggle();

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

