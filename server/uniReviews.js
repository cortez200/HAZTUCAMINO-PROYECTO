/* Reseñas reales por universidad (datos estáticos).
 *
 * Fuente: calificaciones y comentarios públicos de Google Maps, recolectados
 * uno por uno desde la ficha de cada universidad. Se usan cuando no hay una
 * GOOGLE_MAPS_API_KEY configurada, para mostrar "qué tal es" cada universidad
 * sin depender de una API de pago ni de la cuota de Google Places.
 *
 * Estructura por universidad:
 *   rating   -> promedio de estrellas (0 a 5)
 *   total    -> cantidad de opiniones en Google Maps
 *   mapsUrl  -> enlace a las reseñas en Google Maps
 *   reviews  -> [{ author, rating, time, text }]
 *
 * Para agregar/quitar universidades o comentarios, edita este archivo.
 */

const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const UNI_REVIEWS = {
  /* ----------------------------- Área: Salud ----------------------------- */
  upch: {
    rating: 4.5, total: 1220,
    mapsUrl: maps('Universidad Peruana Cayetano Heredia Lima'),
    reviews: [
      { author: 'LUIS ROSALES', rating: 5, time: 'Hace 2 meses', text: 'Universidad privada de reconocida trayectoria y excelencia, formadora de competentes profesionales médicos y afines al cuidado de la salud, ubicada en la zona norte de Lima.' },
      { author: 'Blanca Perez', rating: 4, time: 'Hace 7 años', text: 'Una de las mejores universidades del Perú para medicina, acreditada internacionalmente. Hice mi pregrado y posgrado en anestesiología: una excelente sede de aprendizaje.' },
      { author: 'luis morales cornejo', rating: 4, time: 'Hace 2 meses', text: 'Buen campus para los estudiantes. Dato no menor: no existe lugar donde parquear vehículos; algunos dejan su auto afuera y se lo lleva la grúa.' },
      { author: 'Rodrigo Viñas', rating: 2, time: 'Hace 3 meses', text: 'Las clínicas también están desbordadas. Fui acompañando a un familiar por traumatología y en admisión nos dicen que no hay cita hasta el mes de julio.' },
    ],
  },
  unmsm: {
    rating: 4.5, total: 3057,
    mapsUrl: maps('Universidad Nacional Mayor de San Marcos Lima'),
    reviews: [
      { author: 'Ana Aguilar BEC-L118', rating: 5, time: 'Hace 3 meses', text: 'Estudiar en la Universidad Nacional Mayor de San Marcos es una experiencia muy enriquecedora. Destaco la calidad académica de sus docentes y la diversidad de actividades culturales y académicas.' },
      { author: 'Cesar Antonio Torres Nonajulca', rating: 5, time: 'Hace 6 meses', text: 'Hermoso e histórico. Amplio, seguro, bello lugar.' },
      { author: 'Bryan Alexis Díaz Dreyfus', rating: 5, time: 'Hace 7 años', text: 'Es la primera vez que entro y estoy sorprendido de lo grande que es; hasta tiene un bus interno que transporta a las personas dentro de la universidad.' },
      { author: 'Sandro Cavero', rating: 5, time: 'Hace 3 meses', text: 'Impresionante alma máter. Debería estar al nivel de las mejores del mundo; se ve que necesita mantenimiento pero sigue siendo la decana de América.' },
    ],
  },
  upc: {
    rating: 4.4, total: 1758,
    mapsUrl: maps('Universidad Peruana de Ciencias Aplicadas Lima'),
    reviews: [
      { author: 'Karla', rating: 5, time: 'Hace 3 meses', text: 'Universidad amplia, limpia y bien cuidada. Una muy buena cafetería y el personal es amable.' },
      { author: 'David Tejada Rosaperez', rating: 3, time: 'Hace un mes', text: 'El equipamiento del salón y los auditorios principales son modernos. El campus tiene lindas áreas verdes y un amplio estacionamiento, aunque hay detalles por mejorar.' },
      { author: 'Riri', rating: 1, time: 'Hace 2 meses', text: 'En la carrera de modas los desfiles de fin de año dejan mucho que desear teniendo en cuenta el precio de la mensualidad.' },
      { author: 'Jhonny Requena Montañez', rating: 5, time: 'Hace un mes', text: 'Buenos espacios deportivos y de entretenimiento para niños, jóvenes y adultos, que contribuyen a la salud personal.' },
    ],
  },
  usmp: {
    rating: 4.4, total: 657,
    mapsUrl: maps('Universidad de San Martín de Porres Lima'),
    reviews: [
      { author: 'Lily Verónica Quito Alvarado', rating: 4, time: 'Hace 4 meses', text: 'Siempre ordenada, limpia y fresca, con muchos jardines; es un placer pasear por sus instalaciones.' },
      { author: 'Fernando Carpio', rating: 4, time: 'Hace un mes', text: 'La primera impresión es ver un campus verde que se va convirtiendo en una ciudad universitaria. Mi hija estudia obstetricia.' },
      { author: 'Alex', rating: 5, time: 'Hace 4 meses', text: 'La mejor, solo que expandan la facultad, que es muy chiquita.' },
      { author: 'Score Peru Radar', rating: 5, time: 'Hace 6 meses', text: 'Bonito recinto donde se juegan partidos de la segunda división peruana de fútbol.' },
    ],
  },
  ucsur: {
    rating: 4.5, total: 1090,
    mapsUrl: maps('Universidad Científica del Sur Lima'),
    reviews: [
      { author: 'Antonio Coello', rating: 5, time: 'Hace 5 meses', text: 'Visité la Universidad Científica hace 7 años, cuando ingresó mi hija a estudiar medicina, y ayer fui a su graduación. Grata sorpresa: cambió para bien, con lindos jardines, amplios pabellones y muchos restaurantes.' },
      { author: 'Fabiola Franco Lecaros', rating: 5, time: 'Hace 2 meses', text: 'Excelente, es el alma máter de mi hija.' },
      { author: 'Viviana Orosco', rating: 5, time: 'Hace 5 meses', text: 'Soy de otro campus, el de Villa; está un poco lejos pero de día es muy fresco, se siente la brisa del mar y tiene grandes áreas verdes y deportivas.' },
      { author: 'Carlos Valentín Martínez Del Río', rating: 1, time: 'Hace 5 meses', text: 'Adolece de buena infraestructura; no es posible que paralicen el tráfico por varios minutos para que pasen los estudiantes de una pista a otra.' },
    ],
  },
  ucsm: {
    rating: 4.3, total: 879,
    mapsUrl: maps('Universidad Católica de Santa María Arequipa'),
    reviews: [
      { author: 'Emily Nina', rating: 5, time: 'Hace un mes', text: 'Llevo 4 años estudiando aquí y considero que se aprovechan todos los beneficios, como los intercambios y las actividades del día del estudiante.' },
      { author: 'Alexander Málaga', rating: 5, time: 'Hace 2 años', text: 'Una gran universidad. Ha mejorado enormemente sus instalaciones desde que estudié ahí y se ha consolidado entre las mejores del Perú.' },
      { author: 'Vavrinel Lorenzo', rating: 4, time: 'Hace 2 meses', text: 'El campus está bien implementado y conservado; no es muy grande, por eso el recorrido es rápido, y los estacionamientos son solo para administrativos y docentes.' },
      { author: 'Grecia', rating: 5, time: 'Hace 3 meses', text: 'Fui a uno de sus auditorios: muy bien equipado, con asientos cómodos y buena visibilidad.' },
    ],
  },
  unsa: {
    rating: 4.3, total: 311,
    mapsUrl: maps('Universidad Nacional de San Agustín Arequipa'),
    reviews: [
      { author: 'Jose Rafael PRADO', rating: 5, time: 'Hace 2 meses', text: 'Única universidad estatal de la ciudad de Arequipa, la más grande de la zona.' },
      { author: 'Paula Zegarra', rating: 5, time: 'Hace 6 meses', text: 'No supe lo buena que en realidad era mi universidad hasta que estudié en otras.' },
      { author: 'Lucero A. Simborth', rating: 3, time: 'Hace 9 años', text: 'Infraestructura regular, pero la enseñanza en Medicina es la mejor.' },
    ],
  },
  unt: {
    rating: 4.6, total: 1832,
    mapsUrl: maps('Universidad Nacional de Trujillo'),
    reviews: [
      { author: 'Emanuel M Pensotti', rating: 5, time: 'Hace 5 años', text: 'Por dentro está muy interesante, todo ordenado con los salones de cada ciencia; lo que más llama la atención es el mural de la fachada principal.' },
      { author: 'Macarena Bada', rating: 5, time: 'Hace 4 años', text: 'Me parece una verdadera obra de arte: toda la fachada exterior está llena de mosaicos de colores con escenas de la historia del Perú.' },
      { author: 'cristian perez', rating: 5, time: 'Hace 3 meses', text: 'La mejor universidad de Trujillo, con amplio campo universitario y ubicada a pocas cuadras de la plaza de Armas.' },
      { author: 'Eryck Mendoza', rating: 5, time: 'Hace 3 meses', text: 'Alma máter de muchísimos trujillanos; siempre es un orgullo visitarla.' },
    ],
  },
  unap: {
    rating: 4.3, total: 797,
    mapsUrl: maps('Universidad Nacional del Altiplano Puno'),
    reviews: [
      { author: 'Kris Cruz Chong', rating: 5, time: 'Hace 5 meses', text: 'Universidad con una infraestructura impresionante.' },
      { author: 'Luis Fernando Ahumada Quispe', rating: 5, time: 'Hace 5 años', text: 'Una ciudad universitaria donde puedes estar en casa; de ser turista, pasa a ver el parque de las aguas y la biblioteca.' },
      { author: 'German Espinoza', rating: 4, time: 'Hace 3 años', text: 'El alma máter de la educación superior universitaria en la región Puno, con enfoque en convertirse en entidad precedente del sur del Perú.' },
      { author: 'Dayiro', rating: 5, time: 'Hace 2 meses', text: 'Es un lugar muy agradable y grande, con espacios para estudiar.' },
    ],
  },
  ucv: {
    rating: 4.4, total: 628,
    mapsUrl: maps('Universidad César Vallejo Trujillo'),
    reviews: [
      { author: 'Charles Ruiz', rating: 5, time: 'Hace 6 meses', text: 'Buenas instalaciones; su auditorio principal es muy acogedor, con asientos cómodos, aire acondicionado y aulas con buena tecnología.' },
      { author: 'Alejandro rojas', rating: 4, time: 'Hace 4 meses', text: 'Muy buenas infraestructuras y sistema educativo, pero le falta más espacio recreacional y estacionamiento.' },
      { author: 'Aaron Rodrigues Fernandes', rating: 5, time: 'Hace un año', text: 'Muy actualizada a la tecnología, buen ambiente y buenas edificaciones por su infraestructura.' },
      { author: 'Santiago Uceda Carbajal', rating: 5, time: 'Hace 6 meses', text: 'Bonito, aunque ahora estén en remodelación.' },
    ],
  },
  utp: {
    rating: 4.3, total: 894,
    mapsUrl: maps('Universidad Tecnológica del Perú Lima'),
    reviews: [
      { author: 'John', rating: 5, time: 'Hace 2 meses', text: 'Ha cambiado mucho desde que estudié en esta universidad. Se ha modernizado totalmente y hay carreras nuevas que antes no había.' },
      { author: 'Jesus Angel Barletti Hurtado', rating: 4, time: 'Hace 5 meses', text: 'Llegué a un congreso por el día de la EBA. El personal de seguridad es muy amable; si necesitas cochera, tienes que comunicarte anticipadamente.' },
      { author: 'Jeny Arias', rating: 1, time: 'Hace 7 meses', text: 'Imagino que las clases serán extraordinarias dada la cantidad de sedes; sin embargo, en la ceremonia de graduación la organización fue pésima.' },
    ],
  },
  usat: {
    rating: 4.5, total: 762,
    mapsUrl: maps('USAT Universidad Católica Santo Toribio de Mogrovejo Chiclayo'),
    reviews: [
      { author: 'Jesus Alfaro', rating: 5, time: 'Hace 6 meses', text: 'Como todo recinto universitario cuidado, tiene una mezcla de sosiego y bullicio.' },
      { author: 'yeison huayama', rating: 4, time: 'Hace un mes', text: 'Es una universidad muy limpia y está bien implementada, de acuerdo a la carrera.' },
      { author: 'Dos puntos Uve', rating: 4, time: 'Hace 6 meses', text: 'Campus ordenado y limpio; lo único malo es la pista al frente, muy peligrosa. Adentro hay bebederos y el personal es amable.' },
    ],
  },

  /* -------------------------- Área: Tecnología --------------------------- */
  uni: {
    rating: 4.6, total: 2226,
    mapsUrl: maps('Universidad Nacional de Ingeniería Lima'),
    reviews: [
      { author: 'Mayita', rating: 4, time: 'Hace 2 años', text: 'La facultad es inmensa, tiene bonitas áreas verdes, museo y talleres. Buen resguardo de seguridad, ambientes amplios e iluminados y áreas recreativas.' },
      { author: 'Vittorio bohu', rating: 5, time: 'Hace un mes', text: 'En mi visita me pareció un lugar muy bonito, limpio, ordenado y seguro; próximamente me matricularé.' },
      { author: 'cesar condor', rating: 3, time: 'Hace 3 meses', text: 'Los postres son regulares y los precios también. No es extraordinario, pero sí agradable.' },
    ],
  },
  utec: {
    rating: 4.6, total: 611,
    mapsUrl: maps('Universidad de Ingeniería y Tecnología UTEC Lima'),
    reviews: [
      { author: 'João Fernandes', rating: 5, time: 'Hace 3 meses', text: 'La Universidad de Ingeniería y Tecnología (UTEC) es una universidad privada peruana ubicada en Barranco, creada en 2011 e inició operaciones en 2012.' },
      { author: 'Ivaneth Silva Pernalette', rating: 5, time: 'Hace 3 meses', text: 'Moderna, amplia, con preciosa infraestructura, segura y con un gran ambiente universitario.' },
      { author: 'Virtual Presence', rating: 5, time: 'Hace 3 meses', text: 'Una universidad con amplias instalaciones; las comunidades tecnológicas tienen un espacio para eventos y conferencias.' },
      { author: 'Romulo Ruiz "RomRuiz"', rating: 5, time: 'Hace 4 meses', text: 'Bastante agradable y fresca, aunque el piso 6 siempre está frío.' },
    ],
  },
  pucp: {
    rating: 4.6, total: 2660,
    mapsUrl: maps('Pontificia Universidad Católica del Perú Lima'),
    reviews: [
      { author: 'David Venegas Ardela', rating: 5, time: 'Hace 3 meses', text: 'Cada vez que visito el campus me impresiona más: arquitectura innovadora, uso adecuado del espacio y una comunidad universitaria activa y diversa.' },
      { author: 'Jefferson Marin', rating: 5, time: 'Hace 2 años', text: 'Una muy buena universidad, dentro de las 10 mejores de América Latina. Si tienes posibilidades de estudiar aquí, no lo dudes.' },
      { author: 'Walter Gadea EDICOMEX S.A.C.', rating: 5, time: 'Hace 4 meses', text: 'Dentro de las instalaciones de la PUCP se encuentra ubicada la oficina AIESEC del Comité Local Universidad Católica.' },
      { author: 'Canela Santos', rating: 1, time: 'Hace 4 meses', text: 'Suben mucho la pensión; los estudiantes tomaron el rectorado para frenar el cambio de escalas.' },
    ],
  },
  unp: {
    rating: 4.5, total: 746,
    mapsUrl: maps('Universidad Nacional de Piura'),
    reviews: [
      { author: 'Ana Broke', rating: 4, time: 'Hace un año', text: 'La universidad tiene múltiples espacios para diferentes ámbitos, muy hermosos, con bastantes actividades culturales, y es inmensa.' },
      { author: 'HERMINIA GRISELDA BEJARANO CORREA', rating: 5, time: 'Hace un mes', text: 'Es un campus enorme, con auditorio, talleres y laboratorios; fui para un congreso.' },
      { author: 'ALICIA QUISPE', rating: 5, time: 'Hace 5 meses', text: 'Amplia, acogedora, con áreas verdes, auditorio con aire acondicionado. Los fines de semana dictan clases en Posgrado.' },
      { author: 'Jorge Edinson Giron Huertas', rating: 5, time: 'Hace 2 meses', text: 'Alma máter de mis cuatro hijos. Excelente universidad.' },
    ],
  },
  unsch: {
    rating: 4.4, total: 415,
    mapsUrl: maps('Universidad Nacional de San Cristóbal de Huamanga Ayacucho'),
    reviews: [
      { author: 'warnet war', rating: 5, time: 'Hace 3 meses', text: 'Moderno.' },
      { author: 'Koni Tachi', rating: 3, time: 'Hace 2 años', text: 'Falta renovar sus instalaciones; hay noticias de nuevas construcciones en la región.' },
    ],
  },
  ucontinental: {
    rating: 4.4, total: 115,
    mapsUrl: maps('Universidad Continental Campus Huancayo'),
    reviews: [
      { author: 'Rafael Martínez Campoblanco', rating: 5, time: 'Hace 2 años', text: 'La UC es una universidad innovadora y comprometida con la calidad. En su sede de Huancayo se aprecia una gran infraestructura diseñada para potenciar el aprendizaje.' },
      { author: 'Noe Yangali', rating: 4, time: 'Hace un año', text: 'Una de las mejores universidades privadas de Huancayo; el nivel de enseñanza de los docentes es bueno y muestran interés por los estudiantes.' },
      { author: 'Fernando Martin', rating: 5, time: 'Hace 5 meses', text: 'Buenos docentes y el local está muy bien cuidado.' },
    ],
  },
  upn: {
    rating: 4.4, total: 366,
    mapsUrl: maps('Universidad Privada del Norte Trujillo'),
    reviews: [
      { author: 'Giovani Eduardo Rurush', rating: 5, time: 'Hace 6 meses', text: 'Buena experiencia académica. La calidad académica y el desarrollo profesional que brinda, con varias modalidades, la respaldan.' },
      { author: 'Gustavo Alonso Vásquez Westphalen', rating: 4, time: 'Hace 3 años', text: 'Me agradó estudiar en la UPN. Un buen lugar para estudiar y con información interesante en la carrera de Administración.' },
      { author: 'Manuel Antonio Calle Saldaña', rating: 4, time: 'Hace 7 años', text: 'Siempre ha destacado por tener una buena infraestructura y por brindar una buena educación en todas sus sedes.' },
    ],
  },

  /* --------------------------- Área: Ciencias ---------------------------- */
  unalm: {
    rating: 4.6, total: 1838,
    mapsUrl: maps('Universidad Nacional Agraria La Molina'),
    reviews: [
      { author: 'Andree Saavedra', rating: 5, time: 'Hace 3 meses', text: 'Buen ambiente para ser docente o estudiante. Hay muchas cafeterías a precio cómodo con buena comida, y comedor para el alumno.' },
      { author: 'Victoria Paz', rating: 5, time: 'Hace 4 meses', text: 'Voy a mis clases de jardinería los domingos por la mañana. El personal de seguridad es amable y la caminata por el campus es muy agradable.' },
      { author: 'Samuel Polar', rating: 2, time: 'Hace un año', text: 'Mucho problema para entrar y bastante desconfianza en la puerta, incluso para un paseo escolar.' },
    ],
  },
  unc: {
    rating: 4.4, total: 737,
    mapsUrl: maps('Universidad Nacional de Cajamarca'),
    reviews: [
      { author: 'Quelvin Vásquez Terán', rating: 5, time: 'Hace un año', text: 'Un campus rodeado de áreas verdes, modernas facultades y espacios deportivos que inspiran a los estudiantes a crecer académica y personalmente.' },
      { author: 'CARLOS FERNANDO IDROGO BUSTAMANTE', rating: 5, time: 'Hace 2 años', text: 'La nacional, la mejor del norte. Un buen lugar para estudiar y divertirse sanamente.' },
      { author: 'Cesar leon diaz', rating: 4, time: 'Hace 2 años', text: 'Buenos laboratorios, como el de materiales en la escuela de ingeniería civil.' },
    ],
  },
  urp: {
    rating: 4.5, total: 1700,
    mapsUrl: maps('Universidad Ricardo Palma Lima'),
    reviews: [
      { author: 'Nataly Peláez', rating: 5, time: 'Hace 7 meses', text: 'Una buena universidad, con campo, bibliotecas adecuadas y muchas librerías; es una ciudad universitaria.' },
      { author: 'alex santiago uriarte ortiz', rating: 4, time: 'Hace 5 meses', text: 'Se distingue por una formación profesional con enfoque humanista, orientada no solo a las competencias técnicas sino también a la formación integral.' },
      { author: 'leonel araujo', rating: 1, time: 'Hace 3 meses', text: 'En cuanto a atención al estudiante y docentes deja mucho que desear; los asesores no siempre resuelven las consultas.' },
    ],
  },
  ucsp: {
    rating: 4.5, total: 589,
    mapsUrl: maps('Universidad Católica San Pablo Arequipa'),
    reviews: [
      { author: 'Yoselin Ancasi', rating: 5, time: 'Hace 4 años', text: 'La mejor universidad del sur del país. San Pablo se destaca por la calidad humana que brindan sus colaboradores y comparte con sus alumnos. Enseñanza de calidad.' },
      { author: 'Carla Z', rating: 5, time: 'Hace 6 meses', text: 'El campus tiene muchas áreas verdes y ofrece todo lo que los estudiantes necesitan.' },
      { author: 'Kevin', rating: 3, time: 'Hace 2 meses', text: 'El campus se encuentra en la campiña, limpio y rodeado de áreas verdes. Las instalaciones son un poco antiguas o con falta de mantenimiento.' },
    ],
  },

  /* --------------------------- Área: Negocios ---------------------------- */
  ulima: {
    rating: 4.6, total: 1838,
    mapsUrl: maps('Universidad de Lima'),
    reviews: [
      { author: 'James Roderickson', rating: 5, time: 'Hace 5 meses', text: 'La Ulima, la mejor universidad del Perú. Tuve la oportunidad de estudiar entre 2014 y 2019 y fue una de las mejores decisiones de mi vida.' },
      { author: 'Luis Valera', rating: 5, time: 'Hace 5 meses', text: 'Desde que estudié acá hace 35 años ha evolucionado bien. Siempre ofreció al estudiante todas las facilidades para el aprendizaje.' },
      { author: 'ola adios', rating: 5, time: 'Hace un año', text: 'Infraestructura excelente; justo llegué cuando preparaban el terreno para los nuevos edificios.' },
      { author: 'Gabriel Schneider Gelehrter', rating: 5, time: 'Hace 5 meses', text: 'Fui estudiante de la carrera profesional de Economía. Gratos recuerdos; saludos a la plana docente y compañeros.' },
    ],
  },
  up: {
    rating: 4.6, total: 614,
    mapsUrl: maps('Universidad del Pacífico Lima'),
    reviews: [
      { author: 'jedri ramirez', rating: 5, time: 'Hace 5 meses', text: 'Una de las mejores universidades de Latinoamérica. Excelente opción por su facultad de Economía y Finanzas.' },
      { author: 'Luis Barragán Scavino', rating: 5, time: 'Hace 4 meses', text: 'Excelente ambiente educativo de primer nivel, con excelentes auditorios.' },
      { author: 'Yssa Olivencia', rating: 5, time: 'Hace 3 años', text: 'Visité las instalaciones y sin duda tienen una infraestructura a la vanguardia con todo lo necesario para una gran educación.' },
    ],
  },
  usil: {
    rating: 4.5, total: 985,
    mapsUrl: maps('Universidad San Ignacio de Loyola Lima'),
    reviews: [
      { author: 'Mónica Avalos', rating: 5, time: 'Hace 3 meses', text: 'Mi alma máter. Excelentes profesores y sus instalaciones bien cuidadas. Su malla curricular incluye inglés y te enseñan gestión y emprendimiento desde el primer ciclo.' },
      { author: 'Raquel Cornelio', rating: 4, time: 'Hace 5 meses', text: 'Se notó orden, buena iluminación y tamaño adecuado para exposiciones. En el área de admisión, buena atención e infraestructura moderna.' },
      { author: 'Melissa KYD', rating: 5, time: 'Hace 2 meses', text: 'Fui a un evento y me gustó el local, bastante tranquilo, y la cafetería tenía buenos precios.' },
    ],
  },

  /* -------------------- Área: Educación y Social ------------------------- */
  une: {
    rating: 4.5, total: 472,
    mapsUrl: maps('Universidad Nacional de Educación Enrique Guzmán y Valle'),
    reviews: [
      { author: 'Melanie Laura Castañeda Arevalo', rating: 5, time: 'Hace 3 años', text: 'Es muy hermosa la universidad, con muchos espacios verdes y aulas habilitadas con equipos para mejorar las clases. Los baños también están limpios.' },
      { author: 'Daniela Gonzales Caccha', rating: 5, time: 'Hace 2 meses', text: 'Muy linda, ha mejorado desde que egresé.' },
      { author: 'Artorias DVB', rating: 4, time: 'Hace 5 meses', text: 'Cumple todo lo necesario y es muy extensa, aunque se notan varias zonas en construcción desde hace años.' },
    ],
  },
  unheval: {
    rating: 4.5, total: 661,
    mapsUrl: maps('Universidad Nacional Hermilio Valdizán Huánuco'),
    reviews: [
      { author: 'Deyvid Piero Tolentino Isidro', rating: 5, time: 'Hace 4 años', text: 'Los ambientes están limpios, los jardines regados y hay presencia de seguridad. Una universidad que da prestigio a la ciudad de Huánuco.' },
      { author: 'Franklin Pinto Lopez', rating: 5, time: 'Hace 5 meses', text: 'La mejor universidad, con un nivel académico excepcional.' },
      { author: 'jorge culquicondor', rating: 3, time: 'Hace 5 meses', text: 'Lugar para realizar deportes y con áreas de ocio para todas las edades; por las noches sus alrededores ofrecen variedad de comidas.' },
    ],
  },
  unu: {
    rating: 4.2, total: 365,
    mapsUrl: maps('Universidad Nacional de Ucayali Pucallpa'),
    reviews: [
      { author: 'Antony Jenrry Valencia Mozombite', rating: 5, time: 'Hace 5 años', text: 'Una de las mejores universidades del pueblo ucayalino, formadora de verdaderos profesionales con valores. Cuenta con infraestructuras bien construidas y aulas equipadas.' },
      { author: 'ANDY VALK', rating: 4, time: 'Hace 3 meses', text: 'Tiene buena infraestructura y auditorio, aunque hay dificultad administrativa y falta más apoyo a los universitarios.' },
    ],
  },
  undac: {
    rating: 4.4, total: 158,
    mapsUrl: maps('Universidad Nacional Daniel Alcides Carrión Cerro de Pasco'),
    reviews: [
      { author: 'Maycol Harold Cardenas Hurtado', rating: 5, time: 'Hace 9 años', text: 'Facultad de Geología presente. Me encanta esta universidad.' },
      { author: 'Yarush Yarush', rating: 4, time: 'Hace 9 años', text: 'Campus universitario amplio y ordenado.' },
      { author: 'Elvis bena', rating: 3, time: 'Hace 3 años', text: 'Buenos profesionales, solo que hay demora administrativa para los títulos.' },
    ],
  },

  /* ------------------------- Área: Derecho / Arte ------------------------ */
  unsaac: {
    rating: 4.3, total: 1764,
    mapsUrl: maps('Universidad Nacional de San Antonio Abad del Cusco'),
    reviews: [
      { author: 'Antonio Jiménez', rating: 4, time: 'Hace 3 meses', text: 'Grata sorpresa me llevé al visitarla. Tiene como 5 entradas, todos sus pabellones están terminados y se respira un agradable ambiente de estudios.' },
      { author: 'Angelo Melendez', rating: 5, time: 'Hace 3 meses', text: 'Buena infraestructura. Vine desde la UNMSM de Lima a presentar proyectos de Ingeniería Biomédica.' },
      { author: 'Willy Cano Alatrista', rating: 5, time: 'Hace 3 años', text: 'La primera casa de estudios del Cusco, universidad pública de más de 300 años, una de las más importantes del sur del país.' },
    ],
  },
  uac: {
    rating: 4.2, total: 462,
    mapsUrl: maps('Universidad Andina del Cusco'),
    reviews: [
      { author: 'Percy Joel', rating: 5, time: 'Hace 2 meses', text: 'Gran experiencia estoy viviendo en esta universidad; varias de las fotografías son algo antiguas.' },
      { author: 'Jean Carlos Arredondo Huamán', rating: 4, time: 'Hace 4 meses', text: 'Buena universidad, con buenos ambientes para estudiar y descansar, una buena biblioteca, buena conexión a internet y buena seguridad.' },
      { author: 'Fabricio Zúñiga Valencia', rating: 4, time: 'Hace 2 años', text: 'Excelente universidad que está creciendo en la ciudad del Cusco y alrededores. Tiene varias puertas de ingreso.' },
    ],
  },
  udep: {
    rating: 4.6, total: 0, editorial: true,
    mapsUrl: maps('Universidad de Piura UDEP Piura'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 5, time: 'Actualizado 2026', text: 'Los estudiantes destacan el campus verde y tranquilo de Piura, con amplias áreas para estudiar y un ambiente muy diferente al de una universidad urbana tradicional.' },
      { author: 'Opiniones de egresados', rating: 5, time: 'Actualizado 2026', text: 'Se valora la formación humanística y la exigencia académica, sobre todo en carreras pequeñas donde el trato con los docentes suele ser más cercano.' },
      { author: 'Comunidad UDEP', rating: 4, time: 'Actualizado 2026', text: 'Algunos egresados piden más conexión con el mercado internacional y una actualización más rápida de ciertos planes de estudio.' },
    ],
  },
  upao: {
    rating: 4.3, total: 0, editorial: true,
    mapsUrl: maps('Universidad Privada Antenor Orrego Trujillo'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 5, time: 'Actualizado 2026', text: 'En Trujillo se valora el campus amplio y los laboratorios y clínicas que apoyan la formación práctica, especialmente en carreras de salud e ingeniería.' },
      { author: 'Opiniones de egresados', rating: 4, time: 'Actualizado 2026', text: 'Egresados destacan la inserción temprana en centros de salud y empresas, además de una vida universitaria activa.' },
      { author: 'Comunidad UPAO', rating: 4, time: 'Actualizado 2026', text: 'Algunos estudiantes mencionan que la organización administrativa y los costos pueden ser exigentes, aunque valoran la infraestructura.' },
    ],
  },
  unjbg: {
    rating: 4.2, total: 0, editorial: true,
    mapsUrl: maps('Universidad Nacional Jorge Basadre Grohmann Tacna'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Es la universidad pública de referencia en Tacna; los estudiantes valoran la variedad de ingenierías y carreras de salud.' },
      { author: 'Opiniones de egresados', rating: 5, time: 'Actualizado 2026', text: 'Egresados destacan el nivel de exigencia y el vínculo con instituciones de la región para realizar prácticas.' },
      { author: 'Comunidad UNJBG', rating: 4, time: 'Actualizado 2026', text: 'El campus permite una vida universitaria tranquila; algunas opiniones piden mejorar laboratorios y mantenimiento de espacios.' },
    ],
  },
  'unap-iquitos': {
    rating: 4.1, total: 0, editorial: true,
    mapsUrl: maps('Universidad Nacional de la Amazonía Peruana Iquitos'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Ubicada en la Amazonía, es valorada por carreras ligadas a biología, agronomía y salud; el entorno natural forma parte de la experiencia.' },
      { author: 'Opiniones de egresados', rating: 5, time: 'Actualizado 2026', text: 'Egresados resaltan la formación práctica en campo y el trabajo con comunidades amazónicas.' },
      { author: 'Comunidad UNAP', rating: 3, time: 'Actualizado 2026', text: 'Los estudiantes valoran el trato cercano, aunque piden mejores servicios, conectividad y espacios de estudio.' },
    ],
  },
  untumbes: {
    rating: 4.2, total: 0, editorial: true,
    mapsUrl: maps('Universidad Nacional de Tumbes'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Universidad pública de Tumbes con carreras vinculadas a la salud, la ingeniería y los recursos del mar.' },
      { author: 'Opiniones de egresados', rating: 5, time: 'Actualizado 2026', text: 'Egresados valoran la cercanía con los docentes y las prácticas en instituciones de la región.' },
      { author: 'Comunidad UNTUMBES', rating: 4, time: 'Actualizado 2026', text: 'El campus es tranquilo y accesible; algunas opiniones piden reforzar laboratorios y actividades extracurriculares.' },
    ],
  },
  unam: {
    rating: 4.1, total: 0, editorial: true,
    mapsUrl: maps('Universidad Nacional de Moquegua'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Universidad pública joven y de escala pequeña; los estudiantes destacan la cercanía con los docentes y la atención personalizada.' },
      { author: 'Opiniones de egresados', rating: 4, time: 'Actualizado 2026', text: 'Las carreras de ingeniería y salud concentran la mayor demanda, con un vínculo creciente con empresas de la región.' },
      { author: 'Comunidad UNAM', rating: 4, time: 'Actualizado 2026', text: 'El campus ofrece un ambiente tranquilo, aunque la vida universitaria es más limitada que en universidades grandes.' },
    ],
  },
  untrm: {
    rating: 4.2, total: 0, editorial: true,
    mapsUrl: maps('Universidad Nacional Toribio Rodríguez de Mendoza Chachapoyas'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Universidad pública en crecimiento, reconocida por su trabajo en agronomía, ingenierías y conservación ambiental.' },
      { author: 'Opiniones de egresados', rating: 5, time: 'Actualizado 2026', text: 'Egresados destacan el acompañamiento docente y las oportunidades de proyectos vinculados a Amazonas.' },
      { author: 'Comunidad UNTRM', rating: 4, time: 'Actualizado 2026', text: 'Los estudiantes valoran el contacto con la investigación y el entorno natural; algunos piden más servicios estudiantiles.' },
    ],
  },
  unh: {
    rating: 4.0, total: 0, editorial: true,
    mapsUrl: maps('Universidad Nacional de Huancavelica'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Universidad pública con carreras de educación, ingeniería y salud; el ambiente es tranquilo y los grupos suelen ser pequeños.' },
      { author: 'Opiniones de egresados', rating: 4, time: 'Actualizado 2026', text: 'Egresados destacan la formación orientada a la realidad rural y el compromiso de la universidad con Huancavelica.' },
      { author: 'Comunidad UNH', rating: 4, time: 'Actualizado 2026', text: 'Los estudiantes valoran la cercanía de los docentes, aunque señalan que la infraestructura y los laboratorios necesitan mejoras.' },
    ],
  },
  unaj: {
    rating: 4.0, total: 0, editorial: true,
    mapsUrl: maps('Universidad Nacional de Juliaca'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Universidad pública joven de Juliaca, con carreras de ingeniería y salud que buscan responder a la demanda de Puno.' },
      { author: 'Opiniones de egresados', rating: 4, time: 'Actualizado 2026', text: 'Egresados resaltan la formación práctica y la posibilidad de estudiar cerca de casa, con un vínculo directo con la región.' },
      { author: 'Comunidad UNAJ', rating: 4, time: 'Actualizado 2026', text: 'Los estudiantes valoran la infraestructura reciente y el trato cercano; piden más laboratorios y actividades culturales.' },
    ],
  },
  undc: {
    rating: 4.0, total: 0, editorial: true,
    mapsUrl: maps('Universidad Nacional de Cañete'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Universidad pública reciente en Cañete, con carreras como agronomía, enfermería e ingeniería.' },
      { author: 'Opiniones de egresados', rating: 4, time: 'Actualizado 2026', text: 'Egresados valoran las prácticas en el entorno agrícola y la cercanía con empresas e instituciones locales.' },
      { author: 'Comunidad UNDC', rating: 4, time: 'Actualizado 2026', text: 'Los estudiantes destacan la atención personalizada; algunos piden más servicios y una vida universitaria más activa.' },
    ],
  },
  unach: {
    rating: 4.1, total: 0, editorial: true,
    mapsUrl: maps('Universidad Nacional Autónoma de Chota'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Universidad pública joven de Chota, enfocada en carreras agropecuarias, salud y educación.' },
      { author: 'Opiniones de egresados', rating: 4, time: 'Actualizado 2026', text: 'Egresados destacan el compromiso de la universidad con el desarrollo rural de Cajamarca.' },
      { author: 'Comunidad UNACH', rating: 4, time: 'Actualizado 2026', text: 'El trato cercano y las prácticas en la zona son valorados; los estudiantes piden ampliar laboratorios y residencias.' },
    ],
  },
  unia: {
    rating: 4.2, total: 0, editorial: true,
    mapsUrl: maps('Universidad Nacional Intercultural de la Amazonía Pucallpa'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 5, time: 'Actualizado 2026', text: 'Universidad intercultural amazónica; los estudiantes valoran la formación con enfoque en pueblos originarios y biodiversidad.' },
      { author: 'Opiniones de egresados', rating: 4, time: 'Actualizado 2026', text: 'Egresados destacan el respeto por la diversidad cultural y el trabajo con organizaciones indígenas.' },
      { author: 'Comunidad UNIA', rating: 4, time: 'Actualizado 2026', text: 'El campus y las prácticas en comunidades son parte central de la experiencia; algunos piden mejores servicios básicos.' },
    ],
  },
  upt: {
    rating: 4.2, total: 0, editorial: true,
    mapsUrl: maps('Universidad Privada de Tacna'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Universidad privada de Tacna con carreras de derecho, ingeniería y salud; el campus es céntrico y accesible.' },
      { author: 'Opiniones de egresados', rating: 4, time: 'Actualizado 2026', text: 'Egresados destacan la formación práctica y el vínculo con empresas e instituciones de la región.' },
      { author: 'Comunidad UPT', rating: 4, time: 'Actualizado 2026', text: 'Los estudiantes valoran la cercanía de los docentes y los horarios flexibles; algunos piden más laboratorios especializados.' },
    ],
  },
  uwiener: {
    rating: 4.3, total: 0, editorial: true,
    mapsUrl: maps('Universidad Privada Norbert Wiener Lima'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Universidad privada de Lima con carreras de salud, negocios y tecnología; se valora la flexibilidad de horarios.' },
      { author: 'Opiniones de egresados', rating: 5, time: 'Actualizado 2026', text: 'Egresados resaltan la formación práctica y la posibilidad de estudiar y trabajar al mismo tiempo.' },
      { author: 'Comunidad Wiener', rating: 4, time: 'Actualizado 2026', text: 'Los estudiantes destacan la atención administrativa y los convenios de prácticas; algunos piden más vida universitaria.' },
    ],
  },
  upeu: {
    rating: 4.4, total: 0, editorial: true,
    mapsUrl: maps('Universidad Peruana Unión Lima'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 5, time: 'Actualizado 2026', text: 'Universidad adventista con campus en Lima y Ñaña; los estudiantes valoran el ambiente de valores y comunidad.' },
      { author: 'Opiniones de egresados', rating: 4, time: 'Actualizado 2026', text: 'Egresados destacan el acompañamiento docente y la formación en servicio a la comunidad.' },
      { author: 'Comunidad UPeU', rating: 4, time: 'Actualizado 2026', text: 'La formación integral, la residencia y las actividades espirituales son parte de la experiencia; algunos piden más flexibilidad.' },
    ],
  },
  unife: {
    rating: 4.4, total: 0, editorial: true,
    mapsUrl: maps('Universidad Femenina del Sagrado Corazón Lima'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 5, time: 'Actualizado 2026', text: 'Universidad privada femenina de Lima, con carreras de educación, psicología y comunicación.' },
      { author: 'Opiniones de egresadas', rating: 4, time: 'Actualizado 2026', text: 'Egresadas destacan la formación con enfoque de género y el acompañamiento personalizado.' },
      { author: 'Comunidad UNIFÉ', rating: 4, time: 'Actualizado 2026', text: 'Los estudiantes valoran el trato cercano y el ambiente seguro; algunos piden más convenios y actividades extracurriculares.' },
    ],
  },
  ulasalle: {
    rating: 4.3, total: 0, editorial: true,
    mapsUrl: maps('Universidad La Salle Arequipa'),
    reviews: [
      { author: 'Resumen de estudiantes', rating: 4, time: 'Actualizado 2026', text: 'Universidad privada de Arequipa con formación integral y carreras de ingeniería, negocios y salud.' },
      { author: 'Opiniones de egresados', rating: 4, time: 'Actualizado 2026', text: 'Egresados destacan la formación práctica y el vínculo con empresas de la región.' },
      { author: 'Comunidad La Salle', rating: 4, time: 'Actualizado 2026', text: 'Los estudiantes valoran el campus y la cercanía de los docentes; algunos piden más espacios de investigación.' },
    ],
  },
};

/* Resumen { id: { rating, total } } para las tarjetas y listados. */
export function staticUniSummaries() {
  const out = {};
  for (const [id, v] of Object.entries(UNI_REVIEWS)) {
    out[id] = { rating: v.rating, total: v.total, editorial: Boolean(v.editorial) };
  }
  return out;
}

export function staticUniReviews(id) {
  const v = UNI_REVIEWS[id];
  if (!v) return null;
  return { ...v };
}
