// Intro: a bowl of ramyum is served, smoke rises from the broth and the name condenses out of it.
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const finish = () => {
    root.classList.remove('intro-on');
    root.classList.add('intro-done');
  };

  window.tokusIntro = play;
  if (reduce) { finish(); return; }
  play();

  function play() {
    if (document.getElementById('intro')) return;
    root.classList.remove('intro-done');
    root.classList.add('intro-on');

    const el = document.createElement('div');
    el.id = 'intro';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', "Toku's Ramyum Bar intro");
    el.innerHTML = `
      <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
        <filter id="intro-smoke" x="-15%" y="-60%" width="130%" height="220%" color-interpolation-filters="sRGB">
          <feTurbulence id="is-turb" type="fractalNoise" baseFrequency="0.010 0.018" numOctaves="3" seed="5" result="noise"/>
          <feGaussianBlur id="is-blur" in="SourceGraphic" stdDeviation="0" result="soft"/>
          <feDisplacementMap id="is-disp" in="soft" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </svg>
      <div class="intro__table" aria-hidden="true"></div>
      <canvas class="intro__canvas" aria-hidden="true"></canvas>
      <p class="intro__name">Toku's Ramyum Bar</p>
      <div class="intro__title" aria-hidden="true"><span class="intro__big">Toku's</span><span class="intro__small">Ramyum Bar</span></div>
      <div class="intro__bowl" aria-hidden="true">
        <div class="bowl__shadow"></div>
        <div class="bowl">${window.tokusBowlSVG()}</div>
      </div>
      <button class="intro__skip" type="button">Skip Intro</button>`;
    document.body.prepend(el);

    const canvas = el.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const title = el.querySelector('.intro__title');
    const broth = el.querySelector('#bowl-broth');
    const turb = el.querySelector('#is-turb');
    const blur = el.querySelector('#is-blur');
    const disp = el.querySelector('#is-disp');
    let raf = 0, exiting = false, named = false, timers = [];

    const skip = () => exit(true);
    el.querySelector('.intro__skip').addEventListener('click', skip);
    const onKey = (e) => { if (e.key === 'Escape') skip(); };
    document.addEventListener('keydown', onKey);

    // One soft puff, drawn once and stretched per particle
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 128;
    const sctx = sprite.getContext('2d');
    const g = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,246,240,.9)');
    g.addColorStop(0.3, 'rgba(255,240,232,.5)');
    g.addColorStop(0.65, 'rgba(255,236,228,.14)');
    g.addColorStop(1, 'rgba(255,236,228,0)');
    sctx.fillStyle = g; sctx.fillRect(0, 0, 128, 128);

    let W = 0, H = 0, dpr = 1, ox = 0, oy = 0, ow = 0;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = el.clientWidth; H = el.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    // Name block sits above the bowl; sizes follow the viewport
    const layoutTitle = () => {
      const big = Math.min(W * (W < 600 ? 0.205 : 0.17), H * 0.2, 190);
      const bowlTop = el.querySelector('.bowl-svg').getBoundingClientRect().top - el.getBoundingClientRect().top;
      title.style.setProperty('--big', big + 'px');
      title.style.setProperty('--small', big * 0.34 + 'px');
      title.style.bottom = Math.max(H - bowlTop + big * 0.3, 24) + 'px';
    };

    // Smoke particles: continuous stream of large overlapping puffs carried by a swirling flow
    let puffs = [], last = 0, spawnAcc = 0, t0 = 0, density = 1;
    const rect = () => {
      const b = broth.getBoundingClientRect(), r = el.getBoundingClientRect();
      ox = b.left - r.left + b.width / 2; oy = b.top - r.top + b.height * 0.35; ow = b.width;
    };
    const spawn = (now) => {
      puffs.push({
        x: ox + (Math.random() - 0.5) * ow * 0.5,
        y: oy + (Math.random() - 0.5) * 8,
        born: now,
        life: 3800 + Math.random() * 2200,
        size: (64 + Math.random() * 56) * (ow / 380),
        seed: Math.random() * 100,
        rise: 88 + Math.random() * 60,
        stretch: 1.25 + Math.random() * 0.5,
        peak: 0.11 + Math.random() * 0.09,
      });
    };

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const REVEAL_AT = 50, REVEAL_MS = 1700;

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      const t = now - t0;
      ctx.clearRect(0, 0, W, H);

      // smoke grows thicker as the name starts to form
      density = 1 + Math.min(1, Math.max(0, (t - 50) / 1200)) * 1.6;
      spawnAcc += dt * 70 * density;
      while (spawnAcc >= 1 && puffs.length < 260) { spawn(now); spawnAcc -= 1; }
      if (spawnAcc > 3) spawnAcc = 0;

      puffs = puffs.filter((p) => now - p.born < p.life);
      for (const p of puffs) {
        const k = (now - p.born) / p.life;
        const age = (now - p.born) / 1000;
        // flow field: sums of sines of height and time curl the column left and right
        const sway = (Math.sin(p.y * 0.012 + age * 1.1 + p.seed) * 34 + Math.sin(p.y * 0.031 - age * 1.9 + p.seed * 2) * 14) * (ow / 380);
        p.x += sway * dt * (0.4 + k);
        p.y -= p.rise * dt * (1.15 - k * 0.5);
        const s = p.size * (0.7 + k * 1.9);
        const a = p.peak * Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.05)), 1.3) * (0.7 + 0.3 * density / 2.6);
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, p.x - s / 2, p.y - (s * p.stretch) / 2, s, s * p.stretch);
      }
      ctx.globalAlpha = 1;

      // the name condenses out of the smoke: displacement and blur settle, a mask climbs upward
      if (!named) {
        const raw = (t - REVEAL_AT) / REVEAL_MS;
        if (raw > 0) {
          const p = Math.min(1, raw), e = ease(p), inv = 1 - e;
          disp.setAttribute('scale', (85 * Math.pow(inv, 1.5)).toFixed(1));
          blur.setAttribute('stdDeviation', (16 * inv * inv).toFixed(2));
          turb.setAttribute('baseFrequency', `${(0.010 + Math.sin(t / 900) * 0.0015).toFixed(4)} ${(0.018 - t * 0.0000014).toFixed(4)}`);
          const m = -30 + e * 160;
          title.style.maskImage = title.style.webkitMaskImage = `linear-gradient(to top, #000 ${m - 35}%, transparent ${m}%)`;
          title.style.opacity = Math.min(1, p * 3);
          title.style.transform = `translateY(${(1 - e) * 46}px) scale(${1 + inv * 0.06})`;
          if (p >= 1) {
            named = true;
            title.style.filter = 'none';
            title.style.maskImage = title.style.webkitMaskImage = 'none';
            title.style.transform = 'none';
            el.classList.add('is-named');
            timers.push(setTimeout(() => exit(false), 400));
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function exit(fast) {
      if (exiting) return;
      exiting = true;
      timers.forEach(clearTimeout);
      el.classList.add('is-named', 'is-leaving');
      finish();
      const remove = () => {
        cancelAnimationFrame(raf);
        document.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', onResize);
        el.remove();
      };
      if (fast) setTimeout(remove, 300);
      else el.addEventListener('transitionend', (e) => { if (e.target === el) remove(); });
      setTimeout(remove, 450);
    }

    // Serve the bowl, then start the smoke once fonts are ready
    const fontsReady = Promise.all([
      document.fonts.load('400 100px Shojumaru'),
      document.fonts.load('900 100px "Big Shoulders Display"'),
    ]).catch(() => {});
    requestAnimationFrame(() => el.classList.add('is-served'));
    Promise.all([Promise.race([fontsReady, new Promise((r) => setTimeout(r, 200))]), new Promise((r) => timers.push(setTimeout(r, 150)))]).then(() => {
      if (exiting) return;
      layoutTitle(); rect();
      title.style.filter = 'url(#intro-smoke)';
      t0 = performance.now(); last = t0;
      raf = requestAnimationFrame(frame);
    });
    const w0 = window.innerWidth;
    const onResize = () => { if (!exiting && Math.abs(window.innerWidth - w0) > 40) exit(true); };
    window.addEventListener('resize', onResize);
  }
})();
