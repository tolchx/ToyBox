export interface TutorialStep {
  icon: string;
  title: string;
  title_es: string;
  description: string;
  description_es: string;
}

export interface GameTutorial {
  gameId: string;
  steps: TutorialStep[];
}

export const gameTutorials: Record<string, TutorialStep[]> = {
  // === PASSWORD GAME ===
  "password-game": [
    {
      icon: "🔒",
      title: "Create a Password",
      title_es: "Crea una Contraseña",
      description: "Type a password in the input field. It starts simple but gets wild!",
      description_es: "Escribe una contraseña en el campo. ¡Empieza simple pero se pone loco!",
    },
    {
      icon: "📜",
      title: "Follow the Rules",
      title_es: "Sigue las Reglas",
      description: "New rules appear as you progress. Your password must satisfy ALL rules at once.",
      description_es: "Nuevas reglas aparecen a medida que avanzas. Tu contraseña debe cumplir TODAS las reglas a la vez.",
    },
    {
      icon: "🧠",
      title: "Think Creatively",
      title_es: "Piensa Creativamente",
      description: "Rules get increasingly absurd — emojis, math, chess moves. Stay calm and adapt!",
      description_es: "Las reglas se vuelven cada vez más absurdas — emojis, matemáticas, jugadas de ajedrez. ¡Mantén la calma y adáptate!",
    },
  ],

  // === INFINITE CRAFT ===
  "infinite-craft": [
    {
      icon: "🌊",
      title: "Start with 4 Elements",
      title_es: "Empieza con 4 Elementos",
      description: "You begin with Water, Fire, Earth, and Wind. Drag them onto the canvas.",
      description_es: "Comienzas con Agua, Fuego, Tierra y Viento. Arrástralos al lienzo.",
    },
    {
      icon: "🔗",
      title: "Combine Elements",
      title_es: "Combina Elementos",
      description: "Drag one element onto another to combine them and discover new ones!",
      description_es: "Arrastra un elemento sobre otro para combinarlos y descubrir nuevos.",
    },
    {
      icon: "✨",
      title: "Discover Everything",
      title_es: "Descubre Todo",
      description: "There are infinite combinations. Can you find the rarest discoveries?",
      description_es: "Hay combinaciones infinitas. ¿Puedes encontrar los descubrimientos más raros?",
    },
  ],

  // === POCKET ECOSYSTEM ===
  "pocket-ecosystem": [
    {
      icon: "🎨",
      title: "Select an Element",
      title_es: "Selecciona un Elemento",
      description: "Choose from Water 💧, Plants 🌿, Herbivores 🐰, or Carnivores 🦊 in the toolbar.",
      description_es: "Elige entre Agua 💧, Plantas 🌿, Herbívoros 🐰 o Carnívoros 🦊 en la barra.",
    },
    {
      icon: "🖱️",
      title: "Place on the Grid",
      title_es: "Coloca en la Grilla",
      description: "Click or drag on the grid to place your selected element. Build your ecosystem!",
      description_es: "Haz clic o arrastra en la grilla para colocar tu elemento. ¡Construye tu ecosistema!",
    },
    {
      icon: "⏯️",
      title: "Watch Life Evolve",
      title_es: "Observa la Vida Evolucionar",
      description: "Press Play to start the simulation. Plants grow near water, herbivores eat plants, carnivores hunt herbivores.",
      description_es: "Presiona Play para iniciar la simulación. Las plantas crecen cerca del agua, los herbívoros comen plantas, los carnívoros cazan herbívoros.",
    },
    {
      icon: "⚖️",
      title: "Balance the Ecosystem",
      title_es: "Equilibra el Ecosistema",
      description: "Too many carnivores? They'll starve. No water? Plants die. Find the perfect balance!",
      description_es: "¿Demasiados carnívoros? Morirán de hambre. ¿Sin agua? Las plantas mueren. ¡Encuentra el equilibrio perfecto!",
    },
  ],

  // === CHAOS CONDUCTOR ===
  "chaos-conductor": [
    {
      icon: "🌤️",
      title: "Choose the Weather",
      title_es: "Elige el Clima",
      description: "Click the weather buttons to change conditions: Sun ☀️, Rain 🌧️, Storm ⛈️, Tornado 🌪️, Blizzard ❄️, or UFO 🛸!",
      description_es: "Haz clic en los botones de clima para cambiar condiciones: Sol ☀️, Lluvia 🌧️, Tormenta ⛈️, Tornado 🌪️, Ventisca ❄️ o OVNI 🛸!",
    },
    {
      icon: "👥",
      title: "Watch the Citizens",
      title_es: "Observa a los Ciudadanos",
      description: "Citizens react to the weather — they run indoors during storms and panic during tornados!",
      description_es: "Los ciudadanos reaccionan al clima — corren adentro durante tormentas y entran en pánico con tornados.",
    },
    {
      icon: "🌪️",
      title: "Create Chaos",
      title_es: "Crea el Caos",
      description: "Combine extreme weather events and watch the city descend into beautiful chaos!",
      description_es: "Combina eventos climáticos extremos y observa la ciudad sumirse en un hermoso caos.",
    },
  ],

  // === SPEND MONEY ===
  "spend-money": [
    {
      icon: "💰",
      title: "You Have $100 Billion",
      title_es: "Tienes $100 Mil Millones",
      description: "Your mission: spend every last dollar. Browse the shop and start buying!",
      description_es: "Tu misión: gastar hasta el último dólar. ¡Navega la tienda y empieza a comprar!",
    },
    {
      icon: "🛒",
      title: "Buy Items",
      title_es: "Compra Artículos",
      description: "Click + to buy and - to sell. Items range from a $5 Big Mac to a $10B Airline!",
      description_es: "Haz clic en + para comprar y - para vender. Los artículos van desde un Big Mac de $5 hasta una Aerolínea de $10B.",
    },
    {
      icon: "🧾",
      title: "Check Your Receipt",
      title_es: "Revisa tu Recibo",
      description: "See your total spending and remaining budget. Can you get it to exactly $0?",
      description_es: "Mira tu gasto total y presupuesto restante. ¿Puedes llegar exactamente a $0?",
    },
  ],

  // === PRECARIOUS ARCHITECT ===
  "precarious-architect": [
    {
      icon: "🏗️",
      title: "Stack the Blocks",
      title_es: "Apila los Bloques",
      description: "A block moves across the screen. Click or tap to drop it onto the tower!",
      description_es: "Un bloque se mueve por la pantalla. ¡Haz clic o toca para soltarlo sobre la torre!",
    },
    {
      icon: "📐",
      title: "Align Precisely",
      title_es: "Alinea con Precisión",
      description: "The closer to center you drop, the more stable your tower. Misaligned blocks get trimmed!",
      description_es: "Cuanto más centrado lo sueltes, más estable será tu torre. ¡Los bloques desalineados se recortan!",
    },
    {
      icon: "🏆",
      title: "Build Higher",
      title_es: "Construye Más Alto",
      description: "Blocks get faster and shapes get trickier. How high can you go before it all collapses?",
      description_es: "Los bloques se aceleran y las formas se complican. ¿Qué tan alto puedes llegar antes de que todo colapse?",
    },
  ],

  // === ORBITAL SLINGSHOT ===
  "orbital-slingshot": [
    {
      icon: "🚀",
      title: "Aim Your Probe",
      title_es: "Apunta tu Sonda",
      description: "Click and drag from the probe to set its launch direction and speed.",
      description_es: "Haz clic y arrastra desde la sonda para establecer su dirección y velocidad de lanzamiento.",
    },
    {
      icon: "🪐",
      title: "Use Gravity",
      title_es: "Usa la Gravedad",
      description: "Planets have gravity! Slingshot your probe around them to reach the target zone.",
      description_es: "¡Los planetas tienen gravedad! Usa el efecto honda alrededor de ellos para alcanzar la zona objetivo.",
    },
    {
      icon: "🎯",
      title: "Hit the Target",
      title_es: "Alcanza el Objetivo",
      description: "Guide your probe into the green target zone. Each level adds more planets and complexity!",
      description_es: "Guía tu sonda a la zona objetivo verde. ¡Cada nivel agrega más planetas y complejidad!",
    },
  ],

  // === INFINITE TIMELINE ===
  "infinite-timeline": [
    {
      icon: "⏳",
      title: "Scroll Through Time",
      title_es: "Desplázate por el Tiempo",
      description: "Use your mouse wheel or drag to scroll through 13.8 billion years of history.",
      description_es: "Usa la rueda del ratón o arrastra para desplazarte por 13.800 millones de años de historia.",
    },
    {
      icon: "📍",
      title: "Discover Events",
      title_es: "Descubre Eventos",
      description: "Key events appear as you scroll — from the Big Bang to the present day and beyond!",
      description_es: "Eventos clave aparecen mientras te desplazas — ¡desde el Big Bang hasta el presente y más allá!",
    },
    {
      icon: "🔍",
      title: "Feel the Scale",
      title_es: "Siente la Escala",
      description: "Notice how human history is just a tiny sliver at the end. The universe is VAST!",
      description_es: "Nota cómo la historia humana es solo una pequeña franja al final. ¡El universo es INMENSO!",
    },
  ],

  // === SPEED OF LIGHT ===
  "speed-of-light": [
    {
      icon: "💫",
      title: "Start Your Journey",
      title_es: "Inicia tu Viaje",
      description: "Press Start to begin traveling at the speed of light (299,792 km/s) from Earth.",
      description_es: "Presiona Iniciar para comenzar a viajar a la velocidad de la luz (299.792 km/s) desde la Tierra.",
    },
    {
      icon: "🌙",
      title: "Pass Celestial Bodies",
      title_es: "Pasa Cuerpos Celestes",
      description: "Watch in real-time as you pass the Moon (1.3s), Mars (~3min), Jupiter, and beyond!",
      description_es: "¡Observa en tiempo real cómo pasas la Luna (1.3s), Marte (~3min), Júpiter y más allá!",
    },
    {
      icon: "🌌",
      title: "Feel the Distance",
      title_es: "Siente la Distancia",
      description: "Even at light speed, space is enormous. It takes 4+ years to reach the nearest star!",
      description_es: "Incluso a la velocidad de la luz, el espacio es enorme. ¡Toma 4+ años llegar a la estrella más cercana!",
    },
  ],

  // === LIE DETECTOR ===
  "lie-detector": [
    {
      icon: "📝",
      title: "Tell a Story",
      title_es: "Cuenta una Historia",
      description: "Type a story in the text box — it can be true or completely made up!",
      description_es: "Escribe una historia en el cuadro de texto — ¡puede ser verdadera o completamente inventada!",
    },
    {
      icon: "🔍",
      title: "Submit for Analysis",
      title_es: "Envía para Análisis",
      description: "Click Analyze and watch the AI scan your text for signs of deception.",
      description_es: "Haz clic en Analizar y observa cómo la IA escanea tu texto en busca de señales de engaño.",
    },
    {
      icon: "⚖️",
      title: "Get the Verdict",
      title_es: "Obtén el Veredicto",
      description: "The AI gives a TRUTH or LIE verdict with confidence % and detailed reasoning!",
      description_es: "¡La IA da un veredicto de VERDAD o MENTIRA con % de confianza y razonamiento detallado!",
    },
  ],

  // === INFINITE DEBATE ===
  "infinite-debate": [
    {
      icon: "🎭",
      title: "Pick Two Characters",
      title_es: "Elige Dos Personajes",
      description: "Select two debaters from the roster — Socrates, a Pirate, a Robot, Grandma, and more!",
      description_es: "Selecciona dos debatientes del roster — Sócrates, un Pirata, un Robot, la Abuela, ¡y más!",
    },
    {
      icon: "💬",
      title: "Choose a Topic",
      title_es: "Elige un Tema",
      description: "Pick a debate topic or enter your own. The weirder, the better!",
      description_es: "Elige un tema de debate o ingresa el tuyo. ¡Cuanto más raro, mejor!",
    },
    {
      icon: "🎬",
      title: "Watch the Debate",
      title_es: "Mira el Debate",
      description: "The AI generates arguments turn by turn. Each character debates in their unique style!",
      description_es: "La IA genera argumentos turno a turno. ¡Cada personaje debate con su estilo único!",
    },
  ],

  // === PERFECT ALIGNMENT ===
  "perfect-alignment": [
    {
      icon: "📐",
      title: "See the Misalignment",
      title_es: "Ve la Desalineación",
      description: "Each level shows a crooked object — a frame, books, tiles. Your job: fix it!",
      description_es: "Cada nivel muestra un objeto torcido — un cuadro, libros, baldosas. ¡Tu trabajo: arreglarlo!",
    },
    {
      icon: "🖱️",
      title: "Drag to Align",
      title_es: "Arrastra para Alinear",
      description: "Click and drag the object to straighten it. Get as close to perfect as possible!",
      description_es: "Haz clic y arrastra el objeto para enderezarlo. ¡Acércate lo más posible a la perfección!",
    },
    {
      icon: "⭐",
      title: "Score Points",
      title_es: "Gana Puntos",
      description: "The closer to perfect alignment, the higher your score. Can you get 100% accuracy?",
      description_es: "Cuanto más cerca de la alineación perfecta, mayor tu puntuación. ¿Puedes lograr 100% de precisión?",
    },
  ],

  // === DEAD PIXEL ===
  "dead-pixel": [
    {
      icon: "🔲",
      title: "Look Carefully",
      title_es: "Mira con Cuidado",
      description: "A grid of colored pixels is shown. ONE pixel is slightly different from the rest.",
      description_es: "Se muestra una grilla de píxeles de color. UN píxel es ligeramente diferente del resto.",
    },
    {
      icon: "👁️",
      title: "Find & Click It",
      title_es: "Encuéntralo y Haz Clic",
      description: "Click on the pixel that looks different. Be precise — wrong clicks are counted!",
      description_es: "Haz clic en el píxel que se ve diferente. ¡Sé preciso — los clics erróneos se cuentan!",
    },
    {
      icon: "😈",
      title: "It Gets Harder",
      title_es: "Se Pone Más Difícil",
      description: "Each level: more pixels, smaller difference. Your eyes will hate you. Good luck!",
      description_es: "Cada nivel: más píxeles, menor diferencia. Tus ojos te odiarán. ¡Buena suerte!",
    },
  ],

  // === LOADING SIMULATOR ===
  "loading-simulator": [
    {
      icon: "⏳",
      title: "Watch the Progress Bar",
      title_es: "Mira la Barra de Progreso",
      description: "A loading bar is trying to reach 100%. Your job: help it get there!",
      description_es: "Una barra de carga intenta llegar al 100%. ¡Tu trabajo: ayudarla a lograrlo!",
    },
    {
      icon: "🚫",
      title: "Dismiss Interruptions",
      title_es: "Cierra las Interrupciones",
      description: "Popups, error messages, and chaos will appear. Click X or Dismiss to close them fast!",
      description_es: "Aparecerán popups, mensajes de error y caos. ¡Haz clic en X o Cerrar para eliminarlos rápido!",
    },
    {
      icon: "🏁",
      title: "Reach 100%",
      title_es: "Llega al 100%",
      description: "Keep dismissing obstacles until the download completes. Speed matters!",
      description_es: "Sigue cerrando obstáculos hasta que la descarga se complete. ¡La velocidad importa!",
    },
  ],

  // === MOUSE BALANCER ===
  "mouse-balancer": [
    {
      icon: "🖱️",
      title: "Hover to Start",
      title_es: "Pasa el Cursor para Empezar",
      description: "Move your mouse cursor to the starting zone to begin the challenge.",
      description_es: "Mueve el cursor del ratón a la zona de inicio para comenzar el desafío.",
    },
    {
      icon: "🛤️",
      title: "Stay on the Path",
      title_es: "Mantente en el Camino",
      description: "Keep your cursor on the moving, shrinking path. Don't touch the edges!",
      description_es: "Mantén tu cursor en el camino que se mueve y encoge. ¡No toques los bordes!",
    },
    {
      icon: "⏱️",
      title: "Survive as Long as Possible",
      title_es: "Sobrevive lo Más Posible",
      description: "The path gets narrower and moves faster. Beat your best score!",
      description_es: "El camino se estrecha y se mueve más rápido. ¡Supera tu mejor puntuación!",
    },
  ],

  // === CITY GUESSER AUDIO ===
  "city-guesser-audio": [
    {
      icon: "🎧",
      title: "Listen to the Sounds",
      title_es: "Escucha los Sonidos",
      description: "Press Play to hear ambient sounds from a mystery city. Listen carefully!",
      description_es: "Presiona Play para escuchar sonidos ambientales de una ciudad misteriosa. ¡Escucha con atención!",
    },
    {
      icon: "🗺️",
      title: "Guess on the Map",
      title_es: "Adivina en el Mapa",
      description: "Click on the map where you think the city is located.",
      description_es: "Haz clic en el mapa donde crees que está ubicada la ciudad.",
    },
    {
      icon: "📏",
      title: "Score by Distance",
      title_es: "Puntuación por Distancia",
      description: "The closer your guess to the real city, the more points you earn!",
      description_es: "¡Cuanto más cerca esté tu respuesta de la ciudad real, más puntos ganas!",
    },
  ],
};
