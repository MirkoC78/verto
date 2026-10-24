/* VERTO — lettura: come si legge una parola latina nella pronuncia scolastica italiana, con l'accento segnato.
   Serve agli esercizi di pronuncia e alla lettura ad alta voce con la voce italiana del dispositivo. */
(function (root) {
  'use strict';
  const E = root.VertoEngine || require('./engine.js');
  const GRAVE = { a: 'à', e: 'è', i: 'ì', o: 'ò', u: 'ù' };
  // parole da non usare negli esercizi di accento: la i iniziale vale come vocale (forme di eō) o l'accento è incerto
  const SKIP = /^(ii|iit|ie|ie|iens)/;
  // trascrive una sillaba con le regole della pronuncia scolastica (o.wrong: errori tipici, per le opzioni sbagliate)
  function readSyl(s, next, o = {}) {
    let t = E.plain(s).toLowerCase();
    if (!o.keepAe) t = t.replace(/ae|oe/g, 'e');
    t = t.replace(/ph/g, o.wrongPh ? 'p' : 'f').replace(/th/g, 't').replace(/rh/g, 'r');
    t = t.replace(/y/g, 'i').replace(/j/g, 'i');
    t = t.replace(/^h/, '').replace(/([aeiou])h/g, '$1');
    t = t.replace(/k/g, 'c');
    t = t.replace(/ch(?=[aou])/g, 'c');
    return t;
  }
  function render(S, stress, o = {}) {
    let out = '';
    S.forEach((x, i) => {
      let t = readSyl(x.s, S[i + 1], o);
      // ti + vocale si legge zi (ma non dopo s, t, x)
      const next = S[i + 1] ? E.plain(S[i + 1].s).toLowerCase() : '';
      if (!o.wrongTi && /ti$/.test(t) && /^[aeiou]/.test(next) && !/[stx]ti$/.test(out.slice(-1) + t)) t = t.replace(/ti$/, 'zi');
      if (i === stress && S.length > 1) t = t.replace(/[aeiou](?!.*[aeiou])|[aeiou]/, (v) => GRAVE[v] || v);
      out += t;
    });
    // c e g dure davanti a e, i (errore tipico): ch, gh
    if (o.hardC) out = out.replace(/c([eièì])/, 'ch$1').replace(/^g([eièì])/, 'gh$1');
    return out;
  }
  // lettura corretta: «Cìcero», «Cèsar», «gràzia», «agrìcola»
  function readIt(q, o = {}) {
    const w = String(q);
    const { S, i } = E.accentSyllable(w, o);
    let r = render(S, i, o);
    // la vocale accentata: se il nucleo era un dittongo ae/oe, l'accento va sulla e
    r = r.replace(/([^aeiouàèìòù])?[ae](?=è)/, (m) => m);
    const first = w.charAt(0);
    return first === first.toUpperCase() && first !== first.toLowerCase() ? r.charAt(0).toUpperCase() + r.slice(1) : r;
  }
  // varianti sbagliate plausibili, per gli esercizi a scelta
  function wrongReadings(q) {
    const w = String(q);
    const { S, i } = E.accentSyllable(w);
    const right = readIt(w);
    const out = new Set();
    const cap = (r) => (/^[A-ZĀĒĪŌŪ]/.test(w) ? r.charAt(0).toUpperCase() + r.slice(1) : r);
    if (S.length >= 3) out.add(cap(render(S, i === S.length - 2 ? S.length - 3 : S.length - 2)));
    if (S.length === 2) out.add(cap(render(S, 1)));
    if (/ae|oe/.test(E.plain(w).toLowerCase())) out.add(cap(render(S, i, { keepAe: true })));
    if (/c[eiy]|cae|coe|^g[ei]/i.test(E.plain(w))) out.add(cap(render(S, i, { hardC: true })));
    if (/ti[aeiou]/i.test(E.plain(w))) out.add(cap(render(S, i, { wrongTi: true })));
    if (/ph/i.test(w)) out.add(cap(render(S, i, { wrongPh: true })));
    if (/^h/i.test(w)) out.add('H' === w[0] ? cap('h' + right.slice(0).toLowerCase()) : 'h' + right);
    out.delete(right);
    return [...out];
  }
  const accentOK = (q) => !SKIP.test(E.plain(q).toLowerCase());
  // sillabe scritte per gli esercizi: «a-grì-co-la» oppure con la sillaba accentata in maiuscolo «a-GRI-co-la»
  function syllabified(q, stress) {
    const { S } = E.accentSyllable(q);
    return S.map((x, k) => (k === stress ? E.plain(x.s).toUpperCase() : E.plain(x.s).toLowerCase())).join('-');
  }
  root.VertoRead = { readIt, wrongReadings, accentOK, syllabified };
  if (typeof module !== 'undefined') module.exports = root.VertoRead;
})(typeof window !== 'undefined' ? window : globalThis);
