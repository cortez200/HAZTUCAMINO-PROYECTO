// Becas y créditos educativos reales del Perú (PRONABEC).
// Fuentes oficiales. Siempre se redirige al sitio oficial para postular.

export const BECAS = [
  {
    id: 'beca-18',
    nombre: 'Beca 18',
    entidad: 'PRONABEC',
    tipo: 'Pregrado',
    publico: 'Escolares y egresados',
    destacada: true,
    cobertura: ['Matrícula', 'Pensión de estudios', 'Alimentación', 'Alojamiento', 'Materiales de estudio', 'Movilidad local', 'Inglés', 'Grado o título'],
    dirigidoA: 'Estudiantes del último grado de secundaria o egresados, con alto rendimiento académico y situación de vulnerabilidad.',
    requisitos: [
      'Nacionalidad peruana',
      'Ser menor de 22 años a la fecha de publicación de las bases',
      'Alto rendimiento académico (tercio o medio superior según modalidad)',
      'Condición de pobreza, pobreza extrema o situación especial según modalidad',
      'Haber ingresado a una institución, sede y programa de estudios elegibles'
    ],
    comoPostular: [
      'Revisar las bases y el cronograma en pronabec.gob.pe',
      'Verificar la lista de instituciones y programas elegibles',
      'Completar el módulo de postulación en línea',
      'Cargar documentos y declaraciones juradas',
      'Seguir los resultados y la aceptación de la beca en el portal oficial'
    ],
    linkOficial: 'https://www.pronabec.gob.pe/beca-18',
    linkGobPe: 'https://www.gob.pe/institucion/pronabec/campa%C3%B1as',
    vigencia: 'Convocatoria 2027 en curso (revisa el cronograma oficial)',
    postulacion: 'abierta',
    universidades: ['unmsm', 'uni', 'unsa', 'unt', 'unp', 'unalm', 'unsaac', 'unc', 'unsch', 'pucp', 'upc', 'ulima', 'upch', 'usmp', 'ucsur', 'urp', 'ucv', 'udep', 'up', 'usil'],
    modulos: [
      'Módulo académico: matrícula y pensión',
      'Módulo de alimentación y alojamiento',
      'Módulo de idiomas (inglés)',
      'Módulo de materiales y movilidad local',
      'Módulo de acompañamiento y titulación'
    ],
    nota: 'Las modalidades, vacantes y cronograma cambian por convocatoria. Verifica siempre en el sitio oficial.'
  },
  {
    id: 'beca-generacion-del-bicentenario',
    nombre: 'Beca Generación del Bicentenario',
    entidad: 'PRONABEC',
    tipo: 'Posgrado',
    publico: 'Profesionales',
    destacada: true,
    cobertura: ['Matrícula', 'Manutención', 'Pasajes', 'Seguro médico', 'Otros gastos según bases'],
    dirigidoA: 'Profesionales peruanos con alto rendimiento académico para estudiar una maestría o doctorado en el extranjero.',
    requisitos: [
      'Nacionalidad peruana',
      'Título profesional universitario',
      'Alto rendimiento académico',
      'Admisión o carta de aceptación de una institución elegible',
      'Cumplir los requisitos de las bases de la convocatoria'
    ],
    comoPostular: [
      'Revisar las bases y los programas elegibles en pronabec.gob.pe',
      'Postular por el módulo indicado en la convocatoria',
      'Cargar documentos según el cronograma',
      'Seguir las fases de postulación, subsanación y selección',
      'Revisar la publicación de resultados en el portal oficial'
    ],
    linkOficial: 'https://www.pronabec.gob.pe/beca-generacion-bicentenario/',
    linkGobPe: 'https://www.gob.pe/institucion/pronabec/campa%C3%B1as/145205-beca-generacion-del-bicentenario-convocatoria-2026',
    vigencia: 'Convocatoria 2026 (cronograma oficial)',
    postulacion: 'abierta',
    universidades: [],
    universidadesNota: 'Se estudia en instituciones del extranjero; la lista elegible se publica en las bases oficiales.',
    modulos: [
      'Módulo de matrícula de posgrado',
      'Módulo de manutención mensual',
      'Módulo de pasajes y seguro médico',
      'Módulo de gestión académica en el extranjero'
    ],
    nota: 'Dirigida a maestría o doctorado en el extranjero. Verifica vacantes, plazos y bases en el sitio oficial.'
  },
  {
    id: 'beca-peru',
    nombre: 'Beca Perú',
    entidad: 'PRONABEC',
    tipo: 'Pregrado',
    publico: 'Egresados de secundaria y estudiantes',
    destacada: true,
    cobertura: ['Matrícula', 'Pensión de estudios', 'Beneficios según la IES', 'Acompañamiento'],
    dirigidoA: 'Peruanos sin límite de edad que terminaron secundaria y quieren iniciar o continuar una carrera en universidades o institutos privados en convenio.',
    requisitos: [
      'Nacionalidad peruana',
      'Haber culminado la educación secundaria',
      'Haber ingresado a una institución, sede y programa elegibles',
      'Buen rendimiento académico',
      'Cumplir los requisitos específicos de la institución de educación superior'
    ],
    comoPostular: [
      'Revisar la oferta educativa y las bases del concurso',
      'Ingresar al módulo de postulación de Beca Perú',
      'Elegir las instituciones y programas de interés',
      'Cargar documentos y declaraciones juradas',
      'Revisar resultados y aceptar la beca según el cronograma'
    ],
    linkOficial: 'https://www.pronabec.gob.pe/beca-peru',
    linkGobPe: 'https://www.gob.pe/institucion/pronabec/campa%C3%B1as',
    vigencia: 'Convocatoria 2026 (según cronograma oficial)',
    postulacion: 'abierta',
    universidades: ['pucp', 'upc', 'ulima', 'usil', 'usmp', 'ucsur', 'udep', 'up', 'upao', 'ucontinental', 'upn', 'ucsp', 'uac', 'uwiener', 'upeu', 'ulasalle', 'ucv', 'utp'],
    modulos: [
      'Módulo académico: matrícula y pensión',
      'Módulo de beneficios según la IES',
      'Módulo de acompañamiento académico'
    ],
    nota: 'Cada institución de educación superior define los beneficios y requisitos de sus vacantes.'
  },
  {
    id: 'beca-permanencia',
    nombre: 'Beca Permanencia',
    entidad: 'PRONABEC',
    tipo: 'Pregrado',
    publico: 'Universitarios',
    cobertura: ['Alimentación', 'Movilidad local', 'Útiles de escritorio', 'Acompañamiento socioemocional'],
    dirigidoA: 'Estudiantes de universidades públicas, con buen rendimiento y condición de pobreza o pobreza extrema, que cursan entre el segundo y el último ciclo.',
    requisitos: [
      'Nacionalidad peruana',
      'Estar en condición de pobreza o pobreza extrema según el Sisfoh',
      'Buen rendimiento académico (medio superior como mínimo)',
      'Ser estudiante de una universidad pública, carrera y sede elegibles',
      'Cursar entre el segundo y el último ciclo o año académico'
    ],
    comoPostular: [
      'Revisar las bases y la lista de universidades elegibles',
      'Completar el módulo de postulación en línea',
      'Adjuntar la constancia de rendimiento académico',
      'Presentar declaraciones juradas y formatos generados',
      'Seguir el cronograma y la publicación de resultados'
    ],
    linkOficial: 'https://www.pronabec.gob.pe/beca-permanencia',
    linkGobPe: 'https://www.gob.pe/institucion/pronabec/campa%C3%B1as',
    vigencia: 'Convocatoria anual (2025 concluida; revisa la próxima)',
    postulacion: 'proxima',
    universidades: ['unmsm', 'uni', 'unsa', 'unt', 'unp', 'unalm', 'unsaac', 'unc', 'unsch', 'une', 'unap', 'unjbg', 'unheval', 'unu', 'undac', 'unap-iquitos', 'untumbes', 'unam', 'untrm', 'unh', 'unaj', 'undc', 'unach', 'unia'],
    modulos: [
      'Módulo de alimentación',
      'Módulo de movilidad local',
      'Módulo de útiles de escritorio',
      'Módulo de acompañamiento socioemocional'
    ],
    nota: 'Está enfocada en la permanencia y culminación de estudios universitarios en universidades públicas.'
  },
  {
    id: 'beca-hijos-de-docentes',
    nombre: 'Beca Hijos de Docentes',
    entidad: 'PRONABEC',
    tipo: 'Pregrado',
    publico: 'Hijos de docentes',
    cobertura: ['Examen de admisión', 'Matrícula', 'Pensión de estudios', 'Nivelación académica', 'Grado o título', 'Alimentación', 'Movilidad local', 'Alojamiento'],
    dirigidoA: 'Hijos de docentes de la Carrera Pública Magisterial que quieran estudiar en una universidad, instituto o escuela superior.',
    requisitos: [
      'Nacionalidad peruana',
      'Ser hijo de un docente de la Carrera Pública Magisterial',
      'Alto rendimiento académico',
      'Haber ingresado o contar con reserva de matrícula en una IES elegible',
      'Cumplir los requisitos de las bases de la convocatoria'
    ],
    comoPostular: [
      'Revisar las bases y el cronograma del concurso',
      'Verificar la documentación que acredita el vínculo con el docente',
      'Completar el módulo de postulación en línea',
      'Cargar documentos y declaraciones juradas',
      'Revisar resultados y aceptar la beca en el portal oficial'
    ],
    linkOficial: 'https://www.pronabec.gob.pe/beca-hijos-de-docentes',
    linkGobPe: 'https://www.gob.pe/institucion/pronabec/campa%C3%B1as',
    vigencia: 'Convocatoria 2025 concluida (800 becas); revisa la próxima',
    postulacion: 'proxima',
    universidades: ['unmsm', 'uni', 'unsa', 'unt', 'unp', 'pucp', 'upc', 'ulima', 'usil', 'usmp', 'upao', 'ucontinental', 'upn', 'upch', 'udep', 'ucsur'],
    modulos: [
      'Módulo de examen de admisión',
      'Módulo académico: matrícula y pensión',
      'Módulo de nivelación académica',
      'Módulo de alimentación y alojamiento',
      'Módulo de grado o título'
    ],
    nota: 'Incluye puntaje adicional para docentes de zonas rurales, EIB, frontera y otras condiciones priorizables.'
  },
  {
    id: 'credito-talento',
    nombre: 'Crédito Talento',
    entidad: 'PRONABEC',
    tipo: 'Crédito',
    publico: 'Egresados de secundaria',
    cobertura: ['Financiamiento académico', 'Costos no académicos', 'Tasa de 4.04 % anual', 'Hasta 10 años para pagar'],
    dirigidoA: 'Jóvenes que postularon a Beca 18 y no fueron seleccionados. Permite iniciar una carrera y devolver el préstamo al terminar.',
    requisitos: [
      'Nacionalidad peruana',
      'Haber postulado a Beca 18 y no haber sido seleccionado',
      'Haber ingresado a una institución y programa elegibles',
      'Contar con un cotitular para el crédito',
      'Cumplir los requisitos de las bases de la convocatoria'
    ],
    comoPostular: [
      'Revisar las bases y los conceptos financiables',
      'Completar el módulo de postulación en línea',
      'Registrar al cotitular y cargar la documentación',
      'Firmar electrónicamente la aceptación del crédito',
      'Cumplir el cronograma y las condiciones de devolución'
    ],
    linkOficial: 'https://www.pronabec.gob.pe/credito-talento',
    linkGobPe: 'https://www.gob.pe/institucion/pronabec/campa%C3%B1as',
    vigencia: 'Convocatoria 2025 concluida; revisa la próxima',
    postulacion: 'cerrada',
    universidades: ['pucp', 'upc', 'ulima', 'usil', 'usmp', 'udep', 'up', 'upao', 'ucontinental', 'ucsp', 'uac', 'uwiener', 'upeu', 'ulasalle', 'unmsm', 'uni'],
    modulos: [
      'Módulo financiero académico',
      'Módulo de costos no académicos',
      'Módulo de tasa preferencial (4.04 % anual)',
      'Módulo de repago (hasta 10 años)'
    ],
    nota: 'Es un crédito educativo, no una beca no reembolsable. La devolución inicia al egresar y tiene un plazo de hasta 10 años.'
  },
  {
    id: 'beca-continuidad',
    nombre: 'Beca Continuidad de Estudios',
    entidad: 'PRONABEC',
    tipo: 'Pregrado',
    publico: 'Estudiantes que retoman',
    cobertura: ['Matrícula', 'Pensión de estudios', 'Beneficios según bases', 'Acompañamiento'],
    dirigidoA: 'Estudiantes de educación superior que interrumpieron sus estudios y desean retomarlos y culminarlos.',
    requisitos: [
      'Nacionalidad peruana',
      'Acreditar vulnerabilidad económica',
      'Buen rendimiento académico',
      'Haber interrumpido estudios superiores',
      'Ser admitido en una institución, sede y programa elegibles'
    ],
    comoPostular: [
      'Revisar el portal de concursos y las bases vigentes',
      'Verificar si hay una convocatoria abierta',
      'Completar el módulo de postulación indicado',
      'Cargar documentos y declaraciones juradas',
      'Seguir el cronograma y los resultados oficiales'
    ],
    linkOficial: 'https://www.pronabec.gob.pe/concursos-becas-creditos/',
    linkGobPe: 'https://www.gob.pe/institucion/pronabec/colecciones/5768-resoluciones-del-concurso-beca-de-continuidad-de-estudios-de-educacion-superior-2022',
    vigencia: 'Convocatorias periódicas (revisa el portal oficial)',
    postulacion: 'proxima',
    universidades: ['pucp', 'upc', 'ulima', 'usil', 'usmp', 'udep', 'up', 'upao', 'ucontinental', 'upn', 'ucsp', 'unmsm', 'uni', 'unsa', 'unt'],
    modulos: [
      'Módulo académico: matrícula y pensión',
      'Módulo de beneficios según bases',
      'Módulo de acompañamiento para retomar'
    ],
    nota: 'Si no hay convocatoria abierta, revisa el portal de concursos de PRONABEC para conocer la próxima.'
  },
  {
    id: 'beca-tecnico-productiva',
    nombre: 'Beca Técnico Productiva CNA',
    entidad: 'PRONABEC',
    tipo: 'Técnico',
    publico: 'Comunidades indígenas',
    cobertura: ['Matrícula', 'Pensión de estudios', 'Materiales', 'Alimentación', 'Movilidad', 'Acompañamiento'],
    dirigidoA: 'Jóvenes de pueblos indígenas u originarios de la Amazonía (ámbito CNA) para cursos técnico-productivos presenciales.',
    requisitos: [
      'Nacionalidad peruana',
      'Pertenecer a una comunidad indígena u originaria del ámbito de la convocatoria',
      'Residir en la zona de cobertura',
      'Cumplir los requisitos de las bases del concurso',
      'Ser propuesto o postular mediante el mecanismo indicado'
    ],
    comoPostular: [
      'Revisar las bases y el ámbito territorial de la convocatoria',
      'Contactar al representante de la comunidad o al Pronabec regional',
      'Presentar la documentación en el plazo indicado',
      'Completar la postulación virtual con apoyo del Pronabec',
      'Revisar los resultados en el portal oficial'
    ],
    linkOficial: 'https://www.pronabec.gob.pe/beca-tecnico-productiva',
    linkGobPe: 'https://www.gob.pe/institucion/pronabec/campa%C3%B1as',
    vigencia: 'Convocatoria 2024 concluida; revisa las próximas',
    postulacion: 'cerrada',
    universidades: [],
    universidadesNota: 'Se realiza en institutos y centros de formación del ámbito CNA (Amazonía); consulta la lista oficial en las bases.',
    modulos: [
      'Módulo de matrícula y pensión',
      'Módulo de materiales y herramientas',
      'Módulo de alimentación y movilidad',
      'Módulo de acompañamiento productivo'
    ],
    nota: 'Programa focalizado en comunidades nativas amazónicas (CNA). Revisa nuevas convocatorias en el portal oficial.'
  }
];

export const tiposBeca = ['Todos', 'Pregrado', 'Posgrado', 'Técnico', 'Crédito'];
export const entidadesBeca = ['Todos', 'PRONABEC'];

/* Acceso sin plan: las primeras becas del listado se ven completas. Las
   restantes requieren Premium (se muestran bloqueadas en la lista y en el
   detalle). */
export const FREE_BECAS = BECAS.slice(0, 4).map((b) => b.id);
export const esBecaGratis = (id) => FREE_BECAS.includes(id);

// Perfiles para el recomendador de becas.
export const perfilesBeca = [
  { id: 'todas', label: 'Quiero ver todas las opciones', ids: null },
  { id: 'colegio', label: 'Estoy en el colegio o acabo de terminar', ids: ['beca-18', 'beca-peru', 'beca-hijos-de-docentes', 'credito-talento'] },
  { id: 'superior', label: 'Ya estudio en universidad o instituto', ids: ['beca-permanencia', 'beca-peru', 'beca-tecnico-productiva'] },
  { id: 'posgrado', label: 'Tengo título y quiero estudiar un posgrado', ids: ['beca-generacion-del-bicentenario'] },
  { id: 'docente', label: 'Soy hijo o hija de un docente', ids: ['beca-hijos-de-docentes', 'beca-18', 'beca-peru'] },
  { id: 'retomar', label: 'Dejé mis estudios y quiero retomarlos', ids: ['beca-continuidad', 'beca-peru'] }
];

export const getBecaById = (id) => BECAS.find((b) => b.id === id);

export const getBecasRecomendadas = (perfilId) => {
  const perfil = perfilesBeca.find((p) => p.id === perfilId);
  if (!perfil || !perfil.ids) return [];
  return perfil.ids.map((id) => getBecaById(id)).filter(Boolean);
};

/* ---------------- estados de la postulación ---------------- */
export const ESTADOS_POSTULACION = {
  abierta: { label: 'Convocatoria abierta', tone: 'ok', icon: 'Unlock' },
  proxima: { label: 'Próxima convocatoria', tone: 'gold', icon: 'Clock' },
  cerrada: { label: 'Convocatoria concluida', tone: 'soft', icon: 'Lock' }
};

const ETAPAS_BASE = [
  'Publicación de bases',
  'Postulación en línea',
  'Evaluación y subsanación',
  'Resultados y aceptación'
];

/* Línea de estados del proceso de postulación de una beca. */
export function etapasDePostulacion(estado) {
  const idx = estado === 'abierta' ? 1 : estado === 'cerrada' ? ETAPAS_BASE.length : -1;
  return ETAPAS_BASE.map((t, i) => ({
    t,
    estado: idx < 0 ? 'todo' : (i < idx ? 'done' : i === idx ? 'current' : 'todo'),
    fecha: estado === 'abierta' && i === 1 ? 'En curso' : (estado === 'cerrada' ? 'Concluida' : 'Según cronograma oficial')
  }));
}

export const estadoPostulacion = (b) => ESTADOS_POSTULACION[b?.postulacion] || ESTADOS_POSTULACION.proxima;

/* Becas disponibles por universidad (id de universidad -> becas). */
export const becasPorUniversidad = () => {
  const map = new Map();
  for (const b of BECAS) {
    for (const id of b.universidades || []) {
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(b);
    }
  }
  return map;
};
