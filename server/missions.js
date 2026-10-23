/* Misiones profesionales — simuladores interactivos asociados a carreras.
   Cada misión declara un motor ('code' | 'decision' | 'drag' | 'worksheet' |
   'match' | 'allocate') y el material necesario para evaluarla. El servidor es
   la fuente de verdad de los objetivos y del XP; el cliente solo envía el
   desempeño (score/total) que se sanea aquí.

   Estructura de una misión:
     id, careerId, area, titulo, subtitulo, nivel, dificultad (1-3), tier,
     engine, objetivos, xp, estimadoMin, rol, contexto, objetivo, habilidades,
     entregables[], y el bloque propio del motor.
*/

/* ------------------------------ gamificación ------------------------------ */
export const LEVELS = [
  { xp: 0, nombre: 'Explorador' },
  { xp: 100, nombre: 'Aprendiz' },
  { xp: 250, nombre: 'Practicante' },
  { xp: 450, nombre: 'Analista' },
  { xp: 700, nombre: 'Especialista' },
  { xp: 1000, nombre: 'Profesional' },
  { xp: 1400, nombre: 'Experto' },
  { xp: 1900, nombre: 'Mentor' }
];

export function levelFor(xp) {
  const points = Math.max(0, Math.round(Number(xp) || 0));
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i += 1) if (points >= LEVELS[i].xp) idx = i;
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] || null;
  const span = next ? next.xp - current.xp : 0;
  const into = points - current.xp;
  return {
    nivel: idx + 1,
    nombre: current.nombre,
    xp: points,
    xpNivel: into,
    xpSiguiente: next ? next.xp - points : 0,
    siguiente: next ? next.nombre : null,
    pct: next ? Math.round((into / span) * 100) : 100
  };
}

/* Insignias verificables. Se evalúan en el servidor tras cada intento. */
export const BADGES = [
  { id: 'primer-paso', nombre: 'Primer paso', icon: 'Rocket', desc: 'Completaste tu primera misión.' },
  { id: 'cero-errores', nombre: 'Cero errores', icon: 'BadgeCheck', desc: 'Terminaste una misión con puntaje perfecto.' },
  { id: 'codigo-limpio', nombre: 'Código limpio', icon: 'Bug', desc: 'Resolviste una misión de código sin fallar ninguna prueba.' },
  { id: 'ojo-clinico', nombre: 'Ojo clínico', icon: 'Stethoscope', desc: 'Acertaste al menos el 80% de un caso clínico.' },
  { id: 'constante', nombre: 'Constante', icon: 'RotateCcw', desc: 'Intentaste una misma misión 3 veces o más.' },
  { id: 'explorador-carreras', nombre: 'Explorador de carreras', icon: 'Compass', desc: 'Completaste misiones en dos carreras distintas.' },
  { id: 'quinientos-xp', nombre: '500 XP', icon: 'Award', desc: 'Acumulaste 500 puntos de experiencia.' }
];

/* Reglas de insignias: reciben el contexto del intento y devuelven los ids ganados. */
export function badgesFor({ mission, score, total, progress, allMissions }) {
  const won = [];
  const p = progress || {};
  const missions = p.missions || {};
  const done = Object.entries(missions).filter(([, m]) => (m.best || 0) > 0);
  const pct = total ? score / total : 0;
  if (score > 0 && Object.keys(missions).length) won.push('primer-paso');
  if (total > 0 && score === total) won.push('cero-errores');
  if (mission.engine === 'code' && total > 0 && score === total) won.push('codigo-limpio');
  if (mission.area === 'salud' && pct >= 0.8) won.push('ojo-clinico');
  if ((missions[mission.id]?.attempts || 0) >= 3) won.push('constante');
  if ((p.xp || 0) >= 500) won.push('quinientos-xp');
  const careersDone = new Set();
  for (const [id] of done) {
    const m = (allMissions || []).find((x) => x.id === id);
    if (m) careersDone.add(m.careerId);
  }
  if (careersDone.size >= 2) won.push('explorador-carreras');
  return won;
}

/* -------------------------------- misiones -------------------------------- */
export const MISSIONS = [
  /* ============================ INGENIERÍA DE SOFTWARE ============================ */
  {
    id: 'ing-software-carrito',
    careerId: 'ing-software',
    area: 'tecnologia',
    titulo: 'El carrito que cobra mal',
    subtitulo: 'Corrige una función del checkout y haz que pasen las pruebas',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'code',
    objetivos: 5,
    xp: 100,
    estimadoMin: 12,
    rol: 'Desarrollador(a) junior en una tienda online',
    contexto:
      'Acabas de entrar al equipo de pagos de una tienda online. Los clientes reportan que el total del carrito sale mal: a veces aparece "NaN" y otras veces no se aplica el descuento. El código está en producción y tu tarea es corregirlo antes del siguiente despliegue.',
    objetivo:
      'Corregir la función calcularTotal para que aplique las reglas del negocio y pase las 5 pruebas automáticas.',
    habilidades: ['Depuración', 'Lógica de negocio', 'Pruebas unitarias', 'Lectura de código'],
    entregables: [
      'El bucle debe recorrer exactamente los productos del carrito (sin salirse).',
      'Si el subtotal es S/ 100 o más, se aplica un 10% de descuento.',
      'Sobre el subtotal con descuento se agrega el IGV (18%).',
      'El resultado se redondea a 2 decimales.'
    ],
    code: {
      lang: 'javascript',
      fnName: 'calcularTotal',
      brief: 'Corrige la función y pulsa "Ejecutar pruebas". Cada prueba te dirá qué espera el negocio.',
      starter: [
        'function calcularTotal(precios) {',
        '  // 1. Sumar los precios del carrito',
        '  let subtotal = 0;',
        '  for (let i = 0; i <= precios.length; i++) {',
        '    subtotal = subtotal + precios[i];',
        '  }',
        '',
        '  // 2. Aplicar descuento y calcular el total',
        '  const total = subtotal * 1.18;',
        '  return total;',
        '}'
      ].join('\n'),
      hint:
        'Piensa en tres cosas: cuántas veces recorre el bucle, qué pasa cuando el subtotal llega a 100, y cómo se redondea el dinero.',
      solution: [
        'function calcularTotal(precios) {',
        '  let subtotal = 0;',
        '  for (let i = 0; i < precios.length; i++) {',
        '    subtotal += precios[i];',
        '  }',
        '  const conDescuento = subtotal >= 100 ? subtotal * 0.9 : subtotal;',
        '  const total = conDescuento * 1.18;',
        '  return Math.round(total * 100) / 100;',
        '}'
      ].join('\n'),
      notes: [
        'El bucle usaba `i <= precios.length`: recorre una posición de más, suma `undefined` y todo el total se vuelve `NaN`. Debe ser `i < precios.length`.',
        'Faltaba la regla del negocio: cuando el subtotal llega a S/ 100 se aplica un 10% de descuento ANTES del IGV.',
        'Conviene redondear a 2 decimales para evitar errores del punto flotante (por ejemplo 106.19999999).'
      ],
      tests: [
        { id: 't1', label: 'Carrito de S/ 60 (sin descuento) = S/ 70.80', args: [[10, 20, 30]], expect: 70.8 },
        { id: 't2', label: 'Carrito de S/ 100 (con 10% de descuento) = S/ 106.20', args: [[50, 50]], expect: 106.2 },
        { id: 't3', label: 'Un solo producto de S/ 100 = S/ 106.20', args: [[100]], expect: 106.2 },
        { id: 't4', label: 'Carrito vacío = S/ 0', args: [[]], expect: 0 },
        { id: 't5', label: 'Carrito de S/ 20 (decimales) = S/ 23.60', args: [[12.5, 7.5]], expect: 23.6 }
      ]
    }
  },
  {
    id: 'ing-software-claves',
    careerId: 'ing-software',
    area: 'tecnologia',
    titulo: 'El registro deja pasar claves débiles',
    subtitulo: 'Endurece la validación de contraseñas con pruebas de seguridad',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'code',
    objetivos: 5,
    xp: 130,
    estimadoMin: 15,
    rol: 'Desarrollador(a) de seguridad en una startup',
    contexto:
      'El equipo de seguridad detectó que el registro permite contraseñas débiles. La función esPasswordSegura tiene fallos lógicos. Debes ajustarla para que rechace las claves que no cumplan la política.',
    objetivo:
      'Corregir esPasswordSegura y lograr que las 5 pruebas de seguridad pasen.',
    habilidades: ['Seguridad', 'Expresiones regulares', 'Lógica booleana', 'Pruebas automatizadas'],
    entregables: [
      'La clave debe tener al menos 8 caracteres.',
      'Debe incluir al menos una mayúscula y al menos una minúscula.',
      'Debe incluir al menos un número.',
      'No debe contener espacios.'
    ],
    code: {
      lang: 'javascript',
      fnName: 'esPasswordSegura',
      brief: 'Corrige la lógica de validación y ejecuta las pruebas de seguridad.',
      starter: [
        'function esPasswordSegura(password) {',
        '  if (password.includes(\' \')) {',
        '    return true;',
        '  }',
        '  return password.length >= 8 && /[0-9]/.test(password) && /[A-Z]/.test(password);',
        '}'
      ].join('\n'),
      hint: 'Revisa el caso del espacio (¿debería aceptar o rechazar?) y qué tipos de caracteres no se están exigiendo.',
      solution: [
        'function esPasswordSegura(password) {',
        '  if (password.includes(\' \')) {',
        '    return false;',
        '  }',
        '  return (',
        '    password.length >= 8 &&',
        '    /[a-z]/.test(password) &&',
        '    /[A-Z]/.test(password) &&',
        '    /[0-9]/.test(password)',
        '  );',
        '}'
      ].join('\n'),
      notes: [
        'La condición del espacio estaba invertida: devolvía `true` (clave válida) justo cuando la clave tenía un espacio.',
        'Faltaba exigir al menos una minúscula: `/[a-z]/.test(password)`.',
        'Cada regla debe cumplirse; se combinan con `&&` para que cualquier fallo invalide la clave.'
      ],
      tests: [
        { id: 't1', label: '«Abcdefgh1» cumple toda la política', args: ['Abcdefgh1'], expect: true },
        { id: 't2', label: '«abcdefgh1» falla: no tiene mayúscula', args: ['abcdefgh1'], expect: false },
        { id: 't3', label: '«ABCDEFGH1» falla: no tiene minúscula', args: ['ABCDEFGH1'], expect: false },
        { id: 't4', label: '«Abcdefg1» falla: tiene solo 7 caracteres', args: ['Abcdefg1'], expect: false },
        { id: 't5', label: '«Abcdefg 1» falla: contiene un espacio', args: ['Abcdefg 1'], expect: false }
      ]
    }
  },

  /* =================================== MEDICINA =================================== */
  {
    id: 'medicina-abdomen',
    careerId: 'medicina',
    area: 'salud',
    titulo: 'Dolor abdominal de 20 horas',
    subtitulo: 'Un caso clínico ficticio para practicar el razonamiento diagnóstico',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'decision',
    objetivos: 9,
    xp: 120,
    estimadoMin: 14,
    rol: 'Médico(a) de guardia en el servicio de emergencias',
    contexto:
      'Es tu turno en emergencias. Llega una paciente joven con dolor abdominal. Debes leer su historia, reconocer los signos de alarma y decidir los pasos siguientes. Caso académico ficticio: no reemplaza la práctica clínica real.',
    objetivo:
      'Identificar los signos clave y tomar las decisiones correctas en cada etapa del caso.',
    habilidades: ['Anamnesis dirigida', 'Identificación de signos de alarma', 'Razonamiento clínico', 'Toma de decisiones'],
    entregables: [
      'Reconocer los hallazgos importantes y descartar los irrelevantes.',
      'Elegir la conducta inicial, el estudio, el diagnóstico y el tratamiento.',
      'Aprender el porqué de cada decisión en la retroalimentación.'
    ],
    decision: {
      dossier: {
        titulo: 'Historia clínica — Sala de emergencias',
        secciones: [
          { label: 'Paciente', valor: 'Mujer, 24 años. Estudiante universitaria.' },
          { label: 'Motivo de consulta', valor: 'Dolor abdominal de 20 horas de evolución.' },
          {
            label: 'Enfermedad actual',
            valor:
              'Empezó con dolor difuso alrededor del ombligo, con náuseas y falta de apetito. En las últimas 6 horas el dolor se desplazó hacia la fosa ilíaca derecha y aumenta al caminar o toser.'
          },
          {
            label: 'Signos vitales',
            items: ['Temperatura 38.1 °C', 'Frecuencia cardíaca 98 lpm', 'Presión arterial 118/76 mmHg', 'Frecuencia respiratoria 18 rpm']
          },
          {
            label: 'Examen físico',
            items: ['Dolor a la palpación en fosa ilíaca derecha', 'Signo de Blumberg dudoso', 'Sin masas ni defensa generalizada']
          },
          {
            label: 'Exámenes auxiliares',
            items: ['Leucocitos 13 500/µL (elevados)', 'Examen de orina sin alteraciones']
          }
        ]
      },
      findingsInstruccion:
        'Marca solo los hallazgos que son SIGNOS DE ALARMA o datos clave para este caso. Los datos de relleno no puntúan.',
      findings: [
        { id: 'f1', text: 'Dolor que migró del ombligo a la fosa ilíaca derecha', key: true, fb: 'El dolor migratorio es un signo clásico de irritación peritoneal por apendicitis.' },
        { id: 'f2', text: 'Temperatura 38.1 °C (febrícula)', key: true, fb: 'La fiebre baja sugiere un proceso inflamatorio/infeccioso.' },
        { id: 'f3', text: 'Náuseas y falta de apetito', key: true, fb: 'Muy frecuentes en la apendicitis; refuerzan la sospecha.' },
        { id: 'f4', text: 'Leucocitos 13 500/µL', key: true, fb: 'La leucocitosis moderada respalda una inflamación aguda.' },
        { id: 'f5', text: 'Dolor a la palpación en la fosa ilíaca derecha', key: true, fb: 'Localiza el foco inflamatorio en la fosa ilíaca derecha.' },
        { id: 'f6', text: 'Usa lentes desde la infancia', key: false, fb: 'Dato sin relación con el cuadro abdominal actual.' },
        { id: 'f7', text: 'Trabaja medio tiempo en una tienda', key: false, fb: 'Información social útil, pero no un signo de alarma.' },
        { id: 'f8', text: 'Presión arterial 118/76 mmHg', key: false, fb: 'Es una presión normal: no es un hallazgo de alarma.' }
      ],
      steps: [
        {
          id: 's1',
          titulo: 'Evaluación inicial',
          question: '¿Qué haces en la evaluación inicial?',
          opciones: [
            { t: 'Dar de alta con un analgésico y control en casa.', ok: false, fb: 'Peligroso: un abdomen agudo puede complicarse. No se debe enviar a casa sin descartar una causa quirúrgica.' },
            { t: 'Dejar en observación, en ayuno (NPO), con vía venosa y analgesia, y solicitar estudios de imagen.', ok: true, fb: 'Correcto: aseguras la vía, controlas el dolor, dejas en ayuno por si requiere cirugía y avanzas el diagnóstico.' },
            { t: 'Iniciar antibióticos solos y esperar 24 horas.', ok: false, fb: 'Incompleto: los antibióticos no resuelven una apendicitis establecida y retrasan el tratamiento definitivo.' }
          ]
        },
        {
          id: 's2',
          titulo: 'Estudio diagnóstico',
          question: '¿Qué estudio solicitas para confirmar el diagnóstico?',
          opciones: [
            { t: 'Radiografía de tórax.', ok: false, fb: 'No evalúa el abdomen ni la apéndice en este escenario.' },
            { t: 'Ecografía o tomografía abdominal.', ok: true, fb: 'Correcto: la ecografía es de primera línea; la tomografía confirma con alta sensibilidad si hay duda.' },
            { t: 'Repetir el hemograma en 3 días.', ok: false, fb: 'Retrasarías el diagnóstico 3 días en un cuadro agudo y potencialmente quirúrgico.' }
          ]
        },
        {
          id: 's3',
          titulo: 'Diagnóstico',
          question: '¿Cuál es el diagnóstico más probable?',
          opciones: [
            { t: 'Apendicitis aguda.', ok: true, fb: 'Correcto: dolor migratorio a fosa ilíaca derecha, fiebre, náuseas y leucocitosis configuran el cuadro típico.' },
            { t: 'Gastroenteritis viral.', ok: false, fb: 'La gastroenteritis suele dar diarrea y dolor difuso, sin dolor localizado ni defensa en fosa ilíaca derecha.' },
            { t: 'Dismenorrea (cólico menstrual).', ok: false, fb: 'El cólico menstrual no explica la migración del dolor ni la leucocitosis.' }
          ]
        },
        {
          id: 's4',
          titulo: 'Conducta definitiva',
          question: '¿Cuál es la conducta definitiva?',
          opciones: [
            { t: 'Apendicectomía, con evaluación por cirugía general.', ok: true, fb: 'Correcto: el tratamiento de la apendicitis aguda es quirúrgico, con cirugía general de guardia.' },
            { t: 'Antibióticos orales y alta.', ok: false, fb: 'El manejo solo con antibióticos no es el estándar para una apendicitis aguda no complicada en este contexto.' },
            { t: 'Solo analgesia y observación en casa.', ok: false, fb: 'Riesgo alto de perforación; no es un manejo seguro.' }
          ]
        }
      ],
      debrief:
        'La apendicitis aguda se sospecha por el dolor que migra hacia la fosa ilíaca derecha, acompañado de fiebre baja, náuseas, anorexia y leucocitosis. El manejo incluye dejar al paciente en ayuno, canalizar vía, controlar el dolor, confirmar con imágenes y resolver quirúrgicamente. En la práctica real, la evaluación y el tratamiento los define el equipo médico.'
    }
  },
  {
    id: 'medicina-torax',
    careerId: 'medicina',
    area: 'salud',
    titulo: 'Dolor de pecho en la madrugada',
    subtitulo: 'Caso clínico ficticio: reconoce un síndrome coronario agudo',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'decision',
    objetivos: 9,
    xp: 150,
    estimadoMin: 16,
    rol: 'Médico(a) de guardia en emergencias',
    contexto:
      'Un paciente adulto llega por dolor de pecho. El tiempo es crítico. Caso académico ficticio: úsalo para practicar la identificación de señales de alarma y la toma de decisiones urgentes.',
    objetivo:
      'Detectar los signos de alarma y actuar con prioridad sobre un posible infarto.',
    habilidades: ['Reconocimiento de urgencias', 'Lectura de ECG', 'Decisiones bajo presión', 'Razonamiento clínico'],
    entregables: [
      'Identificar los hallazgos que apuntan a un síndrome coronario agudo.',
      'Elegir las acciones iniciales correctas y el tratamiento definitivo.'
    ],
    decision: {
      dossier: {
        titulo: 'Historia clínica — Dolor torácico',
        secciones: [
          { label: 'Paciente', valor: 'Hombre, 58 años. Trabaja conduciendo.' },
          { label: 'Motivo de consulta', valor: 'Dolor en el pecho de 40 minutos de evolución.' },
          {
            label: 'Enfermedad actual',
            valor:
              'Dolor opresivo en el centro del pecho, como un peso, que se irradia a la mandíbula y al brazo izquierdo, acompañado de sudoración fría y náuseas. No mejora con el reposo ni con cambios de posición.'
          },
          {
            label: 'Antecedentes',
            items: ['Fuma desde los 20 años', 'Diabetes mellitus tipo 2', 'Hipertensión arterial']
          },
          {
            label: 'Signos vitales',
            items: ['Frecuencia cardíaca 96 lpm', 'Presión arterial 150/95 mmHg', 'Frecuencia respiratoria 20 rpm', 'Saturación de oxígeno 96%']
          },
          {
            label: 'Examen y estudios',
            items: ['Piel fría y sudorosa', 'Electrocardiograma con elevación del segmento ST en cara inferior']
          }
        ]
      },
      findingsInstruccion:
        'Marca solo los hallazgos clave para este caso. Los datos de relleno no puntúan.',
      findings: [
        { id: 'f1', text: 'Dolor opresivo retroesternal de 40 minutos', key: true, fb: 'El dolor opresivo prolongado es la manifestación típica de isquemia miocárdica.' },
        { id: 'f2', text: 'Irradiación a mandíbula y brazo izquierdo', key: true, fb: 'La irradiación característica refuerza el origen coronario.' },
        { id: 'f3', text: 'Sudoración fría y náuseas', key: true, fb: 'Síntomas neurovegetativos frecuentes en el infarto.' },
        { id: 'f4', text: 'Antecedentes de tabaquismo, diabetes e hipertensión', key: true, fb: 'Son factores de riesgo cardiovascular mayores.' },
        { id: 'f5', text: 'Elevación del segmento ST en el electrocardiograma', key: true, fb: 'Hallazgo electrocardiográfico que define un infarto con elevación del ST (IAMCEST).' },
        { id: 'f6', text: 'Trabaja conduciendo', key: false, fb: 'Dato ocupacional, no un signo de alarma.' },
        { id: 'f7', text: 'Saturación de oxígeno 96%', key: false, fb: 'Es un valor aceptable; no es un signo de alarma por sí mismo.' },
        { id: 'f8', text: 'Refiere que le gusta el café', key: false, fb: 'Información sin relación con el cuadro agudo.' }
      ],
      steps: [
        {
          id: 's1',
          titulo: 'Primeros minutos',
          question: '¿Qué haces primero al recibir al paciente?',
          opciones: [
            { t: 'Realizar el electrocardiograma en los primeros 10 minutos y monitorizar al paciente.', ok: true, fb: 'Correcto: el ECG precoz es la clave. Debe hacerse y interpretarse en los primeros 10 minutos.' },
            { t: 'Dar un antiácido y esperar si mejora.', ok: false, fb: 'Error grave: se pierde tiempo crítico tratándolo como problema gástrico.' },
            { t: 'Enviarlo a casa porque probablemente son "gases".', ok: false, fb: 'Error grave: un dolor opresivo con irradiación y sudoración no debe enviarse a casa.' }
          ]
        },
        {
          id: 's2',
          titulo: 'Tratamiento inicial',
          question: '¿Qué tratamiento inicial administras?',
          opciones: [
            { t: 'Aspirina masticable y antiagregación, analgesia, y activar el código infarto.', ok: true, fb: 'Correcto: la aspirina reduce la mortalidad y el código infarto moviliza al equipo de reperfusión.' },
            { t: 'Solo un analgésico y observación.', ok: false, fb: 'Insuficiente: se retrasa el tratamiento antiagregante y la reperfusión.' },
            { t: 'Fármacos para la ansiedad y esperar.', ok: false, fb: 'Peligroso: atribuirlo a la ansiedad retrasa el manejo del infarto.' }
          ]
        },
        {
          id: 's3',
          titulo: 'Diagnóstico',
          question: '¿Cuál es el diagnóstico?',
          opciones: [
            { t: 'Síndrome coronario agudo con elevación del ST (infarto).', ok: true, fb: 'Correcto: dolor típico más elevación del ST definen un IAMCEST.' },
            { t: 'Reflujo gastroesofágico.', ok: false, fb: 'El reflujo no produce elevación del ST ni sudoración fría con ese patrón de dolor.' },
            { t: 'Crisis de ansiedad.', ok: false, fb: 'La ansiedad puede imitar síntomas, pero no explica la elevación del ST.' }
          ]
        },
        {
          id: 's4',
          titulo: 'Conducta definitiva',
          question: '¿Qué haces a continuación?',
          opciones: [
            { t: 'Activar la sala de hemodinámica y evaluar la reperfusión (angioplastia) de urgencia.', ok: true, fb: 'Correcto: la reperfusión temprana es el objetivo cuando hay elevación del ST.' },
            { t: 'Dejar en observación en sala general y reevaluar en 6 horas.', ok: false, fb: 'Retraso inaceptable en un IAMCEST.' },
            { t: 'Tranquilizar y dar de alta con control ambulatorio.', ok: false, fb: 'Alto riesgo de complicaciones fatales fuera del hospital.' }
          ]
        }
      ],
      debrief:
        'Ante un dolor torácico opresivo con factores de riesgo, hay que obtener un ECG en los primeros 10 minutos. La elevación del ST define un infarto que exige aspirina, antiagregación y reperfusión precoz. Caso académico: en la vida real todo esto lo decide el equipo médico con protocolos institucionales.'
    }
  },
  {
    id: 'enfermeria-postop',
    careerId: 'enfermeria',
    area: 'salud',
    titulo: 'Vigilancia postoperatoria',
    subtitulo: 'Detecta los signos de alarma en el cambio de turno',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'decision',
    objetivos: 9,
    xp: 120,
    estimadoMin: 14,
    rol: 'Enfermera/o de hospitalización',
    contexto:
      'Recibes el turno de noche en cirugía. Acaban de operar a Lucía, 34 años, apendicectomía hace 6 horas. Debes revisar su estado y decidir los cuidados inmediatos.',
    objetivo: 'Identificar los datos relevantes, priorizar el cuidado y actuar con seguridad.',
    habilidades: ['Valoración de signos vitales', 'Priorización de cuidados', 'Razonamiento clínico'],
    entregables: ['Registro de signos de alarma', 'Plan de cuidados priorizado'],
    decision: {
      brief: 'Revisa los datos del monitoreo y del apósito. Marca lo que es relevante para detectar un deterioro.',
      findings: [
        { id: 'fc', t: 'Frecuencia cardíaca 122 lpm en reposo', key: true, fb: 'Taquicardia en reposo: signo de alarma.' },
        { id: 'pa', t: 'Presión arterial 88/54 mmHg', key: true, fb: 'Hipotensión: posible sangrado o hipovolemia.' },
        { id: 'piel', t: 'Piel pálida, fría y sudorosa', key: true, fb: 'Mala perfusión periférica.' },
        { id: 'aposito', t: 'Apósito con mancha de sangre que crece', key: true, fb: 'Sangrado activo de la herida.' },
        { id: 'dolor', t: 'Dolor abdominal 8/10 que no cede', key: true, fb: 'Dolor intenso y persistente.' },
        { id: 'sopa', t: 'Comentó que le apetece sopa', key: false, fb: 'Dato no relevante ahora.' },
        { id: 'tv', t: 'Está viendo una serie en la tablet', key: false, fb: 'No aporta al deterioro clínico.' },
        { id: 'visita', t: 'Su hermana vendrá mañana', key: false, fb: 'Información administrativa.' }
      ],
      steps: [
        {
          q: '¿Cuál es tu primera acción?',
          opts: [
            { t: 'Reevaluar signos vitales, revisar el apósito y avisar de inmediato al equipo médico.', ok: true, fb: 'Correcto: valorar y escalar el deterioro es prioritario.' },
            { t: 'Anotarlo en la historia y seguir con el resto del turno.', ok: false, fb: 'Podrías perder un sangrado activo.' },
            { t: 'Administrar un analgésico y esperar 30 minutos.', ok: false, fb: 'El dolor no es el problema principal ahora.' }
          ]
        },
        {
          q: 'Antes de que llegue el médico, ¿qué cuidado aplicas?',
          opts: [
            { t: 'Pesar el apósito, reforzarlo sin retirarlo y vigilar la presión cada 15 minutos.', ok: true, fb: 'Control del sangrado y monitorización estrecha.' },
            { t: 'Retirar el apósito para ver la herida a fondo.', ok: false, fb: 'Puede deshacer el efecto hemostático.' },
            { t: 'Dejar solo reposo absoluto sin monitorizar.', ok: false, fb: 'Insuficiente ante un paciente inestable.' }
          ]
        },
        {
          q: '¿Cómo interpretas el conjunto?',
          opts: [
            { t: 'Signos de shock hipovolémico por sangrado postoperatorio.', ok: true, fb: 'Correcto: taquicardia, hipotensión y mala perfusión.' },
            { t: 'Es normal tras la anestesia.', ok: false, fb: 'No se debe normalizar un deterioro.' },
            { t: 'Reacción alérgica leve.', ok: false, fb: 'Faltan signos cutáneos o respiratorios; encaja peor con la pérdida de sangre.' }
          ]
        },
        {
          q: '¿Qué registras y comunicas al equipo?',
          opts: [
            { t: 'Evolución cronológica de constantes, aspecto del apósito y hora del aviso.', ok: true, fb: 'Un registro claro acelera la decisión médica.' },
            { t: 'Solo "paciente inestable".', ok: false, fb: 'Demasiado vago para actuar.' },
            { t: 'Nada hasta que el médico lo vea.', ok: false, fb: 'El registro continuo es responsabilidad de enfermería.' }
          ]
        }
      ],
      debrief:
        'En enfermería, detectar y escalar el deterioro salva vidas: signos vitales, perfusión y herida quirúrgica son los ejes. Caso académico: en la vida real se siguen protocolos institucionales y órdenes médicas.'
    }
  },
  {
    id: 'psicologia-entrevista',
    careerId: 'psicologia',
    area: 'salud',
    titulo: 'Primera entrevista',
    subtitulo: 'Conecta lo que observas con la técnica psicológica',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'match',
    objetivos: 6,
    xp: 110,
    estimadoMin: 12,
    rol: 'Psicóloga/o clínica/o',
    contexto:
      'Atiendes a una persona que llega por malestar y cambios en el ánimo. Debes relacionar sus señales con la lectura o la actuación profesional adecuada.',
    objetivo: 'Emparejar cada señal observada con su interpretación o intervención.',
    habilidades: ['Escucha activa', 'Formulación de caso', 'Registro de señales'],
    entregables: ['Mapa de señales y respuestas'],
    match: {
      brief: 'Une cada señal con la respuesta profesional correcta.',
      leftLabel: 'Señal observada',
      rightLabel: 'Lectura / actuación',
      pairs: [
        { id: 'p1', left: 'Habla en pasado y no ve futuro', right: 'Explorar ideación y estado de ánimo', fb: 'Puede indicar riesgo; hay que evaluarlo con cuidado.' },
        { id: 'p2', left: 'Le tiemblan las manos al hablar en público', right: 'Aplicar exposición gradual', fb: 'La evitación se trabaja con aproximaciones progresivas.' },
        { id: 'p3', left: 'Nombra su emoción sin juzgarse', right: 'Reforzar la regulación emocional', fb: 'Poner nombre a la emoción es una habilidad clave.' },
        { id: 'p4', left: 'Duerme mal y está irritable', right: 'Trabajar higiene del sueño', fb: 'El descanso condiciona el ánimo.' },
        { id: 'p5', left: 'Un error le hace pensar que todo le sale mal', right: 'Cuestionar la generalización', fb: 'Error de pensamiento: sobregeneralizar.' },
        { id: 'p6', left: 'Un mensaje sin respuesta significa rechazo', right: 'Revisar la personalización', fb: 'Atribuirse causas que no dependen de uno.' }
      ]
    }
  },
  {
    id: 'nutricion-deportista',
    careerId: 'nutricion',
    area: 'salud',
    titulo: 'Plan para un deportista',
    subtitulo: 'Calcula su gasto energético y sus macronutrientes',
    nivel: 'inicial',
    dificultad: 2,
    tier: 'free',
    engine: 'worksheet',
    objetivos: 5,
    xp: 130,
    estimadoMin: 16,
    rol: 'Nutricionista deportiva/o',
    contexto:
      'Andrea, 25 años, 80 kg y 180 cm, entrena 5 días por semana. Necesitas estimar su gasto energético y repartir sus macronutrientes.',
    objetivo: 'Calcular el gasto energético total y las cantidades de proteínas, grasas y carbohidratos.',
    habilidades: ['Cálculo de requerimientos', 'Reparto de macronutrientes'],
    entregables: ['Hoja de cálculo completada'],
    worksheet: {
      brief:
        'Usa Mifflin-St Jeor: TMB = 10·peso + 6,25·talla − 5·edad + 5. Factor de actividad 1,55. Proteínas 1,8 g/kg; grasas 25 % de la energía; el resto, carbohidratos (1 g de proteína o carbohidrato = 4 kcal; 1 g de grasa = 9 kcal).',
      hint: 'Calcula primero la TMB y multiplícala por el factor de actividad para obtener el total.',
      fields: [
        { id: 'tmb', label: 'Tasa metabólica basal (TMB)', unit: 'kcal', type: 'number', expect: 1805, tol: 5, fb: '10·80 + 6,25·180 − 5·25 + 5 = 1805 kcal.' },
        { id: 'tdee', label: 'Gasto energético total con actividad', unit: 'kcal', type: 'number', expect: 2798, tol: 6, fb: '1805 × 1,55 = 2798 kcal.' },
        { id: 'prot', label: 'Proteínas diarias', unit: 'g', type: 'number', expect: 144, tol: 3, fb: '1,8 g/kg × 80 kg = 144 g.' },
        { id: 'gras', label: 'Grasas diarias (25 % de la energía)', unit: 'g', type: 'number', expect: 78, tol: 3, fb: '25 % de 2798 = 700 kcal ÷ 9 = 78 g.' },
        { id: 'carbs', label: 'Carbohidratos diarios (energía restante)', unit: 'g', type: 'number', expect: 380, tol: 6, fb: '2798 − 144·4 − 78·9 = 1520 kcal ÷ 4 = 380 g.' }
      ],
      notes: [
        'La TMB estima la energía en reposo; el factor de actividad la ajusta al gasto real.',
        'El reparto de macronutrientes se calcula sobre la energía total, no sobre el peso.'
      ]
    }
  }
,
  {
    id: 'ing-industrial-lote',
    careerId: 'ing-industrial',
    area: 'tecnologia',
    titulo: 'El lote que cuesta de más',
    subtitulo: 'Programa el lote económico de pedido',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'code',
    objetivos: 5,
    xp: 130,
    estimadoMin: 15,
    rol: 'Analista de operaciones y mejora continua',
    contexto:
      'En el almacén se compra de más y se paga de más por almacenar. Te piden una función que calcule el lote óptimo de pedido para reducir el costo total.',
    objetivo: 'Corregir la función loteOptimo para que devuelva el lote económico de pedido (EOQ).',
    habilidades: ['Optimización', 'Costos logísticos', 'Programación'],
    entregables: ['La función debe aplicar la fórmula EOQ = √(2·D·S / H) y redondear al entero.'],
    code: {
      lang: 'javascript',
      fnName: 'loteOptimo',
      brief: 'Corrige la fórmula del lote óptimo y ejecuta las pruebas.',
      starter: [
        'function loteOptimo(demanda, costoPedido, costoMantener) {',
        '  // El lote que hoy usa la empresa',
        '  const eoq = (demanda * costoPedido) / costoMantener;',
        '  return Math.round(eoq);',
        '}'
      ].join('\n'),
      hint: 'La fórmula EOQ lleva un factor 2 multiplicando y una raíz cuadrada.',
      solution: [
        'function loteOptimo(demanda, costoPedido, costoMantener) {',
        '  const eoq = Math.sqrt((2 * demanda * costoPedido) / costoMantener);',
        '  return Math.round(eoq);',
        '}'
      ].join('\n'),
      notes: [
        'La fórmula EOQ = √(2·D·S/H) equilibra el costo de pedir y el de almacenar.',
        'Faltaban el factor 2 y la raíz cuadrada; sin ellos el resultado no es el óptimo.'
      ],
      tests: [
        { id: 't1', label: 'D=1000, S=50, H=4 → 158 unidades', args: [1000, 50, 4], expect: 158 },
        { id: 't2', label: 'D=500, S=20, H=5 → 63 unidades', args: [500, 20, 5], expect: 63 },
        { id: 't3', label: 'D=2000, S=10, H=8 → 71 unidades', args: [2000, 10, 8], expect: 71 },
        { id: 't4', label: 'D=300, S=60, H=9 → 63 unidades', args: [300, 60, 9], expect: 63 },
        { id: 't5', label: 'D=1200, S=25, H=2 → 173 unidades', args: [1200, 25, 2], expect: 173 }
      ]
    }
  },
  {
    id: 'ing-civil-viga',
    careerId: 'ing-civil',
    area: 'tecnologia',
    titulo: 'La viga del puente peatonal',
    subtitulo: 'Calcula reacciones, momento y concreto',
    nivel: 'inicial',
    dificultad: 2,
    tier: 'free',
    engine: 'worksheet',
    objetivos: 5,
    xp: 130,
    estimadoMin: 16,
    rol: 'Ingeniera/o civil en obra',
    contexto:
      'Debes revisar una viga simplemente apoyada de 8 m que soporta una carga distribuida de 12 kN/m. Además, necesitas estimar el concreto de la viga (sección 0,30 × 0,50 m).',
    objetivo: 'Calcular reacciones, cortante, momento flector máximo y el concreto necesario.',
    habilidades: ['Estática', 'Cálculo estructural', 'Metrados'],
    entregables: ['Hoja de cálculo completada'],
    worksheet: {
      brief:
        'Para una carga distribuida w en una viga de luz L: reacción por apoyo R = w·L/2, cortante máximo V = R y momento máximo M = w·L²/8. El peso propio usa el peso específico del concreto armado (24 kN/m³).',
      hint: 'Primero obtén la reacción por apoyo y úsala también como cortante máximo.',
      fields: [
        { id: 'r', label: 'Reacción en cada apoyo', unit: 'kN', type: 'number', expect: 48, tol: 0.5, fb: 'w·L/2 = 12·8/2 = 48 kN.' },
        { id: 'v', label: 'Cortante máximo', unit: 'kN', type: 'number', expect: 48, tol: 0.5, fb: 'La cortante máxima iguala la reacción: 48 kN.' },
        { id: 'm', label: 'Momento flector máximo', unit: 'kN·m', type: 'number', expect: 96, tol: 1, fb: 'w·L²/8 = 12·64/8 = 96 kN·m.' },
        { id: 'vol', label: 'Volumen de concreto de la viga', unit: 'm³', type: 'number', expect: 1.2, tol: 0.05, fb: '0,30·0,50·8 = 1,2 m³.' },
        { id: 'peso', label: 'Peso propio de la viga', unit: 'kN', type: 'number', expect: 28.8, tol: 0.5, fb: '1,2 m³ · 24 kN/m³ = 28,8 kN.' }
      ],
      notes: [
        'En una viga simplemente apoyada con carga uniforme, las dos reacciones son iguales.',
        'El momento máximo ocurre al centro de la luz y vale w·L²/8.',
        'El peso propio siempre debe considerarse en el diseño.'
      ]
    }
  },
  {
    id: 'mecatronica-sensor',
    careerId: 'mecatronica',
    area: 'tecnologia',
    titulo: 'El sensor que mide mal',
    subtitulo: 'Convierte la lectura del ADC en temperatura',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'code',
    objetivos: 5,
    xp: 135,
    estimadoMin: 15,
    rol: 'Ingeniera/o mecatrónica de control',
    contexto:
      'Un microcontrolador lee un sensor de temperatura LM35 (10 mV por °C) con un ADC de 10 bits y 5 V de referencia. Las lecturas salen desviadas y hay que corregir la conversión.',
    objetivo: 'Corregir la función temperatura para convertir la lectura del ADC en grados Celsius.',
    habilidades: ['Sensores', 'Electrónica', 'Programación embebida'],
    entregables: ['La función debe convertir el ADC a voltios y luego a grados con un decimal.'],
    code: {
      lang: 'javascript',
      fnName: 'temperatura',
      brief: 'Corrige la conversión y ejecuta las pruebas.',
      starter: [
        'function temperatura(adc) {',
        '  const voltios = (adc * 5) / 1024;',
        '  const grados = voltios / 0.01;',
        '  return Math.round(grados * 10) / 10;',
        '}'
      ].join('\n'),
      hint: 'El ADC de 10 bits tiene 1023 niveles (0 a 1023), no 1024. El LM35 entrega 10 mV por grado.',
      solution: [
        'function temperatura(adc) {',
        '  const voltios = (adc * 5) / 1023;',
        '  const grados = voltios / 0.01;',
        '  return Math.round(grados * 10) / 10;',
        '}'
      ].join('\n'),
      notes: [
        'Un ADC de 10 bits tiene 1024 niveles, pero el valor máximo es 1023; dividir entre 1024 introduce un error de calibración.',
        'Con 10 mV por grado, cada voltio equivale a 100 °C.'
      ],
      tests: [
        { id: 't1', label: 'adc 512 → 250.2 °C', args: [512], expect: 250.2 },
        { id: 't2', label: 'adc 0 → 0 °C', args: [0], expect: 0 },
        { id: 't3', label: 'adc 1023 → 500 °C', args: [1023], expect: 500 },
        { id: 't4', label: 'adc 205 → 100.2 °C', args: [205], expect: 100.2 },
        { id: 't5', label: 'adc 820 → 400.8 °C', args: [820], expect: 400.8 }
      ]
    }
  },
  {
    id: 'biologia-celula',
    careerId: 'biologia',
    area: 'ciencias',
    titulo: 'Dentro de la célula',
    subtitulo: 'Relaciona cada organelo con su función',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'match',
    objetivos: 6,
    xp: 110,
    estimadoMin: 12,
    rol: 'Bióloga/o celular',
    contexto:
      'Estás preparando una práctica de laboratorio y debes emparejar los organelos con la función que cumplen en la célula.',
    objetivo: 'Asociar correctamente cada organelo con su función.',
    habilidades: ['Biología celular', 'Observación', 'Vocabulario científico'],
    entregables: ['Mapa de organelos y funciones'],
    match: {
      brief: 'Une cada organelo con su función principal.',
      leftLabel: 'Organelo',
      rightLabel: 'Función',
      pairs: [
        { id: 'p1', left: 'Núcleo', right: 'Guarda el material genético (ADN)', fb: 'El núcleo contiene el ADN.' },
        { id: 'p2', left: 'Mitocondria', right: 'Produce energía en forma de ATP', fb: 'La mitocondria es la central energética.' },
        { id: 'p3', left: 'Ribosoma', right: 'Sintetiza proteínas', fb: 'Los ribosomas traducen el ARN mensajero.' },
        { id: 'p4', left: 'Cloroplasto', right: 'Realiza la fotosíntesis', fb: 'Los cloroplastos captan la luz.' },
        { id: 'p5', left: 'Lisosoma', right: 'Digiere y recicla desechos', fb: 'Los lisosomas degradan materiales.' },
        { id: 'p6', left: 'Membrana plasmática', right: 'Regula la entrada y salida de sustancias', fb: 'La membrana controla el intercambio.' }
      ]
    }
  },
  {
    id: 'quimica-disolucion',
    careerId: 'quimica',
    area: 'ciencias',
    titulo: 'Preparar una disolución',
    subtitulo: 'Calcula moles, masa y dilución',
    nivel: 'inicial',
    dificultad: 2,
    tier: 'free',
    engine: 'worksheet',
    objetivos: 5,
    xp: 130,
    estimadoMin: 15,
    rol: 'Química/o de laboratorio',
    contexto:
      'Necesitas preparar 500 mL de disolución de NaOH 0,2 M y resolver dudas de dilución para la práctica de titulación.',
    objetivo: 'Calcular moles, masa y volúmenes para preparar y diluir la disolución.',
    habilidades: ['Estequiometría', 'Concentraciones', 'Dilución'],
    entregables: ['Hoja de laboratorio completada'],
    worksheet: {
      brief:
        'Recuerda: moles = M · V(L); masa = moles · masa molar. Para diluir, C₁·V₁ = C₂·V₂. La masa molar del NaOH es 40 g/mol.',
      hint: 'Primero convierte el volumen a litros (500 mL = 0,5 L).',
      fields: [
        { id: 'n', label: 'Moles de NaOH necesarios', unit: 'mol', type: 'number', expect: 0.1, tol: 0.005, fb: '0,2 M · 0,5 L = 0,1 mol.' },
        { id: 'm', label: 'Masa de NaOH a pesar', unit: 'g', type: 'number', expect: 4, tol: 0.1, fb: '0,1 mol · 40 g/mol = 4 g.' },
        { id: 'v1', label: 'Volumen de disolución 1 M necesaria', unit: 'mL', type: 'number', expect: 100, tol: 1, fb: 'C₁V₁ = C₂V₂ → V₁ = (0,2·500)/1 = 100 mL.' },
        { id: 'n2', label: 'Moles en 250 mL de la disolución 0,2 M', unit: 'mol', type: 'number', expect: 0.05, tol: 0.003, fb: '0,2 M · 0,25 L = 0,05 mol.' },
        { id: 'cf', label: 'Concentración final si se lleva a 1 L', unit: 'M', type: 'number', expect: 0.1, tol: 0.005, fb: '0,1 mol ÷ 1 L = 0,1 M.' }
      ],
      notes: [
        'La molaridad se calcula siempre sobre el volumen en litros.',
        'En una dilución, los moles no cambian: C₁V₁ = C₂V₂.'
      ]
    }
  },
  {
    id: 'matematica-mcd',
    careerId: 'matematica',
    area: 'ciencias',
    titulo: 'El MCD que no converge',
    subtitulo: 'Implementa el algoritmo de Euclides',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'code',
    objetivos: 5,
    xp: 130,
    estimadoMin: 14,
    rol: 'Matemática/o / docente',
    contexto:
      'Un compañero escribió mal el algoritmo para el máximo común divisor y devuelve cualquier cosa. Corrígelo para que pase las pruebas.',
    objetivo: 'Corregir la función mcd para que devuelva el máximo común divisor.',
    habilidades: ['Teoría de números', 'Algoritmos', 'Programación'],
    entregables: ['La función debe devolver el MCD correcto en todos los casos.'],
    code: {
      lang: 'javascript',
      fnName: 'mcd',
      brief: 'Corrige el retorno del algoritmo de Euclides y ejecuta las pruebas.',
      starter: [
        'function mcd(a, b) {',
        '  let x = a;',
        '  let y = b;',
        '  while (y !== 0) {',
        '    const t = y;',
        '    y = x % y;',
        '    x = t;',
        '  }',
        '  return b;',
        '}'
      ].join('\n'),
      hint: 'El bucle deja el resultado en la variable x, no en el valor original b.',
      solution: [
        'function mcd(a, b) {',
        '  let x = a;',
        '  let y = b;',
        '  while (y !== 0) {',
        '    const t = y;',
        '    y = x % y;',
        '    x = t;',
        '  }',
        '  return x;',
        '}'
      ].join('\n'),
      notes: [
        'El algoritmo de Euclides reemplaza (a, b) por (b, a mod b) hasta llegar a 0.',
        'El resultado final queda en x; devolver b retorna el divisor original en lugar del MCD.'
      ],
      tests: [
        { id: 't1', label: 'mcd(48, 18) = 6', args: [48, 18], expect: 6 },
        { id: 't2', label: 'mcd(100, 75) = 25', args: [100, 75], expect: 25 },
        { id: 't3', label: 'mcd(17, 5) = 1', args: [17, 5], expect: 1 },
        { id: 't4', label: 'mcd(0, 9) = 9', args: [0, 9], expect: 9 },
        { id: 't5', label: 'mcd(270, 192) = 6', args: [270, 192], expect: 6 }
      ]
    }
  },
  {
    id: 'fisica-proyectil',
    careerId: 'fisica',
    area: 'ciencias',
    titulo: 'El tiro que cae corto',
    subtitulo: 'Calcula el alcance de un proyectil',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'code',
    objetivos: 5,
    xp: 135,
    estimadoMin: 15,
    rol: 'Física/o experimental',
    contexto:
      'En el laboratorio lanzan un proyectil y el alcance calculado no coincide con la medición. La función debe usar correctamente las unidades angulares.',
    objetivo: 'Corregir la función alcance para calcular el alcance horizontal del proyectil.',
    habilidades: ['Cinemática', 'Trigonometría', 'Programación'],
    entregables: ['La función debe devolver el alcance en metros con 2 decimales.'],
    code: {
      lang: 'javascript',
      fnName: 'alcance',
      brief: 'Corrige el cálculo del alcance y ejecuta las pruebas.',
      starter: [
        'function alcance(v0, angulo) {',
        '  // Alcance de un tiro parabólico (g = 9.8)',
        '  const r = (v0 * v0 * Math.sin(2 * angulo)) / 9.8;',
        '  return Math.round(r * 100) / 100;',
        '}'
      ].join('\n'),
      hint: 'Math.sin trabaja en radianes, no en grados. Hay que convertir el ángulo.',
      solution: [
        'function alcance(v0, angulo) {',
        '  const rad = (angulo * Math.PI) / 180;',
        '  const r = (v0 * v0 * Math.sin(2 * rad)) / 9.8;',
        '  return Math.round(r * 100) / 100;',
        '}'
      ].join('\n'),
      notes: [
        'El alcance sin resistencia del aire es R = v₀²·sin(2θ)/g.',
        'Math.sin espera radianes: hay que convertir los grados con π/180.'
      ],
      tests: [
        { id: 't1', label: 'v0=20, 45° → 40.82 m', args: [20, 45], expect: 40.82 },
        { id: 't2', label: 'v0=10, 30° → 8.84 m', args: [10, 30], expect: 8.84 },
        { id: 't3', label: 'v0=30, 45° → 91.84 m', args: [30, 45], expect: 91.84 },
        { id: 't4', label: 'v0=15, 60° → 19.88 m', args: [15, 60], expect: 19.88 },
        { id: 't5', label: 'v0=5, 45° → 2.55 m', args: [5, 45], expect: 2.55 }
      ]
    }
  }
,
  {
    id: 'administracion-presupuesto',
    careerId: 'administracion',
    area: 'negocios',
    titulo: 'El presupuesto del año',
    subtitulo: 'Reparte los recursos entre las áreas',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'allocate',
    objetivos: 5,
    xp: 130,
    estimadoMin: 14,
    rol: 'Administradora/o de empresa',
    contexto:
      'La dirección te pide distribuir el presupuesto anual de la empresa entre las áreas, sin descuidar ninguna y sin excederte.',
    objetivo: 'Asignar todo el presupuesto respetando los rangos recomendados de cada área.',
    habilidades: ['Planificación', 'Toma de decisiones', 'Gestión de recursos'],
    entregables: ['Presupuesto anual balanceado'],
    allocate: {
      recurso: 'Presupuesto anual (miles)',
      total: 100,
      step: 5,
      brief: 'Asigna las 100 unidades entre las áreas. Cada partida tiene un rango recomendado según su peso estratégico.',
      hint: 'Deja margen para imprevistos: no comprometas todo en una sola área.',
      partidas: [
        { id: 'a1', label: 'Personal', detalle: 'Sueldos y contrataciones clave', min: 30, max: 45, fb: 'El talento es la base; no recortes por debajo del mínimo.' },
        { id: 'p2', label: 'Marketing', detalle: 'Captación de clientes', detail2: '', min: 10, max: 20, fb: 'Impulsa las ventas, pero sin ahogar otras áreas.' },
        { id: 'a3', label: 'Tecnología', min: 15, max: 25, fb: 'Sin herramientas y sistemas la operación se frena.' },
        { id: 'p4', label: 'Capacitación', min: 5, max: 15, fb: 'Invertir en las personas reduce la rotación.' },
        { id: 'p5', label: 'Imprevistos', min: 5, max: 15, fb: 'Una reserva evita endeudarse ante imprevistos.' }
      ],
      notes: [
        'Los rangos representan el peso mínimo y máximo razonable de cada área.',
        'Un buen presupuesto reserva siempre un fondo para imprevistos.'
      ]
    }
  },
  {
    id: 'contabilidad-resultados',
    careerId: 'contabilidad',
    area: 'negocios',
    titulo: 'El estado de resultados',
    subtitulo: 'Calcula utilidades y márgenes',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'worksheet',
    objetivos: 6,
    xp: 135,
    estimadoMin: 16,
    rol: 'Contadora/o',
    contexto:
      'Una empresa cerró el año con ventas de S/ 200 000, costo de ventas de S/ 120 000 y gastos operativos de S/ 40 000. El impuesto a la renta es del 30 %.',
    objetivo: 'Elaborar el estado de resultados y calcular los márgenes.',
    habilidades: ['Estados financieros', 'Análisis de márgenes'],
    entregables: ['Estado de resultados completado'],
    worksheet: {
      brief:
        'Utilidad bruta = ventas − costo de ventas. Utilidad operativa = bruta − gastos operativos. La utilidad neta resta el impuesto (30 % de la utilidad antes de impuestos). Los márgenes se calculan sobre las ventas.',
      hint: 'Calcula primero la utilidad bruta y avanza línea por línea.',
      fields: [
        { id: 'bruta', label: 'Utilidad bruta', unit: 'S/', type: 'number', expect: 80000, tol: 500, fb: '200 000 − 120 000 = 80 000.' },
        { id: 'mbruto', label: 'Margen bruto', unit: '%', type: 'number', expect: 40, tol: 0.5, fb: '80 000 ÷ 200 000 · 100 = 40 %.' },
        { id: 'oper', label: 'Utilidad operativa', unit: 'S/', type: 'number', expect: 40000, tol: 500, fb: '80 000 − 40 000 = 40 000.' },
        { id: 'imp', label: 'Impuesto a la renta (30 %)', unit: 'S/', type: 'number', expect: 12000, tol: 300, fb: '30 % de 40 000 = 12 000.' },
        { id: 'neta', label: 'Utilidad neta', unit: 'S/', type: 'number', expect: 28000, tol: 500, fb: '40 000 − 12 000 = 28 000.' },
        { id: 'mneto', label: 'Margen neto', unit: '%', type: 'number', expect: 14, tol: 0.5, fb: '28 000 ÷ 200 000 · 100 = 14 %.' }
      ],
      notes: [
        'El estado de resultados va de lo general (ventas) a lo específico (utilidad neta).',
        'El margen mide cuánto de cada sol vendido se convierte en ganancia.'
      ]
    }
  },
  {
    id: 'marketing-campana',
    careerId: 'marketing',
    area: 'negocios',
    titulo: 'La campaña que no despega',
    subtitulo: 'Diagnostica el rendimiento y decide',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'decision',
    objetivos: 9,
    xp: 135,
    estimadoMin: 15,
    rol: 'Especialista en marketing digital',
    contexto:
      'Lanzaste una campaña para un producto nuevo. A los diez días las ventas no crecen. Revisa los datos y decide cómo reaccionar.',
    objetivo: 'Interpretar las métricas y priorizar las acciones de la campaña.',
    habilidades: ['Análisis de métricas', 'Decisiones de inversión', 'Pensamiento crítico'],
    entregables: ['Diagnóstico de campaña', 'Plan de acción'],
    decision: {
      brief: 'Selecciona la información que explica el bajo rendimiento de la campaña.',
      findings: [
        { id: 'f1', t: 'El 70 % de las conversiones ocurre en móvil', key: true, fb: 'La experiencia móvil es clave.' },
        { id: 'f2', t: 'El costo por adquisición subió 40 %', key: true, fb: 'Estás pagando más por cada cliente.' },
        { id: 'f3', t: 'Los anuncios de la red B tienen un CTR de 0,3 %', key: true, fb: 'Creatividad o segmentación poco atractiva.' },
        { id: 'f4', t: 'El público de 18 a 24 años no responde al mensaje', key: true, fb: 'El mensaje no conecta con ese segmento.' },
        { id: 'f5', t: 'La página tarda 6 segundos en cargar', key: true, fb: 'La lentitud aumenta el rebote.' },
        { id: 'f6', t: 'El logo usa tres colores', key: false, fb: 'Dato de diseño, no explica el rendimiento.' },
        { id: 'f7', t: 'La oficina está en el centro', key: false, fb: 'Irrelevante para la campaña.' },
        { id: 'f8', t: 'El equipo tomó café', key: false, fb: 'Dato anecdótico.' }
      ],
      steps: [
        {
          q: '¿Por dónde empiezas?',
          opts: [
            { t: 'Optimizar la página para móvil y reducir su tiempo de carga.', ok: true, fb: 'Atacas los dos frenos más directos de la conversión.' },
            { t: 'Duplicar el presupuesto en todos los canales.', ok: false, fb: 'Gastar más sin corregir el problema.' },
            { t: 'Cambiar el logo.', ok: false, fb: 'No responde al diagnóstico.' }
          ]
        },
        {
          q: '¿Cómo reasignas la inversión?',
          opts: [
            { t: 'Retirar presupuesto de la red B y reforzar el canal con mejor retorno.', ok: true, fb: 'Concentra el gasto donde funciona.' },
            { t: 'Mantener la inversión en la red B.', ok: false, fb: 'Es el canal con peor CTR.' },
            { t: 'Detener toda la campaña.', ok: false, fb: 'Reacción exagerada.' }
          ]
        },
        {
          q: '¿Qué haces con el mensaje?',
          opts: [
            { t: 'Probar mensajes distintos (A/B) adaptados al segmento objetivo.', ok: true, fb: 'El test A/B valida qué conecta.' },
            { t: 'Mantener el mismo mensaje para todos.', ok: false, fb: 'Ignora el hallazgo del público 18-24.' },
            { t: 'Escribir un mensaje más largo.', ok: false, fb: 'No hay evidencia de que ayude.' }
          ]
        },
        {
          q: '¿Qué métricas sigues de cerca?',
          opts: [
            { t: 'Costo por adquisición, tasa de conversión y retorno de la inversión.', ok: true, fb: 'Son las métricas que reflejan el resultado real.' },
            { t: 'Número de seguidores únicamente.', ok: false, fb: 'No mide ventas.' },
            { t: 'Cantidad de anuncios publicados.', ok: false, fb: 'Esfuerzo, no resultado.' }
          ]
        }
      ],
      debrief:
        'En marketing, se decide con datos: carga móvil, costo por adquisición, CTR y segmentación. Primero se corrige el embudo y luego se reasigna la inversión. Caso académico con fines educativos.'
    }
  },
  {
    id: 'economia-gasto-publico',
    careerId: 'economia',
    area: 'negocios',
    titulo: 'Prioridades del gasto público',
    subtitulo: 'Asigna el presupuesto público',
    nivel: 'avanzado',
    dificultad: 3,
    tier: 'free',
    engine: 'allocate',
    objetivos: 5,
    xp: 150,
    estimadoMin: 16,
    rol: 'Economista del sector público',
    contexto:
      'Formas parte del equipo que decide cómo distribuir el presupuesto público del próximo año entre los grandes sectores.',
    objetivo: 'Asignar el presupuesto respetando los rangos según prioridades sociales y de inversión.',
    habilidades: ['Política fiscal', 'Priorización', 'Equilibrio presupuestal'],
    entregables: ['Propuesta de asignación presupuestal'],
    allocate: {
      recurso: 'Presupuesto público (millones)',
      total: 100,
      step: 5,
      brief: 'Distribuye los 100 millones entre sectores. Los rangos reflejan las prioridades y compromisos vigentes.',
      hint: 'Educación y salud concentran el gasto social; deja espacio para infraestructura e imprevistos.',
      partidas: [
        { id: 'a1', label: 'Educación', detalle: 'Escuelas, docentes y materiales', min: 20, max: 35, fb: 'Es la inversión con mayor retorno social a largo plazo.' },
        { id: 'a2', label: 'Salud', detalle: 'Hospitales y atención primaria', min: 20, max: 35, fb: 'La salud sostiene la productividad del país.' },
        { id: 'a3', label: 'Infraestructura', detalle: 'Carreteras, agua y saneamiento', min: 10, max: 25, fb: 'Impulsa la actividad económica y conecta regiones.' },
        { id: 'a4', label: 'Seguridad', detalle: 'Policía y prevención', min: 8, max: 20, fb: 'La seguridad sostiene la inversión y confianza.' },
        { id: 'a5', label: 'Medio ambiente', detalle: 'Conservación y gestión de residuos', min: 5, max: 15, fb: 'Prevenir el daño ambiental es más barato que repararlo.' }
      ],
      notes: [
        'El presupuesto público es limitado: asignar más a un sector implica menos para otro.',
        'Los compromisos sociales (educación y salud) suelen tener rangos mínimos altos.'
      ]
    }
  },
  {
    id: 'educacion-sesion',
    careerId: 'educacion',
    area: 'educacion',
    titulo: 'Planifica una sesión',
    subtitulo: 'Clasifica las estrategias por momento de la clase',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'drag',
    objetivos: 6,
    xp: 115,
    estimadoMin: 12,
    rol: 'Docente de aula',
    contexto:
      'Estás preparando la planificación de una sesión de aprendizaje y debes ubicar cada estrategia en el momento adecuado: inicio, desarrollo o cierre.',
    objetivo: 'Clasificar las estrategias pedagógicas según el momento de la sesión.',
    habilidades: ['Planificación didáctica', 'Gestión del aula', 'Evaluación formativa'],
    entregables: ['Secuencia didáctica organizada'],
    drag: {
      modo: 'clasificar',
      instruccion: 'Arrastra cada estrategia al momento de la sesión que le corresponde.',
      slots: [
        { id: 'inicio', label: 'Inicio', icon: 'PlayCircle' },
        { id: 'desarrollo', label: 'Desarrollo', icon: 'BookOpen' },
        { id: 'cierre', label: 'Cierre', icon: 'Flag' }
      ],
      items: [
        { id: 'i1', label: 'Recoger los saberes previos', icon: 'MessageCircle', correct: 'inicio', pista: 'El inicio activa lo que ya saben.' },
        { id: 'i2', label: 'Presentar el propósito de la clase', icon: 'Target', correct: 'inicio', pista: 'Anunciar el propósito orienta el aprendizaje.' },
        { id: 'i3', label: 'Trabajo en grupos con material concreto', icon: 'Users', correct: 'desarrollo', pista: 'El desarrollo construye el aprendizaje.' },
        { id: 'i4', label: 'Resolución guiada de problemas', icon: 'Puzzle', correct: 'desarrollo', pista: 'Acompañar la práctica es propio del desarrollo.' },
        { id: 'i5', label: 'Reflexión sobre lo aprendido', icon: 'Brain', correct: 'cierre', pista: 'El cierre metacognitivo consolida.' },
        { id: 'i6', label: 'Ticket de salida / autoevaluación', icon: 'ClipboardCheck', correct: 'cierre', pista: 'La autoevaluación cierra la sesión.' }
      ]
    }
  },
  {
    id: 'trabajo-social-familia',
    careerId: 'trabajo-social',
    area: 'educacion',
    titulo: 'Un caso familiar',
    subtitulo: 'Detecta el riesgo y define la ruta de apoyo',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'decision',
    objetivos: 9,
    xp: 130,
    estimadoMin: 15,
    rol: 'Trabajadora/or social',
    contexto:
      'Recibes el caso de una familia derivada por la escuela. Debes valorar la situación, priorizar riesgos y proponer una ruta de intervención.',
    objetivo: 'Interpretar los indicadores, priorizar la protección y plantear la ruta de apoyo.',
    habilidades: ['Valoración de casos', 'Protección de derechos', 'Coordinación de servicios'],
    entregables: ['Informe de valoración', 'Ruta de intervención'],
    decision: {
      brief: 'Selecciona la información relevante para valorar la situación familiar.',
      findings: [
        { id: 'f1', t: 'El niño de 7 años falta repetidamente a la escuela', key: true, fb: 'Alerta de posible desprotección.' },
        { id: 'f2', t: 'La familia no tiene ingresos estables', key: true, fb: 'Vulnerabilidad económica.' },
        { id: 'f3', t: 'Vecinos reportan violencia verbal en el hogar', key: true, fb: 'Riesgo que exige atención.' },
        { id: 'f5', t: 'La vivienda no cuenta con servicios básicos', key: true, fb: 'Afecta derechos básicos.' },
        { id: 'f6', t: 'La madre solicita ayuda con la documentación', key: true, fb: 'Demanda de apoyo concreta.' },
        { id: 'n1', label: '', t: 'El niño tiene una mochila nueva', key: false, fb: 'Dato no relacionado con el riesgo.' },
        { id: 'n2', t: 'Les gusta el fútbol', key: false, fb: 'No aporta a la valoración.' },
        { id: 'n3', t: 'Tienen una mascota', key: false, fb: 'Dato anecdótico.' }
      ],
      steps: [
        {
          q: '¿Cuál es tu primera acción?',
          opts: [
            { t: 'Escuchar a la familia y realizar una valoración integral, sin juzgar.', ok: true, fb: 'La relación de confianza es la base de la intervención.' },
            { t: 'Reportar de inmediato sin escuchar.', ok: false, fb: 'Hay que valorar primero, salvo riesgo inminente.' },
            { t: 'Cerrar el caso por falta de pruebas.', ok: false, fb: 'Ignorar los indicadores sería negligente.' }
          ]
        },
        {
          q: '¿Qué priorizas?',
          opts: [
            { t: 'La protección del menor y la seguridad de la familia.', ok: true, fb: 'La protección es el principio rector.' },
            { t: 'El orden de los documentos.', ok: false, fb: 'Administrativo, no prioritario.' },
            { t: 'La puntualidad de la escuela.', ok: false, fb: 'Es un síntoma, no la prioridad.' }
          ]
        },
        {
          q: '¿Cómo articulas la ruta?',
          opts: [
            { t: 'Coordinar con escuela, salud y programas sociales.', ok: true, fb: 'La intervención es intersectorial.' },
            { t: 'Derivar solo a la escuela.', ok: false, fb: 'Insuficiente para el conjunto de problemas.' },
            { t: 'Resolver el caso aisladamente.', ok: false, fb: 'Sin red de apoyo el caso se pierde.' }
          ]
        },
        {
          q: '¿Cómo cierras el proceso?',
          opts: [
            { t: 'Elaborar un plan de intervención con seguimiento periódico.', ok: true, fb: 'El seguimiento garantiza los avances.' },
            { t: 'Archivar el caso tras la primera visita.', ok: false, fb: 'Sin seguimiento no hay resultados.' },
            { t: 'Esperar a que la familia vuelva a contactar.', ok: false, fb: 'La iniciativa es del profesional.' }
          ]
        }
      ],
      debrief:
        'La intervención social valora, prioriza y articula servicios para proteger derechos. La escucha y la coordinación intersectorial son centrales. Caso académico ficticio.'
    }
  },
  {
    id: 'sociologia-encuesta',
    careerId: 'sociologia',
    area: 'educacion',
    titulo: 'Leer una encuesta',
    subtitulo: 'Convierte los datos en indicadores',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'worksheet',
    objetivos: 5,
    xp: 130,
    estimadoMin: 15,
    rol: 'Socióloga/o',
    contexto:
      'Se encuestó a 400 personas de un distrito sobre la satisfacción con los servicios públicos. Debes calcular los principales indicadores del estudio.',
    objetivo: 'Calcular porcentajes, media y tasa de respuesta a partir de los datos de la encuesta.',
    habilidades: ['Análisis de datos', 'Estadística descriptiva', 'Interpretación social'],
    entregables: ['Tabla de indicadores completada'],
    worksheet: {
      brief:
        'Porcentaje = (casos ÷ total) · 100. La media es la suma dividida entre el número de datos. La tasa de respuesta = respuestas ÷ invitados · 100.',
      hint: 'Comprueba que los porcentajes del mismo grupo sumen 100 %.',
      fields: [
        { id: 'sat', label: 'Satisfacción: 240 dijeron "sí"', unit: '%', type: 'number', expect: 60, tol: 0.5, fb: '(240 ÷ 400) · 100 = 60 %.' },
        { id: 'nosat', label: 'Insatisfacción (el resto)', unit: '%', type: 'number', expect: 40, tol: 0.5, fb: '100 − 60 = 40 %.' },
        { id: 'info', label: 'Con internet: 1 de cada 4 personas', unit: '%', type: 'number', expect: 25, tol: 0.5, fb: '1/4 = 25 %.' },
        { id: 'media', label: 'Edad media del grupo: 18, 20, 22, 24, 26', unit: 'años', type: 'number', expect: 22, tol: 0.1, fb: '(18+20+22+24+26) ÷ 5 = 22 años.' },
        { id: 'tasa', label: 'Tasa de respuesta: 400 de 800 invitados', unit: '%', type: 'number', expect: 50, tol: 0.5, fb: '(400 ÷ 800) · 100 = 50 %.' }
      ],
      notes: [
        'Los porcentajes de una misma pregunta siempre suman 100 %.',
        'Una tasa de respuesta baja puede introducir sesgos en el estudio.'
      ]
    }
  },
  {
    id: 'turismo-destinos',
    careerId: 'turismo',
    area: 'educacion',
    titulo: 'Diseña una ruta turística',
    subtitulo: 'Clasifica las actividades por tipo de turismo',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'drag',
    objetivos: 6,
    xp: 115,
    estimadoMin: 12,
    rol: 'Guía / gestor(a) turístico',
    contexto:
      'Estás armando un catálogo de experiencias y debes clasificar cada actividad según el tipo de turismo al que pertenece.',
    objetivo: 'Clasificar las actividades según el tipo de turismo correspondiente.',
    habilidades: ['Gestión turística', 'Clasificación de productos', 'Atención al visitante'],
    entregables: ['Catálogo de experiencias organizado'],
    drag: {
      modo: 'clasificar',
      instruccion: 'Arrastra cada actividad al tipo de turismo que le corresponde.',
      slots: [
        { id: 'cultural', label: 'Cultural', icon: 'Landmark' },
        { id: 'naturaleza', label: 'Naturaleza', icon: 'Trees' },
        { id: 'aventura', label: 'Aventura', icon: 'Mountain' }
      ],
      items: [
        { id: 't1', label: 'Visitar un museo arqueológico', icon: 'Landmark', correct: 'cultural', pista: 'El patrimonio cultural define este tipo.' },
        { id: 't2', label: 'Recorrer un centro histórico', icon: 'Building2', correct: 'cultural', pista: 'La historia de la ciudad es cultural.' },
        { id: 't3', label: 'Caminar por un bosque nublado', icon: 'Trees', correct: 'natural', pista: 'El contacto con la naturaleza.' },
        { id: 't4', label: 'Observar aves en un humedal', icon: 'Bird', correct: 'natural', pista: 'La observación de fauna es turismo de naturaleza.' },
        { id: 't5', label: 'Hacer rafting en un río', icon: 'Waves', correct: 'aventura', pista: 'El deporte de aventura busca adrenalina.' },
        { id: 't6', label: 'Escalar una pared de roca', icon: 'Mountain', correct: 'aventura', pista: 'La escalada es deporte de aventura.' }
      ]
    }
  }
,
  {
    id: 'diseno-grafico-principios',
    careerId: 'diseño-grafico',
    area: 'arte',
    titulo: 'El afiche que no se entiende',
    subtitulo: 'Relaciona cada principio con su efecto',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'match',
    objetivos: 6,
    xp: 115,
    estimadoMin: 12,
    rol: 'Diseñadora/or gráfico',
    contexto:
      'Un cliente rechazó un afiche porque "no se entiende". Repasa los principios del diseño relacionando cada uno con lo que aporta.',
    objetivo: 'Emparejar cada principio de diseño con su efecto o aplicación.',
    habilidades: ['Fundamentos del diseño', 'Comunicación visual', 'Composición'],
    entregables: ['Guía de principios aplicada'],
    match: {
      brief: 'Une cada principio de diseño con lo que aporta.',
      leftLabel: 'Principio / recurso',
      rightLabel: 'Efecto / uso',
      pairs: [
        { id: 'p1', left: 'Contraste', right: 'Diferencia elementos para guiar la mirada', fb: 'El contraste dirige la atención.' },
        { id: 'p2', left: 'Jerarquía visual', right: 'Ordena la importancia de los elementos', fb: 'La jerarquía marca qué leer primero.' },
        { id: 'p3', left: 'Paleta análoga', right: 'Combina colores vecinos del círculo cromático', fb: 'Los colores análogos armonizan.' },
        { id: 'p4', left: 'Tipografía serif', right: 'Transmite tradición y formalidad', fb: 'La serif evoca clasicismo.' },
        { id: 'p5', left: 'Espacio en blanco', right: 'Da respiro y mejora la lectura', fb: 'El aire ordena la composición.' },
        { id: 'p6', left: 'Rejilla (grid)', right: 'Alinea y organiza los elementos', fb: 'La retícula da estructura.' }
      ]
    }
  },
  {
    id: 'arquitectura-ambiente',
    careerId: 'arquitectura',
    area: 'arte',
    titulo: 'Dimensionar un ambiente',
    subtitulo: 'Calcula áreas, volumen y escalones',
    nivel: 'inicial',
    dificultad: 2,
    tier: 'free',
    engine: 'worksheet',
    objetivos: 5,
    xp: 130,
    estimadoMin: 16,
    rol: 'Arquitecta/o',
    contexto:
      'Diseñas un ambiente rectangular de 6,00 m × 4,50 m con 2,80 m de altura libre. Necesitas los metrados básicos para el expediente.',
    objetivo: 'Calcular área, perímetro, volumen, caras y número de contrahuellas.',
    habilidades: ['Metrados', 'Diseño de espacios', 'Cálculo de escaleras'],
    entregables: ['Hoja de metrados completada'],
    worksheet: {
      brief:
        'Área = largo · ancho. Perímetro = 2·(largo + ancho). Volumen = área · altura. El número de contrahuellas = altura a salvar ÷ altura de cada contrahuella.',
      hint: 'Trabaja todos los cálculos en las mismas unidades (metros).',
      fields: [
        { id: 'area', label: 'Área del ambiente', unit: 'm²', type: 'number', expect: 27, tol: 0.1, fb: '6,00 · 4,50 = 27 m².' },
        { id: 'per', label: 'Perímetro del ambiente', unit: 'm', type: 'number', expect: 21, tol: 0.1, fb: '2 · (6,00 + 4,50) = 21 m.' },
        { id: 'vol', label: 'Volumen del ambiente', unit: 'm³', type: 'number', expect: 75.6, tol: 0.3, fb: '27 m² · 2,80 m = 75,6 m³.' },
        { id: 'pared', label: 'Área de la pared mayor', unit: 'm²', type: 'number', expect: 16.8, tol: 0.2, fb: '6,00 · 2,80 = 16,8 m².' },
        { id: 'escalones', label: 'Número de contrahuellas (2,80 m entre 0,175 m)', unit: 'u', type: 'number', expect: 16, tol: 0, fb: '2,80 ÷ 0,175 = 16 contrahuellas.' }
      ],
      notes: [
        'Un buen diseño parte de un levantamiento correcto de dimensiones.',
        'La altura de contrahuella recomendada ronda los 17–18 cm.'
      ]
    }
  },
  {
    id: 'audiovisual-produccion',
    careerId: 'audiovisual',
    area: 'arte',
    titulo: 'Ordena la producción',
    subtitulo: 'Coloca cada etapa en su lugar',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'drag',
    objetivos: 5,
    xp: 115,
    estimadoMin: 12,
    rol: 'Realizadora/or audiovisual',
    contexto:
      'Vas a producir un cortometraje y necesitas ordenar las etapas del proceso de producción.',
    objetivo: 'Ordenar las fases de la producción audiovisual.',
    habilidades: ['Producción audiovisual', 'Organización', 'Planificación'],
    entregables: ['Cronograma de producción ordenado'],
    drag: {
      modo: 'ordenar',
      instruccion: 'Coloca cada actividad en la etapa que le corresponde.',
      slots: [
        { id: 'guion', label: 'Guion', icon: 'FileText' },
        { id: 'rodaje', label: 'Rodaje', icon: 'Video' },
        { id: 'montaje', label: 'Montaje', icon: 'SlidersHorizontal' },
        { id: 'sonido', label: 'Sonorización', icon: 'Megaphone' },
        { id: 'distrib', label: 'Distribución', icon: 'Globe' }
      ],
      items: [
        { id: 'i1', label: 'Escribir el guion y el storyboard', icon: 'FileText', correct: 'guion', pista: 'Todo empieza en el papel.' },
        { id: 'i2', label: 'Grabar las escenas con la cámara', icon: 'Video', correct: 'rodaje', pista: 'El rodaje captura las imágenes.' },
        { id: 'i3', label: 'Editar y unir los planos', icon: 'SlidersHorizontal', correct: 'montaje', pista: 'El montaje arma el relato.' },
        { id: 'i4', label: 'Añadir música y efectos', icon: 'Megaphone', correct: 'sonido', pista: 'La sonorización da atmósfera.' },
        { id: 'i5', label: 'Publicar y difundir la obra', icon: 'Globe', correct: 'distrib', pista: 'La distribución llega al público.' }
      ]
    }
  },
  {
    id: 'moda-prendas',
    careerId: 'moda',
    area: 'arte',
    titulo: 'Armario por temporada',
    subtitulo: 'Clasifica las prendas según la estación',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'drag',
    objetivos: 6,
    xp: 115,
    estimadoMin: 12,
    rol: 'Diseñadora/or de moda',
    contexto:
      'Estás organizando una colección cápsula y debes clasificar cada prenda según la temporada en la que se usa.',
    objetivo: 'Clasificar las prendas por temporada.',
    habilidades: ['Diseño de moda', 'Criterio de temporada', 'Curaduría'],
    entregables: ['Armario cápsula organizado'],
    drag: {
      modo: 'clasificar',
      instruccion: 'Arrastra cada prenda a la temporada que le corresponde.',
      slots: [
        { id: 'verano', label: 'Verano', icon: 'Flame' },
        { id: 'invierno', label: 'Invierno', icon: 'Droplet' },
        { id: 'entretiempo', label: 'Entretiempo', icon: 'Leaf' }
      ],
      items: [
        { id: 'i1', label: 'Polo de algodón manga corta', icon: 'Gift', correct: 'verano', pista: 'Tejido fresco para el calor.' },
        { id: 'i2', label: 'Sandalias', icon: 'Home', correct: 'verano', pista: 'Calzado abierto para el calor.' },
        { id: 'i3', label: 'Abrigo de lana', icon: 'Droplet', correct: 'invierno', pista: 'Abriga en el frío.' },
        { id: 'i4', label: 'Bufanda gruesa', icon: 'Heart', correct: 'invierno', pista: 'Protege del frío intenso.' },
        { id: 'i5', label: 'Casaca de cuero', icon: 'ShieldCheck', correct: 'entretiempo', pista: 'Abriga sin exceso en días templados.' },
        { id: 'i6', label: 'Chalina ligera', icon: 'Sparkles', correct: 'entretiempo', pista: 'Abrigo ligero para media estación.' }
      ]
    }
  },
  {
    id: 'derecho-despido',
    careerId: 'derecho',
    area: 'derecho',
    titulo: 'El despido sin causa',
    subtitulo: 'Analiza el caso y define la vía legal',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'decision',
    objetivos: 9,
    xp: 140,
    estimadoMin: 16,
    rol: 'Abogada/o laboral',
    contexto:
      'Un cliente llega porque lo despidieron sin explicación. Debes identificar los hechos relevantes y decidir la estrategia legal.',
    objetivo: 'Distinguir los hechos relevantes y determinar la vía jurídica adecuada.',
    habilidades: ['Análisis jurídico', 'Derecho laboral', 'Estrategia procesal'],
    entregables: ['Informe legal del caso', 'Estrategia de demanda'],
    decision: {
      brief: 'Selecciona los hechos con relevancia jurídica para el caso.',
      findings: [
        { id: 'f1', t: 'Lo despidieron sin carta de causa justa', key: true, fb: 'Es el eje del despido arbitrario.' },
        { id: 'f2', t: 'Trabajó 3 años de forma continua', key: true, fb: 'La antigüedad define la indemnización.' },
        { id: 'f3', t: 'No le pagaron su liquidación', key: true, fb: 'Genera una pretensión adicional.' },
        { id: 'f4', t: 'Existe contrato de trabajo firmado', key: true, fb: 'Prueba la relación laboral.' },
        { id: 'f5', t: 'El despido ocurrió hace 10 días', key: true, fb: 'Está dentro del plazo de caducidad.' },
        { id: 'f6', t: 'La empresa cambió de logo este año', key: false, fb: 'Irrelevante para el caso.' },
        { id: 'f7', t: 'El cliente vive lejos de la oficina', key: false, fb: 'Dato logístico, no jurídico.' },
        { id: 'f8', t: 'Al cliente le gusta el fútbol', key: false, fb: 'Sin relación con el despido.' }
      ],
      steps: [
        {
          q: '¿Cómo calificas el despido?',
          opts: [
            { t: 'Despido arbitrario, por no existir causa justa acreditada.', ok: true, fb: 'Sin causa justa, el despido es arbitrario.' },
            { t: 'Despido justificado, porque el empleador puede decidir.', ok: false, fb: 'El empleador no puede despedir libremente.' },
            { t: 'Renuncia tácita del trabajador.', ok: false, fb: 'No hubo renuncia.' }
          ]
        },
        {
          q: '¿Cuál es la vía adecuada?',
          opts: [
            { t: 'Demandar la indemnización por despido arbitrario y los beneficios impagos.', ok: true, fb: 'Pretensión principal y accesorias.' },
            { t: 'No hacer nada, ya que no hay contrato indefinido.', ok: false, fb: 'Existe contrato firmado.' },
            { t: 'Pedir solo una disculpa pública.', ok: false, fb: 'No protege los derechos del trabajador.' }
          ]
        },
        {
          q: '¿Qué aspecto del plazo valora?',
          opts: [
            { t: 'El despido ocurrió hace 10 días: aún está dentro del plazo de 30 días.', ok: true, fb: 'La demanda es oportuna.' },
            { t: 'El plazo ya venció.', ok: false, fb: 'Solo han pasado 10 días.' },
            { t: 'El plazo es de un año.', ok: false, fb: 'El plazo laboral suele ser de 30 días.' }
          ]
        },
        {
          q: '¿Qué solicitas finalmente?',
          opts: [
            { t: 'Indemnización, liquidación de beneficios sociales y costas.', ok: true, fb: 'Reclamación completa y coherente.' },
            { t: 'Solo la liquidación.', ok: false, fb: 'Deja fuera la indemnización.' },
            { t: 'Solo las costas del proceso.', ok: false, fb: 'Insuficiente.' }
          ]
        }
      ],
      debrief:
        'En un despido sin causa justa, el análisis jurídico identifica los hechos relevantes, califica el despido como arbitrario y reclama la indemnización y beneficios dentro de plazo. Caso académico simplificado.'
    }
  },
  {
    id: 'periodismo-noticia',
    careerId: 'periodismo',
    area: 'derecho',
    titulo: 'De la fuente a la portada',
    subtitulo: 'Ordena el proceso de una noticia',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'drag',
    objetivos: 5,
    xp: 115,
    estimadoMin: 12,
    rol: 'Periodista',
    contexto:
      'Debes cubrir una noticia y ordenar correctamente las etapas del trabajo periodístico antes de publicarla.',
    objetivo: 'Ordenar las fases de elaboración de una noticia.',
    habilidades: ['Redacción periodística', 'Verificación', 'Ética informativa'],
    entregables: ['Flujo de trabajo periodístico ordenado'],
    drag: {
      modo: 'ordenar',
      instruccion: 'Coloca cada tarea en la etapa del proceso que le corresponde.',
      slots: [
        { id: 'investigacion', label: 'Investigación', icon: 'Search' },
        { id: 'redaccion', label: 'Redacción', icon: 'PenTool' },
        { id: 'edicion', label: 'Edición', icon: 'Type' },
        { id: 'verificacion', label: 'Verificación', icon: 'ShieldCheck' },
        { id: 'publicacion', label: 'Publicación', icon: 'Globe' }
      ],
      items: [
        { id: 'i1', label: 'Recoger testimonios y datos', icon: 'Search', correct: 'investigacion', pista: 'Todo parte de las fuentes.' },
        { id: 'i2', label: 'Escribir el texto con la estructura de la noticia', icon: 'PenTool', correct: 'redaccion', pista: 'La pirámide invertida guía la redacción.' },
        { id: 'i3', label: 'Corregir estilo y titulares', icon: 'Type', correct: 'edicion', pista: 'La edición pule el texto.' },
        { id: 'i4', label: 'Comprobar datos y fuentes', icon: 'ShieldCheck', correct: 'verificacion', pista: 'Sin verificación no hay rigor.' },
        { id: 'i5', label: 'Difundir la noticia al público', icon: 'Globe', correct: 'publicacion', pista: 'La publicación cierra el ciclo.' }
      ]
    }
  },
  {
    id: 'comunicacion-modelo',
    careerId: 'comunicacion',
    area: 'derecho',
    titulo: 'Las piezas del mensaje',
    subtitulo: 'Relaciona cada elemento de la comunicación',
    nivel: 'inicial',
    dificultad: 1,
    tier: 'free',
    engine: 'match',
    objetivos: 6,
    xp: 110,
    estimadoMin: 12,
    rol: 'Comunicadora/or social',
    contexto:
      'En clase de teoría de la comunicación te piden identificar los elementos del proceso comunicativo en un ejemplo real.',
    objetivo: 'Emparejar cada elemento de la comunicación con su definición.',
    habilidades: ['Teoría de la comunicación', 'Análisis de mensajes'],
    entregables: ['Esquema del proceso comunicativo'],
    match: {
      brief: 'Une cada elemento con su definición.',
      leftLabel: 'Elemento',
      rightLabel: 'Definición',
      pairs: [
        { id: 'p1', left: 'Emisor', right: 'Quien construye y envía el mensaje', fb: 'El emisor inicia la comunicación.' },
        { id: 'p2', left: 'Mensaje', right: 'Contenido que se transmite', fb: 'Es la información en sí.' },
        { id: 'p3', left: 'Canal', right: 'Medio por el que viaja el mensaje', fb: 'El canal transporta el mensaje.' },
        { id: 'p4', left: 'Ruido', right: 'Interferencia que distorsiona la comunicación', fb: 'El ruido altera la recepción.' },
        { id: 'p5', left: 'Retroalimentación', right: 'Respuesta del receptor', fb: 'Cierra el circuito comunicativo.' },
        { id: 'p6', left: 'Audiencia', right: 'Público al que se dirige', fb: 'El mensaje se adapta a la audiencia.' }
      ]
    }
  },
  {
    id: 'relaciones-tratado',
    careerId: 'relaciones',
    area: 'derecho',
    titulo: 'Negociar un tratado',
    subtitulo: 'Analiza intereses y define la estrategia diplomática',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'decision',
    objetivos: 9,
    xp: 140,
    estimadoMin: 16,
    rol: 'Analista de relaciones internacionales',
    contexto:
      'Dos países negocian un tratado comercial. Representas a una de las delegaciones y debes preparar la estrategia de negociación.',
    objetivo: 'Identificar los intereses en juego y definir la estrategia diplomática.',
    habilidades: ['Negociación internacional', 'Análisis de intereses', 'Diplomacia'],
    entregables: ['Agenda de negociación', 'Estrategia de acuerdos'],
    decision: {
      brief: 'Selecciona los factores relevantes para la negociación.',
      findings: [
        { id: 'f1', t: 'Existe un conflicto por aranceles a productos agrícolas', key: true, fb: 'Es el punto principal de fricción.' },
        { id: 'f2', t: 'Ambas partes dependen del comercio bilateral', key: true, fb: 'Interdependencia: hay margen para el acuerdo.' },
        { id: 'f3', t: 'El plazo de negociación es de 90 días', key: true, fb: 'El plazo condiciona la estrategia.' },
        { id: 'f4', t: 'Un organismo internacional ofrece mediación', key: true, fb: 'La facilitación puede destrabar la negociación.' },
        { id: 'f5', t: 'La opinión pública presiona por un acuerdo', key: true, fb: 'Presión política sobre ambas delegaciones.' },
        { id: 'f6', t: 'Los equipos usan el mismo color de corbata', key: false, fb: 'Sin relevancia.' },
        { id: 'f7', t: 'El país A ganó un partido de fútbol', key: false, fb: 'Dato sin impacto en la negociación.' },
        { id: 'f8', t: 'La sede de la reunión tiene 20 pisos', key: false, fb: 'Irrelevante.' }
      ],
      steps: [
        {
          q: '¿Cómo preparas la negociación?',
          opts: [
            { t: 'Identificar los intereses de fondo de cada parte, más allá de las posiciones.', ok: true, fb: 'Negociar por intereses abre acuerdos.' },
            { t: 'Fijar una posición y no moverla.', ok: false, fb: 'La rigidez suele llevar al fracaso.' },
            { t: 'Improvisar según cómo vaya la reunión.', ok: false, fb: 'La diplomacia exige preparación.' }
          ]
        },
        {
          q: '¿Qué estrategia adoptas ante el conflicto arancelario?',
          opts: [
            { t: 'Buscar acuerdos mutuamente beneficiosos con concesiones recíprocas.', ok: true, fb: 'El enfoque ganar-ganar sostenible.' },
            { t: 'Amenazar con represalias inmediatas.', ok: false, fb: 'Escala el conflicto y cierra puertas.' },
            { t: 'Ceder en todo para no confrontar.', ok: false, fb: 'Debilita la posición propia.' }
          ]
        },
        {
          q: '¿Cómo usas la mediación ofrecida?',
          opts: [
            { t: 'Aceptar la facilitación para destrabar los puntos críticos.', ok: true, fb: 'Un tercero neutral ayuda a acercar posiciones.' },
            { t: 'Rechazarla por orgullo nacional.', ok: false, fb: 'Desaprovecha una herramienta útil.' },
            { t: 'Delegar toda la negociación al mediador.', ok: false, fb: 'La responsabilidad sigue siendo de las partes.' }
          ]
        },
        {
          q: '¿Qué buscas en el resultado?',
          opts: [
            { t: 'Un acuerdo equilibrado con mecanismos de seguimiento.', ok: true, fb: 'Los acuerdos necesitan verificación y continuidad.' },
            { t: 'Un acuerdo vago sin plazos.', ok: false, fb: 'Sin seguimiento no se cumple.' },
            { t: 'Ganar a toda costa.', ok: false, fb: 'Puede romper la relación bilateral.' }
          ]
        }
      ],
      debrief:
        'La negociación internacional parte de los intereses, no de las posiciones; la interdependencia y la mediación facilitan acuerdos equilibrados y verificables. Caso académico ficticio.'
    }
  }
,
  {
    id: 'agronomia-fertilizacion',
    careerId: 'agronomia',
    area: 'naturaleza',
    titulo: 'Fertilizar la parcela',
    subtitulo: 'Calcula la dosis de urea y la producción',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'worksheet',
    objetivos: 5,
    xp: 130,
    estimadoMin: 16,
    rol: 'Ingeniera/o agrónoma/o',
    contexto:
      'Debes fertilizar una parcela de 2 ha con una dosis de 120 kg de nitrógeno por hectárea, usando urea (46 % de nitrógeno). Además, estimarás la cosecha.',
    objetivo: 'Calcular el nitrógeno, la urea, los sacos y la producción esperada.',
    habilidades: ['Nutrición vegetal', 'Cálculo de dosis', 'Planificación agrícola'],
    entregables: ['Hoja de fertilización completada'],
    worksheet: {
      brief:
        'Nitrógeno total = dosis · superficie. Urea necesaria = nitrógeno ÷ 0,46. Los sacos se redondean hacia arriba. La producción = rendimiento · superficie.',
      hint: 'Ojo: la urea no es 100 % nitrógeno, solo el 46 %.',
      fields: [
        { id: 'n', label: 'Nitrógeno total necesario', unit: 'kg', type: 'number', expect: 240, tol: 2, fb: '120 kg/ha · 2 ha = 240 kg.' },
        { id: 'urea', label: 'Urea necesaria', unit: 'kg', type: 'number', expect: 522, tol: 5, fb: '240 ÷ 0,46 = 521,7 ≈ 522 kg.' },
        { id: 'sacos', label: 'Sacos de 50 kg (redondeando hacia arriba)', unit: 'u', type: 'number', expect: 11, tol: 0, fb: '522 ÷ 50 = 10,44 → 11 sacos.' },
        { id: 'semilla', label: 'Semilla para 2 ha (densidad 100 kg/ha)', unit: 'kg', type: 'number', expect: 200, tol: 1, fb: '100 kg/ha · 2 ha = 200 kg.' },
        { id: 'prod', label: 'Producción esperada (rendimiento 8 t/ha)', unit: 't', type: 'number', expect: 16, tol: 0.2, fb: '8 t/ha · 2 ha = 16 t.' }
      ],
      notes: [
        'La urea concentra el nitrógeno en un 46 %: hay que ajustar la cantidad según su pureza.',
        'El número de sacos siempre se redondea hacia arriba para no quedar cortos.'
      ]
    }
  },
  {
    id: 'ambiental-presupuesto',
    careerId: 'ambiental',
    area: 'naturaleza',
    titulo: 'Invertir en el ambiente',
    subtitulo: 'Reparte el presupuesto de gestión ambiental',
    nivel: 'avanzado',
    dificultad: 3,
    tier: 'free',
    engine: 'allocate',
    objetivos: 5,
    xp: 145,
    estimadoMin: 14,
    rol: 'Ingeniera/o ambiental',
    contexto:
      'Gestionas el presupuesto ambiental de una región y debes repartirlo entre los programas que reducen el mayor impacto.',
    objetivo: 'Asignar todo el presupuesto respetando los rangos de cada programa.',
    habilidades: ['Gestión ambiental', 'Priorización', 'Planificación'],
    entregables: ['Plan de inversión ambiental'],
    allocate: {
      recurso: 'Presupuesto ambiental (millones)',
      total: 100,
      step: 5,
      brief: 'Distribuye los 100 millones entre los programas ambientales según su impacto y urgencia.',
      hint: 'Residuos y aire suelen tener el impacto más inmediato en la salud de la población.',
      partidas: [
        { id: 'a1', label: 'Tratamiento de residuos sólidos', detalle: 'Rellenos sanitarios y reciclaje', min: 20, max: 35, fb: 'Sin gestión de residuos, el impacto sanitario es inmediato.' },
        { id: 'a2', label: 'Calidad del aire', detalle: 'Control de emisiones', min: 15, max: 30, fb: 'La contaminación del aire afecta la salud respiratoria.' },
        { id: 'a3', label: 'Conservación de bosques', detalle: 'Reforestación y áreas protegidas', min: 15, max: 30, fb: 'Los bosques capturan carbono y protegen cuencas.' },
        { id: 'a4', label: 'Educación ambiental', detalle: 'Campañas y concienciación', min: 5, max: 15, fb: 'El cambio de hábitos previene el problema en la fuente.' },
        { id: 'a5', label: 'Monitoreo y fiscalización', detalle: 'Vigilancia y control', min: 5, max: 15, fb: 'Lo que no se mide no se controla.' }
      ],
      notes: [
        'La gestión ambiental prioriza el impacto sobre la población y los ecosistemas.',
        'Prevenir suele ser más económico que remediar el daño ambiental.'
      ]
    }
  },
  {
    id: 'veterinaria-paciente',
    careerId: 'veterinaria',
    area: 'naturaleza',
    titulo: 'El paciente que no come',
    subtitulo: 'Valora los signos y define el tratamiento',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'decision',
    objetivos: 9,
    xp: 135,
    estimadoMin: 15,
    rol: 'Médica/o veterinaria/o',
    contexto:
      'Llega a la consulta un perro de 3 años con vómitos y decaimiento desde ayer. Debes valorar los hallazgos y decidir el manejo.',
    objetivo: 'Identificar los signos relevantes y determinar el manejo clínico.',
    habilidades: ['Examen clínico', 'Diagnóstico veterinario', 'Manejo de pacientes'],
    entregables: ['Ficha de valoración', 'Plan de tratamiento'],
    decision: {
      brief: 'Selecciona los hallazgos relevantes para el cuadro clínico.',
      findings: [
        { id: 'f1', t: 'Vómitos frecuentes desde ayer', key: true, fb: 'Síntoma digestivo principal.' },
        { id: 'f2', t: 'Ingirió basura en el parque', key: true, fb: 'Posible causa del cuadro.' },
        { id: 'f3', t: 'Mucosas secas (deshidratación leve)', key: true, fb: 'Hay pérdida de líquidos.' },
        { id: 'f4', t: 'Temperatura 39,5 °C', key: true, fb: 'Febrícula; hay que interpretarla con el resto.' },
        { id: 'f5', t: 'Abdomen doloroso a la palpación', key: true, fb: 'Sugiere compromiso abdominal.' },
        { id: 'f6', t: 'Es de raza labrador', key: false, fb: 'Dato no decisivo aquí.' },
        { id: 'f7', t: 'El dueño vive en un segundo piso', key: false, fb: 'Sin relevancia clínica.' },
        { id: 'f8', t: 'Le gusta correr en el parque', key: false, fb: 'Anécdota, no signo clínico.' }
      ],
      steps: [
        {
          q: '¿Cuál es tu primera acción?',
          opts: [
            { t: 'Estabilizar y corregir la deshidratación con fluidoterapia.', ok: true, fb: 'Primero se estabiliza al paciente.' },
            { t: 'Operar de inmediato sin exámenes.', ok: false, fb: 'Decisión apresurada y riesgosa.' },
            { t: 'Dar de alta con una dieta blanda.', ok: false, fb: 'No se ha evaluado la causa.' }
          ]
        },
        {
          q: '¿Qué exámenes pides?',
          opts: [
            { t: 'Radiografía o ecografía abdominal y análisis de laboratorio.', ok: true, fb: 'Descartan cuerpo extraño y evalúan el estado general.' },
            { t: 'Ninguno, con la palpación basta.', ok: false, fb: 'Insuficiente para diagnosticar.' },
            { t: 'Solo medir la temperatura otra vez.', ok: false, fb: 'No aporta al diagnóstico.' }
          ]
        },
        {
          q: '¿Cuál es el diagnóstico presuntivo más probable?',
          opts: [
            { t: 'Gastroenteritis, con posible cuerpo extraño.', ok: true, fb: 'Encaja con la ingestión de basura y los signos.' },
            { t: 'Fractura de pata.', ok: false, fb: 'No hay cojera ni traumatismo.' },
            { t: 'Alergia cutánea.', ok: false, fb: 'No hay signos en la piel.' }
          ]
        },
        {
          q: '¿Cómo lo manejas?',
          opts: [
            { t: 'Dieta blanda, antiemético, hidratación y control a las 24 horas.', ok: true, fb: 'Manejo sintomático con seguimiento.' },
            { t: 'Alta inmediata sin tratamiento.', ok: false, fb: 'El paciente necesita tratamiento.' },
            { t: 'Medicación sin revaluación.', ok: false, fb: 'El seguimiento es imprescindible.' }
          ]
        }
      ],
      debrief:
        'En la consulta veterinaria se combinan anamnesis, examen físico y pruebas complementarias. Primero se estabiliza, luego se diagnostica y se establece un plan con seguimiento. Caso académico.'
    }
  },
  {
    id: 'biologia-marina-censo',
    careerId: 'biologia-marina',
    area: 'naturaleza',
    titulo: 'Censar una población marina',
    subtitulo: 'Estima la población y calcula parámetros',
    nivel: 'intermedio',
    dificultad: 2,
    tier: 'free',
    engine: 'worksheet',
    objetivos: 5,
    xp: 130,
    estimadoMin: 16,
    rol: 'Bióloga/o marina/o',
    contexto:
      'Estás estudiando una población de peces. Marcaste 40 individuos y, en una segunda captura de 50, encontraste 8 marcados. También registras parámetros del agua.',
    objetivo: 'Estimar la población con el método de captura-recaptura y calcular parámetros del agua.',
    habilidades: ['Muestreo', 'Estimación poblacional', 'Análisis de datos'],
    entregables: ['Hoja de campo completada'],
    worksheet: {
      brief:
        'Método Lincoln-Petersen: N = (M · C) ÷ R, donde M son los marcados, C los capturados y R los recapturados marcados. La biomasa = población · peso medio.',
      hint: 'Aplica la fórmula con M = 40, C = 50 y R = 8.',
      fields: [
        { id: 'pob', label: 'Población estimada (captura-recaptura)', unit: 'individuos', type: 'number', expect: 250, tol: 3, fb: '(40 · 50) ÷ 8 = 250 individuos.' },
        { id: 'biomasa', label: 'Biomasa estimada (peso medio 2 kg)', unit: 'kg', type: 'number', expect: 500, tol: 6, fb: '250 · 2 kg = 500 kg.' },
        { id: 'temp', label: 'Temperatura media del agua (20, 22, 18 °C)', unit: '°C', type: 'number', expect: 20, tol: 0.1, fb: '(20+22+18) ÷ 3 = 20 °C.' },
        { id: 'sal', label: 'Salinidad media (34, 36, 35)', unit: 'psu', type: 'number', expect: 35, tol: 0.1, fb: '(34+36+35) ÷ 3 = 35 psu.' },
        { id: 'oxi', label: 'Oxígeno disuelto medio (6, 8, 7 mg/L)', unit: 'mg/L', type: 'number', expect: 7, tol: 0.1, fb: '(6+8+7) ÷ 3 = 7 mg/L.' }
      ],
      notes: [
        'El método de captura-recaptura asume que la población está mezclada y que marcar no afecta a los individuos.',
        'La temperatura, la salinidad y el oxígeno disuelto son indicadores básicos de la calidad del agua.'
      ]
    }
  }
];

// Solo quedan una misión gratuita en Ingeniería de Software y otra en Medicina.
// El resto de misiones requiere Premium.
const FREE_MISSION_IDS = new Set(['ing-software-carrito', 'medicina-abdomen']);
for (const mission of MISSIONS) {
  mission.tier = FREE_MISSION_IDS.has(mission.id) ? 'free' : 'premium';
}

/* --------------------------- video "cómo se resuelve" ---------------------------
   Video corto por misión que se muestra ANTES de empezar y explica, paso a
   paso, cómo resolver el reto. Usa la URL de inserción (embed) de YouTube:
     'https://www.youtube.com/embed/VIDEO_ID'
   Deja el valor en '' mientras no haya video: la sección no se mostrará.
   También se pueden pegar/editar estos enlaces desde el panel de administración
   (Catálogo → Misiones → Video cómo se resuelve). */
export const MISSION_VIDEOS = {
  'ing-software-carrito': '',
  'ing-software-claves': '',
  'medicina-abdomen': '',
  'medicina-torax': '',
  'enfermeria-postop': '',
  'psicologia-entrevista': '',
  'nutricion-deportista': '',
  'ing-industrial-lote': '',
  'ing-civil-viga': '',
  'mecatronica-sensor': '',
  'biologia-celula': '',
  'quimica-disolucion': '',
  'matematica-mcd': '',
  'fisica-proyectil': '',
  'administracion-presupuesto': '',
  'contabilidad-resultados': '',
  'marketing-campana': '',
  'economia-gasto-publico': '',
  'educacion-sesion': '',
  'trabajo-social-familia': '',
  'sociologia-encuesta': '',
  'turismo-destinos': '',
  'diseno-grafico-principios': '',
  'arquitectura-ambiente': '',
  'audiovisual-produccion': '',
  'moda-prendas': '',
  'derecho-despido': '',
  'periodismo-noticia': '',
  'comunicacion-modelo': '',
  'relaciones-tratado': '',
  'agronomia-fertilizacion': '',
  'ambiental-presupuesto': '',
  'veterinaria-paciente': '',
  'biologia-marina-censo': ''
};
for (const mission of MISSIONS) {
  if (MISSION_VIDEOS[mission.id]) mission.video = MISSION_VIDEOS[mission.id];
}

export const MISSION_BY_ID = (id) => MISSIONS.find((m) => m.id === id);
