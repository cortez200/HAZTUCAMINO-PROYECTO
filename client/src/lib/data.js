// Datos del dominio "Haz Tu Camino".
// Ya no están embebidos en el cliente: se cargan desde la API (/api/catalog)
// y se hidratan aquí antes de renderizar la app. Ver src/main.jsx.

export const UNIVERSIDADES = [];
export const AREAS = [];
export const CARRERAS = [];
export const PREGUNTAS = [];
export const OPCIONES = [];
export const SIMS = [];
export const NIVELES = [];
export const FREE_SIMS = [];
export const PLANS = [];
let _freeTestLimit = 2;

/* Reemplaza el contenido de un arreglo conservando su identidad
   (los módulos importan estas referencias como live bindings). */
function fill(target, source) {
  target.length = 0;
  if (Array.isArray(source)) target.push(...source);
}

/** Carga en memoria el catálogo devuelto por GET /api/catalog. */
export function hydrateCatalog(catalog = {}) {
  fill(UNIVERSIDADES, catalog.universities);
  fill(AREAS, catalog.areas);
  fill(CARRERAS, catalog.careers);
  fill(PREGUNTAS, catalog.preguntas);
  fill(OPCIONES, catalog.opciones);
  fill(SIMS, catalog.simulations);
  fill(NIVELES, catalog.niveles);
  fill(FREE_SIMS, catalog.freeSims);
  fill(PLANS, catalog.plans);
  if (Number.isFinite(catalog.freeTestLimit)) _freeTestLimit = catalog.freeTestLimit;
}

export const area = (id) => AREAS.find((a) => a.id === id);
export const carrera = (id) => CARRERAS.find((c) => c.id === id);
export const universidad = (id) => UNIVERSIDADES.find((u) => u.id === id);
export const simDeArea = (areaId) => SIMS.find((s) => s.area === areaId);
export const isFreeSim = (id) => FREE_SIMS.includes(id);
export const planById = (id) => PLANS.find((p) => p.id === id);
export const isPremium = (account) => account?.plan === 'premium' || account?.plan === 'super';
export const planLabel = (plan) => planById(plan)?.nombre || 'Básico';
export const freeTestLimit = () => _freeTestLimit;
