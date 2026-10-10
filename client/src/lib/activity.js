/* Actividades de simulación por área — tareas reales de arrastrar y soltar.
   modo:
     - 'ordenar'    → cada zona admite un solo objeto (orden/prioridad).
     - 'clasificar' → cada zona admite varios objetos (categorías). */

export const SIM_ACTIVITY = {
  salud: {
    titulo: 'Triaje en la sala de emergencias',
    instruccion: 'Arrastra cada paciente a la zona según su urgencia. Primero lo más crítico.',
    modo: 'ordenar',
    slots: [
      { id: '1', label: '1º · Crítico', icon: 'AlertTriangle' },
      { id: '2', label: '2º · Urgente', icon: 'Flame' },
      { id: '3', label: '3º · Moderado', icon: 'Activity' },
      { id: '4', label: '4º · Leve', icon: 'Heart' }
    ],
    items: [
      { id: 'p1', label: 'Dolor de pecho intenso y sudor frío', icon: 'HeartPulse', correct: '1', pista: 'Puede ser un infarto: es lo más crítico.' },
      { id: 'p2', label: 'Herida profunda que no deja de sangrar', icon: 'Droplet', correct: '2', pista: 'Riesgo de hemorragia: atención urgente.' },
      { id: 'p3', label: 'Fiebre alta con deshidratación', icon: 'Thermometer', correct: '3', pista: 'Grave pero estable: puede esperar un poco.' },
      { id: 'p4', label: 'Torcedura leve de tobillo', icon: 'Users', correct: '4', pista: 'Sin riesgo vital: va al final.' }
    ]
  },

  tecnologia: {
    titulo: 'Organizar el sprint',
    instruccion: 'Arrastra cada tarea al tablero según su prioridad.',
    modo: 'clasificar',
    slots: [
      { id: 'ahora', label: 'Ahora (crítico)', icon: 'AlertTriangle' },
      { id: 'sprint', label: 'Este sprint', icon: 'Timer' },
      { id: 'backlog', label: 'Backlog', icon: 'FolderKanban' }
    ],
    items: [
      { id: 't1', label: 'Producción caída', icon: 'Wifi', correct: 'ahora', pista: 'Si el servicio está abajo, todo lo demás espera.' },
      { id: 't2', label: 'El pago no procesa a los usuarios', icon: 'CircleDollarSign', correct: 'ahora', pista: 'Afecta dinero y clientes: crítico.' },
      { id: 't3', label: 'Corregir bug en el login', icon: 'Bug', correct: 'ahora', pista: 'Bloquea el acceso: alta prioridad.' },
      { id: 't4', label: 'Optimizar consultas lentas', icon: 'Zap', correct: 'sprint', pista: 'Importante, pero no rompe nada hoy.' },
      { id: 't5', label: 'Escribir pruebas automatizadas', icon: 'ClipboardCheck', correct: 'sprint', pista: 'Mejora el proyecto a mediano plazo.' },
      { id: 't6', label: 'Cambiar el color del botón', icon: 'Paintbrush', correct: 'backlog', pista: 'Detalle estético: sin prisa.' }
    ]
  },

  ciencias: {
    titulo: 'Protocolo del método científico',
    instruccion: 'Ordena los pasos de la investigación de principio a fin.',
    modo: 'ordenar',
    slots: [
      { id: '1', label: '1er paso', icon: 'Lightbulb' },
      { id: '2', label: '2do paso', icon: 'FlaskConical' },
      { id: '3', label: '3er paso', icon: 'Microscope' },
      { id: '4', label: '4to paso', icon: 'ClipboardCheck' },
      { id: '5', label: '5to paso', icon: 'TrendingUp' }
    ],
    items: [
      { id: 'c1', label: 'Formula la hipótesis', icon: 'Lightbulb', correct: '1', pista: 'Todo empieza con una pregunta e hipótesis.' },
      { id: 'c2', label: 'Prepara la muestra y los materiales', icon: 'FlaskConical', correct: '2', pista: 'Luego se prepara el experimento.' },
      { id: 'c3', label: 'Realiza la medición controlada', icon: 'Microscope', correct: '3', pista: 'Se observa y se mide.' },
      { id: 'c4', label: 'Registra los datos obtenidos', icon: 'ClipboardCheck', correct: '4', pista: 'Los datos se registran con rigor.' },
      { id: 'c5', label: 'Analiza y saca conclusiones', icon: 'TrendingUp', correct: '5', pista: 'Al final se interpreta y concluye.' }
    ]
  },

  negocios: {
    titulo: 'Asignar el presupuesto',
    instruccion: 'Clasifica cada gasto según su impacto en el negocio.',
    modo: 'clasificar',
    slots: [
      { id: 'esencial', label: 'Esencial', icon: 'ShieldCheck' },
      { id: 'crecimiento', label: 'Inversión en crecimiento', icon: 'TrendingUp' },
      { id: 'prescindible', label: 'Prescindible', icon: 'Wallet' }
    ],
    items: [
      { id: 'n1', label: 'Sueldos del equipo', icon: 'Users', correct: 'esencial', pista: 'Sin equipo no hay empresa.' },
      { id: 'n2', label: 'Licencias del software base', icon: 'Briefcase', correct: 'esencial', pista: 'Herramientas indispensables para operar.' },
      { id: 'n3', label: 'Campaña de marketing', icon: 'Megaphone', correct: 'crecimiento', pista: 'Atrae clientes nuevos: inversión.' },
      { id: 'n4', label: 'Capacitación del equipo', icon: 'GraduationCap', correct: 'crecimiento', pista: 'Mejora el futuro del negocio.' },
      { id: 'n5', label: 'Decoración de la oficina', icon: 'Paintbrush', correct: 'prescindible', pista: 'Agradable, pero no mueve la aguja.' },
      { id: 'n6', label: 'Máquinas de café premium', icon: 'Coins', correct: 'prescindible', pista: 'Un lujo, no una prioridad.' }
    ]
  },

  educacion: {
    titulo: 'Diseñar la clase',
    instruccion: 'Coloca cada momento de la clase en su etapa.',
    modo: 'clasificar',
    slots: [
      { id: 'inicio', label: 'Inicio', icon: 'Play' },
      { id: 'desarrollo', label: 'Desarrollo', icon: 'BookOpen' },
      { id: 'cierre', label: 'Cierre', icon: 'CheckCircle2' }
    ],
    items: [
      { id: 'e1', label: 'Pregunta para despertar interés', icon: 'HelpCircle', correct: 'inicio', pista: 'Se engancha al inicio de la clase.' },
      { id: 'e2', label: 'Objetivo de la clase', icon: 'Target', correct: 'inicio', pista: 'Se anuncia qué se aprenderá.' },
      { id: 'e3', label: 'Explicación del tema', icon: 'BookOpen', correct: 'desarrollo', pista: 'El núcleo de la clase.' },
      { id: 'e4', label: 'Práctica guiada en grupo', icon: 'Users', correct: 'desarrollo', pista: 'Se aplica lo aprendido.' },
      { id: 'e5', label: 'Resumen y reflexión final', icon: 'MessageCircle', correct: 'cierre', pista: 'Consolida el aprendizaje.' },
      { id: 'e6', label: 'Preguntas de metacognición', icon: 'Sparkles', correct: 'cierre', pista: 'Se piensa cómo se aprendió.' }
    ]
  },

  arte: {
    titulo: 'Componer la identidad de marca',
    instruccion: 'Clasifica cada elemento en su categoría del diseño.',
    modo: 'clasificar',
    slots: [
      { id: 'logo', label: 'Logotipo', icon: 'PenTool' },
      { id: 'color', label: 'Paleta de color', icon: 'Palette' },
      { id: 'tipo', label: 'Tipografía', icon: 'Type' }
    ],
    items: [
      { id: 'a1', label: 'Símbolo o ícono principal', icon: 'PenTool', correct: 'logo', pista: 'La marca gráfica.' },
      { id: 'a2', label: 'Versión en blanco y negro', icon: 'Eye', correct: 'logo', pista: 'Variante del logotipo.' },
      { id: 'a3', label: 'Azul profundo + arena', icon: 'Palette', correct: 'color', pista: 'Una paleta de colores.' },
      { id: 'a4', label: 'Verde menta + gris', icon: 'Paintbrush', correct: 'color', pista: 'Otra paleta de colores.' },
      { id: 'a5', label: 'Fuente sans-serif moderna', icon: 'Type', correct: 'tipo', pista: 'Una tipografía.' },
      { id: 'a6', label: 'Fuente serif elegante', icon: 'FileText', correct: 'tipo', pista: 'La tipografía para textos largos.' }
    ]
  },

  derecho: {
    titulo: 'Ruta de un caso legal',
    instruccion: 'Ordena los pasos del proceso de principio a fin.',
    modo: 'ordenar',
    slots: [
      { id: '1', label: '1er paso', icon: 'MessageCircle' },
      { id: '2', label: '2do paso', icon: 'Search' },
      { id: '3', label: '3er paso', icon: 'Scale' },
      { id: '4', label: '4to paso', icon: 'FileText' },
      { id: '5', label: '5to paso', icon: 'Gavel' }
    ],
    items: [
      { id: 'd1', label: 'Recibe y escucha al cliente', icon: 'MessageCircle', correct: '1', pista: 'Primero se conoce el caso.' },
      { id: 'd2', label: 'Analiza los hechos y las pruebas', icon: 'Search', correct: '2', pista: 'Se examinan los hechos.' },
      { id: 'd3', label: 'Identifica la norma aplicable', icon: 'Scale', correct: '3', pista: 'Se ubica la ley correspondiente.' },
      { id: 'd4', label: 'Redacta la demanda o el contrato', icon: 'FileText', correct: '4', pista: 'Se redacta el documento legal.' },
      { id: 'd5', label: 'Presenta ante el juzgado', icon: 'Gavel', correct: '5', pista: 'Finalmente, se presenta formalmente.' }
    ]
  },

  naturaleza: {
    titulo: 'Plan de acción ambiental',
    instruccion: 'Clasifica cada acción según el plazo en que actúa.',
    modo: 'clasificar',
    slots: [
      { id: 'inmediata', label: 'Acción inmediata', icon: 'Zap' },
      { id: 'largo', label: 'Acción a largo plazo', icon: 'TreePine' }
    ],
    items: [
      { id: 'v1', label: 'Analizar muestras de agua', icon: 'Droplet', correct: 'inmediata', pista: 'Necesario para diagnosticar ya.' },
      { id: 'v2', label: 'Cercar la zona afectada', icon: 'ShieldAlert', correct: 'inmediata', pista: 'Evita que el daño se extienda.' },
      { id: 'v3', label: 'Prohibir el riego por una semana', icon: 'Clock', correct: 'inmediata', pista: 'Medida urgente de contención.' },
      { id: 'v4', label: 'Reforestar la ribera', icon: 'TreePine', correct: 'largo', pista: 'Restaura poco a poco el ecosistema.' },
      { id: 'v5', label: 'Educar a la comunidad', icon: 'GraduationCap', correct: 'largo', pista: 'Cambia hábitos sosteniblemente.' },
      { id: 'v6', label: 'Monitoreo continuo del suelo', icon: 'Waves', correct: 'largo', pista: 'Seguimiento permanente en el tiempo.' }
    ]
  }
};

export function actividadDe(areaId) {
  return SIM_ACTIVITY[areaId] || null;
}
