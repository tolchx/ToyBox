"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/language';
import Scene from './speed-of-light/Scene';

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

export default function SpeedOfLightGame({ onScoreUpdate }: { onScoreUpdate?: (data: any) => void }) {
    const { language } = useLanguage();
    const [traveling, setTraveling] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [timeScale, setTimeScale] = useState(1);
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
    const [muted, setMuted] = useState(false);
    const animRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const elapsedRef = useRef(0);

    const distanceTraveled = elapsedSeconds * SPEED_OF_LIGHT_KM_S;

    // Report score to versus overlay
    useEffect(() => {
        if (!onScoreUpdate) return;

        // Report initial state immediately
        const reportScore = () => {
            const passed = milestones.filter(m => distanceTraveled >= m.distanceKm);
            onScoreUpdate({
                distance: formatDistance(distanceTraveled),
                time: formatTime(elapsedSeconds),
                milestones: passed.length,
                points: passed.length * 100,
            });
        };

        reportScore(); // immediate first report
        const interval = setInterval(reportScore, 2000);
        return () => clearInterval(interval);
    }, [onScoreUpdate, traveling, distanceTraveled, elapsedSeconds]);

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

    const handleTravelTo = (milestone: Milestone) => {
        const seconds = milestone.distanceKm / SPEED_OF_LIGHT_KM_S;
        setElapsedSeconds(seconds);
        elapsedRef.current = seconds;
        setTraveling(false);
    };

    return (
        <div className="h-full bg-black text-white flex flex-col relative overflow-hidden">
            {/* 3D Scene Background */}
            <div className="absolute inset-0 z-0">
                <Scene
                    traveling={traveling}
                    timeScale={timeScale}
                    distanceTraveled={distanceTraveled}
                    milestones={milestones}
                    muted={muted}
                />
            </div>

            {/* Main content (HUD) */}
            <div className="relative z-10 h-full w-full pointer-events-none">

                {/* Left Panel - Info & Controls */}
                <div className="absolute top-4 left-4 w-80 max-h-[calc(100vh-2rem)] flex flex-col gap-4 pointer-events-auto overflow-y-auto scrollbar-none">

                    {/* Title */}
                    <div className="flex justify-between items-start">
                        <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
                            <h1 className="text-2xl font-black bg-gradient-to-br from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                                {language === 'es' ? 'Viajero a la Velocidad de la Luz' : 'Speed of Light Traveler'}
                            </h1>
                            <p className="text-[10px] text-cyan-400/80 uppercase tracking-[0.2em] font-medium mt-1">
                                {language === 'es' ? 'Viaja a 299.792 km/s desde la Tierra' : 'Travel at 299,792 km/s from Earth'}
                            </p>
                        </div>

                        <button
                            onClick={() => setMuted(!muted)}
                            className={`p-3 rounded-xl backdrop-blur-md border transition-all ${muted
                                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                }`}
                        >
                            {muted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                            )}
                        </button>
                    </div>

                    {/* Stats Compact */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-amber-500/30">
                            <div className="text-[10px] text-amber-200 uppercase tracking-wider">{language === 'es' ? 'Distancia' : 'Distance'}</div>
                            <div className="text-sm font-bold text-amber-400 font-mono truncate">{formatDistance(distanceTraveled)}</div>
                        </div>
                        <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-cyan-500/30">
                            <div className="text-[10px] text-cyan-200 uppercase tracking-wider">{language === 'es' ? 'Tiempo' : 'Time'}</div>
                            <div className="text-sm font-bold text-cyan-400 font-mono truncate">{formatTime(elapsedSeconds)}</div>
                        </div>
                        <div className="col-span-2 bg-black/60 backdrop-blur-md rounded-xl p-3 border border-emerald-500/30 flex justify-between items-center">
                            <div className="text-[10px] text-emerald-200 uppercase tracking-wider">{language === 'es' ? 'Velocidad' : 'Speed'}</div>
                            <div className="text-sm font-bold text-emerald-400 font-mono">c × {timeScale}</div>
                        </div>
                    </div>

                    {/* Light Distance Badge */}
                    <div className="text-center text-xs text-cyan-300 font-mono bg-black/40 px-3 py-1.5 rounded-full border border-cyan-500/20 backdrop-blur-sm self-start">
                        {formatLightTime(distanceTraveled)}
                    </div>

                    {/* Controls */}
                    <div className="bg-black/60 p-4 rounded-xl backdrop-blur-md border border-white/10 flex flex-col gap-3">
                        {/* Time Scale */}
                        <div className="flex flex-wrap gap-1 justify-center">
                            {[1, 10, 60, 600, 3600].map(scale => (
                                <button
                                    key={scale}
                                    onClick={() => setTimeScale(scale)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border flex-1 whitespace-nowrap ${timeScale === scale
                                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                        : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                        }`}
                                >
                                    {scale === 1 ? '1×' : scale === 10 ? '10×' : scale === 60 ? '1m/s' : scale === 600 ? '10m/s' : '1h/s'}
                                </button>
                            ))}
                        </div>

                        {/* Main Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={reset}
                                className="flex-1 bg-gray-800/80 hover:bg-gray-700 text-gray-400 py-2 rounded-lg border border-gray-600 transition-all hover:scale-105 active:scale-95 text-xs font-bold uppercase tracking-wider"
                            >
                                {language === 'es' ? 'Reiniciar' : 'Reset'}
                            </button>

                            <button
                                onClick={() => setTraveling(!traveling)}
                                className={`flex-[2] py-2 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg border ${traveling
                                    ? 'bg-red-600 hover:bg-red-500 border-red-800 shadow-red-500/50 text-white'
                                    : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-800 shadow-cyan-500/50 text-white'
                                    }`}
                            >
                                {traveling ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                        <span className="text-xs font-bold uppercase tracking-wider">{language === 'es' ? 'Pausar' : 'Pause'}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                        <span className="text-xs font-bold uppercase tracking-wider">{language === 'es' ? 'Viajar' : 'Travel'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Milestones & Log */}
                <div className="absolute top-4 right-4 w-80 max-h-[calc(100vh-2rem)] flex flex-col gap-4 pointer-events-auto overflow-y-auto scrollbar-none">

                    {/* Next Milestone */}
                    {nextMilestone && (
                        <div className="bg-black/60 p-3 rounded-xl border border-white/10 backdrop-blur-md">
                            <div className="flex justify-between text-xs text-gray-300 mb-2 font-medium">
                                <span>{language === 'es' ? 'Siguiente' : 'Next'}: <span className="text-yellow-400">{nextMilestone.emoji} {language === 'es' ? nextMilestone.name_es : nextMilestone.name}</span></span>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                <span>{formatDistance(nextMilestone.distanceKm - distanceTraveled)} {language === 'es' ? 'restantes' : 'remaining'}</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-white/5 relative">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)' }}></div>
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-600 via-blue-500 to-purple-500 rounded-full transition-all duration-200"
                                    style={{ width: `${Math.min(progressToNext, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Passed Milestones Log */}
                    <div className="flex-1 min-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent mask-linear-fade-bottom pb-20">
                        {[...passedMilestones].reverse().map((m, i) => (
                            <div
                                key={m.name}
                                className={`group relative flex items-center gap-3 p-2.5 mb-2 rounded-xl border backdrop-blur-sm transition-all animate-in slide-in-from-left-2 cursor-pointer hover:bg-white/10 ${i === 0
                                    ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-amber-500/40 text-amber-100'
                                    : 'bg-black/40 border-white/5 text-gray-400'
                                    }`}
                                onClick={() => handleTravelTo(m)}
                            >
                                <span className="text-xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{m.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold text-xs truncate ${i === 0 ? 'text-amber-300' : 'text-gray-300'}`}>
                                        {language === 'es' ? m.name_es : m.name}
                                    </div>
                                    <div className="text-[10px] opacity-70 truncate">{language === 'es' ? m.fact_es : m.fact}</div>
                                </div>
                                <button
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-white/20 text-cyan-400 transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMilestone(m);
                                    }}
                                    title="Info"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Modal */}
                {selectedMilestone && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
                        <div className="bg-gray-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setSelectedMilestone(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4 animate-bounce-slow">{selectedMilestone.emoji}</div>
                                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                                    {language === 'es' ? selectedMilestone.name_es : selectedMilestone.name}
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{language === 'es' ? 'Distancia desde la Tierra' : 'Distance from Earth'}</div>
                                    <div className="font-mono text-cyan-300">{formatDistance(selectedMilestone.distanceKm)}</div>
                                </div>
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{language === 'es' ? 'Tiempo Luz' : 'Light Time'}</div>
                                    <div className="font-mono text-cyan-300">{formatLightTime(selectedMilestone.distanceKm)}</div>
                                </div>
                                <div className="p-3">
                                    <div className="text-sm text-gray-300 italic text-center">
                                        "{language === 'es' ? selectedMilestone.fact_es : selectedMilestone.fact}"
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    handleTravelTo(selectedMilestone);
                                    setSelectedMilestone(null);
                                }}
                                className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                            >
                                {language === 'es' ? 'Viajar Aquí' : 'Travel Here'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .mask-linear-fade {
                    mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
                }
            `}</style>
        </div>
    );
}
