import { AREAS, PREGUNTAS, CARRERAS } from './data.js';

/* Puntaje (0-100) por área a partir de las respuestas del test. */
export function areaScores(answers = {}) {
  return AREAS.map((ar) => {
    const qs = PREGUNTAS.filter((p) => p.area === ar.id);
    let sum = 0;
    qs.forEach((p) => { if (answers[p.id] != null) sum += answers[p.id]; });
    return { ...ar, pct: Math.round((sum / (qs.length * 2)) * 100) };
  }).sort((a, b) => b.pct - a.pct);
}

/* Carreras sugeridas priorizando las áreas con mayor afinidad. */
export function topCareers(answers = {}, n = 4) {
  const ranked = areaScores(answers).filter((a) => a.pct > 0);
  const out = [];
  const order = ranked.length ? ranked : areaScores(answers);
  let i = 0;
  while (out.length < n && i < order.length * 4) {
    const ar = order[i % order.length];
    const pool = CARRERAS.filter((c) => c.area === ar.id && !out.includes(c));
    if (pool.length) out.push(pool[Math.floor(i / order.length) % pool.length]);
    i++;
  }
  return out.slice(0, n);
}
