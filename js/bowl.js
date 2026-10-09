// Procedural ramen bowl (3/4 view) with shaded ceramic, glossy broth and toppings.
window.tokusBowlSVG = function () {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const r = (a, b) => a + rnd() * (b - a);

  // noodles: many long wavy strands across the broth surface
  let noodles = '';
  for (let i = 0; i < 46; i++) {
    const y = r(92, 132), x0 = r(54, 120), x1 = x0 + r(120, 230);
    const a = r(6, 14), c1 = r(-a, a), c2 = r(-a, a);
    const hue = rnd() > .5 ? '#f3d98f' : '#e9c26b';
    noodles += `<path d="M${x0},${y} C${x0 + (x1 - x0) * .3},${y + c1} ${x0 + (x1 - x0) * .65},${y + c2} ${x1},${y + r(-6, 6)}" stroke="${hue}" stroke-width="${r(2.4, 4)}" opacity="${r(.8, 1)}"/>`;
    noodles += `<path d="M${x0 + 6},${y - 1} C${x0 + 60},${y + c1 - 1} ${x1 - 60},${y + c2 - 1} ${x1 - 6},${y - 1}" stroke="#fff3c9" stroke-width="1" opacity=".45"/>`;
  }
  // oil beads and chilli flakes on the broth
  let oil = '', chilli = '';
  for (let i = 0; i < 70; i++) {
    const a = r(0, 6.28), d = Math.sqrt(rnd());
    const x = 200 + Math.cos(a) * 148 * d, y = 112 + Math.sin(a) * 30 * d;
    oil += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r(2, 6).toFixed(1)}" ry="${r(.9, 2.2).toFixed(1)}" fill="#ffc46b" opacity="${r(.25, .6).toFixed(2)}"/>`;
  }
  for (let i = 0; i < 40; i++) {
    const a = r(0, 6.28), d = Math.sqrt(rnd());
    const x = 200 + Math.cos(a) * 140 * d, y = 112 + Math.sin(a) * 28 * d;
    chilli += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r(1.2, 2.6).toFixed(1)}" ry="${r(.7, 1.4).toFixed(1)}" fill="#8a1408" opacity=".85" transform="rotate(${r(0, 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  let scallion = '';
  for (let i = 0; i < 26; i++) {
    const x = r(210, 330), y = r(104, 132);
    scallion += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r(3, 4.6).toFixed(1)}" ry="${r(1.6, 2.4).toFixed(1)}" fill="none" stroke="#7fc94b" stroke-width="1.5" opacity=".95"/>`;
  }
  let sesame = '';
  for (let i = 0; i < 18; i++) sesame += `<ellipse cx="${r(120, 300).toFixed(1)}" cy="${r(98, 130).toFixed(1)}" rx="1.6" ry=".9" fill="#f3e6c4"/>`;

  return `
<svg class="bowl-svg" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="bw-body" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#4d0615"/><stop offset=".18" stop-color="#8e0d2c"/><stop offset=".42" stop-color="#c2224a"/>
      <stop offset=".6" stop-color="#9a1233"/><stop offset=".88" stop-color="#5c0919"/><stop offset="1" stop-color="#36040e"/>
    </linearGradient>
    <linearGradient id="bw-shade" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".05"/><stop offset=".6" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".5"/>
    </linearGradient>
    <linearGradient id="bw-rim" x1="0" x2="1">
      <stop offset="0" stop-color="#cfc6bd"/><stop offset=".3" stop-color="#fffaf3"/><stop offset=".7" stop-color="#f4ece1"/><stop offset="1" stop-color="#b8aea4"/>
    </linearGradient>
    <radialGradient id="bw-broth" cx=".5" cy=".4" r=".7">
      <stop offset="0" stop-color="#d98a2f"/><stop offset=".55" stop-color="#b8601a"/><stop offset="1" stop-color="#6b2c0a"/>
    </radialGradient>
    <radialGradient id="bw-yolk" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffc83a"/><stop offset=".7" stop-color="#f08a12"/><stop offset="1" stop-color="#c85d08"/></radialGradient>
    <radialGradient id="bw-egg" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#e6d9b8"/></radialGradient>
    <radialGradient id="bw-pork" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#e7b3a0"/><stop offset=".7" stop-color="#b9715a"/><stop offset="1" stop-color="#7d4333"/></radialGradient>
    <linearGradient id="bw-nori" x1="0" x2="1"><stop offset="0" stop-color="#0c1a10"/><stop offset=".5" stop-color="#27402b"/><stop offset="1" stop-color="#0a140c"/></linearGradient>
    <linearGradient id="bw-wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f0c88d"/><stop offset=".5" stop-color="#c58d4f"/><stop offset="1" stop-color="#8a5a2a"/></linearGradient>
    <clipPath id="bw-clip"><ellipse cx="200" cy="112" rx="156" ry="33"/></clipPath>
    <filter id="bw-blur"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="bw-soft"><feGaussianBlur stdDeviation="1.2"/></filter>
  </defs>

  <!-- foot ring and body -->
  <ellipse cx="200" cy="268" rx="70" ry="12" fill="#2b0309"/>
  <path d="M130,262 L130,274 C130,282 270,282 270,274 L270,262 Z" fill="#6e0f26"/>
  <path d="M30,110 C30,212 112,266 200,266 C288,266 370,212 370,110 Z" fill="url(#bw-body)"/>
  <path d="M30,110 C30,212 112,266 200,266 C288,266 370,212 370,110 Z" fill="url(#bw-shade)"/>
  <!-- decorative gold band and glaze highlights -->
  <path d="M38,152 C70,196 130,222 200,222 C270,222 330,196 362,152" fill="none" stroke="#e8c38a" stroke-width="2" opacity=".85"/>
  <path d="M46,170 C80,208 135,232 200,232 C265,232 320,208 354,170" fill="none" stroke="#e8c38a" stroke-width="1" opacity=".5"/>
  <path d="M54,128 C60,170 84,200 112,218" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".28" filter="url(#bw-soft)"/>
  <path d="M338,150 C330,184 312,206 292,220" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".16" filter="url(#bw-soft)"/>

  <!-- rim -->
  <ellipse cx="200" cy="110" rx="171" ry="42" fill="url(#bw-rim)"/>
  <ellipse cx="200" cy="112" rx="159" ry="36" fill="#d9cfc2"/>
  <ellipse cx="200" cy="114" rx="157" ry="34" fill="#9a8c7e" opacity=".5"/>
  <!-- broth -->
  <g id="bw-broth-group">
    <ellipse id="bowl-broth" cx="200" cy="114" rx="156" ry="33" fill="url(#bw-broth)"/>
    <g clip-path="url(#bw-clip)">
      ${oil}
      <g fill="none" stroke-linecap="round">${noodles}</g>
      ${chilli}
      <!-- chashu -->
      <g transform="rotate(-8 150 112)">
        <ellipse cx="150" cy="116" rx="40" ry="19" fill="#5a2c20" opacity=".55" filter="url(#bw-soft)"/>
        <ellipse cx="150" cy="112" rx="38" ry="18" fill="url(#bw-pork)"/>
        <path d="M120,112 C132,104 144,120 156,110 S176,108 184,112" fill="none" stroke="#f7e0d3" stroke-width="3" opacity=".75"/>
        <ellipse cx="146" cy="107" rx="18" ry="5" fill="#fff" opacity=".18"/>
      </g>
      <g transform="rotate(6 232 120)">
        <ellipse cx="236" cy="124" rx="36" ry="17" fill="#5a2c20" opacity=".55" filter="url(#bw-soft)"/>
        <ellipse cx="232" cy="120" rx="34" ry="16" fill="url(#bw-pork)"/>
        <path d="M204,120 C214,113 226,126 238,118 S254,116 262,120" fill="none" stroke="#f7e0d3" stroke-width="2.6" opacity=".7"/>
      </g>
      <!-- eggs -->
      <g>
        <ellipse cx="108" cy="102" rx="24" ry="14" fill="#5a2c10" opacity=".45" filter="url(#bw-soft)"/>
        <ellipse cx="106" cy="99" rx="22" ry="13" fill="url(#bw-egg)"/>
        <ellipse cx="106" cy="99" rx="11" ry="7" fill="url(#bw-yolk)"/>
        <ellipse cx="103" cy="96.5" rx="4" ry="2" fill="#fff" opacity=".6"/>
      </g>
      <g>
        <ellipse cx="140" cy="94" rx="22" ry="12" fill="#5a2c10" opacity=".4" filter="url(#bw-soft)"/>
        <ellipse cx="139" cy="91" rx="20" ry="12" fill="url(#bw-egg)"/>
        <ellipse cx="139" cy="91" rx="10" ry="6.5" fill="url(#bw-yolk)"/>
        <ellipse cx="136" cy="88.5" rx="3.6" ry="1.8" fill="#fff" opacity=".6"/>
      </g>
      <!-- narutomaki -->
      <g transform="translate(300 118)">
        <ellipse cx="0" cy="3" rx="20" ry="9" fill="#4a2410" opacity=".5" filter="url(#bw-soft)"/>
        <ellipse cx="0" cy="0" rx="19" ry="9" fill="#fff7f2"/>
        <path d="M-10,0 C-8,-6 6,-6 8,0 C6,5 -4,5 -3,0 C-2,-2 2,-2 2,0" fill="none" stroke="#e86a8e" stroke-width="1.8"/>
        <ellipse cx="0" cy="0" rx="19" ry="9" fill="none" stroke="#e86a8e" stroke-width="1.4" stroke-dasharray="3 2.6" opacity=".7"/>
      </g>
      ${scallion}
      ${sesame}
    </g>
    <!-- broth sheen -->
    <ellipse cx="200" cy="114" rx="156" ry="33" fill="none" stroke="#ffd9a0" stroke-width="1.4" opacity=".45"/>
    <ellipse cx="120" cy="124" rx="36" ry="5" fill="#fff" opacity=".12" filter="url(#bw-soft)"/>
  </g>
  <!-- nori standing against the rim -->
  <g transform="rotate(12 262 78)">
    <path d="M250,62 L286,60 L284,114 L250,116 Z" fill="url(#bw-nori)"/>
    <path d="M254,66 L254,112 M262,64 L262,113 M271,63 L271,114 M279,62 L279,114" stroke="#5f8566" stroke-width=".7" opacity=".35"/>
    <path d="M251,62 L284,60" stroke="#8fb594" stroke-width="1" opacity=".5"/>
  </g>
  <!-- rim front lip highlight -->
  <path d="M30,112 C34,142 112,152 200,152 C288,152 366,142 370,112" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>
  <ellipse cx="200" cy="110" rx="171" ry="42" fill="none" stroke="#fff" stroke-width="1.4" opacity=".6"/>
  <ellipse cx="128" cy="78" rx="40" ry="3" fill="#fff" opacity=".7" filter="url(#bw-soft)"/>

  <!-- chopsticks resting on the rim -->
  <g>
    <path d="M214,52 L402,118" stroke="#000" stroke-width="7" stroke-linecap="round" opacity=".25" filter="url(#bw-blur)" transform="translate(4 6)"/>
    <path d="M214,50 L402,116" stroke="url(#bw-wood)" stroke-width="5" stroke-linecap="round"/>
    <path d="M222,44 L406,104" stroke="url(#bw-wood)" stroke-width="5" stroke-linecap="round"/>
    <path d="M216,49 L398,112" stroke="#fff" stroke-width="1" opacity=".35"/>
  </g>
</svg>`;
};
