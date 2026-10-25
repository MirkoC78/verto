/* VERTO — controllo delle traduzioni italiane scritte a tastiera.
   Senza servizi esterni il significato non si può giudicare: una somiglianza tra stringhe premia anche «L'agnello vede
   il lupo» al posto di «Il lupo vede l'agnello». Perciò si accetta da sé solo una risposta che coincide con una delle
   traduzioni previste, a meno di maiuscole, punteggiatura, accenti, apostrofi e piccoli errori di battitura dentro una
   parola lunga: mai sulla desinenza, che porta persona, numero e genere, e mai con parole in più, in meno o spostate.
   Ogni altra risposta va al confronto guidato, dove lo studente la giudica con una traccia. */
(function (root) {
  'use strict';
  function normIt(s) {
    return String(s).toLowerCase().replace(/[’`´]/g, "'").normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/'/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function lev(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i), cur = new Array(n + 1);
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      [prev, cur] = [cur, prev];
    }
    return prev[n];
  }
  const sim = (a, b) => (!a && !b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));
  // una parola scritta con un errore di battitura: almeno 5 lettere, stessa desinenza (ultime due lettere), una sola lettera diversa
  function wordOK(a, b) {
    if (a === b) return true;
    if (Math.min(a.length, b.length) < 5 || a.slice(-2) !== b.slice(-2)) return false;
    return lev(a, b) <= 1;
  }
  function sameWords(a, b) {
    const A = a.split(' '), B = b.split(' ');
    return A.length === B.length && A.every((w, i) => wordOK(w, B[i]));
  }
  // esito: { ok, ref, exact }; con ok falso, ref è la traduzione prevista più vicina, da mostrare nel confronto
  function italian(refs, answer) {
    const a = normIt(answer);
    for (const r of refs) if (normIt(r) === a) return { ok: true, ref: r, exact: true };
    for (const r of refs) if (sameWords(a, normIt(r))) return { ok: true, ref: r, exact: false };
    let ref = refs[0], best = -1;
    for (const r of refs) { const v = sim(a, normIt(r)); if (v > best) { best = v; ref = r; } }
    return { ok: false, ref, exact: false, sim: best };
  }
  root.VertoCheck = { normIt, lev, sim, wordOK, italian };
  if (typeof module !== 'undefined') module.exports = root.VertoCheck;
})(typeof window !== 'undefined' ? window : globalThis);
