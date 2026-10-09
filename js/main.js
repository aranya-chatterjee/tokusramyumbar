(() => {
  document.documentElement.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const setNav = (open) => {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-list');
  };
  toggle.addEventListener('click', () => setNav(!links.classList.contains('is-open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  // Scroll reveals
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Menu tabs (roving tabindex, arrow keys)
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (typeof feature === 'function') feature(document.querySelector(`#${tab.getAttribute('aria-controls')} .dish`));
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      select(next); next.focus();
    });
  });

  // Feature plate follows the dish being looked at
  const plate = document.querySelector('.menu__plate');
  const plateImg = plate.querySelector('img');
  const glyph = plate.querySelector('.menu__glyph');
  const fName = document.querySelector('.menu__feature-name');
  const fDesc = document.querySelector('.menu__feature-desc');
  let current = null;
  const feature = (dish) => {
    if (!dish || dish === current) return;
    current = dish;
    const thumb = dish.querySelector('.dish__img');
    const apply = () => {
      const photo = thumb.classList.contains('dish__img--photo');
      plateImg.hidden = !photo;
      glyph.hidden = photo;
      if (!photo) { glyph.textContent = thumb.textContent; glyph.classList.toggle('is-alt', thumb.classList.contains('dish__img--alt')); }
      fName.textContent = dish.querySelector('h3').textContent;
      fDesc.textContent = dish.querySelector('p').textContent;
    };
    if (reduceMotion) { apply(); return; }
    plate.classList.remove('is-swapping'); void plate.offsetWidth; plate.classList.add('is-swapping');
    setTimeout(apply, 260);
  };
  document.querySelectorAll('.dish').forEach((d) => {
    d.addEventListener('pointerenter', () => feature(d));
    d.addEventListener('focusin', () => feature(d));
  });
  current = document.querySelector('#tab-ramen .dish');

  // Note wall (kept in this browser only)
  const KEY = 'tokus-notes';
  const list = document.getElementById('notes');
  const form = document.getElementById('noteForm');
  const field = document.getElementById('noteText');
  const hint = document.getElementById('noteHint');
  const defaultHint = hint.textContent;
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const write = (notes) => { try { localStorage.setItem(KEY, JSON.stringify(notes.slice(-6))); } catch { /* storage blocked */ } };
  const addNote = (text, fresh) => {
    const li = document.createElement('li');
    li.className = 'note' + (fresh ? ' is-new' : '');
    li.textContent = text;
    list.prepend(li);
    while (list.children.length > 9) list.lastElementChild.remove();
  };
  read().forEach((t) => addNote(t, false));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = field.value.trim();
    if (!text) {
      field.setAttribute('aria-invalid', 'true');
      hint.textContent = 'Write something first, even just "send noods".';
      hint.classList.add('is-error');
      field.focus();
      return;
    }
    field.removeAttribute('aria-invalid');
    hint.textContent = 'Stuck! See you at the real wall.';
    hint.classList.remove('is-error');
    addNote(text, true);
    write([...read(), text]);
    form.reset();
    setTimeout(() => { hint.textContent = defaultHint; }, 3500);
  });
  field.addEventListener('input', () => {
    if (field.value.trim()) { field.removeAttribute('aria-invalid'); hint.classList.remove('is-error'); hint.textContent = defaultHint; }
  });

  const replay = document.getElementById('replayIntro');
  if (replay) replay.addEventListener('click', () => { if (window.tokusIntro) { window.scrollTo(0, 0); window.tokusIntro(); } });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
