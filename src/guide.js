/* VERTO — la guida: un dio romano disegnato in SVG, a figura intera in stile cartone con contorno uniforme.
   Cinque espressioni: idle (normale), happy (contenta), think (pensierosa), sad (triste), cheer (esultante).
   Sotto i 64 px si disegna solo il busto. Tre proposte (Giano, Minerva, Mercurio): si sceglie con #guide=… */
(function (root) {
  'use strict';
  const L = '#2B211D', LW = 2.6;
  const K = {
    skin: '#F3C9A1', blush: '#EE8F7E', mouth: '#8A2B2B', tongue: '#E9746A', cloth: '#F7F2E7', clothD: '#E3D9C6',
    gold: '#E0A93B', bronze: '#C98A36', bronzeL: '#E8C27A', red: '#B83A2E', purple: '#7B3466', blue: '#3E62B4',
    green: '#4E8A49', brown: '#6A4429', gray: '#C9C2B9', dark: '#3C2A20', ochre: '#B98A44', ochreD: '#9C7134', sandal: '#8A5A33', white: '#FFFFFF',
  };
  const st = `stroke="${L}" stroke-width="${LW}" stroke-linejoin="round" stroke-linecap="round"`;
  const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${st} ${extra}/>`;
  const Ln = (d, w = LW) => `<path d="${d}" fill="none" stroke="${L}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const C = (cx, cy, r, fill) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${st}/>`;
  const El = (cx, cy, rx, ry, fill, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${st}${rot != null ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  // arti e serpenti: due tratti sovrapposti, così il contorno resta dello stesso spessore
  const limb = (d, fill, w = 7) => `<path d="${d}" fill="none" stroke="${L}" stroke-width="${w + 2 * LW}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`;

  /* ---------- Pose: braccio sinistro (l), destro (r), mani, inclinazione dell'attributo e della testa ---------- */
  const POSE = {
    idle: { l: 'M46 82 Q38 96 38 112', lh: [38, 112], r: 'M74 82 Q88 92 91 106', rh: [91, 106], ra: 0 },
    happy: { l: 'M46 82 Q33 82 30 66', lh: [30, 64], r: 'M74 82 Q88 92 91 106', rh: [91, 106], ra: 0 },
    think: { l: 'M45 84 Q32 94 45 73', lh: [46, 69], r: 'M74 82 Q88 92 91 106', rh: [91, 106], ra: 0, head: 'rotate(-4 60 72)', handFront: true },
    sad: { l: 'M46 82 Q40 98 40 114', lh: [40, 114], r: 'M74 82 Q85 96 87 111', rh: [87, 111], ra: 7, head: 'translate(0 2) rotate(-5 60 72)' },
    cheer: { l: 'M46 82 Q31 72 27 53', lh: [27, 51], r: 'M74 82 Q89 72 93 53', rh: [93, 51], ra: 16, raised: true },
  };

  /* ---------- Volto di fronte (Minerva, Mercurio) ---------- */
  function faceFront(m) {
    let h = '';
    const y = 46;
    // guance
    if (m !== 'sad') h += `<circle cx="44" cy="55" r="3.8" fill="${K.blush}" opacity="${m === 'idle' || m === 'think' ? 0.35 : 0.6}"/><circle cx="76" cy="55" r="3.8" fill="${K.blush}" opacity="${m === 'idle' || m === 'think' ? 0.35 : 0.6}"/>`;
    // occhi
    if (m === 'happy' || m === 'cheer') h += [50, 70].map((x) => Ln(`M${x - 4.5} ${y + 1.5} Q${x} ${y - 4.5} ${x + 4.5} ${y + 1.5}`)).join('');
    else {
      const dx = m === 'think' ? 1.6 : 0, dy = m === 'think' ? -1.8 : m === 'sad' ? 1 : 0, ry = m === 'sad' ? 3.5 : 4.2;
      h += [50, 70].map((x) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="3.3" ry="${ry}" fill="${L}"/><circle cx="${x + dx + 1.1}" cy="${y + dy - 1.5}" r="1.2" fill="#FFFFFF"/>`).join('');
    }
    // sopracciglia
    const B = { sad: ['M44 40 L53 37', 'M67 37 L76 40'], think: ['M44 38.5 Q49 37 54 38.5', 'M66 35.5 Q71 32.5 76 35.5'], cheer: ['M44 36.5 Q49 33 54 36.5', 'M66 36.5 Q71 33 76 36.5'] }[m] || ['M45 38.5 Q49.5 36.5 54 38.5', 'M66 38.5 Q70.5 36.5 75 38.5'];
    h += B.map((d) => Ln(d, 2.2)).join('');
    // naso
    h += Ln('M59 49.5 Q62 52 59.5 54', 2);
    // bocca
    h += mouth(m, 60, 57);
    return h;
  }
  function mouth(m, x, y) {
    if (m === 'happy') return P(`M${x - 7.5} ${y - 1} Q${x} ${y + 9} ${x + 7.5} ${y - 1} Z`, K.mouth) + `<path d="M${x - 4} ${y + 4.4} Q${x} ${y + 2.6} ${x + 4} ${y + 4.4} Q${x} ${y + 7} ${x - 4} ${y + 4.4} Z" fill="${K.tongue}"/>`;
    if (m === 'cheer') return P(`M${x - 9} ${y - 2} Q${x} ${y + 14} ${x + 9} ${y - 2} Z`, K.mouth) + `<ellipse cx="${x}" cy="${y + 6.6}" rx="4.6" ry="2.4" fill="${K.tongue}"/>`;
    if (m === 'sad') return Ln(`M${x - 6} ${y + 3.5} Q${x} ${y - 1.5} ${x + 6} ${y + 3.5}`);
    if (m === 'think') return Ln(`M${x - 4} ${y + 2} Q${x + 0.5} ${y + 0.5} ${x + 5} ${y + 2.5}`);
    return Ln(`M${x - 6} ${y} Q${x} ${y + 4.5} ${x + 6} ${y}`);
  }

  /* ---------- Giano: due volti di profilo, il vecchio (il latino) guarda a sinistra, il giovane (l'italiano) a destra ---------- */
  function faceProfile(m, dir) {
    // dir -1: volto a sinistra; +1: volto a destra
    const ex = 60 + dir * 22, y = 42, mx = 60 + dir * 26.5;
    let h = '';
    if (m !== 'sad') h += `<circle cx="${60 + dir * 16}" cy="51" r="3.6" fill="${K.blush}" opacity="${m === 'idle' || m === 'think' ? 0.35 : 0.6}"/>`;
    if (m === 'happy' || m === 'cheer') h += Ln(`M${ex - 4} ${y + 1.5} Q${ex} ${y - 4} ${ex + 4} ${y + 1.5}`);
    else {
      const dx = dir * 1.2 + (m === 'think' ? dir * 0.6 : 0), dy = m === 'think' ? -1.8 : m === 'sad' ? 1 : 0, ry = m === 'sad' ? 3.4 : 4;
      h += `<ellipse cx="${ex + dx}" cy="${y + dy}" rx="3.1" ry="${ry}" fill="${L}"/><circle cx="${ex + dx + dir * 1.1}" cy="${y + dy - 1.4}" r="1.1" fill="#FFFFFF"/>`;
    }
    // sopracciglio: il capo del lato del naso è quello «interno»
    const fx = ex + dir * 4.5, bx = ex - dir * 4.5;
    const brow = m === 'sad' ? `M${bx} ${y - 6.5} L${fx} ${y - 9.5}` : m === 'think' && dir > 0 ? `M${bx} ${y - 9} Q${ex} ${y - 12.5} ${fx} ${y - 9.5}` : m === 'cheer' ? `M${bx} ${y - 9} Q${ex} ${y - 12} ${fx} ${y - 9}` : `M${bx} ${y - 7.5} Q${ex} ${y - 9.5} ${fx} ${y - 7.5}`;
    h += Ln(brow, 2.2);
    h += mouth(m, mx - dir, 56);
    return h;
  }
  function headJanus(m) {
    // due teste unite per la nuca: i nasi sporgono ai lati, i capelli scendono nel mezzo
    const T = 'M60 19 A31 26 0 0 0 29.58 40 Q19.5 41 20 46 Q20.5 51.5 29.84 51 A31 26 0 0 0 60 71 A31 26 0 0 0 90.16 51 Q99.5 51.5 100 46 Q100.5 41 90.42 40 A31 26 0 0 0 60 19 Z';
    let h = P(T, K.skin);
    // barba del volto antico
    h += P('M29.8 51 C28.5 60 32 67 40 69.5 C45 70.5 49 68 51 64 C49 58 46 55 42 54.5 C38 55.5 34 54.5 31.6 52.2 Z', K.gray);
    // capelli: grigi dal lato antico, castani dal lato giovane, fino alla nuca comune
    h += P('M30.5 37 C31 22 44 14 60 14 L60 65 C55 65 52.5 61 52 55 C51.5 46 49.5 38 44 33.5 C39 30.5 34 32 30.5 37 Z', K.gray);
    h += P('M89.5 37 C89 22 76 14 60 14 L60 65 C65 65 67.5 61 68 55 C68.5 46 70.5 38 76 33.5 C81 30.5 86 32 89.5 37 Z', K.brown);
    // orecchie, una per testa
    h += El(50.5, 47, 4, 5.4, K.skin) + Ln('M51.5 44.5 Q49 47 51.2 49.5', 1.8) + El(69.5, 47, 4, 5.4, K.skin) + Ln('M68.5 44.5 Q71 47 68.8 49.5', 1.8);
    // corona d'alloro
    const leaves = [[34, 33, -55], [40, 26.5, -38], [47.5, 22, -20], [55, 19.8, -6], [65, 19.8, 6], [72.5, 22, 20], [80, 26.5, 38], [86, 33, 55]];
    h += leaves.map(([x, y, a]) => El(x, y, 5.2, 2.7, K.green, a)).join('');
    h += faceProfile(m, -1) + faceProfile(m, 1);
    return h;
  }
  function key(o) {
    // la chiave di Giano, signore delle porte
    return `<g transform="translate(${o.x} ${o.y}) rotate(${o.a})">${P('M-7 -24 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M-3 -24 a3 3 0 1 1 6 0 a3 3 0 1 1 -6 0 Z', K.gold, 'fill-rule="evenodd"')}${P('M-2.4 -17.2 L2.4 -17.2 L2.4 16 L-2.4 16 Z', K.gold)}${P('M2.4 5 L9.5 5 L9.5 9 L6.5 9 L6.5 12 L9.5 12 L9.5 16 L2.4 16 Z', K.gold)}</g>`;
  }
  function bodyJanus() {
    let h = El(50, 141, 7, 4, K.sandal) + El(70, 141, 7, 4, K.sandal);
    h += P('M45 74 Q35 100 33 136 Q60 143 87 136 Q85 100 75 74 Q60 70 45 74 Z', K.cloth);
    // pieghe della toga e la fascia di porpora (toga praetexta)
    h += Ln('M52 96 Q50 116 48 136', 2) + Ln('M66 104 Q68 120 70 137', 2);
    h += P('M42 81 L49 75.5 L85.5 121 L82.6 129 Z', K.purple);
    return h;
  }

  /* ---------- Minerva: elmo corinzio sollevato con il cimiero, egida, lancia, scudo con il ramo d'ulivo ---------- */
  function headMinerva(m) {
    let h = P('M35 36 Q25 60 31 80 L45 77 Q40 60 42 44 Z', K.brown) + P('M85 36 Q95 60 89 80 L75 77 Q80 60 78 44 Z', K.brown);
    h += C(60, 44, 26, K.skin);
    h += P('M35 33 Q41 41 48 34 Q54 40 60 34 Q66 40 72 34 Q79 41 85 33 L85 30 L35 30 Z', K.brown);
    // cimiero
    h += P('M43 16 C43 0.5 77 0.5 77 16 Z', K.red) + Ln('M51 6.5 L51 13', 1.8) + Ln('M60 4.5 L60 13', 1.8) + Ln('M69 6.5 L69 13', 1.8);
    // elmo
    h += P('M33 33 C33 18 45 12 60 12 C75 12 87 18 87 33 C78 29 42 29 33 33 Z', K.bronze);
    h += P('M44.5 23 Q50 17.5 55.5 23 Q50 26 44.5 23 Z', L) + P('M64.5 23 Q70 17.5 75.5 23 Q70 26 64.5 23 Z', L);
    h += P('M58.4 17 L61.6 17 L61.6 28.5 L58.4 28.5 Z', K.bronzeL);
    return h + faceFront(m);
  }
  function spear(o) {
    const len = o.raised ? [-46, 40] : [-78, 36];
    return `<g transform="translate(${o.x} ${o.y}) rotate(${o.a})">${P(`M-2 ${len[0]} L2 ${len[0]} L2 ${len[1]} L-2 ${len[1]} Z`, K.sandal)}${P(`M0 ${len[0] - 15} Q6 ${len[0] - 5} 0 ${len[0] + 1} Q-6 ${len[0] - 5} 0 ${len[0] - 15} Z`, K.bronzeL)}</g>`;
  }
  function bodyMinerva() {
    // scudo appoggiato a terra, dietro la figura
    let h = C(27, 121, 17, K.bronze) + C(27, 121, 11.5, K.bronzeL);
    h += Ln('M20 128 Q27 121 33 112', 2.2) + El(22.5, 121.5, 3.4, 1.8, K.green, -40) + El(28, 116.5, 3.4, 1.8, K.green, 30) + El(30.5, 121.5, 3.4, 1.8, K.green, -20);
    h += El(50, 141, 7, 4, K.sandal) + El(70, 141, 7, 4, K.sandal);
    h += P('M45 74 Q35 100 33 136 Q60 143 87 136 Q85 100 75 74 Q60 70 45 74 Z', K.blue);
    h += Ln('M53 108 Q51 122 49 137', 2) + Ln('M67 108 Q69 122 71 137', 2);
    h += P('M37.2 99 Q60 105 82.8 99 L83.5 104.5 Q60 110.5 36.5 104.5 Z', K.gold);
    // egida
    h += P('M41 76 Q60 69 79 76 L81 86 Q76.5 91 72.5 86.5 Q68.5 93 64.5 87.5 Q60 94 55.5 87.5 Q51.5 93 47.5 86.5 Q43.5 91 39 86 Z', K.gold);
    h += C(60, 81.5, 4.6, K.red);
    return h;
  }

  /* ---------- Mercurio: petaso alato, clamide, caduceo, sandali alati ---------- */
  function headMercurio(m) {
    let h = P('M36 30 Q29 40 35 50 Q38 42 41 34 Z', K.dark) + P('M84 30 Q91 40 85 50 Q82 42 79 34 Z', K.dark);
    h += C(60, 44, 26, K.skin);
    h += P('M37 30 Q43 37 49 31 Q55 37 60 31 Q65 37 71 31 Q77 37 83 30 L83 28 L37 28 Z', K.dark);
    // ali del petaso
    h += P('M45 17 C37 8 29 7 24 9.5 C28 12.5 30 14.5 33.5 16 C29.5 17 27.5 19 25.5 21.5 C32 22.5 39 21.5 45 21 Z', K.white);
    h += P('M75 17 C83 8 91 7 96 9.5 C92 12.5 90 14.5 86.5 16 C90.5 17 92.5 19 94.5 21.5 C88 22.5 81 21.5 75 21 Z', K.white);
    h += P('M43 25 C44 9 52 4 60 4 C68 4 76 9 77 25 Z', K.ochre);
    h += El(60, 26, 33, 6.5, K.ochreD);
    return h + faceFront(m);
  }
  function caduceus(o) {
    const top = o.raised ? -40 : -46, bot = o.raised ? 34 : 30;
    const snake = (s) => limb(`M0 ${bot - 10} C${-10 * s} ${bot - 18} ${-10 * s} ${bot - 30} 0 ${bot - 38} C${8 * s} ${bot - 44} ${8 * s} ${bot - 54} ${3 * s} ${bot - 58}`, K.green, 2.4) + C(3 * s, bot - 59, 2.6, K.green);
    return `<g transform="translate(${o.x} ${o.y}) rotate(${o.a})">${P(`M-2 ${top} L2 ${top} L2 ${bot} L-2 ${bot} Z`, K.gold)}${snake(1)}${snake(-1)}${P(`M-2 ${top + 4} C-8 ${top - 2} -14 ${top - 2} -17 ${top} C-13 ${top + 3} -8 ${top + 5} -2 ${top + 7} Z`, K.white)}${P(`M2 ${top + 4} C8 ${top - 2} 14 ${top - 2} 17 ${top} C13 ${top + 3} 8 ${top + 5} 2 ${top + 7} Z`, K.white)}${C(0, top - 2, 3.4, K.gold)}</g>`;
  }
  function bodyMercurio() {
    // clamide dietro le spalle
    let h = P('M70 76 Q93 84 93 121 L79 118 Z', K.red);
    h += limb('M52 118 L52 137', K.skin) + limb('M68 118 L68 137', K.skin);
    h += El(51, 141, 7, 4, K.sandal) + El(69, 141, 7, 4, K.sandal);
    h += P('M44.5 137 C40 131 36 131 34 132 C37 135 39 137 44.5 140 Z', K.white) + P('M75.5 137 C80 131 84 131 86 132 C83 135 81 137 75.5 140 Z', K.white);
    h += P('M45 74 Q37 96 36 122 Q60 128 84 122 Q83 96 75 74 Q60 70 45 74 Z', K.cloth);
    h += Ln('M54 102 Q53 112 52 123', 2) + Ln('M66 102 Q67 112 68 123', 2);
    h += P('M41.5 80 Q58 98 77 80 L74 75.5 Q58 87 46 75.5 Z', K.red);
    h += C(75, 79, 3.3, K.gold);
    return h;
  }

  /* ---------- Composizione ---------- */
  const CHARS = {
    giano: {
      name: 'Giano', head: headJanus, body: bodyJanus, attr: key, attrDy: 0, bust: '15 9 90 90',
      intro: 'Io sono Giano, il dio delle porte e degli inizi: con un volto guardo il latino, con l’altro l’italiano.',
      about: 'Il dio bifronte delle porte e dei passaggi: un volto anziano guarda il latino, uno giovane l’italiano. Tiene la chiave e porta la corona d’alloro.',
    },
    minerva: {
      name: 'Minerva', head: headMinerva, body: bodyMinerva, attr: spear, bust: '16 0 88 88',
      intro: 'Io sono Minerva, dea della sapienza e protettrice di chi studia: ti accompagno una lezione dopo l’altra.',
      about: 'La dea della sapienza e delle scuole: elmo corinzio sollevato con il cimiero, egida dorata, lancia e scudo con il ramo d’ulivo (niente civetta).',
    },
    mercurio: {
      name: 'Mercurio', head: headMercurio, body: bodyMercurio, attr: caduceus, bust: '14 0 92 92',
      intro: 'Io sono Mercurio, il messaggero degli dèi: porto le parole da una lingua all’altra.',
      about: 'Il messaggero e l’interprete degli dèi: petaso alato, clamide rossa, caduceo e sandali alati. È la versione romana di Ermes, la guida di Hermeneus.',
    },
  };
  let cur = 'giano';
  function figure(id, mood) {
    const ch = CHARS[id], p = POSE[mood] || POSE.idle;
    const attr = ch.attr({ x: p.rh[0], y: p.rh[1], a: p.ra, raised: !!p.raised });
    let h = `<ellipse cx="60" cy="144" rx="30" ry="4" fill="#000000" opacity="0.13"/>`;
    h += ch.body();
    h += P('M55.5 64 L64.5 64 L64.5 76 L55.5 76 Z', K.skin);
    h += limb(p.l, K.skin) + limb(p.r, K.skin);
    if (!p.handFront) h += C(p.lh[0], p.lh[1], 5.2, K.skin);
    h += `<g${p.head ? ` transform="${p.head}"` : ''}>${ch.head(mood)}</g>`;
    h += attr + C(p.rh[0], p.rh[1], 5.2, K.skin);
    if (p.handFront) h += C(p.lh[0], p.lh[1], 5.2, K.skin);
    return h;
  }
  const MOODS = ['idle', 'happy', 'think', 'sad', 'cheer'];
  function svg(mood = 'idle', size = 96, id = cur) {
    if (!MOODS.includes(mood)) mood = 'idle';
    const ch = CHARS[id] || CHARS.giano;
    const bust = size < 64;
    const vb = bust ? ch.bust : '0 0 120 150';
    const h = bust ? size : Math.round(size * 1.25);
    return `<svg class="guide ${mood === 'cheer' ? 'cheer' : 'bob'}" viewBox="${vb}" width="${size}" height="${h}" aria-hidden="true" focusable="false"><g class="figure">${figure(id, mood)}</g></svg>`;
  }
  function use(id) { if (CHARS[id]) { cur = id; api.name = CHARS[id].name; api.intro = CHARS[id].intro; } }
  const api = { svg, use, MOODS, CHARS, name: CHARS.giano.name, intro: CHARS.giano.intro };
  try { const m = root.location && root.location.hash.match(/guide=(\w+)/); if (m) use(m[1]); } catch (e) { /* nessuna anteprima */ }
  root.VERTO_GUIDE = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
