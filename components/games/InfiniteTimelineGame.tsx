"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/language';

interface TimelineEvent {
    year: number;
    label: string;
    label_es: string;
    emoji: string;
    color: string;
}

const events: TimelineEvent[] = [
    { year: -13800000000, label: 'The Big Bang', label_es: 'El Big Bang', emoji: '💥', color: '#ef4444' },
    { year: -13300000000, label: 'First Stars Form', label_es: 'Se forman las primeras estrellas', emoji: '⭐', color: '#fbbf24' },
    { year: -10000000000, label: 'Milky Way Forms', label_es: 'Se forma la Vía Láctea', emoji: '🌌', color: '#8b5cf6' },
    { year: -4600000000, label: 'Solar System Forms', label_es: 'Se forma el Sistema Solar', emoji: '☀️', color: '#f59e0b' },
    { year: -4500000000, label: 'Earth Forms', label_es: 'Se forma la Tierra', emoji: '🌍', color: '#3b82f6' },
    { year: -4400000000, label: 'The Moon Forms', label_es: 'Se forma la Luna', emoji: '🌙', color: '#94a3b8' },
    { year: -3800000000, label: 'First Life (Bacteria)', label_es: 'Primera vida (Bacterias)', emoji: '🦠', color: '#22c55e' },
    { year: -2400000000, label: 'Great Oxidation Event', label_es: 'Gran Evento de Oxidación', emoji: '💨', color: '#06b6d4' },
    { year: -540000000, label: 'Cambrian Explosion', label_es: 'Explosión Cámbrica', emoji: '🐚', color: '#f97316' },
    { year: -230000000, label: 'First Dinosaurs', label_es: 'Primeros Dinosaurios', emoji: '🦕', color: '#84cc16' },
    { year: -66000000, label: 'Dinosaur Extinction', label_es: 'Extinción de los Dinosaurios', emoji: '☄️', color: '#ef4444' },
    { year: -6000000, label: 'First Hominids', label_es: 'Primeros Homínidos', emoji: '🐒', color: '#a16207' },
    { year: -300000, label: 'Homo Sapiens', label_es: 'Homo Sapiens', emoji: '🧑', color: '#d97706' },
    { year: -10000, label: 'Agriculture Begins', label_es: 'Comienza la Agricultura', emoji: '🌾', color: '#65a30d' },
    { year: -3000, label: 'First Writing', label_es: 'Primera Escritura', emoji: '📜', color: '#ca8a04' },
    { year: -2560, label: 'Great Pyramid Built', label_es: 'Se construye la Gran Pirámide', emoji: '🔺', color: '#d4a017' },
    { year: -500, label: 'Classical Greece', label_es: 'Grecia Clásica', emoji: '🏛️', color: '#60a5fa' },
    { year: 0, label: 'Year Zero', label_es: 'Año Cero', emoji: '📅', color: '#f472b6' },
    { year: 1440, label: 'Printing Press', label_es: 'Imprenta', emoji: '📖', color: '#78716c' },
    { year: 1492, label: 'Columbus Reaches Americas', label_es: 'Colón llega a América', emoji: '⛵', color: '#0ea5e9' },
    { year: 1687, label: "Newton's Principia", label_es: 'Principia de Newton', emoji: '🍎', color: '#dc2626' },
    { year: 1776, label: 'American Independence', label_es: 'Independencia de EE.UU.', emoji: '🗽', color: '#2563eb' },
    { year: 1879, label: 'Light Bulb Invented', label_es: 'Se inventa la bombilla', emoji: '💡', color: '#eab308' },
    { year: 1903, label: 'First Flight', label_es: 'Primer Vuelo', emoji: '✈️', color: '#64748b' },
    { year: 1945, label: 'Atomic Bomb', label_es: 'Bomba Atómica', emoji: '☢️', color: '#f97316' },
    { year: 1969, label: 'Moon Landing', label_es: 'Llegada a la Luna', emoji: '🚀', color: '#a3a3a3' },
    { year: 1991, label: 'World Wide Web', label_es: 'World Wide Web', emoji: '🌐', color: '#3b82f6' },
    { year: 2007, label: 'First iPhone', label_es: 'Primer iPhone', emoji: '📱', color: '#6b7280' },
    { year: 2024, label: 'AI Revolution', label_es: 'Revolución de la IA', emoji: '🤖', color: '#8b5cf6' },
    { year: 2026, label: 'You Are Here', label_es: 'Estás Aquí', emoji: '📍', color: '#ef4444' },
    { year: 5000000000, label: 'Sun Becomes Red Giant', label_es: 'El Sol se convierte en Gigante Roja', emoji: '🔴', color: '#dc2626' },
    { year: 100000000000, label: 'Last Stars Die', label_es: 'Mueren las últimas estrellas', emoji: '⚫', color: '#525252' },
    { year: 1000000000000000, label: 'Heat Death of Universe', label_es: 'Muerte Térmica del Universo', emoji: '🕳️', color: '#171717' },
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
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);

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

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => el.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const currentYear = activeEvent ? activeEvent.year : events[0].year;

    return (
        <div className="h-full bg-gradient-to-b from-indigo-950 via-gray-950 to-gray-950 text-white flex flex-col overflow-hidden">
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
                {/* Progress bar */}
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 via-amber-500 via-emerald-500 to-indigo-500 rounded-full transition-all duration-100"
                        style={{ width: `${scrollProgress * 100}%` }}
                    />
                </div>
            </div>

            {/* Scrollable Timeline */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto px-4 py-8"
            >
                <div className="max-w-md mx-auto relative">
                    {/* Central line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-amber-500 via-emerald-500 to-indigo-900" />

                    {events.map((evt, i) => {
                        const label = language === 'es' ? evt.label_es : evt.label;
                        const isActive = activeEvent?.year === evt.year;
                        return (
                            <div
                                key={i}
                                className={`relative pl-16 pb-12 transition-all duration-300 ${isActive ? 'scale-[1.02]' : 'opacity-70'}`}
                            >
                                {/* Dot on timeline */}
                                <div
                                    className={`absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'scale-125' : ''}`}
                                    style={{ borderColor: evt.color, backgroundColor: isActive ? evt.color : 'transparent' }}
                                >
                                    {isActive && <span className="text-[8px]">{evt.emoji}</span>}
                                </div>

                                {/* Content */}
                                <div className={`rounded-xl p-4 transition-all ${isActive ? 'bg-gray-800/80 border border-gray-700' : 'bg-transparent'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{evt.emoji}</span>
                                        <span className="text-xs font-mono font-bold" style={{ color: evt.color }}>
                                            {formatYear(evt.year, language)}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm">{label}</h3>
                                </div>
                            </div>
                        );
                    })}

                    {/* End spacer */}
                    <div className="h-40" />
                </div>
            </div>
        </div>
    );
}
