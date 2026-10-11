(() => {
  document.documentElement.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Bubble side bar
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const scrim = document.getElementById('navScrim');
  const setNav = (open) => {
    links.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-list');
    if (open) links.querySelector('a').focus({ preventScroll: true });
  };
  toggle.addEventListener('click', () => setNav(!links.classList.contains('is-open')));
  scrim.addEventListener('click', () => setNav(false));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && links.classList.contains('is-open')) { setNav(false); toggle.focus(); } });

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

  // "See more": long category lists show the first few dishes, the button reveals the rest
  const SHOW = 4;
  document.querySelectorAll('.dishes').forEach((ul) => {
    const dishes = [...ul.querySelectorAll('.dish')];
    if (dishes.length <= SHOW + 1) return;
    const extra = dishes.slice(SHOW);
    extra.forEach((d) => d.classList.add('is-extra'));
    ul.classList.add('is-collapsed');
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'more';
    btn.setAttribute('aria-controls', ul.id); btn.setAttribute('aria-expanded', 'false');
    const label = (open) => {
      btn.innerHTML = open
        ? '<span>See less</span><svg class="icon" aria-hidden="true"><use href="#i-caret"/></svg>'
        : `<span>See more</span><span class="more__count">${extra.length} more</span><svg class="icon" aria-hidden="true"><use href="#i-caret"/></svg>`;
    };
    label(false);
    btn.addEventListener('click', () => {
      const open = ul.classList.contains('is-collapsed');
      ul.classList.toggle('is-collapsed', !open);
      btn.setAttribute('aria-expanded', String(open));
      label(open);
      if (open) {
        extra.forEach((d, k) => { d.style.setProperty('--k', Math.min(k, 8)); d.classList.remove('is-fresh'); void d.offsetWidth; d.classList.add('is-fresh'); });
        extra[0].querySelector('a, h3').scrollIntoView?.({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
      } else {
        ul.closest('.menu').scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
    ul.after(btn);
    // the button belongs to its tab: hide it with the list
    new MutationObserver(() => { btn.hidden = ul.hidden; }).observe(ul, { attributes: true, attributeFilter: ['hidden'] });
    btn.hidden = ul.hidden;
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

  // Book a seat: opens WhatsApp when data-whatsapp holds a number (digits with country code), otherwise shows a confirmation
  const bookForm = document.getElementById('bookForm');
  if (bookForm) {
    const bookDone = document.getElementById('bookDone');
    const bookHint = document.getElementById('bookHint');
    const dateEl = document.getElementById('bookDate');
    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    dateEl.min = today.toISOString().slice(0, 10);
    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = bookForm.elements;
      let ok = true;
      [f.name, f.phone, f.date, f.time].forEach((el) => {
        const bad = !el.value.trim() || (el === f.phone && el.value.replace(/\D/g, '').length < 8);
        el.setAttribute('aria-invalid', String(bad)); if (bad) ok = false;
      });
      bookHint.classList.toggle('is-error', !ok);
      if (!ok) { bookHint.textContent = 'Please fill in your name, a phone number, a date and a time.'; bookForm.querySelector('[aria-invalid="true"]').focus(); return; }
      const day = new Date(f.date.value + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
      const summary = `${f.name.value.trim()}, ${f.guests.value} ${f.guests.value === '1' ? 'guest' : 'guests'}, ${day} at ${f.time.value}`;
      const wa = bookForm.dataset.whatsapp.replace(/\D/g, '');
      if (wa) window.open(`https://wa.me/${wa}?text=${encodeURIComponent(`Table request: ${summary}. Phone: ${f.phone.value.trim()}`)}`, '_blank', 'noopener');
      document.getElementById('bookSummary').textContent = summary;
      bookForm.hidden = true; bookDone.hidden = false;
    });
    document.getElementById('bookAgain').addEventListener('click', () => { bookForm.reset(); bookHint.textContent = 'We will confirm by phone.'; bookDone.hidden = true; bookForm.hidden = false; });
  }

  // Post-its: margins on wide screens, zigzag rows between sections on narrow ones
  const postits = [...document.querySelectorAll('.postits--l .pi, .postits--r .pi')];
  if (postits.length) {
    const left = [...document.querySelectorAll('.postits--l .pi')], right = [...document.querySelectorAll('.postits--r .pi')];
    const order = left.flatMap((n, i) => [n, right[i]]).filter(Boolean);
    const wide = window.matchMedia('(min-width: 1100px)');
    const homes = new Map(order.map((n) => [n, n.parentElement]));
    let rows = [];
    const place = () => {
      rows.forEach((r) => r.remove()); rows = [];
      if (wide.matches) { order.forEach((n) => homes.get(n).appendChild(n)); return; }
      const slots = [...document.querySelectorAll('main > section:not(.hero), main > .marquee')];
      const counts = [2, 2, 2, 2, 2, 1, 1];
      let k = 0;
      slots.slice(0, counts.length).forEach((slot, s) => {
        if (k >= order.length) return;
        const row = document.createElement('div');
        row.className = 'postit-row' + (s % 2 ? ' postit-row--r' : '');
        row.setAttribute('aria-hidden', 'true');
        for (let c = 0; c < counts[s] && k < order.length; c++) row.appendChild(order[k++]);
        slot.after(row); rows.push(row);
      });
    };
    wide.addEventListener('change', place); place();
  }

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
