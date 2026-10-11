// Two large wagasa (oiled-paper umbrellas), seen from above, turning behind the page as it scrolls.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TURN = 1800; // px of scrolling per full turn
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  const lite = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;
  function build(cls, dir, hueA, hueB) {
    const wrap = document.createElement('div');
    wrap.className = `umb ${cls}`;
    wrap.setAttribute('aria-hidden', 'true');
    const spin = document.createElement('div');
    spin.className = 'umb__spin';
    wrap.appendChild(spin);
    const svg = el('svg', { viewBox: '0 0 400 400' }, spin);
    const defs = el('defs', {}, svg);
    const g = el('radialGradient', { id: `paper-${cls}`, cx: '50%', cy: '50%', r: '50%' }, defs);
    el('stop', { offset: '0', 'stop-color': hueA }, g);
    el('stop', { offset: '.7', 'stop-color': hueB }, g);
    el('stop', { offset: '1', 'stop-color': '#7a0d27' }, g);
    // fibrous paper grain
    const f = el('filter', { id: `grain-${cls}`, x: 0, y: 0, width: '100%', height: '100%' }, defs);
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: '.9 .06', numOctaves: 3, seed: dir > 0 ? 4 : 9 }, f);
    el('feColorMatrix', { type: 'matrix', values: '0 0 0 0 .35  0 0 0 0 .05  0 0 0 0 .1  0 0 0 .55 0' }, f);

    const C = 200;
    el('circle', { cx: C, cy: C, r: 196, fill: `url(#paper-${cls})` }, svg);
    // alternating panels between ribs give the folded-paper look
    const N = 36;
    for (let i = 0; i < N; i += 2) {
      const a0 = (i * 2 * Math.PI) / N, a1 = ((i + 1) * 2 * Math.PI) / N;
      const p = (a, r) => `${C + Math.sin(a) * r},${C - Math.cos(a) * r}`;
      el('path', { d: `M${C},${C} L${p(a0, 196)} A196,196 0 0 1 ${p(a1, 196)} Z`, fill: '#fff', opacity: 0.07 }, svg);
    }
    const clip = el('clipPath', { id: `disc-${cls}` }, defs);
    el('circle', { cx: C, cy: C, r: 196 }, clip);
    const grain = el('g', { 'clip-path': `url(#disc-${cls})` }, svg);
    if (!lite) el('rect', { x: 0, y: 0, width: 400, height: 400, fill: '#000', filter: `url(#grain-${cls})`, opacity: 0.5 }, grain);
    // cream bands, like the painted rings on a real wagasa
    [[168, 9], [120, 5], [74, 3]].forEach(([r, w]) => el('circle', { cx: C, cy: C, r, fill: 'none', stroke: '#fbeee4', 'stroke-width': w, opacity: 0.85 }, svg));
    // binding threads crossing the ribs
    [[146, '3 4'], [96, '3 4']].forEach(([r, d]) => el('circle', { cx: C, cy: C, r, fill: 'none', stroke: '#f1d9a8', 'stroke-width': 1.4, 'stroke-dasharray': d, opacity: 0.8 }, svg));
    // bamboo ribs: a dark line with a pale highlight beside it
    for (let i = 0; i < N; i++) {
      const rot = (i * 360) / N;
      el('line', { x1: C, y1: C - 14, x2: C, y2: 6, stroke: '#4a0714', 'stroke-width': 2, opacity: 0.55, transform: `rotate(${rot} ${C} ${C})` }, svg);
      el('line', { x1: C + 2, y1: C - 14, x2: C + 2, y2: 6, stroke: '#ffd9c8', 'stroke-width': 0.8, opacity: 0.22, transform: `rotate(${rot} ${C} ${C})` }, svg);
    }
    // bamboo rim
    el('circle', { cx: C, cy: C, r: 196, fill: 'none', stroke: '#e0b979', 'stroke-width': 3, opacity: 0.9 }, svg);
    el('circle', { cx: C, cy: C, r: 199, fill: 'none', stroke: '#4a0714', 'stroke-width': 2, opacity: 0.6 }, svg);
    // wooden hub
    el('circle', { cx: C, cy: C, r: 26, fill: '#3a1b10' }, svg);
    el('circle', { cx: C, cy: C, r: 20, fill: '#b98649' }, svg);
    el('circle', { cx: C, cy: C, r: 10, fill: '#5c3a1e' }, svg);
    el('circle', { cx: C - 5, cy: C - 6, r: 4, fill: '#fff', opacity: 0.35 }, svg);
    document.body.prepend(wrap);
    return { wrap, spin, dir };
  }

  const umbs = [build('umb--a', 1, '#e0405f', '#c01c42'), build('umb--b', -1, '#d3365a', '#a8153a')];
  if (reduce) return;

  const supportsTimeline = CSS.supports('animation-timeline: scroll()');
  const setTurns = () => {
    const total = Math.max(document.documentElement.scrollHeight, innerHeight * 2);
    document.documentElement.style.setProperty('--turns', (total - innerHeight) / TURN);
  };
  setTurns();
  let t = 0;
  new ResizeObserver(() => { clearTimeout(t); t = setTimeout(setTurns, 250); }).observe(document.body);
  window.addEventListener('load', setTurns);

  if (supportsTimeline) return;
  // Fallback for browsers without scroll timelines: turn the umbrellas as bands of the page pass the top edge.
  const bands = document.createElement('div');
  bands.setAttribute('aria-hidden', 'true');
  bands.style.cssText = 'position:absolute;top:0;left:0;width:1px;pointer-events:none;visibility:hidden';
  document.body.appendChild(bands);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const k = +e.target.dataset.k;
      umbs.forEach((u) => { u.spin.style.transform = `rotate(${u.dir * k * 90}deg)`; });
    });
  }, { rootMargin: '0px 0px -98% 0px' });
  const count = Math.ceil(document.documentElement.scrollHeight / 450) + 4;
  for (let k = 0; k < count; k++) {
    const b = document.createElement('i');
    b.style.cssText = 'display:block;width:1px;height:450px';
    b.dataset.k = k;
    bands.appendChild(b);
    io.observe(b);
  }
})();
