export type GameCategory =
  | 'all'
  | 'god-mode'
  | 'physics'
  | 'data-viz'
  | 'ai-text'
  | 'skill'
  | 'geography';

export interface GameTheme {
  gradient: [string, string];
  accent: string;
  icon: string;
  pattern: string;
}

export interface Game {
  id: string;
  title: string;
  title_es?: string;
  description: string;
  description_es?: string;
  thumbnail?: string;
  path: string;
  theme: GameTheme;
  category: GameCategory;
  difficulty?: 'easy' | 'medium' | 'hard' | 'insane';
  tags?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
}

export const categories: { id: GameCategory; label: string; label_es: string; icon: string; color: string }[] = [
  { id: 'all', label: 'All Games', label_es: 'Todos', icon: '🎮', color: '#6366f1' },
  { id: 'god-mode', label: 'God Mode', label_es: 'Modo Dios', icon: '⚡', color: '#f59e0b' },
  { id: 'physics', label: 'Physics Toys', label_es: 'Física', icon: '🧲', color: '#ef4444' },
  { id: 'data-viz', label: 'Data & Scale', label_es: 'Datos y Escala', icon: '📊', color: '#06b6d4' },
  { id: 'ai-text', label: 'AI & Text', label_es: 'IA y Texto', icon: '🤖', color: '#8b5cf6' },
  { id: 'skill', label: 'Skill & Pain', label_es: 'Habilidad', icon: '🎯', color: '#ec4899' },
  { id: 'geography', label: 'Geography', label_es: 'Geografía', icon: '🌍', color: '#10b981' },
];

export const games: Game[] = [
  // === EXISTING GAMES ===
  {
    id: "password-game",
    title: "The Password Game",
    title_es: "El Juego de la Contraseña",
    description: "Please choose a password. Rules will be added as you go.",
    description_es: "Por favor, elige una contraseña. Se añadirán reglas a medida que avances.",
    path: "/games/password-game/index.html",
    category: 'skill',
    difficulty: 'insane',
    tags: ['text', 'rules', 'frustration'],
    isFeatured: true,
    theme: {
      gradient: ['#1e1b4b', '#312e81'],
      accent: '#a78bfa',
      icon: '🔒',
      pattern: 'locks',
    },
  },
  {
    id: "infinite-craft",
    title: "Infinite Craft",
    title_es: "Crafteo Infinito",
    description: "Combine elements to discover new ones. Start with Water, Fire, Earth and Wind.",
    description_es: "Combina elementos para descubrir nuevos. Comienza con Agua, Fuego, Tierra y Viento.",
    path: "/games/infinite-craft/index.html",
    category: 'ai-text',
    difficulty: 'easy',
    tags: ['ai', 'creative', 'infinite'],
    isFeatured: true,
    theme: {
      gradient: ['#064e3b', '#065f46'],
      accent: '#34d399',
      icon: '✨',
      pattern: 'elements',
    },
  },

  // === CATEGORY A: GOD MODE SIMULATORS ===
  {
    id: "pocket-ecosystem",
    title: "Pocket Ecosystem",
    title_es: "Ecosistema de Bolsillo",
    description: "Place resources and organisms on a grid. Watch life evolve, compete, and collapse.",
    description_es: "Coloca recursos y organismos en una grilla. Observa la vida evolucionar, competir y colapsar.",
    path: "/play/pocket-ecosystem",
    category: 'god-mode',
    difficulty: 'medium',
    tags: ['simulation', 'life', 'cellular-automata'],
    isNew: true,
    theme: {
      gradient: ['#064e3b', '#022c22'],
      accent: '#4ade80',
      icon: '🦠',
      pattern: 'ecosystem',
    },
  },
  {
    id: "chaos-conductor",
    title: "Chaos Conductor",
    title_es: "Director del Caos",
    description: "Control the weather of a tiny city. Rain, sun, tornado, or alien invasion — your call.",
    description_es: "Controla el clima de una pequeña ciudad. Lluvia, sol, tornado o invasión alienígena — tú decides.",
    path: "/play/chaos-conductor",
    category: 'god-mode',
    difficulty: 'easy',
    tags: ['weather', 'city', 'chaos'],
    isNew: true,
    theme: {
      gradient: ['#1e3a5f', '#0c4a6e'],
      accent: '#38bdf8',
      icon: '🌪️',
      pattern: 'weather',
    },
  },
  {
    id: "spend-money",
    title: "Spend All The Money",
    title_es: "Gasta Todo El Dinero",
    description: "You have $100 billion. Buy everything you can imagine. Can you spend it all?",
    description_es: "Tienes $100 mil millones. Compra todo lo que puedas imaginar. ¿Puedes gastarlo todo?",
    path: "/play/spend-money",
    category: 'god-mode',
    difficulty: 'easy',
    tags: ['money', 'shopping', 'scale'],
    isFeatured: true,
    isNew: true,
    theme: {
      gradient: ['#14532d', '#166534'],
      accent: '#4ade80',
      icon: '💰',
      pattern: 'money',
    },
  },

  // === CATEGORY B: PHYSICS TOYS ===
  {
    id: "precarious-architect",
    title: "Precarious Architect",
    title_es: "Arquitecto Precario",
    description: "Stack irregular shapes as high as possible. One wrong move and it all comes crashing down.",
    description_es: "Apila formas irregulares lo más alto posible. Un movimiento en falso y todo se derrumba.",
    path: "/play/precarious-architect",
    category: 'physics',
    difficulty: 'medium',
    tags: ['stacking', 'physics', 'balance'],
    isNew: true,
    theme: {
      gradient: ['#78350f', '#92400e'],
      accent: '#fbbf24',
      icon: '🏗️',
      pattern: 'blocks',
    },
  },
  {
    id: "orbital-slingshot",
    title: "Orbital Slingshot",
    title_es: "Lanzamiento Orbital",
    description: "Use planetary gravity to slingshot a probe to its target. Master orbital mechanics!",
    description_es: "Usa la gravedad planetaria para lanzar una sonda a su objetivo. ¡Domina la mecánica orbital!",
    path: "/play/orbital-slingshot",
    category: 'physics',
    difficulty: 'hard',
    tags: ['space', 'gravity', 'trajectory'],
    isNew: true,
    theme: {
      gradient: ['#0f172a', '#1e1b4b'],
      accent: '#818cf8',
      icon: '🚀',
      pattern: 'orbital',
    },
  },

  // === CATEGORY C: DATA & VISUALIZATION ===
  {
    id: "infinite-timeline",
    title: "The Infinite Timeline",
    title_es: "La Línea de Tiempo Infinita",
    description: "Scroll from the Big Bang to the heat death of the universe. 13.8 billion years of history.",
    description_es: "Desplázate desde el Big Bang hasta la muerte térmica del universo. 13.800 millones de años de historia.",
    path: "/play/infinite-timeline",
    category: 'data-viz',
    difficulty: 'easy',
    tags: ['scroll', 'history', 'scale', 'time'],
    isNew: true,
    theme: {
      gradient: ['#1e1b4b', '#312e81'],
      accent: '#c4b5fd',
      icon: '⏳',
      pattern: 'timeline',
    },
  },
  {
    id: "speed-of-light",
    title: "Speed of Light Voyager",
    title_es: "Viajero a la Velocidad de la Luz",
    description: "Travel at light speed from Earth. Watch in real-time as you pass the Moon, Mars, and beyond.",
    description_es: "Viaja a la velocidad de la luz desde la Tierra. Observa en tiempo real cómo pasas la Luna, Marte y más allá.",
    path: "/play/speed-of-light",
    category: 'data-viz',
    difficulty: 'easy',
    tags: ['space', 'realtime', 'scale', 'light'],
    isNew: true,
    isFeatured: true,
    theme: {
      gradient: ['#0c0a09', '#1c1917'],
      accent: '#fde68a',
      icon: '💫',
      pattern: 'stars',
    },
  },

  // === CATEGORY D: AI & TEXT ===
  {
    id: "lie-detector",
    title: "AI Lie Detector",
    title_es: "Detector de Mentiras IA",
    description: "Tell a story. The AI will analyze it and decide if you're lying or telling the truth.",
    description_es: "Cuenta una historia. La IA la analizará y decidirá si mientes o dices la verdad.",
    path: "/play/lie-detector",
    category: 'ai-text',
    difficulty: 'easy',
    tags: ['ai', 'text', 'analysis'],
    isNew: true,
    theme: {
      gradient: ['#450a0a', '#7f1d1d'],
      accent: '#fca5a5',
      icon: '🔍',
      pattern: 'interrogation',
    },
  },
  {
    id: "infinite-debate",
    title: "Infinite Debate",
    title_es: "Debate Infinito",
    description: "Pick two characters and a topic. Watch AI generate an epic debate turn by turn.",
    description_es: "Elige dos personajes y un tema. Observa cómo la IA genera un debate épico turno a turno.",
    path: "/play/infinite-debate",
    category: 'ai-text',
    difficulty: 'easy',
    tags: ['ai', 'debate', 'characters'],
    isNew: true,
    theme: {
      gradient: ['#4a1d96', '#5b21b6'],
      accent: '#c084fc',
      icon: '🎭',
      pattern: 'debate',
    },
  },

  // === CATEGORY E: SKILL & PAIN GAMES ===
  {
    id: "perfect-alignment",
    title: "Perfect Alignment",
    title_es: "Alineación Perfecta",
    description: "Straighten crooked frames, align books, fix tiles. Pixel-perfect precision required.",
    description_es: "Endereza cuadros torcidos, alinea libros, arregla baldosas. Se requiere precisión al píxel.",
    path: "/play/perfect-alignment",
    category: 'skill',
    difficulty: 'hard',
    tags: ['precision', 'ocd', 'satisfying'],
    isNew: true,
    isFeatured: true,
    theme: {
      gradient: ['#1e293b', '#334155'],
      accent: '#94a3b8',
      icon: '📐',
      pattern: 'alignment',
    },
  },
  {
    id: "dead-pixel",
    title: "The Dead Pixel",
    title_es: "El Píxel Muerto",
    description: "Find the ONE pixel that's slightly different. Your eyes will hate you.",
    description_es: "Encuentra EL píxel que es ligeramente diferente. Tus ojos te odiarán.",
    path: "/play/dead-pixel",
    category: 'skill',
    difficulty: 'insane',
    tags: ['vision', 'pixel', 'impossible'],
    isNew: true,
    theme: {
      gradient: ['#18181b', '#27272a'],
      accent: '#71717a',
      icon: '🔲',
      pattern: 'pixels',
    },
  },
  {
    id: "loading-simulator",
    title: "Loading Simulator",
    title_es: "Simulador de Carga",
    description: "Get the loading bar to 100%. But popups, errors, and chaos will try to stop you.",
    description_es: "Lleva la barra de carga al 100%. Pero popups, errores y caos intentarán detenerte.",
    path: "/play/loading-simulator",
    category: 'skill',
    difficulty: 'medium',
    tags: ['retro', 'nostalgia', 'quick-time'],
    isNew: true,
    theme: {
      gradient: ['#008080', '#004d4d'],
      accent: '#c0c0c0',
      icon: '⏳',
      pattern: 'loading',
    },
  },
  {
    id: "mouse-balancer",
    title: "Mouse Balancer",
    title_es: "Equilibrista de Ratón",
    description: "Keep your cursor on the shrinking, moving path. Don't touch the edges!",
    description_es: "Mantén tu cursor en el camino que se mueve y encoge. ¡No toques los bordes!",
    path: "/play/mouse-balancer",
    category: 'skill',
    difficulty: 'hard',
    tags: ['mouse', 'precision', 'nerve'],
    isNew: true,
    theme: {
      gradient: ['#7f1d1d', '#991b1b'],
      accent: '#f87171',
      icon: '🖱️',
      pattern: 'path',
    },
  },

  // === CATEGORY F: GEOGRAPHY ===
  {
    id: "city-guesser-audio",
    title: "City Guesser Audio",
    title_es: "Adivina la Ciudad por Audio",
    description: "Listen to ambient sounds of a city. Guess which city it is on the map.",
    description_es: "Escucha los sonidos ambientales de una ciudad. Adivina cuál es en el mapa.",
    path: "/play/city-guesser-audio",
    category: 'geography',
    difficulty: 'hard',
    tags: ['audio', 'cities', 'guessing'],
    isNew: true,
    theme: {
      gradient: ['#0f766e', '#115e59'],
      accent: '#2dd4bf',
      icon: '🎧',
      pattern: 'soundwave',
    },
  },
];
