/* VERTO — la guida: Giano bifronte, il dio delle porte e degli inizi, disegnato in SVG in stile cartone con contorno uniforme.
   Due teste unite per la nuca: il volto anziano e barbuto (il latino) guarda a sinistra, quello giovane (l'italiano) a destra.
   Attributi: la chiave, la corona d'alloro, la toga con la fascia di porpora.
   Cinque espressioni: idle (normale), happy (contenta), think (pensierosa), sad (triste), cheer (esultante).
   Sotto i 64 px si disegna solo il busto. Le altre due proposte (Minerva, Mercurio) sono nella storia del repository, tappa 4. */
(function (root) {
  'use strict';
  const L = '#2B211D', LW = 2.6;
  const K = {
    skin: '#F3C9A1', blush: '#EE8F7E', mouth: '#8A2B2B', tongue: '#E9746A', cloth: '#F7F2E7',
    gold: '#E0A93B', purple: '#7B3466', green: '#4E8A49', brown: '#6A4429', gray: '#C9C2B9', sandal: '#8A5A33',
  };
  const st = `stroke="${L}" stroke-width="${LW}" stroke-linejoin="round" stroke-linecap="round"`;
  const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${st} ${extra}/>`;
  const Ln = (d, w = LW) => `<path d="${d}" fill="none" stroke="${L}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const C = (cx, cy, r, fill) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${st}/>`;
  const El = (cx, cy, rx, ry, fill, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${st}${rot != null ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  // braccia: due tratti sovrapposti, così il contorno resta dello stesso spessore
  const limb = (d, fill, w = 7) => `<path d="${d}" fill="none" stroke="${L}" stroke-width="${w + 2 * LW}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`;

  /* ---------- Pose: braccio sinistro (l) e destro (r), mani, inclinazione della chiave e della testa ---------- */
  const POSE = {
    idle: { l: 'M46 82 Q38 96 38 112', lh: [38, 112], r: 'M74 82 Q88 92 91 106', rh: [91, 106], ra: 0 },
    happy: { l: 'M46 82 Q33 82 30 66', lh: [30, 64], r: 'M74 82 Q88 92 91 106', rh: [91, 106], ra: 0 },
    think: { l: 'M45 84 Q32 94 45 73', lh: [46, 69], r: 'M74 82 Q88 92 91 106', rh: [91, 106], ra: 0, head: 'rotate(-4 60 72)', handFront: true },
    sad: { l: 'M46 82 Q40 98 40 114', lh: [40, 114], r: 'M74 82 Q85 96 87 111', rh: [87, 111], ra: 7, head: 'translate(0 2) rotate(-5 60 72)' },
    cheer: { l: 'M46 82 Q31 72 27 53', lh: [27, 51], r: 'M74 82 Q89 72 93 53', rh: [93, 51], ra: 16 },
  };

  function mouth(m, x, y) {
    if (m === 'happy') return P(`M${x - 7.5} ${y - 1} Q${x} ${y + 9} ${x + 7.5} ${y - 1} Z`, K.mouth) + `<path d="M${x - 4} ${y + 4.4} Q${x} ${y + 2.6} ${x + 4} ${y + 4.4} Q${x} ${y + 7} ${x - 4} ${y + 4.4} Z" fill="${K.tongue}"/>`;
    if (m === 'cheer') return P(`M${x - 9} ${y - 2} Q${x} ${y + 14} ${x + 9} ${y - 2} Z`, K.mouth) + `<ellipse cx="${x}" cy="${y + 6.6}" rx="4.6" ry="2.4" fill="${K.tongue}"/>`;
    if (m === 'sad') return Ln(`M${x - 6} ${y + 3.5} Q${x} ${y - 1.5} ${x + 6} ${y + 3.5}`);
    if (m === 'think') return Ln(`M${x - 4} ${y + 2} Q${x + 0.5} ${y + 0.5} ${x + 5} ${y + 2.5}`);
    return Ln(`M${x - 6} ${y} Q${x} ${y + 4.5} ${x + 6} ${y}`);
  }
  // un volto di profilo; dir -1: il volto anziano a sinistra, +1: il volto giovane a destra
  function face(m, dir) {
    const ex = 60 + dir * 22, y = 42, mx = 60 + dir * 26.5;
    let h = '';
    if (m !== 'sad') h += `<circle cx="${60 + dir * 16}" cy="51" r="3.6" fill="${K.blush}" opacity="${m === 'idle' || m === 'think' ? 0.35 : 0.6}"/>`;
    if (m === 'happy' || m === 'cheer') h += Ln(`M${ex - 4} ${y + 1.5} Q${ex} ${y - 4} ${ex + 4} ${y + 1.5}`);
    else {
      const dx = dir * 1.2 + (m === 'think' ? dir * 0.6 : 0), dy = m === 'think' ? -1.8 : m === 'sad' ? 1 : 0, ry = m === 'sad' ? 3.4 : 4;
      h += `<ellipse cx="${ex + dx}" cy="${y + dy}" rx="3.1" ry="${ry}" fill="${L}"/><circle cx="${ex + dx + dir * 1.1}" cy="${y + dy - 1.4}" r="1.1" fill="#FFFFFF"/>`;
    }
    // sopracciglio: il capo verso il naso è quello «interno»
    const fx = ex + dir * 4.5, bx = ex - dir * 4.5;
    const brow = m === 'sad' ? `M${bx} ${y - 6.5} L${fx} ${y - 9.5}`
      : m === 'think' && dir > 0 ? `M${bx} ${y - 9} Q${ex} ${y - 12.5} ${fx} ${y - 9.5}`
        : m === 'cheer' ? `M${bx} ${y - 9} Q${ex} ${y - 12} ${fx} ${y - 9}`
          : `M${bx} ${y - 7.5} Q${ex} ${y - 9.5} ${fx} ${y - 7.5}`;
    h += Ln(brow, 2.2);
    // una ruga sulla fronte del volto anziano
    if (dir < 0) h += Ln(`M${ex - 2.5} ${y - 13} Q${ex + 1} ${y - 14.2} ${ex + 4.5} ${y - 13}`, 1.6);
    h += mouth(m, mx - dir, 56);
    return h;
  }
  function head(m) {
    // due teste unite per la nuca: i nasi sporgono ai lati, i capelli scendono nel mezzo
    let h = P('M60 19 A31 26 0 0 0 29.58 40 Q19.5 41 20 46 Q20.5 51.5 29.84 51 A31 26 0 0 0 60 71 A31 26 0 0 0 90.16 51 Q99.5 51.5 100 46 Q100.5 41 90.42 40 A31 26 0 0 0 60 19 Z', K.skin);
    // barba del volto anziano
    h += P('M29.8 51 C28.5 60 32 67 40 69.5 C45 70.5 49 68 51 64 C49 58 46 55 42 54.5 C38 55.5 34 54.5 31.6 52.2 Z', K.gray);
    // capelli: grigi dal lato anziano, castani dal lato giovane, fino alla nuca comune
    h += P('M30.5 37 C31 22 44 14 60 14 L60 65 C55 65 52.5 61 52 55 C51.5 46 49.5 38 44 33.5 C39 30.5 34 32 30.5 37 Z', K.gray);
    h += P('M89.5 37 C89 22 76 14 60 14 L60 65 C65 65 67.5 61 68 55 C68.5 46 70.5 38 76 33.5 C81 30.5 86 32 89.5 37 Z', K.brown);
    // orecchie, una per testa
    h += El(50.5, 47, 4, 5.4, K.skin) + Ln('M51.5 44.5 Q49 47 51.2 49.5', 1.8) + El(69.5, 47, 4, 5.4, K.skin) + Ln('M68.5 44.5 Q71 47 68.8 49.5', 1.8);
    // corona d'alloro
    const leaves = [[34, 33, -55], [40, 26.5, -38], [47.5, 22, -20], [55, 19.8, -6], [65, 19.8, 6], [72.5, 22, 20], [80, 26.5, 38], [86, 33, 55]];
    h += leaves.map(([x, y, a]) => El(x, y, 5.2, 2.7, K.green, a)).join('');
    return h + face(m, -1) + face(m, 1);
  }
  // la chiave di Giano, signore delle porte
  function key(x, y, a) {
    return `<g transform="translate(${x} ${y}) rotate(${a})">${P('M-7 -24 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M-3 -24 a3 3 0 1 1 6 0 a3 3 0 1 1 -6 0 Z', K.gold, 'fill-rule="evenodd"')}${P('M-2.4 -17.2 L2.4 -17.2 L2.4 16 L-2.4 16 Z', K.gold)}${P('M2.4 5 L9.5 5 L9.5 9 L6.5 9 L6.5 12 L9.5 12 L9.5 16 L2.4 16 Z', K.gold)}</g>`;
  }
  function body() {
    let h = El(50, 141, 7, 4, K.sandal) + El(70, 141, 7, 4, K.sandal);
    h += P('M45 74 Q35 100 33 136 Q60 143 87 136 Q85 100 75 74 Q60 70 45 74 Z', K.cloth);
    // pieghe della toga e la fascia di porpora (toga praetexta)
    h += Ln('M52 96 Q50 116 48 136', 2) + Ln('M66 104 Q68 120 70 137', 2);
    h += P('M42 81 L49 75.5 L85.5 121 L82.6 129 Z', K.purple);
    return h;
  }
  function figure(mood) {
    const p = POSE[mood] || POSE.idle;
    const hand = (xy) => C(xy[0], xy[1], 5.2, K.skin);
    let h = '<ellipse cx="60" cy="144" rx="30" ry="4" fill="#000000" opacity="0.13"/>';
    h += body();
    h += P('M55.5 64 L64.5 64 L64.5 76 L55.5 76 Z', K.skin);
    h += limb(p.l, K.skin) + limb(p.r, K.skin);
    if (!p.handFront) h += hand(p.lh);
    h += `<g${p.head ? ` transform="${p.head}"` : ''}>${head(mood)}</g>`;
    h += key(p.rh[0], p.rh[1], p.ra) + hand(p.rh);
    if (p.handFront) h += hand(p.lh);
    return h;
  }
  const MOODS = ['idle', 'happy', 'think', 'sad', 'cheer'];
  function svg(mood = 'idle', size = 96) {
    if (!MOODS.includes(mood)) mood = 'idle';
    const bust = size < 64;
    return `<svg class="guide ${mood === 'cheer' ? 'cheer' : 'bob'}" viewBox="${bust ? '15 9 90 90' : '0 0 120 150'}" width="${size}" height="${bust ? size : Math.round(size * 1.25)}" aria-hidden="true" focusable="false"><g class="figure">${figure(mood)}</g></svg>`;
  }
  const api = {
    svg, MOODS, name: 'Giano',
    intro: 'Io sono Giano, il dio delle porte e degli inizi: con un volto guardo il latino, con l’altro l’italiano.',
  };
  root.VERTO_GUIDE = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
