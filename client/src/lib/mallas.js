/* Generador determinista de mallas curriculares por carrera + universidad.
   Las mallas son datos de ejemplo realistas (no oficiales). */

const GENERAL = [
  'Matemática I', 'Comunicación Oral y Escrita', 'Pensamiento Crítico y Lógica',
  'Introducción a la Vida Universitaria', 'Matemática II', 'Estadística Descriptiva',
  'Química General', 'Biología General', 'Física General', 'Ética y Ciudadanía',
  'Metodología de la Investigación', 'Inglés Técnico'
];

const AREA_COURSES = {
  salud: ['Anatomía Humana', 'Fisiología Humana', 'Histología', 'Bioquímica', 'Microbiología', 'Farmacología', 'Semiología', 'Patología', 'Epidemiología', 'Salud Pública', 'Nutrición y Metabolismo', 'Genética Médica', 'Inmunología', 'Parasitología', 'Fisiopatología', 'Cuidado del Paciente', 'Primeros Auxilios', 'Ética Médica', 'Investigación Clínica', 'Psicología de la Salud', 'Gestión en Salud', 'Internado Clínico', 'Rotación por Especialidades', 'Proyecto de Investigación'],
  tecnologia: ['Álgebra Lineal', 'Cálculo Diferencial', 'Cálculo Integral', 'Física Mecánica', 'Programación I', 'Estructuras de Datos', 'Algoritmos', 'Bases de Datos', 'Redes de Computadoras', 'Sistemas Operativos', 'Ingeniería de Software', 'Arquitectura de Software', 'Inteligencia Artificial', 'Machine Learning', 'Seguridad Informática', 'Desarrollo Web', 'Desarrollo Móvil', 'Estadística Inferencial', 'Investigación de Operaciones', 'Gestión de Proyectos', 'Electrónica Digital', 'Circuitos Eléctricos', 'Termodinámica', 'Mecánica de Materiales'],
  ciencias: ['Álgebra Superior', 'Cálculo de Varias Variables', 'Ecuaciones Diferenciales', 'Química Analítica', 'Química Orgánica', 'Física I', 'Física II', 'Biología Celular', 'Genética', 'Ecología', 'Botánica', 'Zoología', 'Bioestadística', 'Métodos Numéricos', 'Laboratorio de Química', 'Laboratorio de Física', 'Bioquímica', 'Microbiología General', 'Evolución', 'Geología y Suelos', 'Investigación Científica', 'Modelamiento Matemático', 'Análisis de Datos', 'Seminario de Tesis'],
  negocios: ['Contabilidad Financiera', 'Contabilidad de Costos', 'Microeconomía', 'Macroeconomía', 'Estadística para Negocios', 'Matemática Financiera', 'Administración General', 'Comportamiento Organizacional', 'Marketing Estratégico', 'Investigación de Mercados', 'Finanzas Corporativas', 'Gestión de Operaciones', 'Recursos Humanos', 'Derecho Empresarial', 'Auditoría', 'Tributación', 'Comercio Internacional', 'Gestión de Proyectos', 'Emprendimiento e Innovación', 'Presupuestos', 'Análisis Financiero', 'Estrategia Empresarial', 'Business Intelligence', 'Plan de Negocios'],
  educacion: ['Psicología del Aprendizaje', 'Teorías Pedagógicas', 'Didáctica General', 'Currículo y Evaluación', 'Desarrollo Humano', 'Neuroeducación', 'Tecnología Educativa', 'Metodología de la Enseñanza', 'Educación Inclusiva', 'Gestión Educativa', 'Sociología de la Educación', 'Psicopedagogía', 'Diseño de Materiales', 'Evaluación del Aprendizaje', 'Tutoría y Orientación', 'Investigación Educativa', 'Historia de la Educación', 'Filosofía de la Educación', 'Educación Ambiental', 'Educación Intercultural', 'Práctica Preprofesional I', 'Práctica Preprofesional II', 'Seminario de Tesis', 'Taller de Creatividad'],
  arte: ['Fundamentos del Diseño', 'Teoría del Color', 'Dibujo Artístico', 'Historia del Arte', 'Diseño Digital', 'Tipografía', 'Identidad Visual', 'Ilustración', 'Fotografía', 'Diseño Editorial', 'Diseño de Interiores', 'Modelado 2D y 3D', 'Animación', 'Producción Audiovisual', 'Guion y Narrativa', 'Dirección de Arte', 'Diseño de Modas', 'Patronaje y Confección', 'Ergonomía', 'Materiales y Procesos', 'Portafolio Profesional', 'Gestión de Proyectos Creativos', 'Taller de Creatividad', 'Proyecto de Tesis'],
  derecho: ['Introducción al Derecho', 'Derecho Civil I', 'Derecho Constitucional', 'Derecho Penal I', 'Teoría General del Proceso', 'Derecho Administrativo', 'Derecho Laboral', 'Derechos Reales', 'Derecho de Obligaciones', 'Derecho Comercial', 'Derecho Tributario', 'Derecho Procesal Civil', 'Derecho Procesal Penal', 'Derecho Internacional Público', 'Derechos Humanos', 'Derecho Ambiental', 'Criminología', 'Litigación Oral', 'Argumentación Jurídica', 'Hermenéutica Legal', 'Periodismo', 'Comunicación Política', 'Opinión Pública', 'Seminario de Tesis'],
  naturaleza: ['Botánica General', 'Zoología General', 'Ecología General', 'Edafología', 'Genética Vegetal', 'Fisiología Vegetal', 'Fisiología Animal', 'Microbiología Agrícola', 'Entomología', 'Fitopatología', 'Agronomía General', 'Producción Animal', 'Recursos Hídricos', 'Conservación de Suelos', 'Gestión Ambiental', 'Evaluación de Impacto Ambiental', 'Biotecnología', 'Manejo de Cuencas', 'Sistemas de Información Geográfica', 'Ecotoxicología', 'Desarrollo Sostenible', 'Laboratorio de Campo', 'Práctica Preprofesional', 'Seminario de Tesis']
};

const FILLER = ['Electivo Profesional I', 'Taller Integrador I', 'Seminario de Investigación I', 'Práctica Profesional I', 'Electivo Profesional II', 'Taller Integrador II', 'Seminario de Investigación II', 'Práctica Profesional II', 'Proyecto de Titulación', 'Electivo de Especialidad', 'Taller de Innovación', 'Ética Profesional'];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const uniq = (arr) => [...new Set(arr.filter(Boolean))];

const CACHE = new Map();

/** Devuelve la malla: [{ ciclo: 'I', cursos: [...] }, ...] */
export function buildMalla(career, offering) {
  const key = `${career.id}-${offering.id}`;
  if (CACHE.has(key)) return CACHE.get(key);

  const duracion = offering.duracion || 10;
  const rnd = mulberry(hash(key));
  const areaPool = AREA_COURSES[career.area] || [];
  const especificos = [...(career.cursos || []), ...(career.especializaciones || [])];
  let pool = uniq(shuffle([...areaPool, ...especificos, ...FILLER], rnd));

  const needed = (duracion - 2) * 6;
  let i = 1;
  while (pool.length < needed) pool.push(`Electivo Profesional ${i++}`);

  const CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];
  const malla = [
    { ciclo: CICLOS[0], cursos: GENERAL.slice(0, 6) },
    { ciclo: CICLOS[1], cursos: GENERAL.slice(6, 12) }
  ];
  for (let c = 2; c < duracion; c++) {
    malla.push({ ciclo: CICLOS[c], cursos: pool.slice((c - 2) * 6, (c - 2) * 6 + 6) });
  }
  CACHE.set(key, malla);
  return malla;
}
