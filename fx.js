// Shared motion layer: loader, cursor, ambient glow, name reveal,
// scroll reveals, count-ups and widget spotlight/tilt.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  // ambient background
  const bg = document.createElement('div');
  bg.className = 'fx-bg';
  bg.innerHTML = '<b></b><b></b><b></b><div class="glow"></div>';
  body.prepend(bg);
  const glow = bg.querySelector('.glow');

  // split name into letters
  document.querySelectorAll('[data-split]').forEach(el => {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
      s.textContent = c === ' ' ? ' ' : c;
      s.style.transitionDelay = (i * 0.045) + 's';
      el.appendChild(s);
    });
  });

  // loader (home page only, once per visit)
  let seen = false;
  try { seen = sessionStorage.getItem('fx-loaded') === '1'; sessionStorage.setItem('fx-loaded', '1'); } catch (e) {}
  if (document.querySelector('[data-loader]') && !reduce && !seen) {
    const l = document.createElement('div');
    l.className = 'loader';
    l.innerHTML = '<div class="count">0</div><div class="bar"></div>';
    body.appendChild(l);
    const count = l.querySelector('.count'), bar = l.querySelector('.bar');
    let n = 0;
    const tick = () => {
      n = Math.min(100, n + Math.ceil(Math.random() * 11));
      count.textContent = n; bar.style.width = n + '%';
      if (n < 100) return setTimeout(tick, 35);
      setTimeout(() => { l.classList.add('done'); setTimeout(() => body.classList.add('ready'), 350); setTimeout(() => l.remove(), 1200); }, 200);
    };
    tick();
  } else {
    requestAnimationFrame(() => body.classList.add('ready'));
  }

  // cursor + glow follow
  if (!reduce && matchMedia('(hover:hover)').matches) {
    const cur = document.createElement('div');
    cur.className = 'cursor';
    body.appendChild(cur);
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      glow.style.left = mx + 'px'; glow.style.top = my + 'px';
    });
    (function loop() { cx += (mx - cx) * .22; cy += (my - cy) * .22; cur.style.left = cx + 'px'; cur.style.top = cy + 'px'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', e => cur.classList.toggle('big', !!e.target.closest('a,button,.tilt')));
  }

  // widgets: spotlight + gentle tilt
  const widgets = '.focus>div,.fc,.area,.hstats>div,.stat,.wrap>.row,.skills dl';
  document.querySelectorAll(widgets).forEach(w => {
    w.classList.add('tilt');
    w.addEventListener('mousemove', e => {
      const r = w.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      w.style.setProperty('--mx', x + 'px'); w.style.setProperty('--my', y + 'px');
      if (!reduce) w.style.transform = `perspective(900px) rotateX(${(y / r.height - .5) * -4}deg) rotateY(${(x / r.width - .5) * 4}deg) translateY(-2px)`;
    });
    w.addEventListener('mouseleave', () => w.style.transform = '');
  });

  // scroll reveal (also used for content rendered by page scripts before this runs)
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  const targets = 'section h2,.section-lead,.wrap>.row,.focus>div,.fc,.area,.stat,.hstats>div,.skills dl,.contact h3,.support a,.term,.marquee';
  document.querySelectorAll(targets).forEach((el, i) => {
    el.classList.add('rv'); el.style.transitionDelay = (i % 4) * .06 + 's'; io.observe(el);
  });

  // count-up numbers
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = parseFloat(el.dataset.count), t0 = performance.now();
    cio.unobserve(el);
    if (reduce) return el.textContent = end;
    const step = t => { const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));
})();
