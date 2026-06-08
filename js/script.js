/* =============================================
   DNT COMPLIANCE — MAIN SCRIPT
   ============================================= */

// paste your deployed Google Apps Script Web App URL below
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNuakTFbOOXnPYMDaL42gEX2anVk1ufBrNxM_wheDC1zVs3T3gVC6ceLYBHAZOqT7U/exec'; 

document.addEventListener('DOMContentLoaded', () => {
  /* ---- Navbar Scroll Effect ---- */
  const nav = document.getElementById('main-nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 50 || nav.classList.contains('always-scrolled')) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Elite Canvas Globe Implementation ---- */
  const initGlobe = () => {
    const container = document.getElementById('globe-container');
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height, dpr, radius, cx, cy;
    const fov = 600;

    const dots = [];
    const isMobile = window.innerWidth < 768;
    const numDots = isMobile ? 700 : 1200;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < numDots; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numDots);
      dots.push([Math.cos(theta) * Math.sin(phi), Math.cos(phi), Math.sin(theta) * Math.sin(phi)]);
    }

    const markers = [
      { lat: 37.78, lng: -122.42, label: "San Francisco" },
      { lat: 51.51, lng: -0.13, label: "London" },
      { lat: 35.68, lng: 139.69, label: "Tokyo" },
      { lat: -33.87, lng: 151.21, label: "Sydney" },
      { lat: 1.35, lng: 103.82, label: "Singapore" },
      { lat: 55.76, lng: 37.62, label: "Moscow" },
      { lat: -23.55, lng: -46.63, label: "São Paulo" },
      { lat: 19.43, lng: -99.13, label: "Mexico City" },
      { lat: 19.07, lng: 72.87, label: "Mumbai" },
      { lat: 28.61, lng: 77.21, label: "Delhi" },
      { lat: 23.81, lng: 90.41, label: "Dhaka" },
      { lat: 39.90, lng: 116.40, label: "Beijing" },
      { lat: 52.52, lng: 13.40, label: "Berlin" },
      { lat: 36.19, lng: 44.01, label: "Erbil" },
    ];

    const connections = [
      { from: [37.78, -122.42], to: [51.51, -0.13] },
      { from: [51.51, -0.13], to: [39.90, 116.40] },
      { from: [28.61, 77.21], to: [23.81, 90.41] },
      { from: [51.51, -0.13], to: [52.52, 13.40] },
      { from: [51.51, -0.13], to: [28.61, 77.21] },
      { from: [37.78, -122.42], to: [1.35, 103.82] },
      { from: [1.35, 103.82], to: [-33.87, 151.21] },
      { from: [28.61, 77.21], to: [36.19, 44.01] },
      { from: [51.51, -0.13], to: [36.19, 44.01] },
    ];

    let rotY = 0.4, rotX = 0.2;
    let isDragging = false;
    let startX, startY, startRotY, startRotX;
    let time = 0;

    const latLngToXYZ = (lat, lng, r) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + 180) * Math.PI) / 180;
      return [
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      ];
    };

    const rotateX = (x, y, z, a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
    const rotateY = (x, y, z, a) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
    const project = (x, y, z) => [x * (fov / (fov + z)) + cx, y * (fov / (fov + z)) + cy];

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      cx = width / 2;
      cy = height / 2;
      radius = Math.min(width, height) * 0.45;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      // Auto-rotation (always on mobile, or when not dragging on desktop)
      if (!isDragging || isMobile) {
        rotY += 0.005; 
        rotX += Math.sin(time * 0.5) * 0.0015; 
      }
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // NO GLOW OR LIGHT (Removing the radial gradient to fix "white light" issue)

      // Draw Dots
      dots.forEach(dot => {
        let [x, y, z] = [dot[0] * radius, dot[1] * radius, dot[2] * radius];
        [x, y, z] = rotateX(x, y, z, rotX);
        [x, y, z] = rotateY(x, y, z, rotY);
        if (z > 0) return;
        const [sx, sy] = project(x, y, z);
        const alpha = Math.max(0.12, 1 - (z + radius) / (2 * radius));
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2 + alpha * 1.0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 240, 255, ${(alpha * 0.65).toFixed(2)})`;
        ctx.fill();
      });

      // Connections
      connections.forEach(conn => {
        let [x1, y1, z1] = latLngToXYZ(conn.from[0], conn.from[1], radius);
        let [x2, y2, z2] = latLngToXYZ(conn.to[0], conn.to[1], radius);
        [x1, y1, z1] = rotateX(x1, y1, z1, rotX); [x1, y1, z1] = rotateY(x1, y1, z1, rotY);
        [x2, y2, z2] = rotateX(x2, y2, z2, rotX); [x2, y2, z2] = rotateY(x2, y2, z2, rotY);
        if (z1 > radius * 0.35 && z2 > radius * 0.35) return;
        const [sx1, sy1] = project(x1, y1, z1);
        const [sx2, sy2] = project(x2, y2, z2);
        const [midX, midY, midZ] = [(x1+x2)/2, (y1+y2)/2, (z1+z2)/2];
        const midLen = Math.sqrt(midX*midX + midY*midY + midZ*midZ);
        const [ex, ey, ez] = [(midX/midLen)*radius*1.3, (midY/midLen)*radius*1.3, (midZ/midLen)*radius*1.3];
        const [scx, scy] = project(ex, ey, ez);
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.quadraticCurveTo(scx, scy, sx2, sy2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.3;
        ctx.stroke();
        // Traveling Pulse (Sharp)
        const t = (Math.sin(time * 1.8 + conn.from[0]) + 1) / 2;
        const tx = (1-t)**2 * sx1 + 2*(1-t)*t*scx + t**2 * sx2;
        const ty = (1-t)**2 * sy1 + 2*(1-t)*t*scy + t**2 * sy2;
        ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI*2);
        ctx.fillStyle = "rgba(234, 179, 8, 1)"; 
        ctx.shadowBlur = 0; // Removing shadowBlur to fix "pixel light" issue
        ctx.fill();
      });

      // Markers
      markers.forEach(m => {
        let [x, y, z] = latLngToXYZ(m.lat, m.lng, radius);
        [x, y, z] = rotateX(x, y, z, rotX); [x, y, z] = rotateY(x, y, z, rotY);
        if (z > radius * 0.1) return;
        const [sx, sy] = project(x, y, z);
        const pulse = Math.sin(time * 2.2 + m.lat) * 0.5 + 0.5;
        ctx.beginPath(); ctx.arc(sx, sy, 4.5 + pulse * 4.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + pulse * 0.25})`;
        ctx.stroke();
        ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 1)"; ctx.fill();
        ctx.font = "600 11px 'Plus Jakarta Sans', system-ui"; ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(m.label, sx + 10, sy + 4);
      });

      requestAnimationFrame(draw);
    };
    draw();

    container.addEventListener('pointerdown', e => {
      isDragging = true; startX = e.clientX; startY = e.clientY;
      startRotY = rotY; startRotX = rotX;
      container.setPointerCapture(e.pointerId);
    });
    container.addEventListener('pointermove', e => {
      if (!isDragging) return;
      rotY = startRotY + (e.clientX - startX) * 0.005;
      rotX = Math.max(-1, Math.min(1, startRotX + (e.clientY - startY) * 0.005));
    });
    container.addEventListener('pointerup', () => isDragging = false);
  };
  initGlobe();

  /* ---- Mobile Menu Toggle ---- */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOverlay = document.getElementById('menu-overlay');
  const mobileMenuClose = document.getElementById('mobile-menu-close');

  const toggleMenu = (show) => {
    const shouldShow = typeof show === 'boolean' ? show : !mobileMenu.classList.contains('open');
    mobileMenuBtn.classList.toggle('is-active', shouldShow);
    mobileMenu.classList.toggle('open', shouldShow);
    menuOverlay.classList.toggle('open', shouldShow);
    document.body.classList.toggle('menu-open', shouldShow);
  };

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => toggleMenu());
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', () => toggleMenu(false));
    if (menuOverlay) menuOverlay.addEventListener('click', () => toggleMenu(false));

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Auto-close menu on scroll removed to allow scrolling within menu

  }

  /* ---- Theme Toggle Restore ---- */
  const themeToggle = document.getElementById('theme-toggle-btn');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      console.log("Theme Toggle Clicked: Remaining in high-contrast mode for consistency.");
    });
  }

  /* ---- Generic Desktop Dropdown Pinned State ---- */
  document.querySelectorAll('.nav-dropdown-wrap').forEach(wrap => {
    const btn = wrap.querySelector('.nav-dropdown-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close others
        document.querySelectorAll('.nav-dropdown-wrap.pinned').forEach(other => {
          if (other !== wrap) other.classList.remove('pinned');
        });
        wrap.classList.toggle('pinned');
      });
    }
    
    wrap.querySelectorAll('.nav-dropdown-content a').forEach(link => {
      link.addEventListener('click', () => {
        wrap.classList.remove('pinned');
      });
    });
  });

  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown-wrap.pinned').forEach(wrap => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('pinned');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown-wrap.pinned').forEach(wrap => {
        wrap.classList.remove('pinned');
      });
    }
  });

  /* ---- Mobile Sub-menus Toggle ---- */
  document.querySelectorAll('.mobile-dropdown-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.nextElementSibling;
      if (sub && sub.classList.contains('mobile-sub-menu')) {
        // Toggle current
        const isOpen = btn.classList.contains('open');
        
        // Close others in mobile menu
        btn.closest('#mobile-menu').querySelectorAll('.mobile-dropdown-btn.open').forEach(otherBtn => {
          if (otherBtn !== btn) {
            otherBtn.classList.remove('open');
            otherBtn.nextElementSibling.classList.remove('open');
          }
        });

        btn.classList.toggle('open', !isOpen);
        sub.classList.toggle('open', !isOpen);
      }
    });
  });

  /* ---- Accordion / FAQ ---- */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('open');

      // Close others (optional single-open behavior)
      const accordion = item.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.accordion-item.open').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('open');
            openItem.querySelector('.accordion-body').classList.remove('open');
          }
        });
      }

      item.classList.toggle('open', !isOpen);
      body.classList.toggle('open', !isOpen);
    });
  });

  /* ---- Tabs (Comparison Table) ---- */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      const container = btn.closest('.tabs-wrapper');
      if (!container) return;

      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const content = container.querySelector(`[data-tab-content="${target}"]`);
      if (content) content.classList.add('active');
    });
  });

  /* ---- Blog Filters ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const blogCards = document.querySelectorAll('.blog-card-wrap');
  if (filterBtns.length && blogCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-category');
        blogCards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          card.style.display = (cat === 'All' || cat === cardCat) ? 'block' : 'none';
        });
      });
    });
  }

  /* ---- Blog Search ---- */
  const blogSearch = document.getElementById('blog-search');
  if (blogSearch) {
    blogSearch.addEventListener('input', () => {
      const q = blogSearch.value.toLowerCase();
      blogCards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const excerpt = card.getAttribute('data-excerpt') || '';
        card.style.display = (title.includes(q) || excerpt.includes(q)) ? 'block' : 'none';
      });
    });
  }

  /* ---- Scroll Reveal (Staggered IntersectionObserver) ---- */
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('animate-stagger')) {
          const children = entry.target.querySelectorAll('.reveal');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('visible');
            }, index * 150);
          });
        } else {
          entry.target.classList.add('visible');
        }
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .animate-stagger').forEach(el => revealObserver.observe(el));

  /* ---- Hero Parallax (Mouse Tracking) ---- */
  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 30;
      const yPos = (clientY / window.innerHeight - 0.5) * 30;
      
      const particles = hero.querySelector('.aurora-particles');
      if (particles) {
        particles.style.transform = `translate(${xPos}px, ${yPos}px)`;
      }
    });
  }

  /* ---- Animated Number Counters ---- */
  const counters = document.querySelectorAll('.counter');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1800;
      const step = 16;
      const increment = target / (duration / step);
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current) + suffix;
      }, step);
    };

    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }

  /* ---- Cookie Consent ---- */
  const cookieBanner = document.getElementById('cookie-consent');
  if (cookieBanner && !localStorage.getItem('dnt-cookie-accepted')) {
    setTimeout(() => cookieBanner.classList.add('show'), 1500);
  }
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('dnt-cookie-accepted', '1');
      cookieBanner.classList.remove('show');
    });
  }
  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      cookieBanner.classList.remove('show');
    });
  }

  // Active Link Detection
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Normalize href for comparison (remove ../)
    const normalizedHref = href.replace(/\.\.\//g, '');
    
    if (currentPath.endsWith(href) || 
       (href === 'index.html' && (currentPath.endsWith('/') || currentPath === '')) ||
       (currentPath.includes(normalizedHref) && normalizedHref !== 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- Magnetic Button Effect ---- */
  const magneticBtns = document.querySelectorAll('.btn-magnetic');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  /* ---- 3D Tilt Effect ---- */
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });

  /* ---- Contact Form Submission Feedback ---- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = 'Sending...';
        btn.disabled = true;
      }
    });
  }

});

/* ==============================================
   DNT FORM UTILITIES — reusable across all pages
   ============================================== */

/**
 * Validate a single field and toggle error state.
 * @param {string} fieldId   - wrapper div id (e.g. "field-name")
 * @param {*}      value     - current field value
 * @param {string} type      - "required" | "email" | "phone" | "maxlen"
 * @param {number} [maxlen]  - only for type "maxlen"
 * @returns {boolean} true if valid
 */
function dntValidateField(fieldId, value, type, maxlen) {
  const fieldEl = document.getElementById(fieldId);
  if (!fieldEl) return true;

  let valid = true;
  const v = String(value).trim();

  switch (type) {
    case 'required': valid = v.length > 0; break;
    case 'email':    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); break;
    case 'phone':    valid = /^[6-9]\d{9}$/.test(v.replace(/\D/g, '')); break;
    case 'maxlen':   valid = v.length <= (maxlen || 999); break;
    default:         valid = true;
  }

  if (valid) {
    fieldEl.classList.remove('has-error');
    fieldEl.classList.add('is-valid');
    const input = fieldEl.querySelector('input, select, textarea');
    if (input) { input.setAttribute('aria-invalid', 'false'); }
  } else {
    fieldEl.classList.add('has-error');
    fieldEl.classList.remove('is-valid');
    const input = fieldEl.querySelector('input, select, textarea');
    if (input) { input.setAttribute('aria-invalid', 'true'); }
  }
  return valid;
}

/**
 * Character counter utility — attach to any textarea.
 * @param {HTMLElement} textarea  - the textarea element
 * @param {string}      counterId - id of counter display element
 * @param {number}      maxLen    - character limit
 */
function dntCharCounter(textarea, counterId, maxLen) {
  const counter = document.getElementById(counterId);
  if (!counter) return;
  const len = textarea.value.length;
  counter.textContent = len + ' / ' + maxLen;
  counter.classList.toggle('over', len > maxLen);
}

/**
 * Set button to loading state.
 * @param {string}  btnId     - button element id
 * @param {boolean} isLoading - true = show spinner, false = restore
 * @param {string}  [label]   - button text when restored
 */
function dntSetBtnLoading(btnId, isLoading, label) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.classList.add('loading');
    const textEl = btn.querySelector('span') || btn;
    textEl.textContent = 'Sending…';
    const iconEl = btn.querySelector('svg');
    if (iconEl) iconEl.style.display = 'none';
    const spinner = document.createElement('span');
    spinner.className = 'dnt-spinner';
    spinner.id = btnId + '-spinner';
    btn.appendChild(spinner);
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
    const textEl = btn.querySelector('span:not(.dnt-spinner)') || btn;
    textEl.textContent = label || 'Submit';
    const iconEl = btn.querySelector('svg');
    if (iconEl) iconEl.style.display = '';
    const spinner = document.getElementById(btnId + '-spinner');
    if (spinner) spinner.remove();
  }
}

/**
 * Sync floating labels for pre-filled or auto-filled inputs.
 * Call once on DOMContentLoaded for pages using .dnt-field.
 */
function dntSyncFloatingLabels() {
  document.querySelectorAll('.dnt-field input, .dnt-field select, .dnt-field textarea').forEach(function(el) {
    if (el.value && el.value.trim() !== '') {
      el.dispatchEvent(new Event('input'));
    }
    if (el.tagName === 'SELECT' && el.value !== '') {
      el.classList.add('has-value');
    }
  });
}
document.addEventListener('DOMContentLoaded', dntSyncFloatingLabels);

/**
 * Contact form submit handler with full validation + loading state.
 */
function dntHandleContactSubmit(e) {
  e.preventDefault();

  const name    = document.getElementById('inp-name');
  const phone   = document.getElementById('inp-phone');
  const email   = document.getElementById('inp-email');
  const service = document.getElementById('inp-service');
  const message = document.getElementById('inp-message');

  if (!name) return; // Not on contact page

  let ok = true;
  ok = dntValidateField('field-name',    name.value,    'required') && ok;
  ok = dntValidateField('field-phone',   phone.value,   'phone')    && ok;
  ok = dntValidateField('field-email',   email.value,   'email')    && ok;
  ok = dntValidateField('field-service', service.value, 'required') && ok;
  if (message && message.value.length > 500) {
    ok = dntValidateField('field-message', message.value, 'maxlen', 500) && ok;
  }

  if (!ok) {
    // Focus first error field
    const firstErr = document.querySelector('.dnt-field.has-error input, .dnt-field.has-error select, .dnt-field.has-error textarea');
    if (firstErr) firstErr.focus();
    return;
  }

  // Show loading state
  dntSetBtnLoading('contactSubmitBtn', true);

  // Simulate async submission (replace with actual fetch/FormData in production)
  setTimeout(function() {
    dntSetBtnLoading('contactSubmitBtn', false, 'Send Message');

    // Success banner
    const alerts = document.getElementById('formAlerts');
    if (alerts) {
      alerts.innerHTML = '<div role="alert" style="background:#ecfdf5;border:1.5px solid #10b981;border-radius:10px;padding:0.85rem 1.1rem;font-size:0.88rem;color:#065f46;display:flex;align-items:center;gap:0.6rem;margin-bottom:1rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Message sent! We\'ll get back to you within 24 hours.</div>';
    }

    // Reset form
    document.getElementById('contactForm').reset();
    document.querySelectorAll('.dnt-field').forEach(function(f) {
      f.classList.remove('is-valid', 'has-error');
    });
    const counter = document.getElementById('msg-counter');
    if (counter) counter.textContent = '0 / 500';
  }, 1800);
}

// Real-time validation on blur
document.addEventListener('DOMContentLoaded', function() {
  const validators = {
    'inp-name':    { field: 'field-name',    type: 'required' },
    'inp-phone':   { field: 'field-phone',   type: 'phone' },
    'inp-email':   { field: 'field-email',   type: 'email' },
    'inp-service': { field: 'field-service', type: 'required' }
  };
  Object.keys(validators).forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', function() {
        if (el.value.trim()) {
          dntValidateField(validators[id].field, el.value, validators[id].type);
        }
      });
    }
  });
});

/* ==============================================
   GOOGLE SHEETS INTEGRATION
   ============================================== */

/**
 * Extracts form data dynamically, matching name attributes or using positional fallbacks
 * if the form inputs do not have name attributes (standard in many DNT service page templates).
 */
function dntExtractFormData(form) {
  const data = {
    formId: form.id || 'unknown_form',
    pageUrl: window.location.href,
    pageTitle: document.title,
    timestamp: new Date().toISOString(),
    name: '',
    phone: '',
    email: '',
    service: '',
    message: ''
  };

  const inputs = form.querySelectorAll('input, select, textarea');

  // 1. Try mapping using "name" attribute first
  inputs.forEach(input => {
    const name = input.getAttribute('name');
    const val = input.value ? input.value.trim() : '';
    if (name) {
      const lowerName = name.toLowerCase();
      if (lowerName === 'name' || lowerName.includes('name')) data.name = val;
      else if (lowerName === 'phone' || lowerName === 'tel' || lowerName.includes('phone') || lowerName.includes('mobile') || lowerName.includes('contact')) data.phone = val;
      else if (lowerName === 'email' || lowerName.includes('email')) data.email = val;
      else if (lowerName === 'service' || lowerName === 'subject' || lowerName === 'type' || lowerName.includes('service') || lowerName.includes('profession')) data.service = val;
      else if (lowerName === 'message' || lowerName.includes('message') || lowerName === 'desc') data.message = val;
      else {
        data[name] = val; // Store custom fields
      }
    }
  });

  // 2. Fallback: Identify fields by type, placeholder, or tag name if name is missing
  inputs.forEach(input => {
    const nameAttr = input.getAttribute('name');
    if (nameAttr) return; // Skip if already mapped via name attribute

    const val = input.value ? input.value.trim() : '';
    const type = (input.getAttribute('type') || '').toLowerCase();
    const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
    const tagName = input.tagName.toLowerCase();

    if (tagName === 'textarea') {
      if (!data.message) data.message = val;
    } else if (tagName === 'select') {
      if (!data.service) data.service = val;
    } else if (type === 'tel' || placeholder.includes('phone') || placeholder.includes('mobile') || placeholder.includes('contact') || placeholder.includes('number')) {
      if (!data.phone) data.phone = val;
    } else if (type === 'email' || placeholder.includes('email')) {
      if (!data.email) data.email = val;
    } else if (type === 'text' || placeholder.includes('name') || placeholder.includes('brand')) {
      if (!data.name) data.name = val;
    }
  });

  return data;
}

/**
 * Sends form data to the Google Apps Script Web App URL in the background.
 */
window.dntSubmitToGoogleSheets = function(form) {
  const url = GOOGLE_SCRIPT_URL;
  if (!url || !url.startsWith('http')) {
    console.warn('Google Sheets URL is not configured in js/script.js. Submission skipped.');
    return Promise.resolve({ simulated: true });
  }

  const data = dntExtractFormData(form);

  return fetch(url, {
    method: 'POST',
    mode: 'no-cors', // Avoids CORS preflight errors with Google Apps Script
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(data)
  })
  .then(response => {
    console.log('Form data submitted to Google Sheets successfully.');
    return { success: true };
  })
  .catch(error => {
    console.error('Error submitting form to Google Sheets:', error);
    throw error;
  });
};

/**
 * Global form submission interceptor for all standard lead/contact forms.
 */
document.addEventListener('submit', function(event) {
  const form = event.target;

  // Exclude forms that should not be tracked (e.g., admin login, blog comments)
  if (form.id === 'loginForm' || form.id === 'comment-form') {
    return;
  }

  // Prevent default page reload
  event.preventDefault();

  // Validate HTML5 constraints
  if (form.checkValidity && !form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Optional: Custom validation for 10-digit Indian phone numbers
  const phoneInput = form.querySelector('input[type="tel"]');
  if (phoneInput) {
    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 10) {
      phoneInput.setCustomValidity('Please enter a valid 10-digit phone number.');
      phoneInput.reportValidity();
      return;
    } else {
      phoneInput.setCustomValidity('');
    }
  }

  // Show loading state in the submit button
  const submitBtn = form.querySelector('button[type="submit"]');
  let originalBtnHTML = '';
  if (submitBtn) {
    originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="dnt-spinner" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-radius:50%; border-top-color:transparent; animation:dnt-spin 0.6s linear infinite; margin-right:8px; vertical-align:middle;"></span>Processing...';
  }

  // Check if form has custom page-specific submit/success logic
  const isContactPageForm = form.id === 'contactForm';
  const isCustomPMMarketingForm = form.id === 'itrFinalLeadForm' && window.location.href.includes('performance-marketing');

  // Trigger submission to Google Sheets
  window.dntSubmitToGoogleSheets(form)
    .then(() => {
      // Restore button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }

      // If page has its own success screen logic, do not override its UI behavior
      if (isContactPageForm || isCustomPMMarketingForm) {
        return;
      }

      // Otherwise, show our premium central success confirmation card
      const card = form.closest('.itr-lead-card') || form.parentElement;
      if (card) {
        // Inject custom keyframes for the spinner/fade if not already injected
        if (!document.getElementById('dnt-spin-style')) {
          const style = document.createElement('style');
          style.id = 'dnt-spin-style';
          style.textContent = `
            @keyframes dnt-spin { to { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          `;
          document.head.appendChild(style);
        }

        card.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1.5rem; background: #fff; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; animation: fadeIn 0.5s ease-out;">
            <div style="width: 65px; height: 65px; background: rgba(16, 185, 129, 0.1); color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 1.8rem;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 0.75rem;">Request Received!</h3>
            <p style="color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; font-family: 'Inter', sans-serif;">Thank you for reaching out. Our tax and compliance experts will review your request and contact you within 30 minutes.</p>
            <div style="font-size: 0.8rem; color: #10b981; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; font-family: 'Outfit', sans-serif;">
              Priority Support Active
            </div>
          </div>
        `;
      }
    })
    .catch(error => {
      // Revert loading state
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
      alert('An error occurred while submitting. Please try again.');
    });
});
