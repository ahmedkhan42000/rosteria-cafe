document.addEventListener('DOMContentLoaded', () => {

  // ----- Mobile nav toggle -----
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // ----- Dark / light theme toggle -----
  const themeToggle = document.querySelector('.theme-toggle');
  const root = document.documentElement;

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('rosteria-theme', next);
    });
  }

  // ----- Pinned hero video: scales up and loses its rounded corners as you scroll past it -----
  const heroPin = document.querySelector('#hero-pin');
  const heroMedia = document.querySelector('#hero-media-scale');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroPin && heroMedia && !reduceMotion) {
    const isNarrow = () => window.innerWidth <= 720;
    let ticking = false;

    const updateHeroScale = () => {
      const rect = heroPin.getBoundingClientRect();
      const minScale = isNarrow() ? 0.92 : 0.86;
      const maxRadius = isNarrow() ? 20 : 32;
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 0;

      heroMedia.style.transform = `scale(${minScale + (1 - minScale) * progress})`;
      heroMedia.style.borderRadius = `${maxRadius * (1 - progress)}px`;
      ticking = false;
    };

    const requestHeroUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeroScale);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestHeroUpdate, { passive: true });
    window.addEventListener('resize', requestHeroUpdate);
    updateHeroScale();
  }

  // ----- Hero content: subtle 3D tilt that follows the cursor -----
  const heroContent = document.querySelector('#hero-pin .hero-content');

  if (heroContent) {
    if (reduceMotion) {
      heroContent.classList.add('is-loaded');
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => heroContent.classList.add('is-loaded')));
    }
  }

  if (heroPin && heroContent && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    const maxHeroTilt = 4;

    heroPin.addEventListener('mousemove', (e) => {
      const rect = heroPin.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      heroContent.style.transform = `rotateX(${(-py * maxHeroTilt).toFixed(2)}deg) rotateY(${(px * maxHeroTilt).toFixed(2)}deg)`;
    });

    heroPin.addEventListener('mouseleave', () => {
      heroContent.style.transform = '';
    });
  }

  // ----- Dimensional tilt for card grids (pillars, feature cards) -----
  const setupTiltCards = (selector, { maxTilt = 8, stagger = 140 } = {}) => {
    const cards = document.querySelectorAll(selector);
    if (!cards.length || reduceMotion) return;

    const canHover = window.matchMedia('(hover: hover)').matches;

    // Re-arm the entrance stagger delay every time a card scrolls back into view,
    // then drop it to 0 once the reveal transition finishes so hover stays snappy.
    if ('IntersectionObserver' in window) {
      const delayObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const card = entry.target;
          const i = Array.prototype.indexOf.call(cards, card);
          if (entry.isIntersecting) {
            card.style.transitionDelay = `${i * stagger}ms`;
            card.addEventListener('transitionend', () => {
              card.style.transitionDelay = '0ms';
            }, { once: true });
          }
        });
      }, { threshold: 0.15 });

      cards.forEach((card) => delayObserver.observe(card));
    } else {
      cards.forEach((card, i) => { card.style.transitionDelay = `${i * stagger}ms`; });
    }

    if (!canHover) return;

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  };

  setupTiltCards('.pillars .pillar', { maxTilt: 8, stagger: 140 });
  setupTiltCards('.grid-3 .card', { maxTilt: 6, stagger: 120 });

  // ----- Lifestyle photo: image and caption drift at different speeds while scrolling -----
  const lifestylePhoto = document.querySelector('.lifestyle-photo');
  const lifestyleImg = lifestylePhoto ? lifestylePhoto.querySelector('img') : null;
  const lifestyleCaption = lifestylePhoto ? lifestylePhoto.querySelector('.lifestyle-caption') : null;

  if (lifestylePhoto && lifestyleImg && lifestyleCaption && !reduceMotion) {
    let lifestyleTicking = false;

    const updateLifestyleParallax = () => {
      const rect = lifestylePhoto.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const shift = Math.max(-24, Math.min(24, center * -0.06));
      lifestyleImg.style.transform = `scale(1.15) translateY(${shift}px)`;
      lifestyleCaption.style.transform = `translateY(${(-shift * 0.5).toFixed(1)}px)`;
      lifestyleTicking = false;
    };

    const requestLifestyleUpdate = () => {
      if (!lifestyleTicking) {
        requestAnimationFrame(updateLifestyleParallax);
        lifestyleTicking = true;
      }
    };

    window.addEventListener('scroll', requestLifestyleUpdate, { passive: true });
    window.addEventListener('resize', requestLifestyleUpdate);
    updateLifestyleParallax();
  }

  // ----- Staggered word reveal for headings marked [data-stagger] -----
  const staggerEls = document.querySelectorAll('[data-stagger]');

  staggerEls.forEach((el) => {
    const words = el.textContent.split(' ');
    el.textContent = '';
    words.forEach((word, i) => {
      if (i > 0) el.appendChild(document.createTextNode(' '));
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.style.transitionDelay = `${i * 60}ms`;
      el.appendChild(span);
    });
  });

  if (staggerEls.length) {
    if ('IntersectionObserver' in window) {
      const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      }, { threshold: 0.4 });

      staggerEls.forEach((el) => staggerObserver.observe(el));
    } else {
      staggerEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // ----- Scroll reveal animations (replays every time an element scrolls back into view) -----
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      }, { threshold: 0.15 });

      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // ----- Animated stat counters (about page) -----
  const counters = document.querySelectorAll('[data-count]');

  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const value = Math.round(target * progress);
          el.textContent = value + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => counterObserver.observe(el));
  }

  // ----- Menu category tabs -----
  const tabs = document.querySelectorAll('.menu-tab');
  const categories = document.querySelectorAll('.menu-category');

  function activateTab(tab) {
    if (!tab) return;
    const target = tab.dataset.category;

    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    categories.forEach((cat) => {
      cat.classList.toggle('hidden', cat.dataset.category !== target);
    });
  }

  if (tabs.length && categories.length) {
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activateTab(tab));
    });

    // Deep-link support: menu.html#matcha, #coffee, #cakes (used by the home page pillars)
    const hashCategoryMap = { matcha: 'iced-matcha', coffee: 'hot-coffee', cakes: 'pastries' };
    const hash = window.location.hash.replace('#', '');

    if (hashCategoryMap[hash]) {
      const targetTab = document.querySelector(`.menu-tab[data-category="${hashCategoryMap[hash]}"]`);
      if (targetTab) activateTab(targetTab);
    }
  }

  // ----- Gallery lightbox with keyboard navigation -----
  const lightbox = document.querySelector('#lightbox');
  const lightboxImg = document.querySelector('#lightbox-img');
  const lightboxClose = document.querySelector('#lightbox-close');
  const galleryThumbs = Array.from(document.querySelectorAll('.gallery-grid figure img'));

  if (lightbox && lightboxImg && galleryThumbs.length) {
    let currentIndex = 0;

    const openAt = (index) => {
      currentIndex = (index + galleryThumbs.length) % galleryThumbs.length;
      const thumb = galleryThumbs[currentIndex];
      lightboxImg.src = thumb.src;
      lightboxImg.alt = thumb.alt;
      lightbox.classList.add('open');
    };

    galleryThumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => openAt(index));
    });

    const closeLightbox = () => lightbox.classList.remove('open');

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') openAt(currentIndex + 1);
      if (e.key === 'ArrowLeft') openAt(currentIndex - 1);
    });
  }

  // ----- Contact form (opens a pre-filled email via mailto: — no backend required) -----
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('.form-status');
  const CONTACT_EMAIL = 'nerir26016@netiren.com';

  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.querySelector('#name').value.trim();
      const email = document.querySelector('#email').value.trim();
      const message = document.querySelector('#message').value.trim();

      const subject = encodeURIComponent(`New message from ${name} via Rösteria Café website`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

      status.style.display = 'block';
      status.textContent = 'Opening your email app to send this message...';
      form.reset();
    });
  }
});
