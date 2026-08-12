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

  // ----- Contact form (front-end only placeholder — wire up a real backend/email service later) -----
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('.form-status');

  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.style.display = 'block';
      status.textContent = 'Thanks! Your message has been noted (demo only — connect a backend to actually send it).';
      form.reset();
    });
  }
});
