export const ADMISSION_AREAS = [
  { id: 'razonamiento', label: 'Razonamiento matemático', icon: 'Brain' },
  { id: 'matematica', label: 'Matemática', icon: 'Calculator' },
  { id: 'comunicacion', label: 'Comunicación', icon: 'BookOpen' },
  { id: 'ciencias', label: 'Ciencias', icon: 'FlaskConical' },
  { id: 'historia', label: 'Historia y actualidad', icon: 'Landmark' },
  { id: 'verbal', label: 'Aptitud verbal', icon: 'MessageCircle' }
];

export const ADMISSION_QUESTIONS = [
  {
    id: 'rm-1',
    area: 'razonamiento',
    uni: 'UNI',
    nivel: 'Básico',
    q: 'Si 3 obreros construyen 12 metros de muro en 4 días, ¿cuántos metros construirán 5 obreros en 6 días?',
    options: ['20 m', '25 m', '30 m', '36 m'],
    answer: 2,
    why: 'El rendimiento es 1 m por obrero por día. Entonces 5 × 6 × 1 = 30 metros.'
  },
  {
    id: 'rm-2',
    area: 'razonamiento',
    uni: 'UNMSM',
    nivel: 'Básico',
    q: 'Completa la secuencia: 2, 6, 12, 20, 30, ...',
    options: ['36', '40', '42', '44'],
    answer: 2,
    why: 'Las diferencias son 4, 6, 8, 10 y 12. Por eso el siguiente término es 30 + 12 = 42.'
  },
  {
    id: 'rm-3',
    area: 'razonamiento',
    uni: 'PUCP',
    nivel: 'Intermedio',
    q: 'Un producto cuesta S/ 80. Se aplica un descuento de 25% y luego se agrega IGV de 18%. ¿Cuál es el precio final?',
    options: ['S/ 70.80', 'S/ 72.00', 'S/ 75.00', 'S/ 76.80'],
    answer: 0,
    why: '80 × 0.75 = 60. Luego 60 × 1.18 = 70.80.'
  },
  {
    id: 'rm-4',
    area: 'razonamiento',
    uni: 'UNI',
    nivel: 'Básico',
    q: 'Si hoy es martes, ¿qué día de la semana será dentro de 100 días?',
    options: ['Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    answer: 1,
    why: '100 entre 7 deja residuo 2. Dos días después del martes es jueves.'
  },
  {
    id: 'rm-5',
    area: 'razonamiento',
    uni: 'UNMSM',
    nivel: 'Básico',
    q: '¿Cuál es el mínimo común múltiplo de 12 y 18?',
    options: ['24', '36', '48', '72'],
    answer: 1,
    why: '12 = 2² × 3 y 18 = 2 × 3². El MCM toma los mayores exponentes: 2² × 3² = 36.'
  },
  {
    id: 'rm-6',
    area: 'razonamiento',
    uni: 'PUCP',
    nivel: 'Básico',
    q: 'Las notas de un estudiante son 14, 16, 18 y 20. ¿Cuál es su promedio?',
    options: ['16', '17', '18', '19'],
    answer: 1,
    why: 'La suma es 68 y al dividir entre 4 se obtiene 17.'
  },
  {
    id: 'mat-1',
    area: 'matematica',
    uni: 'UNI',
    nivel: 'Básico',
    q: 'Resuelve la ecuación 2x + 5 = 17.',
    options: ['4', '5', '6', '7'],
    answer: 2,
    why: '2x = 17 − 5 = 12, por lo tanto x = 6.'
  },
  {
    id: 'mat-2',
    area: 'matematica',
    uni: 'UNMSM',
    nivel: 'Básico',
    q: '¿Cuáles son las soluciones de x² − 9 = 0?',
    options: ['Solo 3', 'Solo −3', '3 y −3', '9 y −9'],
    answer: 2,
    why: 'x² = 9, entonces x = 3 o x = −3.'
  },
  {
    id: 'mat-3',
    area: 'matematica',
    uni: 'PUCP',
    nivel: 'Básico',
    q: 'Un triángulo tiene base 10 cm y altura 6 cm. ¿Cuál es su área?',
    options: ['30 cm²', '60 cm²', '16 cm²', '80 cm²'],
    answer: 0,
    why: 'El área del triángulo es base × altura ÷ 2 = 10 × 6 ÷ 2 = 30 cm².'
  },
  {
    id: 'mat-4',
    area: 'matematica',
    uni: 'UNI',
    nivel: 'Intermedio',
    q: '¿Cuál es el valor de log₂ 32?',
    options: ['4', '5', '6', '8'],
    answer: 1,
    why: '2⁵ = 32, por lo tanto log₂ 32 = 5.'
  },
  {
    id: 'mat-5',
    area: 'matematica',
    uni: 'UNMSM',
    nivel: 'Básico',
    q: 'Al lanzar un dado justo de seis caras, ¿cuál es la probabilidad de obtener un número par?',
    options: ['1/6', '1/3', '1/2', '2/3'],
    answer: 2,
    why: 'Hay 3 resultados pares (2, 4, 6) de 6 posibles: 3/6 = 1/2.'
  },
  {
    id: 'mat-6',
    area: 'matematica',
    uni: 'PUCP',
    nivel: 'Intermedio',
    q: '¿Cuál es la derivada de f(x) = 3x²?',
    options: ['3x', '6x', 'x²', '6'],
    answer: 1,
    why: 'Aplicando la regla de la potencia: 3 × 2x = 6x.'
  },
  {
    id: 'com-1',
    area: 'comunicacion',
    uni: 'UNMSM',
    nivel: 'Básico',
    q: 'En la oración “Los estudiantes leyeron el libro”, ¿cuál es el sujeto?',
    options: ['El libro', 'Leyeron', 'Los estudiantes', 'Estudiantes leyeron'],
    answer: 2,
    why: 'El sujeto es quien realiza la acción: “Los estudiantes”. “El libro” es el objeto directo.'
  },
  {
    id: 'com-2',
    area: 'comunicacion',
    uni: 'PUCP',
    nivel: 'Básico',
    q: '¿Cuál es el sinónimo de “efímero”?',
    options: ['Duradero', 'Pasajero', 'Intenso', 'Antiguo'],
    answer: 1,
    why: 'Efímero significa que dura poco; su sinónimo más cercano es pasajero.'
  },
  {
    id: 'com-3',
    area: 'comunicacion',
    uni: 'UNI',
    nivel: 'Básico',
    q: '¿Cuál es el antónimo de “cauto”?',
    options: ['Prudente', 'Cuidadoso', 'Imprudente', 'Reservado'],
    answer: 2,
    why: 'Cauto significa prudente. Su antónimo es imprudente.'
  },
  {
    id: 'com-4',
    area: 'comunicacion',
    uni: 'UNMSM',
    nivel: 'Intermedio',
    q: 'En la oración “Aunque llovía, salimos a caminar”, la palabra “aunque” introduce una idea de:',
    options: ['Causa', 'Consecuencia', 'Concesión', 'Condición'],
    answer: 2,
    why: '“Aunque” expresa una objeción o dificultad que no impide la acción principal: es un conector concesivo.'
  },
  {
    id: 'com-5',
    area: 'comunicacion',
    uni: 'PUCP',
    nivel: 'Básico',
    q: 'Completa correctamente: “___ llegó tarde a la entrevista”.',
    options: ['El', 'Él', 'él', 'Èl'],
    answer: 1,
    why: '“Él” es pronombre personal y lleva tilde. “El” es artículo y no lleva tilde.'
  },
  {
    id: 'com-6',
    area: 'comunicacion',
    uni: 'UNI',
    nivel: 'Básico',
    q: '¿Qué figura literaria aparece en “sus ojos eran dos luceros”?',
    options: ['Hipérbole', 'Metáfora', 'Personificación', 'Aliteración'],
    answer: 1,
    why: 'Se identifica los ojos con luceros sin usar “como”; es una metáfora.'
  },
  {
    id: 'cie-1',
    area: 'ciencias',
    uni: 'UNMSM',
    nivel: 'Básico',
    q: '¿Qué orgánulo celular es responsable de la respiración celular y la producción de ATP?',
    options: ['Ribosoma', 'Mitocondria', 'Núcleo', 'Lisosoma'],
    answer: 1,
    why: 'La mitocondria produce la mayor parte del ATP mediante respiración celular.'
  },
  {
    id: 'cie-2',
    area: 'ciencias',
    uni: 'UNI',
    nivel: 'Básico',
    q: '¿Cuál es la fórmula química del agua?',
    options: ['CO₂', 'H₂O', 'O₂', 'NaCl'],
    answer: 1,
    why: 'El agua está formada por dos átomos de hidrógeno y uno de oxígeno: H₂O.'
  },
  {
    id: 'cie-3',
    area: 'ciencias',
    uni: 'PUCP',
    nivel: 'Básico',
    q: '¿Qué ley de Newton explica que a toda acción le corresponde una reacción de igual magnitud y sentido opuesto?',
    options: ['Primera ley', 'Segunda ley', 'Tercera ley', 'Ley de gravitación'],
    answer: 2,
    why: 'La tercera ley de Newton es el principio de acción y reacción.'
  },
  {
    id: 'cie-4',
    area: 'ciencias',
    uni: 'UNI',
    nivel: 'Básico',
    q: '¿Cuál es la unidad de fuerza en el Sistema Internacional?',
    options: ['Joule', 'Watt', 'Newton', 'Pascal'],
    answer: 2,
    why: 'La unidad de fuerza en el SI es el newton (N).'
  },
  {
    id: 'cie-5',
    area: 'ciencias',
    uni: 'UNMSM',
    nivel: 'Básico',
    q: '¿Qué gas captan las plantas para realizar la fotosíntesis?',
    options: ['Oxígeno', 'Nitrógeno', 'Dióxido de carbono', 'Hidrógeno'],
    answer: 2,
    why: 'Las plantas usan CO₂ y agua para producir glucosa y liberar oxígeno.'
  },
  {
    id: 'cie-6',
    area: 'ciencias',
    uni: 'PUCP',
    nivel: 'Básico',
    q: 'Una sustancia con pH menor a 7 se clasifica como:',
    options: ['Básica', 'Neutra', 'Ácida', 'Salina'],
    answer: 2,
    why: 'La escala de pH va de 0 a 14. Menos de 7 indica acidez; 7 es neutro.'
  },
  {
    id: 'his-1',
    area: 'historia',
    uni: 'UNMSM',
    nivel: 'Básico',
    q: '¿Qué cultura prehispánica construyó Machu Picchu?',
    options: ['Moche', 'Nazca', 'Inca', 'Chavín'],
    answer: 2,
    why: 'Machu Picchu fue construida durante el imperio Inca, probablemente en el siglo XV.'
  },
  {
    id: 'his-2',
    area: 'historia',
    uni: 'UNI',
    nivel: 'Básico',
    q: '¿En qué año se proclamó la independencia del Perú?',
    options: ['1820', '1821', '1824', '1826'],
    answer: 1,
    why: 'José de San Martín proclamó la independencia del Perú el 28 de julio de 1821.'
  },
  {
    id: 'his-3',
    area: 'historia',
    uni: 'PUCP',
    nivel: 'Intermedio',
    q: '¿Qué héroe peruano lideró la resistencia en la campaña de La Breña y combatió en Huamachuco?',
    options: ['Miguel Grau', 'Francisco Bolognesi', 'Andrés Avelino Cáceres', 'Túpac Amaru II'],
    answer: 2,
    why: 'Andrés Avelino Cáceres organizó la resistencia en La Breña durante la Guerra del Pacífico.'
  },
  {
    id: 'his-4',
    area: 'historia',
    uni: 'UNMSM',
    nivel: 'Básico',
    q: '¿Cuál es el río más caudaloso del Perú?',
    options: ['Ucayali', 'Marañón', 'Amazonas', 'Mantaro'],
    answer: 2,
    why: 'El Amazonas es el río más caudaloso del Perú y del mundo.'
  },
  {
    id: 'his-5',
    area: 'historia',
    uni: 'UNI',
    nivel: 'Básico',
    q: '¿Cuál es la región natural más extensa del territorio peruano?',
    options: ['Costa', 'Sierra', 'Selva', 'Puna'],
    answer: 2,
    why: 'La selva o Amazonía ocupa la mayor parte del territorio peruano.'
  },
  {
    id: 'his-6',
    area: 'historia',
    uni: 'PUCP',
    nivel: 'Actualidad',
    q: '¿Qué organismo internacional lidera la coordinación sanitaria global y declaró la emergencia por COVID-19?',
    options: ['OEA', 'OMS', 'UNESCO', 'FMI'],
    answer: 1,
    why: 'La Organización Mundial de la Salud (OMS) coordina la respuesta sanitaria internacional.'
  },
  {
    id: 'ver-1',
    area: 'verbal',
    uni: 'UNMSM',
    nivel: 'Básico',
    q: 'Completa la analogía: libro es a leer como música es a...',
    options: ['Componer', 'Escuchar', 'Bailar', 'Cantar'],
    answer: 1,
    why: 'La relación es objeto → acción habitual: un libro se lee y la música se escucha.'
  },
  {
    id: 'ver-2',
    area: 'verbal',
    uni: 'PUCP',
    nivel: 'Básico',
    q: '¿Qué palabra no pertenece al grupo: rojo, azul, verde, mesa?',
    options: ['Rojo', 'Azul', 'Verde', 'Mesa'],
    answer: 3,
    why: 'Rojo, azul y verde son colores; mesa es un objeto.'
  },
  {
    id: 'ver-3',
    area: 'verbal',
    uni: 'UNI',
    nivel: 'Intermedio',
    q: '¿Cuál es la forma correcta de la oración?',
    options: ['Hubieron muchos problemas.', 'Hubo muchos problemas.', 'Habían muchos problemas.', 'Haber muchos problemas.'],
    answer: 1,
    why: '“Hubo” es impersonal y se usa en singular aunque el complemento sea plural.'
  },
  {
    id: 'ver-4',
    area: 'verbal',
    uni: 'UNMSM',
    nivel: 'Básico',
    q: '¿Cuál es el significado más cercano de “inferir”?',
    options: ['Deducir', 'Afirmar', 'Negar', 'Repetir'],
    answer: 0,
    why: 'Inferir es obtener una conclusión a partir de indicios o información previa.'
  },
  {
    id: 'ver-5',
    area: 'verbal',
    uni: 'PUCP',
    nivel: 'Básico',
    q: 'Completa: “El estudio es a la universidad como el trabajo es a la ___”.',
    options: ['Escuela', 'Empresa', 'Casa', 'Calle'],
    answer: 1,
    why: 'La universidad es el espacio donde se estudia; la empresa es el espacio donde se trabaja.'
  },
  {
    id: 'ver-6',
    area: 'verbal',
    uni: 'UNI',
    nivel: 'Básico',
    q: 'Completa el refrán: “No por mucho madrugar...”.',
    options: ['...se llega más lejos.', '...amanece más temprano.', '...se gana más dinero.', '...se descansa mejor.'],
    answer: 1,
    why: 'El refrán completo es “No por mucho madrugar amanece más temprano”.'
  }
];

export const REAL_EXAMS = [
  {
    id: 'uni-2021-1',
    uni: 'UNI',
    year: '2021',
    title: 'Solucionario oficial Admisión UNI 2021-1',
    tipo: 'Solucionario oficial',
    url: 'https://www.admision.uni.edu.pe/wp-content/uploads/2022/11/solucionario2021.pdf',
    note: 'Examen y solucionario publicado por la Dirección de Admisión de la UNI.'
  },
  {
    id: 'uni-2020-1',
    uni: 'UNI',
    year: '2020',
    title: 'Solucionario oficial Admisión UNI 2020-1',
    tipo: 'Solucionario oficial',
    url: 'https://www.admision.uni.edu.pe/wp-content/uploads/2022/11/solucionario2020.pdf',
    note: 'Preguntas oficiales con resolución, útil para medir tu nivel real.'
  },
  {
    id: 'uni-2019-2',
    uni: 'UNI',
    year: '2019',
    title: 'Solucionario oficial Admisión UNI 2019-2',
    tipo: 'Solucionario oficial',
    url: 'https://www.admision.uni.edu.pe/wp-content/uploads/2022/11/solucionario20192.pdf',
    note: 'Prueba de admisión UNI con solucionario oficial.'
  },
  {
    id: 'uni-2019-1',
    uni: 'UNI',
    year: '2019',
    title: 'Solucionario oficial Admisión UNI 2019-1',
    tipo: 'Solucionario oficial',
    url: 'https://www.admision.uni.edu.pe/wp-content/uploads/2022/11/solucionario2019.pdf',
    note: 'Examen oficial y claves de respuesta de la UNI.'
  },
  {
    id: 'uni-2018-2',
    uni: 'UNI',
    year: '2018',
    title: 'Solucionario oficial Admisión UNI 2018-2',
    tipo: 'Solucionario oficial',
    url: 'https://www.admision.uni.edu.pe/wp-content/uploads/2022/11/solucionario20182.pdf',
    note: 'Material oficial para práctica cronometrada.'
  },
  {
    id: 'uni-2018-1',
    uni: 'UNI',
    year: '2018',
    title: 'Solucionario oficial Admisión UNI 2018-1',
    tipo: 'Solucionario oficial',
    url: 'https://www.admision.uni.edu.pe/wp-content/uploads/2022/11/solucionario2018.pdf',
    note: 'Examen oficial con soluciones de la Dirección de Admisión.'
  },
  {
    id: 'uni-2017-2',
    uni: 'UNI',
    year: '2017',
    title: 'Solucionario oficial Admisión UNI 2017-2',
    tipo: 'Solucionario oficial',
    url: 'https://www.admision.uni.edu.pe/wp-content/uploads/2022/11/solucionario20172.pdf',
    note: 'Preguntas tipo UNI para entrenar razonamiento y ciencias.'
  },
  {
    id: 'uni-2017-1',
    uni: 'UNI',
    year: '2017',
    title: 'Solucionario oficial Admisión UNI 2017-1',
    tipo: 'Solucionario oficial',
    url: 'https://www.admision.uni.edu.pe/wp-content/uploads/2022/11/solucionario20171.pdf',
    note: 'Examen oficial con solucionario para autoevaluación.'
  },
  {
    id: 'unmsm-deco',
    uni: 'UNMSM',
    year: '2024',
    title: 'Estructura oficial de la prueba DECO',
    tipo: 'Documento oficial',
    url: 'https://admision.unmsm.edu.pe/portal/wp-content/uploads/2023/11/Resolucion-Rectoral-de-cambio-en-el-examen.pdf',
    note: 'Resolución oficial que detalla secciones, número de preguntas y áreas de la prueba.'
  },
  {
    id: 'unmsm-portal',
    uni: 'UNMSM',
    year: 'Actual',
    title: 'Portal oficial de admisión UNMSM',
    tipo: 'Fuente oficial',
    url: 'https://admision.unmsm.edu.pe/portal/',
    note: 'Cronogramas, reglamentos, resultados y publicaciones oficiales de San Marcos.'
  },
  {
    id: 'pucp-guia',
    uni: 'PUCP',
    year: 'Actual',
    title: 'Guía del postulante y temario PUCP',
    tipo: 'Guía oficial',
    url: 'https://admision.pucp.edu.pe/guia-del-postulante',
    note: 'Modalidades, estructura de la evaluación y temario oficial de la PUCP.'
  },
  {
    id: 'uni-descargas',
    uni: 'UNI',
    year: 'Varios',
    title: 'Repositorio oficial de solucionarios UNI',
    tipo: 'Repositorio oficial',
    url: 'https://www.admision.uni.edu.pe/descargas/',
    note: 'Descarga más exámenes y solucionarios desde la página oficial de admisión UNI.'
  }
];

export const ADMISSION_COPY = {
  updatedAt: 'Octubre 2026',
  disclaimer: 'El banco de preguntas es material de práctica elaborado por Haz Tu Camino con el formato y nivel de los exámenes de admisión. Los enlaces de exámenes reales llevan a documentos y portales oficiales de cada universidad.'
};
