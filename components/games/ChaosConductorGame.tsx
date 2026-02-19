"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/language';

type Weather = 'sunny' | 'rain' | 'storm' | 'tornado' | 'ufo' | 'snow';
type Mood = 'happy' | 'neutral' | 'scared' | 'panicked';

interface Citizen {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    mood: Mood;
    emoji: string;
    indoors: boolean;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    vy: number;
    vx: number;
    type: 'rain' | 'snow' | 'debris' | 'beam';
    opacity: number;
}

const WEATHER_CONFIG: Record<Weather, { label: string; label_es: string; emoji: string; color: string }> = {
    sunny: { label: 'Sunny', label_es: 'Soleado', emoji: '☀️', color: '#fbbf24' },
    rain: { label: 'Rain', label_es: 'Lluvia', emoji: '🌧️', color: '#3b82f6' },
    storm: { label: 'Storm', label_es: 'Tormenta', emoji: '⛈️', color: '#6366f1' },
    tornado: { label: 'Tornado', label_es: 'Tornado', emoji: '🌪️', color: '#ef4444' },
    ufo: { label: 'UFO Invasion', label_es: 'Invasión OVNI', emoji: '🛸', color: '#10b981' },
    snow: { label: 'Blizzard', label_es: 'Ventisca', emoji: '❄️', color: '#67e8f9' },
};

const CITIZEN_EMOJIS = ['🧑', '👩', '👨', '🧒', '👴', '👵', '🧑‍💼', '👷'];

function createCitizens(count: number): Citizen[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 30 + Math.random() * 440,
        y: 200 + Math.random() * 180,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 0.8,
        mood: 'happy' as Mood,
        emoji: CITIZEN_EMOJIS[Math.floor(Math.random() * CITIZEN_EMOJIS.length)],
        indoors: false,
    }));
}

export default function ChaosConductorGame() {
    const { language } = useLanguage();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [weather, setWeather] = useState<Weather>('sunny');
    const [citizens, setCitizens] = useState<Citizen[]>(() => createCitizens(20));
    const [particles, setParticles] = useState<Particle[]>([]);
    const [population, setPopulation] = useState(20);
    const [happiness, setHappiness] = useState(100);
    const [chaos, setChaos] = useState(0);
    const [events, setEvents] = useState<string[]>([]);
    const weatherRef = useRef(weather);
    const particleIdRef = useRef(0);
    const animRef = useRef<number>(0);

    weatherRef.current = weather;

    const addEvent = useCallback((msg: string) => {
        setEvents(prev => [msg, ...prev].slice(0, 8));
    }, []);

    // Update citizens based on weather
    useEffect(() => {
        const moodMap: Record<Weather, Mood> = {
            sunny: 'happy',
            rain: 'neutral',
            storm: 'scared',
            tornado: 'panicked',
            ufo: 'panicked',
            snow: 'neutral',
        };
        setCitizens(prev => prev.map(c => ({ ...c, mood: moodMap[weather] })));

        const happinessMap: Record<Weather, number> = { sunny: 2, rain: -1, storm: -3, tornado: -8, ufo: -10, snow: -2 };
        const chaosMap: Record<Weather, number> = { sunny: -3, rain: 1, storm: 5, tornado: 15, ufo: 20, snow: 2 };

        const interval = setInterval(() => {
            setHappiness(prev => Math.max(0, Math.min(100, prev + happinessMap[weatherRef.current])));
            setChaos(prev => Math.max(0, Math.min(100, prev + chaosMap[weatherRef.current])));
        }, 1000);

        if (weather === 'tornado') {
            addEvent(language === 'es' ? '🌪️ ¡Un tornado azota la ciudad!' : '🌪️ A tornado hits the city!');
        } else if (weather === 'ufo') {
            addEvent(language === 'es' ? '🛸 ¡Naves alienígenas detectadas!' : '🛸 Alien ships detected!');
        } else if (weather === 'storm') {
            addEvent(language === 'es' ? '⛈️ Tormenta eléctrica en progreso' : '⛈️ Thunderstorm in progress');
        } else if (weather === 'sunny') {
            addEvent(language === 'es' ? '☀️ Un hermoso día soleado' : '☀️ A beautiful sunny day');
        }

        return () => clearInterval(interval);
    }, [weather, addEvent, language]);

    // Canvas rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let localParticles: Particle[] = [];

        const render = () => {
            ctx.clearRect(0, 0, 500, 420);

            // Sky gradient
            const skyColors: Record<Weather, [string, string]> = {
                sunny: ['#87CEEB', '#E0F7FA'],
                rain: ['#546E7A', '#78909C'],
                storm: ['#1a1a2e', '#37474F'],
                tornado: ['#2d1b1b', '#4a2c2c'],
                ufo: ['#0a1628', '#1a2744'],
                snow: ['#B0BEC5', '#CFD8DC'],
            };
            const [skyTop, skyBottom] = skyColors[weatherRef.current];
            const grad = ctx.createLinearGradient(0, 0, 0, 280);
            grad.addColorStop(0, skyTop);
            grad.addColorStop(1, skyBottom);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 500, 280);

            // Ground
            ctx.fillStyle = weatherRef.current === 'snow' ? '#e8e8e8' : '#4a7c3f';
            ctx.fillRect(0, 280, 500, 140);

            // Road
            ctx.fillStyle = '#555';
            ctx.fillRect(0, 340, 500, 30);
            ctx.setLineDash([20, 15]);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 355);
            ctx.lineTo(500, 355);
            ctx.stroke();
            ctx.setLineDash([]);

            // Buildings
            const buildings = [
                { x: 30, w: 60, h: 120, color: '#78909C' },
                { x: 110, w: 50, h: 90, color: '#8D6E63' },
                { x: 180, w: 70, h: 140, color: '#607D8B' },
                { x: 270, w: 55, h: 100, color: '#795548' },
                { x: 340, w: 65, h: 130, color: '#546E7A' },
                { x: 420, w: 50, h: 85, color: '#8D6E63' },
            ];
            for (const b of buildings) {
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x, 280 - b.h, b.w, b.h);
                // Windows
                ctx.fillStyle = weatherRef.current === 'sunny' ? '#FFE082' : '#FFF9C4';
                for (let wy = 280 - b.h + 10; wy < 270; wy += 20) {
                    for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 15) {
                        ctx.fillRect(wx, wy, 8, 10);
                    }
                }
            }

            // Spawn particles
            if (weatherRef.current === 'rain' || weatherRef.current === 'storm') {
                for (let i = 0; i < 5; i++) {
                    localParticles.push({
                        id: particleIdRef.current++,
                        x: Math.random() * 500,
                        y: -5,
                        vy: 8 + Math.random() * 4,
                        vx: weatherRef.current === 'storm' ? -2 + Math.random() : 0,
                        type: 'rain',
                        opacity: 0.4 + Math.random() * 0.3,
                    });
                }
            } else if (weatherRef.current === 'snow') {
                for (let i = 0; i < 3; i++) {
                    localParticles.push({
                        id: particleIdRef.current++,
                        x: Math.random() * 500,
                        y: -5,
                        vy: 1 + Math.random() * 2,
                        vx: (Math.random() - 0.5) * 2,
                        type: 'snow',
                        opacity: 0.6 + Math.random() * 0.3,
                    });
                }
            } else if (weatherRef.current === 'tornado') {
                for (let i = 0; i < 2; i++) {
                    localParticles.push({
                        id: particleIdRef.current++,
                        x: 200 + Math.random() * 100,
                        y: 250 + Math.random() * 50,
                        vy: -3 - Math.random() * 5,
                        vx: (Math.random() - 0.5) * 10,
                        type: 'debris',
                        opacity: 0.7,
                    });
                }
            }

            // Update & draw particles
            localParticles = localParticles.filter(p => p.y < 420 && p.y > -20 && p.x > -20 && p.x < 520 && p.opacity > 0);
            for (const p of localParticles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.type === 'debris') p.opacity -= 0.01;

                if (p.type === 'rain') {
                    ctx.strokeStyle = `rgba(100, 180, 255, ${p.opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + p.vx, p.y + 6);
                    ctx.stroke();
                } else if (p.type === 'snow') {
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.type === 'debris') {
                    ctx.fillStyle = `rgba(139, 90, 43, ${p.opacity})`;
                    ctx.fillRect(p.x, p.y, 4, 4);
                }
            }

            // Tornado funnel
            if (weatherRef.current === 'tornado') {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#555';
                ctx.beginPath();
                ctx.moveTo(230, 0);
                ctx.lineTo(270, 0);
                ctx.lineTo(260, 280);
                ctx.lineTo(240, 280);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // UFO
            if (weatherRef.current === 'ufo') {
                const ufoX = 250 + Math.sin(Date.now() / 500) * 80;
                const ufoY = 60 + Math.sin(Date.now() / 700) * 20;
                ctx.font = '36px serif';
                ctx.textAlign = 'center';
                ctx.fillText('🛸', ufoX, ufoY);
                // Beam
                ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
                ctx.beginPath();
                ctx.moveTo(ufoX - 10, ufoY + 10);
                ctx.lineTo(ufoX - 50, 280);
                ctx.lineTo(ufoX + 50, 280);
                ctx.lineTo(ufoX + 10, ufoY + 10);
                ctx.closePath();
                ctx.fill();
            }

            // Lightning flash
            if (weatherRef.current === 'storm' && Math.random() < 0.01) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(0, 0, 500, 420);
            }

            // Sun
            if (weatherRef.current === 'sunny') {
                ctx.font = '40px serif';
                ctx.textAlign = 'center';
                ctx.fillText('☀️', 430, 50);
            }

            animRef.current = requestAnimationFrame(render);
        };

        animRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animRef.current);
    }, []);

    return (
        <div className="h-full bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col items-center p-2 sm:p-4 md:p-6 overflow-auto">
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="text-2xl md:text-3xl font-black mb-1">
                    {language === 'es' ? '🌪️ Director del Caos' : '🌪️ Chaos Conductor'}
                </h1>
                <p className="text-gray-400 text-sm">
                    {language === 'es' ? 'Controla el clima. Observa el caos.' : 'Control the weather. Watch the chaos.'}
                </p>
            </div>

            {/* Weather buttons */}
            <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
                {(Object.entries(WEATHER_CONFIG) as [Weather, typeof WEATHER_CONFIG[Weather]][]).map(([key, cfg]) => (
                    <button
                        key={key}
                        onClick={() => setWeather(key)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            weather === key
                                ? 'ring-2 ring-white/40 scale-105 text-white'
                                : 'opacity-50 hover:opacity-80 text-gray-300'
                        }`}
                        style={{ backgroundColor: weather === key ? cfg.color + '44' : '#1f2937' }}
                    >
                        <span className="text-lg">{cfg.emoji}</span>
                        <span>{language === 'es' ? cfg.label_es : cfg.label}</span>
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1">
                    <span>😊</span>
                    <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${happiness}%` }} />
                    </div>
                    <span className="text-gray-400 w-8">{happiness}%</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>💥</span>
                    <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${chaos}%` }} />
                    </div>
                    <span className="text-gray-400 w-8">{chaos}%</span>
                </div>
                <span className="text-gray-400">👥 {population}</span>
            </div>

            {/* Canvas */}
            <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl w-full max-w-[500px]">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={420}
                    className="block w-full h-auto"
                />
            </div>

            {/* Event log */}
            <div className="w-full max-w-lg mt-4 space-y-1 max-h-32 overflow-y-auto">
                {events.map((evt, i) => (
                    <div key={i} className={`text-xs px-3 py-1.5 rounded-lg ${i === 0 ? 'bg-gray-800 text-gray-200' : 'text-gray-500'}`}>
                        {evt}
                    </div>
                ))}
            </div>
        </div>
    );
}
