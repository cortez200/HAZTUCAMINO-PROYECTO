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

/* Puntaje por carrera: 60% el área dominante + 40% la afinidad de las
   respuestas puntuales (p.c), normalizada por cuántas preguntas apuntan a esa
   carrera. Así todas las carreras compiten en igualdad y dos personas con la
   misma área favorita reciben carreras distintas según lo que marcaron. */
export function careerScores(answers = {}) {
  const areas = areaScores(answers);
  const areaPct = Object.fromEntries(areas.map((a) => [a.id, a.pct]));
  return CARRERAS.map((c) => {
    const base = areaPct[c.area] || 0;
    let sum = 0;
    let count = 0;
    for (const p of PREGUNTAS) {
      if (p.c && p.c.includes(c.id)) {
        count += 1;
        if (answers[p.id] != null) sum += answers[p.id];
      }
    }
    const affPct = count ? (sum / (count * 2)) * 100 : 0;
    const score = Math.round(base * 0.6 + affPct * 0.4);
    return { ...c, areaPct: base, aff: Math.round(affPct), score };
  }).sort((a, b) => b.score - a.score || b.areaPct - a.areaPct);
}

/* Carreras sugeridas, ordenadas por afinidad real con las respuestas. */
export function topCareers(answers = {}, n = 4) {
  const ranked = careerScores(answers);
  const withSignal = ranked.filter((c) => c.score > 0);
  return (withSignal.length ? withSignal : ranked).slice(0, n);
}
