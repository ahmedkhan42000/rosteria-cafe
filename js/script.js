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
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            staggerObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      staggerEls.forEach((el) => staggerObserver.observe(el));
    } else {
      staggerEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // ----- Scroll reveal animations -----
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
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
