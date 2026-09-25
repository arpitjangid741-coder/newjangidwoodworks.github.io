
(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = $('.site-header');
  const progress = $('.scroll-progress');
  const toggle = $('.menu-toggle');
  const nav = $('.site-nav');

  const setScrollState = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max ? (window.scrollY / max) * 100 : 0}%`;
  };
  addEventListener('scroll', setScrollState, {passive:true});
  setScrollState();

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });
  $$('.site-nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded','false'); document.body.classList.remove('menu-open');
  }));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  if (!reduced) $$('.reveal').forEach(el => revealObserver.observe(el));
  else $$('.reveal').forEach(el => el.classList.add('visible'));

  const heroImg = $('.hero-media img');
  if (!reduced && heroImg) {
    addEventListener('scroll', () => {
      const y = Math.min(window.scrollY * .12, 90);
      heroImg.style.transform = `scale(1.06) translateY(${y}px)`;
    }, {passive:true});
  }

  $$('.tilt').forEach(card => {
    if (reduced) return;
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      card.style.transform = `perspective(900px) rotateX(${y*-2.4}deg) rotateY(${x*2.8}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform='');
  });

  const doorStage = $('[data-door-stage]');
  const door = $('.door-object');
  if (doorStage && door && !reduced) {
    doorStage.addEventListener('pointermove', e => {
      const r=doorStage.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      door.style.transform=`rotateY(${x*8}deg) rotateX(${y*-5}deg)`;
    });
    doorStage.addEventListener('pointerleave',()=>door.style.transform='');
  }

  $$('.magnetic').forEach(btn => {
    if (reduced) return;
    btn.addEventListener('pointermove', e => {
      const r=btn.getBoundingClientRect(), x=e.clientX-(r.left+r.width/2), y=e.clientY-(r.top+r.height/2);
      btn.style.transform=`translate(${x*.08}px,${y*.08}px)`;
    });
    btn.addEventListener('pointerleave',()=>btn.style.transform='');
  });

  function setupFilters(groupName) {
    const group = $(`[data-filter-group="${groupName}"]`);
    if (!group) return;
    const items = groupName === 'gallery' ? $$('.gallery-item') : $$('.inspiration-card');
    $$('.filter', group).forEach(button => {
      button.addEventListener('click', () => {
        $$('.filter', group).forEach(b=>b.classList.remove('active'));
        button.classList.add('active');
        const filter=button.dataset.filter;
        items.forEach(item => {
          item.style.display = (filter==='all'||item.dataset.category===filter) ? '' : 'none';
        });
      });
    });
  }
  setupFilters('gallery'); setupFilters('inspiration');

  const lightbox=$('#lightbox'), lbImg=$('#lightboxImage'), lbTitle=$('#lightboxTitle');
  $$('.gallery-item').forEach(item => item.addEventListener('click',()=>{
    lbImg.src=item.dataset.image; lbImg.alt=item.dataset.title||'Gallery image'; lbTitle.textContent=item.dataset.title||'Design inspiration';
    lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  }));
  const closeLightbox=()=>{lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); document.body.style.overflow='';};
  $('.lightbox-close')?.addEventListener('click',closeLightbox);
  lightbox?.addEventListener('click',e=>{if(e.target===lightbox) closeLightbox();});
  addEventListener('keydown',e=>{if(e.key==='Escape') closeLightbox();});

  const waNumber='919074192212';
  $$('.use-design').forEach(btn=>btn.addEventListener('click',()=>{
    const design=btn.dataset.design||'design reference';
    const msg=`Hello New Jangid Wood Works, I found a design reference on your website and would like to discuss a similar custom wooden project. Reference: ${design}.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
  }));

  $('#quoteForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const data=new FormData(e.currentTarget);
    const msg=`Hello New Jangid Wood Works,

I would like to enquire about your products.

Name: ${data.get('name')}
Phone: ${data.get('phone')}
City: ${data.get('city')}
Product: ${data.get('product')}
Requirement: ${data.get('requirement')}

Please share price and details.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
  });

  $('#year').textContent=new Date().getFullYear();

  // Gentle fallback for any local image that is accidentally unavailable.
  $$('img').forEach(img=>{
    img.addEventListener('error',()=>{
      img.style.background='linear-gradient(135deg,#6e3f1d,#1f1510)';
      img.removeAttribute('src');
      img.alt=img.alt||'Woodwork visual';
    },{once:true});
  });
})();
