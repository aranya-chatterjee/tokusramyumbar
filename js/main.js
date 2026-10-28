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
  current = document.querySelector('.dishes .dish');

  // Book a seat: books live through the API (data-api); falls back to a prefilled WhatsApp message (data-whatsapp) when the API can't be reached or the group is too big
  const bookForm = document.getElementById('bookForm');
  if (bookForm) {
    const api = bookForm.dataset.api || '';
    const wa = (bookForm.dataset.whatsapp || '').replace(/\D/g, '');
    const bookDone = document.getElementById('bookDone');
    const bookHint = document.getElementById('bookHint');
    const slotsBox = document.getElementById('bookSlots');
    const dateEl = document.getElementById('bookDate');
    const guestsEl = document.getElementById('bookGuests');
    const f = bookForm.elements;
    const FALLBACK_TIMES = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
    const label = (t) => { const h = +t.slice(0, 2); return `${h % 12 || 12}:${t.slice(3)} ${h < 12 ? 'am' : 'pm'}`; };
    const defaultHint = () => (live ? 'Your table is confirmed straight away.' : 'Your request opens in WhatsApp, ready to send to us.');
    let live = !!api, slots = [], loadSeq = 0;

    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    dateEl.min = today.toISOString().slice(0, 10);
    const later = new Date(today); later.setDate(later.getDate() + 30);
    dateEl.max = later.toISOString().slice(0, 10);

    const setHint = (text, isError) => { bookHint.textContent = text; bookHint.classList.toggle('is-error', !!isError); };
    const groupSize = () => (guestsEl.value === '9+' ? 9 : +guestsEl.value);

    function renderSlots(keep) {
      slotsBox.querySelectorAll('.slot, .book__slots-empty').forEach((n) => n.remove());
      if (!slots.length) return;
      const n = groupSize();
      slots.forEach((s) => {
        const tooFew = live && s.open && s.left < n && guestsEl.value !== '9+';
        const lab = document.createElement('label'); lab.className = 'slot';
        const input = document.createElement('input');
        Object.assign(input, { type: 'radio', name: 'time', value: s.time, disabled: !s.open || tooFew });
        input.dataset.label = s.label;
        if (keep === s.time && !input.disabled) input.checked = true;
        const span = document.createElement('span');
        span.textContent = s.label;
        if (live) {
          const small = document.createElement('small');
          small.textContent = !s.open ? (s.left ? 'closed' : 'full') : tooFew ? `${s.left} left` : s.left <= 6 ? `${s.left} seats left` : 'open';
          span.append(small);
        }
        lab.append(input, span); slotsBox.append(lab);
      });
    }

    function emptyNote(text) {
      slotsBox.querySelectorAll('.slot, .book__slots-empty').forEach((n) => n.remove());
      const p = document.createElement('p'); p.className = 'book__slots-empty'; p.textContent = text; slotsBox.append(p);
    }

    async function loadSlots() {
      const date = dateEl.value, keep = f.time && f.time.value, seq = ++loadSeq;
      if (!date) { slots = []; emptyNote('Pick a date to see open times.'); return; }
      if (!api) { slots = FALLBACK_TIMES.map((t) => ({ time: t, label: label(t), open: true })); renderSlots(keep); return; }
      emptyNote('Checking open tables...');
      try {
        const res = await fetch(`${api}/slots?date=${encodeURIComponent(date)}`, { headers: { accept: 'application/json' } });
        if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) throw new Error(res.status);
        const data = await res.json();
        if (seq !== loadSeq) return;
        live = true; setHint(defaultHint());
        if (data.closed) { slots = []; emptyNote(data.closed); return; }
        slots = data.slots;
        renderSlots(keep);
        if (!slots.some((s) => s.open)) emptyNote('No tables left online for this day. Message us on WhatsApp and we will try to fit you in.');
      } catch {
        if (seq !== loadSeq) return;
        live = false; setHint(defaultHint());
        slots = FALLBACK_TIMES.map((t) => ({ time: t, label: label(t), open: true }));
        renderSlots(keep);
      }
    }

    function showDone(summary, code) {
      document.getElementById('bookSummary').textContent = summary;
      document.getElementById('bookDoneTag').textContent = code ? 'Table confirmed' : 'Request ready';
      document.getElementById('bookCodeWrap').hidden = !code;
      document.getElementById('bookCode').textContent = code || '';
      document.getElementById('bookDoneMsg').firstChild.textContent = code
        ? 'Show this code when you arrive. To change or cancel, call or WhatsApp us on '
        : 'Hit send in WhatsApp and we will confirm your table. Or call us on ';
      bookForm.hidden = true; bookDone.hidden = false; bookDone.focus();
    }

    function sendWhatsApp(summary) {
      const note = f.note.value.trim();
      if (wa) window.open(`https://wa.me/${wa}?text=${encodeURIComponent(`Table request: ${summary}. Phone: ${f.phone.value.trim()}${note ? `. Note: ${note}` : ''}`)}`, '_blank', 'noopener');
      showDone(summary, null);
    }

    dateEl.addEventListener('change', loadSlots);
    guestsEl.addEventListener('change', () => {
      renderSlots(f.time && f.time.value);
      if (guestsEl.value === '9+') setHint('For 9 or more, we will sort your table over WhatsApp.');
      else setHint(defaultHint());
    });

    bookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const time = slotsBox.querySelector('input:checked');
      let ok = true;
      [f.name, f.phone, f.date].forEach((el) => {
        const bad = !el.value.trim() || (el === f.phone && el.value.replace(/\D/g, '').length < 10);
        el.setAttribute('aria-invalid', String(bad)); if (bad) ok = false;
      });
      slotsBox.setAttribute('aria-invalid', String(!time)); if (!time) ok = false;
      if (!ok) {
        setHint('Please fill in your name, a 10 digit phone number, a date and a time.', true);
        (bookForm.querySelector('input[aria-invalid="true"]') || slotsBox.querySelector('input:not(:disabled)') || dateEl).focus();
        return;
      }
      const day = new Date(f.date.value + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
      const guests = guestsEl.value === '9+' ? '9 or more guests' : `${guestsEl.value} ${guestsEl.value === '1' ? 'guest' : 'guests'}`;
      const summary = `${f.name.value.trim()}, ${guests}, ${day} at ${time.dataset.label}`;
      if (!live || guestsEl.value === '9+') { sendWhatsApp(summary); return; }

      bookForm.classList.add('is-busy'); setHint('Booking your table...');
      try {
        const res = await fetch(`${api}/book`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: f.name.value, phone: f.phone.value, date: f.date.value, time: time.value, guests: guestsEl.value, note: f.note.value, website: f.website.value }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) { showDone(summary, data.code); return; }
        if (res.status >= 500 || !data.message) throw new Error(res.status);
        setHint(data.message, true);
        if (data.error === 'full' || data.error === 'time') loadSlots();
        if (f[data.error] && f[data.error].focus) { f[data.error].setAttribute('aria-invalid', 'true'); f[data.error].focus(); }
      } catch {
        setHint('We could not reach the booking system, so this opens WhatsApp instead.', true);
        live = false; sendWhatsApp(summary);
      } finally {
        bookForm.classList.remove('is-busy');
      }
    });

    document.getElementById('bookAgain').addEventListener('click', () => {
      bookForm.reset(); slots = []; emptyNote('Pick a date to see open times.');
      live = !!api; setHint('Pick a date and time. Your table is confirmed straight away.');
      bookDone.hidden = true; bookForm.hidden = false;
    });
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

  // Note wall: star ratings and notes everyone can see, stored by the worker (/api/reviews)
  const list = document.getElementById('notes');
  const form = document.getElementById('noteForm');
  const field = document.getElementById('noteText');
  const hint = document.getElementById('noteHint');
  const starsBox = document.getElementById('noteStars');
  const defaultHint = hint.textContent;
  const starText = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
  const say = (text, isError) => { hint.textContent = text; hint.classList.toggle('is-error', !!isError); };
  const noteEl = (n, fresh) => {
    const li = document.createElement('li');
    li.className = 'note' + (fresh ? ' is-new' : '');
    const stars = document.createElement('span');
    stars.className = 'note__stars'; stars.textContent = starText(n.stars);
    stars.setAttribute('aria-label', n.stars + ' out of 5');
    const text = document.createElement('span');
    text.className = 'note__text'; text.textContent = n.note;
    li.append(stars, text);
    if (n.name) {
      const who = document.createElement('span');
      who.className = 'note__name'; who.textContent = '- ' + n.name;
      li.append(who);
    }
    return li;
  };
  const showScore = (d) => {
    const box = document.getElementById('wallScore');
    if (!d.count) { box.hidden = true; return; }
    box.hidden = false;
    document.getElementById('wallAvg').textContent = d.average.toFixed(1);
    document.getElementById('wallStars').style.setProperty('--v', d.average);
    document.getElementById('wallCount').textContent = `from ${d.count} ${d.count === 1 ? 'note' : 'notes'}`;
  };
  const loadWall = async () => {
    try {
      const res = await fetch('/api/reviews', { headers: { accept: 'application/json' } });
      const d = await res.json();
      if (!d.ok) return;
      showScore(d);
      list.replaceChildren(...d.notes.map((n) => noteEl(n, false)));
      document.getElementById('wallEmpty').hidden = d.notes.length > 0;
    } catch { /* wall offline: leave it empty */ }
  };
  loadWall();

  let sending = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    const picked = form.querySelector('input[name="stars"]:checked');
    const note = field.value.trim();
    if (!picked) { starsBox.classList.add('is-invalid'); say('Tap the stars to rate your visit.', true); form.querySelector('#star5').focus(); return; }
    if (!note) { field.setAttribute('aria-invalid', 'true'); say('Write something first, even just "send noods".', true); field.focus(); return; }
    sending = true;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; say('Sticking…');
    const body = { stars: +picked.value, note, name: form.elements.name.value.trim(), website: form.elements.website.value };
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const d = await res.json();
      if (!d.ok) { say(d.message || 'That did not stick. Try again in a minute.', true); return; }
      if (d.status === 'pending') say('Thanks! Your note goes up once the team has seen it.');
      else {
        if (!d.repeat) {
          document.getElementById('wallEmpty').hidden = true;
          list.prepend(noteEl(body, true));
          while (list.children.length > 9) list.lastElementChild.remove();
          if (d.count) showScore(d);
        }
        say('Stuck! See you at the real wall.');
      }
      form.reset();
      setTimeout(() => say(defaultHint), 3500);
    } catch {
      say('The wall is offline right now. Try again in a bit.', true);
    } finally {
      sending = false; btn.disabled = false;
    }
  });
  field.addEventListener('input', () => {
    if (field.value.trim()) { field.removeAttribute('aria-invalid'); say(defaultHint); }
  });
  starsBox.addEventListener('change', () => { starsBox.classList.remove('is-invalid'); if (hint.classList.contains('is-error')) say(defaultHint); });

  const replay = document.getElementById('replayIntro');
  if (replay) replay.addEventListener('click', () => { if (window.tokusIntro) { window.scrollTo(0, 0); window.tokusIntro(); } });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
