/* VERTO — frasi: tessere, parole con la loro analisi (token), ordine libero controllato, grafia con le quantità.
   Il trattino basso unisce in una sola tessera la preposizione e il suo nome (in_silva).
   Token: { w (come è scritta), uid (lemma), key (analisi scelta), q (con le quantità), tile (indice della tessera) }. */
(function (root) {
  'use strict';
  const E = root.VertoEngine || require('./engine.js');
  const LETTERS = /[^A-Za-zÀ-ÿāēīōūĀĒĪŌŪ]/g;
  const tiles = (la) => la.split(/\s+/).map((t) => t.replace(/[.,;:!?«»"“”]/g, '')).filter(Boolean);
  const words = (la) => la.replace(/_/g, ' ').split(/\s+/).map((w) => w.replace(LETTERS, '')).filter(Boolean);
  const wordCount = (la) => words(la).length;

  /* ---------- Analisi delle frasi della banca ---------- */
  // preposizioni e caso retto: dentro la tessera tutte le parole prendono il caso della preposizione
  const PREP_CASE = { a: ['abl'], ab: ['abl'], e: ['abl'], ex: ['abl'], de: ['abl'], cum: ['abl'], sine: ['abl'], pro: ['abl'], prae: ['abl'], in: ['abl', 'acc'], sub: ['abl', 'acc'], ad: ['acc'], per: ['acc'], post: ['acc'], ante: ['acc'], apud: ['acc'], propter: ['acc'], ob: ['acc'], contra: ['acc'], inter: ['acc'], trans: ['acc'], circum: ['acc'], prope: ['acc'], praeter: ['acc'] };
  const CASE_PREF = ['nom', 'acc', 'gen', 'dat', 'abl', 'voc', 'loc'];
  const caseOf = (a) => { const m = a.key.match(/^(?:n|a:\w+|p|v:part:\w+):(\w+):/); return m ? m[1] : null; };
  function rank(a) {
    const k = a.key;
    if (k === 'i') return 0;
    const c = caseOf(a);
    let r = c ? CASE_PREF.indexOf(c) : 0;
    if (/^v:/.test(k)) {
      r = 0;
      if (/^v:part/.test(k)) r += 20;
      if (/^v:cong/.test(k)) r += 5;
      if (/^v:imp/.test(k)) r += 8;
      if (/:(perf|ppf|futant):/.test(k)) r += 3;
      if (/:fut:/.test(k)) r += 2;
      if (/^v:inf/.test(k)) r += 1;
    }
    if (/^a:(comp|sup)/.test(k)) r += 1;
    return r;
  }
  // hints: «parola=uid» sceglie il lemma, «parola=@regex» l'analisi (es. amicitia=@abl, advenit=@perf)
  function parseHints(h) {
    const o = {};
    String(h || '').split(/\s+/).filter(Boolean).forEach((x) => { const [w, v] = x.split('='); (o[E.norm(w)] = o[E.norm(w)] || []).push(v); });
    return o;
  }
  function resolveBank(la, tags, hints) {
    const T = tags instanceof Set ? tags : new Set(tags);
    const H = parseHints(hints);
    const interrog = /\?\s*$/.test(la);
    const out = [];
    tiles(la).forEach((tile, ti) => {
      const ws = tile.split('_').map((w) => w.replace(LETTERS, '')).filter(Boolean);
      let prep = null;
      if (ws.length > 1) for (const w of ws) { const n = E.norm(w); if (PREP_CASE[n] && E.analyze(w).some((a) => a.e.k === 'i' && a.req.every((t) => T.has(t)))) { prep = n; break; } }
      ws.forEach((w, wi) => {
        const n = E.norm(w);
        let an = E.analyze(w).filter((a) => a.req.every((t) => T.has(t)));
        if (!an.length) { out.push(null); return; }
        const hs = H[n] || [];
        for (const h of hs) {
          if (h[0] === '@') { const re = new RegExp(h.slice(1)); const f = an.filter((a) => re.test(a.key)); if (f.length) an = f; }
          else { const f = an.filter((a) => a.e.uid === h); if (f.length) an = f; }
        }
        // lemmi omografi: cum preposizione dentro la tessera, congiunzione da sola; quis nelle domande; il nome prima dell'aggettivo
        let uids = [...new Set(an.map((a) => a.e.uid))];
        if (uids.length > 1) {
          let keep = null;
          if (n === 'cum') keep = ws.length > 1 && wi === 0 ? 'cum' : 'cum@s_cum';
          else if (uids.includes('qui') && uids.includes('quis')) keep = interrog && out.filter(Boolean).every((t) => t.tile === ti) ? 'quis' : 'qui';
          else { const noun = an.find((a) => a.e.k === 'n'); if (noun) keep = noun.e.uid; }
          if (keep && uids.includes(keep)) { an = an.filter((a) => a.e.uid === keep); uids = [keep]; }
          else { an = an.filter((a) => a.e.uid === uids[0]); uids = [uids[0]]; }
        }
        // caso retto dalla preposizione
        if (prep && n !== prep) { const f = an.filter((a) => PREP_CASE[prep].includes(caseOf(a))); if (f.length) an = f; }
        an = an.slice().sort((a, b) => rank(a) - rank(b));
        const a = an[0];
        out.push({ w, uid: a.e.uid, key: a.key, q: a.q || w, tile: ti, alts: [...new Set(an.map((x) => x.key))] });
      });
    });
    return out;
  }

  /* ---------- Grafia ---------- */
  // frase da mostrare: con le quantità (q) o senza; mantiene maiuscole, punteggiatura e spazi dell'originale
  function render(la, tokens, quant) {
    if (!quant || !tokens) return la.replace(/_/g, ' ');
    let k = 0;
    return la.replace(/_/g, ' ').replace(/[A-Za-zÀ-ÿāēīōūĀĒĪŌŪ]+/g, (w) => {
      const t = tokens[k++];
      if (!t || !t.q) return w;
      const q = t.q;
      return /^[A-ZĀĒĪŌŪ]/.test(w) ? q.charAt(0).toUpperCase() + q.slice(1) : q;
    });
  }

  /* ---------- Ordine libero controllato ---------- */
  // Nella retroversione l'ordine delle parole è libero dentro ogni proposizione, con tre vincoli:
  // i connettivi (congiunzioni, relativi, interrogativi) restano al loro posto, e così i segni d'interpunzione
  // che separano le proposizioni; «non» resta davanti alla parola che nega.
  const ANCHOR = new Set(['et', 'sed', 'atque', 'ac', 'aut', 'vel', 'nec', 'neque', 'nam', 'enim', 'autem', 'itaque', 'igitur', 'tamen', 'ergo', 'dum', 'postquam', 'quia', 'quoniam', 'si', 'nisi', 'quamquam', 'antequam', 'ut', 'ne', 'quam', 'cur', 'quando', 'ecce', 'o']);
  const RELATIVE = /^(qui|quae|quod|cuius|cui|quem|quam|quo|qua|quorum|quarum|quibus|quos|quas|quis|quid|ubi)$/;
  // ref: frase latina di riferimento; ans: elenco delle tessere date (stringhe)
  function orderOK(ref, ans) {
    const R = tiles(ref);
    const A = ans.map((t) => t.replace(/[.,;:!?]/g, ''));
    const key = (t) => E.norm(t).replace(/\s+/g, '_');
    if (R.length !== A.length) return false;
    const rs = R.map(key).slice().sort().join(' '), as = A.map(key).slice().sort().join(' ');
    if (rs !== as) return false;
    // segmenti: tra due ancore, o tra due segni di interpunzione nel riferimento
    const raw = ref.split(/\s+/).filter(Boolean);
    const seg = [];
    let s = 0;
    raw.forEach((t, i) => {
      const k = key(t.replace(/[.,;:!?«»"]/g, ''));
      if (ANCHOR.has(k) || (RELATIVE.test(k) && i > 0 && /[,;:]$/.test(raw[i - 1]))) { s++; seg.push({ k, s, anchor: true }); s++; return; }
      seg.push({ k, s });
      if (/[,;:]$/.test(t)) s++;
    });
    // la risposta deve rispettare la sequenza dei segmenti: stesse ancore negli stessi punti, stesse parole in ogni segmento
    let i = 0;
    while (i < seg.length) {
      const cur = seg[i].s;
      let j = i;
      while (j < seg.length && seg[j].s === cur) j++;
      const want = seg.slice(i, j).map((x) => x.k).sort().join(' ');
      const got = A.slice(i, j).map(key).sort().join(' ');
      if (want !== got) return false;
      if (seg[i].anchor && key(A[i]) !== seg[i].k) return false;
      i = j;
    }
    // «non» davanti alla stessa parola
    for (let k = 0; k < R.length - 1; k++) if (key(R[k]) === 'non') {
      const next = key(R[k + 1]);
      const pos = A.findIndex((t, x) => key(t) === 'non' && key(A[x + 1] || '') === next);
      if (pos < 0) return false;
    }
    return true;
  }
  // risposta scritta: le parole vengono raggruppate nelle tessere del riferimento (in silva → in_silva)
  function typedTiles(ref, typed) {
    const R = tiles(ref).map((t) => t.split('_').map((w) => E.norm(w).replace(/v/g, 'u')));
    const W = String(typed).replace(/[.,;:!?«»"“”]/g, ' ').split(/\s+/).filter(Boolean).map((w) => E.norm(w).replace(/v/g, 'u'));
    const used = new Array(R.length).fill(false);
    const order = [];
    let found = null;
    (function dfs(p) {
      if (found) return;
      if (p === W.length) { if (used.every(Boolean)) found = order.slice(); return; }
      for (let r = 0; r < R.length; r++) {
        if (used[r]) continue;
        const t = R[r];
        if (t.every((w, k) => W[p + k] === w)) { used[r] = true; order.push(r); dfs(p + t.length); order.pop(); used[r] = false; if (found) return; }
      }
    })(0);
    return found ? found.map((r) => tiles(ref)[r]) : null;
  }

  root.VertoSentence = { tiles, words, wordCount, resolveBank, render, orderOK, typedTiles, caseOf, PREP_CASE };
  if (typeof module !== 'undefined') module.exports = root.VertoSentence;
})(typeof window !== 'undefined' ? window : globalThis);
