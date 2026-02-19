"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/language';

interface Milestone {
    name: string;
    name_es: string;
    distanceKm: number;
    emoji: string;
    fact: string;
    fact_es: string;
}

const SPEED_OF_LIGHT_KM_S = 299792.458;

const milestones: Milestone[] = [
    { name: 'International Space Station', name_es: 'Estación Espacial Internacional', distanceKm: 408, emoji: '🛰️', fact: 'Orbits at 408 km altitude', fact_es: 'Orbita a 408 km de altitud' },
    { name: 'GPS Satellites', name_es: 'Satélites GPS', distanceKm: 20200, emoji: '📡', fact: '~20,200 km above Earth', fact_es: '~20.200 km sobre la Tierra' },
    { name: 'Geostationary Orbit', name_es: 'Órbita Geoestacionaria', distanceKm: 35786, emoji: '🌐', fact: 'Where TV satellites live', fact_es: 'Donde viven los satélites de TV' },
    { name: 'The Moon', name_es: 'La Luna', distanceKm: 384400, emoji: '🌙', fact: 'Light takes 1.28 seconds', fact_es: 'La luz tarda 1,28 segundos' },
    { name: 'Mars (closest)', name_es: 'Marte (más cercano)', distanceKm: 54600000, emoji: '🔴', fact: '~3 minutes at light speed', fact_es: '~3 minutos a la velocidad de la luz' },
    { name: 'Venus (closest)', name_es: 'Venus (más cercano)', distanceKm: 38000000, emoji: '🟡', fact: 'Our closest planetary neighbor', fact_es: 'Nuestro vecino planetario más cercano' },
    { name: 'The Sun', name_es: 'El Sol', distanceKm: 149597870, emoji: '☀️', fact: '~8.3 minutes at light speed', fact_es: '~8,3 minutos a la velocidad de la luz' },
    { name: 'Jupiter', name_es: 'Júpiter', distanceKm: 588000000, emoji: '🟤', fact: '~33 minutes at light speed', fact_es: '~33 minutos a la velocidad de la luz' },
    { name: 'Saturn', name_es: 'Saturno', distanceKm: 1200000000, emoji: '🪐', fact: '~1.1 hours at light speed', fact_es: '~1,1 horas a la velocidad de la luz' },
    { name: 'Uranus', name_es: 'Urano', distanceKm: 2600000000, emoji: '🔵', fact: '~2.4 hours at light speed', fact_es: '~2,4 horas a la velocidad de la luz' },
    { name: 'Neptune', name_es: 'Neptuno', distanceKm: 4300000000, emoji: '💙', fact: '~4 hours at light speed', fact_es: '~4 horas a la velocidad de la luz' },
    { name: 'Pluto', name_es: 'Plutón', distanceKm: 5900000000, emoji: '⚫', fact: '~5.5 hours at light speed', fact_es: '~5,5 horas a la velocidad de la luz' },
    { name: 'Voyager 1 (current)', name_es: 'Voyager 1 (actual)', distanceKm: 24000000000, emoji: '🚀', fact: 'Farthest human-made object', fact_es: 'El objeto más lejano hecho por humanos' },
    { name: 'Oort Cloud (inner)', name_es: 'Nube de Oort (interna)', distanceKm: 300000000000, emoji: '☁️', fact: '~11 days at light speed', fact_es: '~11 días a la velocidad de la luz' },
    { name: 'Proxima Centauri', name_es: 'Próxima Centauri', distanceKm: 40208000000000, emoji: '⭐', fact: '4.24 light years away', fact_es: '4,24 años luz de distancia' },
];

function formatDistance(km: number): string {
    if (km < 1000) return `${km.toFixed(0)} km`;
    if (km < 1000000) return `${(km / 1000).toFixed(1)}K km`;
    if (km < 1000000000) return `${(km / 1000000).toFixed(2)}M km`;
    if (km < 1000000000000) return `${(km / 1000000000).toFixed(2)}B km`;
    return `${(km / 1000000000000).toFixed(3)}T km`;
}

function formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

function formatLightTime(km: number): string {
    const seconds = km / SPEED_OF_LIGHT_KM_S;
    if (seconds < 60) return `${seconds.toFixed(2)} light-seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} light-minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} light-hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} light-days`;
    return `${(seconds / 31536000).toFixed(4)} light-years`;
}

export default function SpeedOfLightGame() {
    const { language } = useLanguage();
    const [traveling, setTraveling] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [timeScale, setTimeScale] = useState(1);
    const animRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const elapsedRef = useRef(0);

    const distanceTraveled = elapsedSeconds * SPEED_OF_LIGHT_KM_S;

    const passedMilestones = milestones.filter(m => distanceTraveled >= m.distanceKm);
    const nextMilestone = milestones.find(m => distanceTraveled < m.distanceKm);
    const progressToNext = nextMilestone
        ? ((distanceTraveled - (passedMilestones.length > 0 ? passedMilestones[passedMilestones.length - 1].distanceKm : 0)) /
            (nextMilestone.distanceKm - (passedMilestones.length > 0 ? passedMilestones[passedMilestones.length - 1].distanceKm : 0))) * 100
        : 100;

    const animate = useCallback((timestamp: number) => {
        if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
        const delta = (timestamp - lastTimeRef.current) / 1000;
        lastTimeRef.current = timestamp;
        elapsedRef.current += delta * timeScale;
        setElapsedSeconds(elapsedRef.current);
        animRef.current = requestAnimationFrame(animate);
    }, [timeScale]);

    useEffect(() => {
        if (traveling) {
            lastTimeRef.current = 0;
            animRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(animRef.current);
        }
        return () => cancelAnimationFrame(animRef.current);
    }, [traveling, animate]);

    const reset = () => {
        setTraveling(false);
        setElapsedSeconds(0);
        elapsedRef.current = 0;
        setTimeScale(1);
    };

    const starCount = 60;
    const stars = useRef(
        Array.from({ length: starCount }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 1 + Math.random() * 2,
            speed: 0.5 + Math.random() * 2,
        }))
    );

    return (
        <div className="h-full bg-black text-white flex flex-col relative overflow-hidden">
            {/* Star field background */}
            <div className="absolute inset-0 overflow-hidden">
                {stars.current.map((star, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: 0.3 + Math.random() * 0.5,
                            animation: traveling ? `streakStar ${3 / (star.speed * Math.min(timeScale, 10))}s linear infinite` : 'twinkle 3s ease-in-out infinite',
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center p-2 sm:p-4 md:p-8 flex-1 overflow-auto">
                {/* Title */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-black mb-1">
                        {language === 'es' ? '💫 Viajero a la Velocidad de la Luz' : '💫 Speed of Light Voyager'}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {language === 'es'
                            ? 'Viaja a 299.792 km/s desde la Tierra en tiempo real'
                            : 'Travel at 299,792 km/s from Earth in real-time'}
                    </p>
                </div>

                {/* Dashboard */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 w-full max-w-lg">
                    <div className="bg-gray-900/80 rounded-xl p-3 text-center border border-gray-800">
                        <div className="text-xs text-gray-500 mb-1">{language === 'es' ? 'Distancia' : 'Distance'}</div>
                        <div className="text-lg font-bold text-amber-400 font-mono">{formatDistance(distanceTraveled)}</div>
                    </div>
                    <div className="bg-gray-900/80 rounded-xl p-3 text-center border border-gray-800">
                        <div className="text-xs text-gray-500 mb-1">{language === 'es' ? 'Tiempo' : 'Time'}</div>
                        <div className="text-lg font-bold text-cyan-400 font-mono">{formatTime(elapsedSeconds)}</div>
                    </div>
                    <div className="bg-gray-900/80 rounded-xl p-3 text-center border border-gray-800">
                        <div className="text-xs text-gray-500 mb-1">{language === 'es' ? 'Velocidad' : 'Speed'}</div>
                        <div className="text-lg font-bold text-emerald-400 font-mono">c × {timeScale}</div>
                    </div>
                </div>

                {/* Light distance */}
                <div className="text-center mb-4 text-sm text-gray-400">
                    {formatLightTime(distanceTraveled)}
                </div>

                {/* Progress to next milestone */}
                {nextMilestone && (
                    <div className="w-full max-w-lg mb-6">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>{language === 'es' ? 'Siguiente' : 'Next'}: {nextMilestone.emoji} {language === 'es' ? nextMilestone.name_es : nextMilestone.name}</span>
                            <span>{formatDistance(nextMilestone.distanceKm - distanceTraveled)}</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-200"
                                style={{ width: `${Math.min(progressToNext, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => setTraveling(!traveling)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            traveling
                                ? 'bg-red-600 hover:bg-red-500'
                                : 'bg-amber-500 hover:bg-amber-400 text-black'
                        }`}
                    >
                        {traveling
                            ? (language === 'es' ? '⏸ Pausar' : '⏸ Pause')
                            : (language === 'es' ? '🚀 Viajar' : '🚀 Launch')}
                    </button>
                    <button onClick={reset} className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-sm">
                        {language === 'es' ? '↺ Reiniciar' : '↺ Reset'}
                    </button>
                </div>

                {/* Time scale */}
                <div className="flex items-center gap-1 sm:gap-2 mb-6 flex-wrap justify-center">
                    <span className="text-xs text-gray-500">{language === 'es' ? 'Escala de tiempo:' : 'Time scale:'}</span>
                    {[1, 10, 60, 600, 3600].map(scale => (
                        <button
                            key={scale}
                            onClick={() => setTimeScale(scale)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                timeScale === scale
                                    ? 'bg-amber-500 text-black'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {scale === 1 ? '1×' : scale === 10 ? '10×' : scale === 60 ? '1min/s' : scale === 600 ? '10min/s' : '1hr/s'}
                        </button>
                    ))}
                </div>

                {/* Milestones reached */}
                <div className="w-full max-w-lg space-y-2 overflow-y-auto max-h-64">
                    {[...passedMilestones].reverse().map((m, i) => (
                        <div
                            key={m.name}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                i === 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-gray-900/50 border-gray-800'
                            }`}
                        >
                            <span className="text-2xl">{m.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm truncate">{language === 'es' ? m.name_es : m.name}</div>
                                <div className="text-xs text-gray-400">{language === 'es' ? m.fact_es : m.fact}</div>
                            </div>
                            <div className="text-xs text-gray-500 font-mono text-right shrink-0">
                                {formatDistance(m.distanceKm)}
                            </div>
                        </div>
                    ))}
                    {passedMilestones.length === 0 && (
                        <div className="text-center text-gray-600 text-sm py-8">
                            {language === 'es' ? '🚀 Presiona Viajar para comenzar tu viaje a la velocidad de la luz' : '🚀 Press Launch to begin your light-speed journey'}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes streakStar {
                    from { transform: translateX(0); opacity: 0.8; }
                    to { transform: translateX(-200px); opacity: 0; }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}
