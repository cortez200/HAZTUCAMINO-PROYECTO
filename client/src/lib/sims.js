/* Tema visual de las simulaciones por área.
   Define actores y medidores para la escena interactiva. */

export const SIM_THEME = {
  salud: {
    actores: [
      { icon: 'HeartPulse', label: 'Paciente' },
      { icon: 'Stethoscope', label: 'Colega' },
      { icon: 'Users', label: 'Familia' }
    ],
    medidores: [
      { label: 'Precisión', icon: 'Target' },
      { label: 'Empatía', icon: 'Heart' }
    ]
  },
  tecnologia: {
    actores: [
      { icon: 'Wifi', label: 'Producción' },
      { icon: 'Users', label: 'Equipo' },
      { icon: 'Cpu', label: 'Deploy' }
    ],
    medidores: [
      { label: 'Precisión', icon: 'Target' },
      { label: 'Velocidad', icon: 'Zap' }
    ]
  },
  ciencias: {
    actores: [
      { icon: 'FlaskConical', label: 'Muestra' },
      { icon: 'Microscope', label: 'Análisis' },
      { icon: 'ClipboardCheck', label: 'Datos' }
    ],
    medidores: [
      { label: 'Rigor', icon: 'Target' },
      { label: 'Curiosidad', icon: 'Lightbulb' }
    ]
  },
  negocios: {
    actores: [
      { icon: 'CircleDollarSign', label: 'Presupuesto' },
      { icon: 'Users', label: 'Cliente' },
      { icon: 'TrendingUp', label: 'Mercado' }
    ],
    medidores: [
      { label: 'Rentabilidad', icon: 'TrendingUp' },
      { label: 'Estrategia', icon: 'Target' }
    ]
  },
  educacion: {
    actores: [
      { icon: 'GraduationCap', label: 'Estudiantes' },
      { icon: 'BookOpen', label: 'Clase' },
      { icon: 'Lightbulb', label: 'Motivación' }
    ],
    medidores: [
      { label: 'Claridad', icon: 'Target' },
      { label: 'Empatía', icon: 'Heart' }
    ]
  },
  arte: {
    actores: [
      { icon: 'Palette', label: 'Concepto' },
      { icon: 'PenTool', label: 'Diseño' },
      { icon: 'Eye', label: 'Cliente' }
    ],
    medidores: [
      { label: 'Creatividad', icon: 'Sparkles' },
      { label: 'Brief', icon: 'Target' }
    ]
  },
  derecho: {
    actores: [
      { icon: 'Gavel', label: 'Norma' },
      { icon: 'Users', label: 'Cliente' },
      { icon: 'FileText', label: 'Expediente' }
    ],
    medidores: [
      { label: 'Argumento', icon: 'Scale' },
      { label: 'Empatía', icon: 'Heart' }
    ]
  },
  naturaleza: {
    actores: [
      { icon: 'Leaf', label: 'Cultivo' },
      { icon: 'Users', label: 'Familias' },
      { icon: 'Zap', label: 'Recursos' }
    ],
    medidores: [
      { label: 'Rigor', icon: 'Target' },
      { label: 'Sostenibilidad', icon: 'Leaf' }
    ]
  }
};

export function themeDe(areaId) {
  return SIM_THEME[areaId] || {
    actores: [
      { icon: 'ClipboardList', label: 'Tarea' },
      { icon: 'Users', label: 'Equipo' },
      { icon: 'Target', label: 'Meta' }
    ],
    medidores: [
      { label: 'Criterio', icon: 'Target' },
      { label: 'Actitud', icon: 'Heart' }
    ]
  };
}

/* Elige un icono representativo para una opción según su texto. */
const ICON_RULES = [
  [/gravedad|urgenc|prioriz|triaje|alerta|emergenc|cr[ií]tic|riesgo|peligr/i, 'AlertTriangle'],
  [/evita|ignora|deja pasar|posterg|omite|no haces nada|sin hacer/i, 'XCircle'],
  [/explica|comunica|habla|informa|conversa|pregunta|escucha|acompa[ñn]a|calma|palabras simples|dialoga/i, 'MessageCircle'],
  [/presupuesto|dinero|inviert|cost|soles|rentab|gasto/i, 'CircleDollarSign'],
  [/datos|medici[oó]n|registra|documenta|anota|prueba|experiment|evidencia|mide/i, 'ClipboardCheck'],
  [/investiga|busca|analiza|diagn[oó]stic|estudia|hip[oó]tesis|eval[uú]a/i, 'Search'],
  [/prototipo|dise[ñn]|creativ|boceto|marca|visual|concepto/i, 'PenTool'],
  [/norma|ley|legal|argumenta|derecho|contrato|expediente/i, 'Scale'],
  [/ambient|sostenib|recurs|suelo|agua|cultiv|ecolog|plaga/i, 'Leaf'],
  [/equipo|colabora|delegar|comparte|reuni[oó]n|junto/i, 'Users'],
  [/planifica|organiza|estrategia|objetivo|meta|prioriza tareas/i, 'Target'],
  [/tiempo|r[aá]pid|espera|plazo|demora|urgen/i, 'Timer'],
  [/paciente|persona|familia|usuario|cliente|estudiante|comunidad/i, 'Users']
];

export function iconForOption(text = '') {
  for (const [re, icon] of ICON_RULES) if (re.test(text)) return icon;
  return 'HelpCircle';
}
