"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/language';

interface TimelineEvent {
    year: number;
    label: string;
    label_es: string;
    emoji: string;
    color: string;
    category: string;
    category_es: string;
    description: string;
    description_es: string;
}

const events: TimelineEvent[] = [
    // Cosmos
    {
        year: -13800000000, label: 'The Big Bang', label_es: 'El Big Bang', emoji: '💥', color: '#ef4444', category: 'Cosmos', category_es: 'Cosmos',
        description: "The universe begins as a hot, dense point and rapidly expands.",
        description_es: "El universo comienza como un punto caliente y denso y se expande rápidamente."
    },
    {
        year: -13300000000, label: 'First Stars Form', label_es: 'Se forman las primeras estrellas', emoji: '⭐', color: '#fbbf24', category: 'Cosmos', category_es: 'Cosmos',
        description: "Gravity pulls gas together to ignite the first stars, ending the cosmic dark ages.",
        description_es: "La gravedad atrae el gas para encender las primeras estrellas, terminando la edad oscura cósmica."
    },
    {
        year: -10000000000, label: 'Milky Way Forms', label_es: 'Se forma la Vía Láctea', emoji: '🌌', color: '#8b5cf6', category: 'Cosmos', category_es: 'Cosmos',
        description: "Our home galaxy begins to take shape, a spiral collection of stars and dust.",
        description_es: "Nuestra galaxia comienza a tomar forma, una colección espiral de estrellas y polvo."
    },
    {
        year: -5000000000, label: 'Dark Energy Dominance', label_es: 'Dominio de la Energía Oscura', emoji: '🌌', color: '#6366f1', category: 'Cosmos', category_es: 'Cosmos',
        description: "The expansion of the universe begins to accelerate due to mysterious dark energy.",
        description_es: "La expansión del universo comienza a acelerarse debido a la misteriosa energía oscura."
    },
    {
        year: -4600000000, label: 'Solar System Forms', label_es: 'Se forma el Sistema Solar', emoji: '☀️', color: '#f59e0b', category: 'Cosmos', category_es: 'Cosmos',
        description: "A cloud of gas and dust collapses to form our Sun and the planets.",
        description_es: "Una nube de gas y polvo colapsa para formar nuestro Sol y los planetas."
    },

    // Earth & Life
    {
        year: -4500000000, label: 'Earth Forms', label_es: 'Se forma la Tierra', emoji: '🌍', color: '#3b82f6', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "Earth forms from collisions of rocky debris in the young solar system.",
        description_es: "La Tierra se forma a partir de colisiones de escombros rocosos en el joven sistema solar."
    },
    {
        year: -4400000000, label: 'The Moon Forms', label_es: 'Se forma la Luna', emoji: '🌙', color: '#94a3b8', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "A Mars-sized object impacts Earth, creating debris that forms the Moon.",
        description_es: "Un objeto del tamaño de Marte impacta la Tierra, creando escombros que forman la Luna."
    },
    {
        year: -3800000000, label: 'First Life (Bacteria)', label_es: 'Primera vida (Bacterias)', emoji: '🦠', color: '#22c55e', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "Simple single-celled organisms appear in the oceans.",
        description_es: "Organismos unicelulares simples aparecen en los océanos."
    },
    {
        year: -2400000000, label: 'Great Oxidation Event', label_es: 'Gran Evento de Oxidación', emoji: '💨', color: '#06b6d4', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "Cyanobacteria produce oxygen, changing Earth's atmosphere forever.",
        description_es: "Las cianobacterias producen oxígeno, cambiando la atmósfera de la Tierra para siempre."
    },
    {
        year: -1500000000, label: 'First Multicellular Life', label_es: 'Vida Multicelular', emoji: '🌿', color: '#10b981', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "Life becomes more complex as cells begin to work together.",
        description_es: "La vida se vuelve más compleja a medida que las células comienzan a trabajar juntas."
    },
    {
        year: -540000000, label: 'Cambrian Explosion', label_es: 'Explosión Cámbrica', emoji: '🐚', color: '#f97316', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "A sudden burst of evolutionary diversity creates most major animal groups.",
        description_es: "Un estallido repentino de diversidad evolutiva crea la mayoría de los grupos de animales principales."
    },
    {
        year: -470000000, label: 'First Land Plants', label_es: 'Primeras Plantas Terrestres', emoji: '🌲', color: '#15803d', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "Plants move from water to land, greening the continents.",
        description_es: "Las plantas pasan del agua a la tierra, reverdeciendo los continentes."
    },
    {
        year: -230000000, label: 'First Dinosaurs', label_es: 'Primeros Dinosaurios', emoji: '🦕', color: '#84cc16', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "Reptiles evolve into the first dinosaurs, beginning their long reign.",
        description_es: "Los reptiles evolucionan en los primeros dinosaurios, comenzando su largo reinado."
    },
    {
        year: -200000000, label: 'First Mammals', label_es: 'Primeros Mamíferos', emoji: '🐀', color: '#a16207', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "Small, nocturnal ancestors of modern mammals appear.",
        description_es: "Aparecen pequeños ancestros nocturnos de los mamíferos modernos."
    },
    {
        year: -130000000, label: 'First Flowers', label_es: 'Primeras Flores', emoji: '🌺', color: '#ec4899', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "Flowering plants evolve, transforming ecosystems.",
        description_es: "Las plantas con flores evolucionan, transformando los ecosistemas."
    },
    {
        year: -66000000, label: 'Dinosaur Extinction', label_es: 'Extinción de los Dinosaurios', emoji: '☄️', color: '#ef4444', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "An asteroid impact causes mass extinction, ending the age of dinosaurs.",
        description_es: "El impacto de un asteroide causa una extinción masiva, terminando la era de los dinosaurios."
    },
    {
        year: -6000000, label: 'First Hominids', label_es: 'Primeros Homínidos', emoji: '🐒', color: '#a16207', category: 'Earth & Life', category_es: 'Tierra y Vida',
        description: "Our early ancestors split from the lineage of chimpanzees.",
        description_es: "Nuestros primeros ancestros se separan del linaje de los chimpancés."
    },

    // Human History
    {
        year: -1000000, label: 'Control of Fire', label_es: 'Control del Fuego', emoji: '🔥', color: '#f97316', category: 'Human History', category_es: 'Historia Humana',
        description: "Humans learn to control fire, providing warmth, protection, and cooked food.",
        description_es: "Los humanos aprenden a controlar el fuego, proporcionando calor, protección y alimentos cocinados."
    },
    {
        year: -300000, label: 'Homo Sapiens', label_es: 'Homo Sapiens', emoji: '🧑', color: '#d97706', category: 'Human History', category_es: 'Historia Humana',
        description: "Anatomically modern humans appear in Africa.",
        description_es: "Los humanos anatómicamente modernos aparecen en África."
    },
    {
        year: -10000, label: 'Agriculture Begins', label_es: 'Comienza la Agricultura', emoji: '🌾', color: '#65a30d', category: 'Human History', category_es: 'Historia Humana',
        description: "Farming allows for permanent settlements and civilization.",
        description_es: "La agricultura permite asentamientos permanentes y la civilización."
    },
    {
        year: -3500, label: 'Invention of the Wheel', label_es: 'Invención de la Rueda', emoji: '⚙️', color: '#78716c', category: 'Human History', category_es: 'Historia Humana',
        description: "The wheel revolutionizes transport and pottery.",
        description_es: "La rueda revoluciona el transporte y la alfarería."
    },
    {
        year: -3000, label: 'First Writing', label_es: 'Primera Escritura', emoji: '📜', color: '#ca8a04', category: 'Human History', category_es: 'Historia Humana',
        description: "Writing systems emerge in Mesopotamia and Egypt.",
        description_es: "Surgen sistemas de escritura en Mesopotamia y Egipto."
    },
    {
        year: -2560, label: 'Great Pyramid Built', label_es: 'Se construye la Gran Pirámide', emoji: '🔺', color: '#d4a017', category: 'Human History', category_es: 'Historia Humana',
        description: "The Great Pyramid of Giza is completed for Pharaoh Khufu.",
        description_es: "Se completa la Gran Pirámide de Giza para el faraón enterramiento Keops."
    },
    {
        year: -500, label: 'Classical Greece', label_es: 'Grecia Clásica', emoji: '🏛️', color: '#60a5fa', category: 'Human History', category_es: 'Historia Humana',
        description: "A golden age of philosophy, art, and democracy in Athens.",
        description_es: "Una edad de oro de la filosofía, el arte y la democracia en Atenas."
    },
    {
        year: 0, label: 'Year Zero', label_es: 'Año Cero', emoji: '📅', color: '#f472b6', category: 'Human History', category_es: 'Historia Humana',
        description: "The approximate epoch of the Anno Domini calendar era.",
        description_es: "La época aproximada de la era del calendario Anno Domini."
    },
    {
        year: 1347, label: 'Black Death', label_es: 'La Peste Negra', emoji: '💀', color: '#1f2937', category: 'Human History', category_es: 'Historia Humana',
        description: "A devastating pandemic sweeps through Afro-Eurasia.",
        description_es: "Una devastadora pandemia arrasa Afro-Eurasia."
    },
    {
        year: 1440, label: 'Printing Press', label_es: 'Imprenta', emoji: '📖', color: '#78716c', category: 'Human History', category_es: 'Historia Humana',
        description: "Gutenberg's invention spreads knowledge and literacy.",
        description_es: "El invento de Gutenberg difunde el conocimiento y la alfabetización."
    },
    {
        year: 1492, label: 'Columbus Reaches Americas', label_es: 'Colón llega a América', emoji: '⛵', color: '#0ea5e9', category: 'Human History', category_es: 'Historia Humana',
        description: "This voyage connects Europe and the Americas, changing the world.",
        description_es: "Este viaje conecta Europa y las Américas, cambiando el mundo."
    },
    {
        year: 1687, label: "Newton's Principia", label_es: 'Principia de Newton', emoji: '🍎', color: '#dc2626', category: 'Human History', category_es: 'Historia Humana',
        description: "Isaac Newton publishes the laws of motion and gravity.",
        description_es: "Isaac Newton publica las leyes del movimiento y la gravedad."
    },
    {
        year: 1712, label: 'Steam Engine Invented', label_es: 'Máquina de Vapor', emoji: '🚂', color: '#57534e', category: 'Human History', category_es: 'Historia Humana',
        description: "Newcomen builds the first practical steam engine, powering industry.",
        description_es: "Newcomen construye la primera máquina de vapor práctica, impulsando la industria."
    },
    {
        year: 1776, label: 'American Independence', label_es: 'Independencia de EE.UU.', emoji: '🗽', color: '#2563eb', category: 'Human History', category_es: 'Historia Humana',
        description: "Declaration of Independence marks the birth of the United States.",
        description_es: "La Declaración de Independencia marca el nacimiento de los Estados Unidos."
    },

    // Modern Era
    {
        year: 1879, label: 'Light Bulb Invented', label_es: 'Se inventa la bombilla', emoji: '💡', color: '#eab308', category: 'Modern Era', category_es: 'Era Moderna',
        description: "Edison patent makes electric light practical for homes.",
        description_es: "La patente de Edison hace que la luz eléctrica sea práctica para los hogares."
    },
    {
        year: 1903, label: 'First Flight', label_es: 'Primer Vuelo', emoji: '✈️', color: '#64748b', category: 'Modern Era', category_es: 'Era Moderna',
        description: "The Wright brothers achieve powered flight.",
        description_es: "Los hermanos Wright logran el vuelo propulsado."
    },
    {
        year: 1928, label: 'Discovery of Penicillin', label_es: 'Descubrimiento de la Penicilina', emoji: '💊', color: '#14b8a6', category: 'Modern Era', category_es: 'Era Moderna',
        description: "Alexander Fleming discovers the first antibiotic.",
        description_es: "Alexander Fleming descubre el primer antibiótico."
    },
    {
        year: 1945, label: 'Atomic Bomb', label_es: 'Bomba Atómica', emoji: '☢️', color: '#f97316', category: 'Modern Era', category_es: 'Era Moderna',
        description: "Nuclear weapons are used for the first time in history.",
        description_es: "Las armas nucleares se usan por primera vez en la historia."
    },
    {
        year: 1953, label: 'DNA Structure Discovered', label_es: 'Estructura del ADN', emoji: '🧬', color: '#8b5cf6', category: 'Modern Era', category_es: 'Era Moderna',
        description: "Watson and Crick reveal the double helix structure of life.",
        description_es: "Watson y Crick revelan la estructura de doble hélice de la vida."
    },
    {
        year: 1969, label: 'Moon Landing', label_es: 'Llegada a la Luna', emoji: '🚀', color: '#a3a3a3', category: 'Modern Era', category_es: 'Era Moderna',
        description: "Humans set foot on another world for the first time.",
        description_es: "Los humanos pisan otro mundo por primera vez."
    },
    {
        year: 1991, label: 'World Wide Web', label_es: 'World Wide Web', emoji: '🌐', color: '#3b82f6', category: 'Modern Era', category_es: 'Era Moderna',
        description: "The internet becomes accessible to the public, connecting the world.",
        description_es: "Internet se vuelve accesible al público, conectando el mundo."
    },
    {
        year: 2007, label: 'First iPhone', label_es: 'Primer iPhone', emoji: '📱', color: '#6b7280', category: 'Modern Era', category_es: 'Era Moderna',
        description: "Smartphones revolutionize communication and technology.",
        description_es: "Los teléfonos inteligentes revolucionan la comunicación y la tecnología."
    },
    {
        year: 2024, label: 'AI Revolution', label_es: 'Revolución de la IA', emoji: '🤖', color: '#8b5cf6', category: 'Modern Era', category_es: 'Era Moderna',
        description: "Artificial Intelligence rapidly advances, transforming society.",
        description_es: "La Inteligencia Artificial avanza rápidamente, transformando la sociedad."
    },

    // Future
    {
        year: 2026, label: 'You Are Here', label_es: 'Estás Aquí', emoji: '📍', color: '#ef4444', category: 'Future', category_es: 'Futuro',
        description: "The present moment.",
        description_es: "El momento presente."
    },
    {
        year: 50000, label: 'Niagara Falls Erodes', label_es: 'Erosión de las Cataratas del Niágara', emoji: '💧', color: '#3b82f6', category: 'Future', category_es: 'Futuro',
        description: "The falls erode back to Lake Erie and cease to exist.",
        description_es: "Las cataratas se erosionan hasta el lago Erie y dejan de existir."
    },
    {
        year: 250000000, label: 'Supercontinent Amasia', label_es: 'Supercontinente Amasia', emoji: '🗺️', color: '#059669', category: 'Future', category_es: 'Futuro',
        description: "Continents merge once again into a single supercontinent.",
        description_es: "Los continentes se fusionan una vez más en un solo supercontinente."
    },
    {
        year: 5000000000, label: 'Sun Becomes Red Giant', label_es: 'El Sol se convierte en Gigante Roja', emoji: '🔴', color: '#dc2626', category: 'Future', category_es: 'Futuro',
        description: "The sun expands, swallowing the inner planets including Earth.",
        description_es: "El sol se expande, tragándose los planetas interiores, incluida la Tierra."
    },
    {
        year: 100000000000, label: 'Last Stars Die', label_es: 'Mueren las últimas estrellas', emoji: '⚫', color: '#525252', category: 'Future', category_es: 'Futuro',
        description: "The last stars burn out, leaving the universe dark.",
        description_es: "Las últimas estrellas se apagan, dejando el universo a oscuras."
    },
    {
        year: 1000000000000000, label: 'Heat Death of Universe', label_es: 'Muerte Térmica del Universo', emoji: '🕳️', color: '#171717', category: 'Future', category_es: 'Futuro',
        description: "The universe reaches maximum entropy and thermodynamic equilibrium.",
        description_es: "El universo alcanza la máxima entropía y el equilibrio termodinámico."
    },
];

function formatYear(year: number, lang: string): string {
    const abs = Math.abs(year);
    const suffix = year < 0 ? (lang === 'es' ? ' a.C.' : ' BC') : (year > 2026 ? (lang === 'es' ? ' d.C.' : ' AD') : '');
    if (abs >= 1e15) return `${(abs / 1e15).toFixed(0)}Q${suffix}`;
    if (abs >= 1e12) return `${(abs / 1e12).toFixed(0)}T${suffix}`;
    if (abs >= 1e9) return `${(abs / 1e9).toFixed(1)}B${suffix}`;
    if (abs >= 1e6) return `${(abs / 1e6).toFixed(1)}M${suffix}`;
    if (abs >= 1e3) return `${(abs / 1e3).toFixed(1)}K${suffix}`;
    return `${abs}${suffix}`;
}

export default function InfiniteTimelineGame() {
    const { language } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

    const handleScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        setScrollProgress(progress);

        const eventIndex = Math.min(Math.floor(progress * events.length), events.length - 1);
        setActiveEvent(events[eventIndex]);
    }, []);

    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || !containerRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, x / width));

        const el = containerRef.current;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        el.scrollTop = percentage * scrollHeight;
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => el.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const currentYear = activeEvent ? activeEvent.year : events[0].year;

    return (
        <div className="h-full bg-gradient-to-b from-indigo-950 via-gray-950 to-gray-950 text-white flex flex-col overflow-hidden relative">
            {/* Fixed Header */}
            <div className="shrink-0 p-2 sm:p-4 text-center border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm z-10">
                <h1 className="text-xl font-black mb-1">
                    {language === 'es' ? '⏳ La Línea de Tiempo Infinita' : '⏳ The Infinite Timeline'}
                </h1>
                <div className="text-3xl font-black font-mono text-indigo-400">
                    {formatYear(currentYear, language)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {language === 'es' ? 'Desplázate para viajar en el tiempo' : 'Scroll to travel through time'}
                </div>
                {/* Interactive Progress bar */}
                <div
                    ref={progressBarRef}
                    className="mt-2 h-4 bg-gray-800 rounded-full overflow-hidden max-w-xs mx-auto cursor-pointer relative group"
                    onClick={handleProgressBarClick}
                    title={language === 'es' ? 'Haz clic para saltar' : 'Click to jump'}
                >
                    <div
                        className="h-full bg-gradient-to-r from-red-500 via-amber-500 via-emerald-500 to-indigo-500 rounded-full transition-all duration-100"
                        style={{ width: `${scrollProgress * 100}%` }}
                    />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Scrollable Timeline */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth"
            >
                <div className="max-w-md mx-auto relative">
                    {/* Central line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-amber-500 via-emerald-500 to-indigo-900" />

                    {events.map((evt, i) => {
                        const label = language === 'es' ? evt.label_es : evt.label;
                        const categoryName = language === 'es' ? evt.category_es : evt.category;
                        const isActive = activeEvent?.year === evt.year;

                        const prevCategory = i > 0 ? (language === 'es' ? events[i - 1].category_es : events[i - 1].category) : null;
                        const showCategory = categoryName !== prevCategory;

                        return (
                            <div key={i}>
                                {showCategory && (
                                    <div className="pl-16 mb-8 mt-4">
                                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded border border-indigo-500/30">
                                            {categoryName}
                                        </span>
                                    </div>
                                )}
                                <div
                                    className={`relative pl-16 pb-12 transition-all duration-300 ${isActive ? 'scale-[1.02]' : 'opacity-70'} cursor-pointer group`}
                                    onClick={() => setSelectedEvent(evt)}
                                >
                                    {/* Dot on timeline */}
                                    <div
                                        className={`absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'scale-125' : 'group-hover:scale-110'}`}
                                        style={{ borderColor: evt.color, backgroundColor: isActive ? evt.color : 'transparent' }}
                                    >
                                        {isActive && <span className="text-[8px]">{evt.emoji}</span>}
                                    </div>

                                    {/* Content */}
                                    <div className={`rounded-xl p-4 transition-all ${isActive ? 'bg-gray-800/80 border border-gray-700' : 'bg-transparent group-hover:bg-gray-900/40'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xl">{evt.emoji}</span>
                                            <span className="text-xs font-mono font-bold" style={{ color: evt.color }}>
                                                {formatYear(evt.year, language)}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-sm">{label}</h3>
                                        {isActive && (
                                            <div className="mt-2 text-xs text-gray-400">
                                                {language === 'es' ? 'Haz clic para más info' : 'Click for more info'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* End spacer */}
                    <div className="h-40" />
                </div>
            </div>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            onClick={() => setSelectedEvent(null)}
                        >
                            ✕
                        </button>
                        <div className="text-center mb-4">
                            <div className="text-6xl mb-2">{selectedEvent.emoji}</div>
                            <div className="font-mono font-bold text-lg mb-1" style={{ color: selectedEvent.color }}>
                                {formatYear(selectedEvent.year, language)}
                            </div>
                            <h2 className="text-xl font-bold">{language === 'es' ? selectedEvent.label_es : selectedEvent.label}</h2>
                            <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">
                                {language === 'es' ? selectedEvent.category_es : selectedEvent.category}
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed text-center">
                            {language === 'es' ? selectedEvent.description_es : selectedEvent.description}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
