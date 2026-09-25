(() => {
  'use strict';
  const WA = '919074192212';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches || window.innerWidth < 768;

  const cursor = document.querySelector('.cursor-glow');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let cursorX = mouseX, cursorY = mouseY;
  if (cursor && !reduced) {
    window.addEventListener('pointermove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    const cursorLoop = () => {
      cursorX += (mouseX - cursorX) * 0.12;
      cursorY += (mouseY - cursorY) * 0.12;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      requestAnimationFrame(cursorLoop);
    };
    cursorLoop();
  }

  // Scroll reveal — lightweight IntersectionObserver.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px' });
    revealItems.forEach(el => io.observe(el));
  } else revealItems.forEach(el => el.classList.add('is-visible'));

  // Hero/background parallax with rAF.
  const parallaxLayers = [...document.querySelectorAll('.parallax-layer')];
  const parallaxBg = document.querySelector('.parallax-bg');
  let scrollY = 0, ticking = false;
  const updateParallax = () => {
    if (!reduced) {
      if (parallaxBg) parallaxBg.style.transform = `translate3d(0, ${scrollY * 0.035}px, 0) scale(1.06)`;
      parallaxLayers.forEach(el => {
        const depth = Number(el.dataset.depth || 0.02);
        el.style.transform = `translate3d(0, ${scrollY * depth}px, 0)`;
      });
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); }
  }, { passive: true });

  // Mouse tilt for product cards. Disabled on touch and reduced-motion.
  if (!isTouch && !reduced) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      let raf = 0;
      const reset = () => {
        cancelAnimationFrame(raf);
        card.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0)';
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      };
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const ry = (x - 0.5) * 10;
        const rx = (0.5 - y) * 8;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => { card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`; });
      });
      card.addEventListener('pointerleave', reset);
      card.addEventListener('focusout', reset);
    });
  }

  // Magnetic buttons — subtle, not aggressive.
  if (!isTouch && !reduced) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.12;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.12;
        el.style.transform = `translate3d(${x}px,${y}px,0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // Graceful local SVG fallback if remote reference imagery is unavailable.
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = '1';
      img.src = 'images/wood-fallback.svg';
    }, { once: true });
  });

  // Product quick view modal.
  const modal = document.getElementById('productModal');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalCustom = document.getElementById('modalCustom');
  const modalQuote = document.getElementById('modalQuote');
  const modalWhatsApp = document.getElementById('modalWhatsApp');
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  const openModal = card => {
    if (!modal) return;
    const product = card.dataset.product || 'Custom Woodwork';
    const image = card.dataset.image || '';
    const description = card.dataset.description || '';
    const custom = card.dataset.custom || 'Size · design · finish';
    modalImage.src = image;
    modalImage.alt = product;
    modalTitle.textContent = product;
    modalDescription.textContent = description;
    modalCustom.textContent = custom;
    const message = `Hello New Jangid Wood Works, I would like a quotation for ${product}. Please share price and details.`;
    modalWhatsApp.href = `https://wa.me/${WA}?text=${encodeURIComponent(message)}`;
    modalQuote.href = '#contact';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.querySelector('.modal-close')?.focus(), 50);
  };
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      openModal(card);
    });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); } });
  });
  modal?.addEventListener('click', e => { if (e.target.closest('[data-close-modal]')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  modalQuote?.addEventListener('click', closeModal);

  // Contact form -> WhatsApp.
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const message = [
      'Hello New Jangid Wood Works,', '',
      'I would like to enquire about:', '',
      `Name: ${data.get('name')}`,
      `Phone: ${data.get('phone')}`,
      `City: ${data.get('city')}`,
      `Product: ${data.get('product')}`,
      `Requirement: ${data.get('requirement')}`, '',
      'Please share price and details.'
    ].join('\n');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });

  // Mobile nav.
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const mobileLinks = [...document.querySelectorAll('.desktop-nav a')];
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('mobile-open');
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      nav.style.height = 'auto';
      nav.style.paddingBottom = '18px';
      nav.querySelector('.desktop-nav').style.display = 'grid';
      nav.querySelector('.desktop-nav').style.position = 'absolute';
      nav.querySelector('.desktop-nav').style.top = '72px';
      nav.querySelector('.desktop-nav').style.left = '18px';
      nav.querySelector('.desktop-nav').style.right = '18px';
      nav.querySelector('.desktop-nav').style.padding = '18px';
      nav.querySelector('.desktop-nav').style.background = '#17100c';
      nav.querySelector('.desktop-nav').style.border = '1px solid rgba(255,255,255,.08)';
    } else {
      nav.style.height = '';
      nav.style.paddingBottom = '';
      nav.querySelector('.desktop-nav').style.display = '';
      nav.querySelector('.desktop-nav').style.position = '';
      nav.querySelector('.desktop-nav').style.top = '';
      nav.querySelector('.desktop-nav').style.left = '';
      nav.querySelector('.desktop-nav').style.right = '';
      nav.querySelector('.desktop-nav').style.padding = '';
      nav.querySelector('.desktop-nav').style.background = '';
      nav.querySelector('.desktop-nav').style.border = '';
    }
  });
  mobileLinks.forEach(link => link.addEventListener('click', () => toggle?.click()));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
