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

/* Puntaje por carrera: se apoya en el área (dominante) pero suma la afinidad
   de las respuestas puntuales que apuntan a cada carrera (p.c). Así dos
   personas con la misma área favorita reciben carreras distintas según lo que
   marcaron. */
export function careerScores(answers = {}) {
  const areas = areaScores(answers);
  const areaPct = Object.fromEntries(areas.map((a) => [a.id, a.pct]));
  return CARRERAS.map((c) => {
    const base = areaPct[c.area] || 0;
    let aff = 0;
    for (const p of PREGUNTAS) {
      if (p.c && p.c.includes(c.id) && answers[p.id] != null) aff += answers[p.id];
    }
    return { ...c, areaPct: base, aff, score: base * 100 + aff };
  }).sort((a, b) => b.score - a.score || b.areaPct - a.areaPct);
}

/* Carreras sugeridas, ordenadas por afinidad real con las respuestas. */
export function topCareers(answers = {}, n = 4) {
  const ranked = careerScores(answers);
  const withSignal = ranked.filter((c) => c.score > 0);
  return (withSignal.length ? withSignal : ranked).slice(0, n);
}
