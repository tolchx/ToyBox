"use client";

import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/lib/language';

interface City {
    name: string;
    name_es: string;
    country: string;
    country_es: string;
    lat: number;
    lng: number;
    sounds: string[];
    sounds_es: string[];
    hints: string[];
    hints_es: string[];
    emoji: string;
}

const cities: City[] = [
    {
        name: 'Tokyo', name_es: 'Tokio', country: 'Japan', country_es: 'Japón',
        lat: 35.68, lng: 139.69, emoji: '🗼',
        sounds: ['Train station jingle melody', 'Busy crosswalk beeping', 'Vending machine hum', 'Distant temple bell'],
        sounds_es: ['Melodía de estación de tren', 'Pitido de cruce peatonal', 'Zumbido de máquina expendedora', 'Campana de templo lejana'],
        hints: ['Very organized traffic sounds', 'Electronic melodies everywhere', 'Dense urban ambiance'],
        hints_es: ['Sonidos de tráfico muy organizados', 'Melodías electrónicas por todas partes', 'Ambiente urbano denso'],
    },
    {
        name: 'New York', name_es: 'Nueva York', country: 'USA', country_es: 'EE.UU.',
        lat: 40.71, lng: -74.01, emoji: '🗽',
        sounds: ['Taxi horns honking', 'Subway rumble below', 'Street vendor shouting', 'Sirens in distance'],
        sounds_es: ['Bocinas de taxis', 'Retumbar del metro abajo', 'Vendedor callejero gritando', 'Sirenas a lo lejos'],
        hints: ['Aggressive car horns', 'English shouting', 'Never-ending traffic'],
        hints_es: ['Bocinas agresivas', 'Gritos en inglés', 'Tráfico interminable'],
    },
    {
        name: 'Paris', name_es: 'París', country: 'France', country_es: 'Francia',
        lat: 48.86, lng: 2.35, emoji: '🗼',
        sounds: ['Accordion music from café', 'Motorcycle on cobblestones', 'Church bells ringing', 'Pigeons cooing'],
        sounds_es: ['Música de acordeón desde un café', 'Motocicleta en adoquines', 'Campanas de iglesia', 'Palomas arrullando'],
        hints: ['Romantic café ambiance', 'Cobblestone vehicle sounds', 'French conversation'],
        hints_es: ['Ambiente romántico de café', 'Sonidos de vehículos en adoquines', 'Conversación en francés'],
    },
    {
        name: 'Cairo', name_es: 'El Cairo', country: 'Egypt', country_es: 'Egipto',
        lat: 30.04, lng: 31.24, emoji: '🏛️',
        sounds: ['Call to prayer echoing', 'Market haggling', 'Car horns in chaos', 'Desert wind'],
        sounds_es: ['Llamada a la oración resonando', 'Regateo en el mercado', 'Bocinas caóticas', 'Viento del desierto'],
        hints: ['Arabic speech patterns', 'Chaotic but rhythmic traffic', 'Dry wind sounds'],
        hints_es: ['Patrones de habla árabe', 'Tráfico caótico pero rítmico', 'Sonidos de viento seco'],
    },
    {
        name: 'Rio de Janeiro', name_es: 'Río de Janeiro', country: 'Brazil', country_es: 'Brasil',
        lat: -22.91, lng: -43.17, emoji: '🏖️',
        sounds: ['Samba drums in distance', 'Ocean waves crashing', 'Portuguese chatter', 'Tropical birds singing'],
        sounds_es: ['Tambores de samba a lo lejos', 'Olas del océano rompiendo', 'Charla en portugués', 'Pájaros tropicales cantando'],
        hints: ['Beach + city mix', 'Rhythmic music always present', 'Portuguese language'],
        hints_es: ['Mezcla de playa + ciudad', 'Música rítmica siempre presente', 'Idioma portugués'],
    },
    {
        name: 'Mumbai', name_es: 'Bombay', country: 'India', country_es: 'India',
        lat: 19.08, lng: 72.88, emoji: '🕌',
        sounds: ['Auto-rickshaw engines', 'Bollywood music from shops', 'Train announcements in Hindi', 'Street food sizzling'],
        sounds_es: ['Motores de auto-rickshaw', 'Música de Bollywood desde tiendas', 'Anuncios de tren en hindi', 'Comida callejera chisporroteando'],
        hints: ['Constant horn honking', 'Hindi/English mix', 'Extremely dense soundscape'],
        hints_es: ['Bocinas constantes', 'Mezcla hindi/inglés', 'Paisaje sonoro extremadamente denso'],
    },
    {
        name: 'London', name_es: 'Londres', country: 'UK', country_es: 'Reino Unido',
        lat: 51.51, lng: -0.13, emoji: '🎡',
        sounds: ['Big Ben chiming', 'Double-decker bus engine', 'Rain on umbrellas', 'Polite queuing murmurs'],
        sounds_es: ['Big Ben sonando', 'Motor de autobús de dos pisos', 'Lluvia en paraguas', 'Murmullos de cola educada'],
        hints: ['Rain sounds frequent', 'British accents', 'Orderly traffic'],
        hints_es: ['Sonidos de lluvia frecuentes', 'Acentos británicos', 'Tráfico ordenado'],
    },
    {
        name: 'Mexico City', name_es: 'Ciudad de México', country: 'Mexico', country_es: 'México',
        lat: 19.43, lng: -99.13, emoji: '🌮',
        sounds: ['Street organ grinder', 'Tamale vendor whistle', 'Mariachi in the distance', 'Church bells over traffic'],
        sounds_es: ['Organillero callejero', 'Silbato de vendedor de tamales', 'Mariachi a lo lejos', 'Campanas de iglesia sobre el tráfico'],
        hints: ['Spanish language', 'Musical street vendors', 'Mix of old and modern'],
        hints_es: ['Idioma español', 'Vendedores callejeros musicales', 'Mezcla de antiguo y moderno'],
    },
];

export default function CityGuesserAudioGame() {
    const { language } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [currentCityIdx, setCurrentCityIdx] = useState(0);
    const [guess, setGuess] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [hintsRevealed, setHintsRevealed] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        setMounted(true);
        setCurrentCityIdx(Math.floor(Math.random() * cities.length));
    }, []);

    const city = cities[currentCityIdx];

    if (!mounted) {
        return <div className="h-full bg-gray-950 text-white flex items-center justify-center">Loading...</div>;
    }

    const sounds = language === 'es' ? city.sounds_es : city.sounds;
    const hints = language === 'es' ? city.hints_es : city.hints;

    const shuffledOptions = useMemo(() => {
        const others = cities.filter((_, i) => i !== currentCityIdx)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        const all = [...others, city].sort(() => Math.random() - 0.5);
        return all;
    }, [currentCityIdx, city]);

    const makeGuess = (cityName: string) => {
        setGuess(cityName);
        setShowResult(true);
        if (cityName === city.name) {
            const points = Math.max(10, 30 - hintsRevealed * 10);
            setScore(prev => prev + points);
        }
    };

    // Stop speech when component unmounts
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const speakSounds = () => {
        if (!window.speechSynthesis) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const textToSpeak = sounds.join('. ');
        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        // Set language
        utterance.lang = language === 'es' ? 'es-ES' : 'en-US';

        // Optional: specific voice selection could go here, but default usually works well

        // When speech ends, stop the visual playing state
        utterance.onend = () => {
            setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const togglePlay = () => {
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);

        if (newIsPlaying) {
            speakSounds();
        } else {
            window.speechSynthesis.cancel();
        }
    };

    const nextRound = () => {
        window.speechSynthesis.cancel();
        let nextIdx = Math.floor(Math.random() * cities.length);
        while (nextIdx === currentCityIdx) nextIdx = Math.floor(Math.random() * cities.length);
        setCurrentCityIdx(nextIdx);
        setGuess(null);
        setShowResult(false);
        setHintsRevealed(0);
        setRound(prev => prev + 1);
        setIsPlaying(false); // Reset playing state
    };

    // Watch for language changes to update voice if playing (optional, mostly for consistency)
    useEffect(() => {
        if (isPlaying) {
            speakSounds();
        }
    }, [language]);

    const revealHint = () => {
        if (hintsRevealed < hints.length) setHintsRevealed(prev => prev + 1);
    };

    const isCorrect = guess === city.name;

    return (
        <div className="h-full bg-gradient-to-b from-teal-950 via-gray-950 to-gray-950 text-white p-2 sm:p-4 md:p-8 flex flex-col items-center overflow-auto">
            <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-black mb-1">
                    {language === 'es' ? '🎧 Adivina la Ciudad por Audio' : '🎧 City Guesser Audio'}
                </h1>
                <p className="text-gray-400 text-sm">
                    {language === 'es' ? 'Lee las descripciones de sonido. Adivina la ciudad.' : 'Read the sound descriptions. Guess the city.'}
                </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 text-sm">
                <span className="text-gray-400">{language === 'es' ? 'Ronda' : 'Round'}: <span className="text-teal-400 font-bold">{round}</span></span>
                <span className="text-gray-400">{language === 'es' ? 'Puntuación' : 'Score'}: <span className="text-amber-400 font-bold">{score}</span></span>
            </div>

            {/* Sound descriptions (simulating audio) */}
            <div className="w-full max-w-md mb-6">
                <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                            <span className="text-lg">🔊</span>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold">{language === 'es' ? 'Sonidos Ambientales' : 'Ambient Sounds'}</div>
                            <div className="text-xs text-gray-500">{language === 'es' ? 'Escucha con atención...' : 'Listen carefully...'}</div>
                        </div>
                        <button
                            onClick={togglePlay}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying
                                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                : 'bg-teal-500 hover:bg-teal-600'
                                }`}
                        >
                            {isPlaying ? (
                                <span className="text-white text-xl">⏸</span>
                            ) : (
                                <span className="text-white text-xl">▶</span>
                            )}
                        </button>
                    </div>

                    {/* Waveform visualization */}
                    <div className="flex items-end gap-0.5 h-12 mb-4 justify-center">
                        {Array.from({ length: 40 }).map((_, i) => {
                            // Deterministic pseudo-random based on index
                            const rand = ((i * 1234.5678) % 1);
                            return (
                                <div
                                    key={i}
                                    className={`w-1.5 rounded-full transition-all duration-300 ${isPlaying
                                        ? 'bg-teal-500 animate-pulse'
                                        : 'bg-teal-500/30'
                                        }`}
                                    style={{
                                        height: isPlaying
                                            ? `${20 + Math.sin(i * 0.5) * 30 + rand * 20}%`
                                            : `${15 + Math.sin(i * 0.5) * 20 + rand * 15}%`,
                                        animationDelay: isPlaying ? `${i * 0.05}s` : '0s',
                                        animationDuration: isPlaying ? `${0.3 + rand * 0.4}s` : `${0.5 + rand * 1}s`,
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Sound list */}
                    <div className="space-y-2">
                        {sounds.map((sound, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="text-teal-400">♪</span>
                                <span className="text-gray-300">{sound}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hints */}
            {!showResult && (
                <div className="w-full max-w-md mb-4">
                    {hintsRevealed > 0 && (
                        <div className="space-y-1 mb-3">
                            {hints.slice(0, hintsRevealed).map((hint, i) => (
                                <div key={i} className="text-xs text-amber-400/80 flex items-center gap-1.5">
                                    <span>💡</span> {hint}
                                </div>
                            ))}
                        </div>
                    )}
                    {hintsRevealed < hints.length && (
                        <button
                            onClick={revealHint}
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            💡 {language === 'es' ? `Revelar pista (${hints.length - hintsRevealed} restantes)` : `Reveal hint (${hints.length - hintsRevealed} left)`}
                        </button>
                    )}
                </div>
            )}

            {/* Options */}
            {!showResult && (
                <div className="w-full max-w-md grid grid-cols-2 gap-3">
                    {shuffledOptions.map((opt) => (
                        <button
                            key={opt.name}
                            onClick={() => makeGuess(opt.name)}
                            className="p-4 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 hover:border-teal-500/50 rounded-xl text-left transition-all"
                        >
                            <div className="text-xl mb-1">{opt.emoji}</div>
                            <div className="font-bold text-sm">{language === 'es' ? opt.name_es : opt.name}</div>
                            <div className="text-xs text-gray-500">{language === 'es' ? opt.country_es : opt.country}</div>
                        </button>
                    ))}
                </div>
            )}

            {/* Result */}
            {showResult && (
                <div className="w-full max-w-md text-center">
                    <div className={`p-6 rounded-2xl border mb-4 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        <div className="text-5xl mb-3">{isCorrect ? '🎉' : '😔'}</div>
                        <h2 className={`text-2xl font-black mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isCorrect
                                ? (language === 'es' ? '¡Correcto!' : 'Correct!')
                                : (language === 'es' ? 'Incorrecto' : 'Wrong')}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {language === 'es' ? 'La ciudad era' : 'The city was'}: <span className="text-white font-bold">{city.emoji} {language === 'es' ? city.name_es : city.name}, {language === 'es' ? city.country_es : city.country}</span>
                        </p>
                        {isCorrect && (
                            <p className="text-emerald-400 text-sm mt-1">+{Math.max(10, 30 - hintsRevealed * 10)} pts</p>
                        )}
                    </div>
                    <button
                        onClick={nextRound}
                        className="px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors"
                    >
                        {language === 'es' ? 'Siguiente Ciudad →' : 'Next City →'}
                    </button>
                </div>
            )}
        </div>
    );
}
