"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/language';

interface Body {
    x: number;
    y: number;
    mass: number;
    radius: number;
    color: string;
    label: string;
    label_es: string;
}

interface Probe {
    x: number;
    y: number;
    vx: number;
    vy: number;
    trail: { x: number; y: number }[];
    alive: boolean;
}

const G = 0.5;

const levels: { bodies: Body[]; target: { x: number; y: number; radius: number }; startX: number; startY: number }[] = [
    {
        bodies: [
            { x: 250, y: 250, mass: 800, radius: 25, color: '#fbbf24', label: 'Star', label_es: 'Estrella' },
        ],
        target: { x: 420, y: 100, radius: 20 },
        startX: 80, startY: 400,
    },
    {
        bodies: [
            { x: 200, y: 250, mass: 600, radius: 22, color: '#fbbf24', label: 'Star', label_es: 'Estrella' },
            { x: 380, y: 180, mass: 300, radius: 15, color: '#3b82f6', label: 'Planet', label_es: 'Planeta' },
        ],
        target: { x: 430, y: 420, radius: 20 },
        startX: 60, startY: 80,
    },
    {
        bodies: [
            { x: 250, y: 250, mass: 900, radius: 28, color: '#fbbf24', label: 'Star', label_es: 'Estrella' },
            { x: 120, y: 120, mass: 200, radius: 12, color: '#ef4444', label: 'Red Dwarf', label_es: 'Enana Roja' },
            { x: 400, y: 350, mass: 250, radius: 14, color: '#8b5cf6', label: 'Gas Giant', label_es: 'Gigante Gaseoso' },
        ],
        target: { x: 450, y: 60, radius: 18 },
        startX: 40, startY: 450,
    },
    {
        bodies: [
            { x: 150, y: 200, mass: 500, radius: 20, color: '#fbbf24', label: 'Star A', label_es: 'Estrella A' },
            { x: 350, y: 300, mass: 500, radius: 20, color: '#f97316', label: 'Star B', label_es: 'Estrella B' },
        ],
        target: { x: 250, y: 50, radius: 18 },
        startX: 250, startY: 470,
    },
    {
        bodies: [
            { x: 250, y: 250, mass: 1000, radius: 30, color: '#fbbf24', label: 'Supergiant', label_es: 'Supergigante' },
            { x: 100, y: 150, mass: 180, radius: 11, color: '#ef4444', label: 'Red Dwarf', label_es: 'Enana Roja' },
            { x: 400, y: 150, mass: 180, radius: 11, color: '#3b82f6', label: 'Blue Dwarf', label_es: 'Enana Azul' },
            { x: 150, y: 400, mass: 220, radius: 13, color: '#8b5cf6', label: 'Gas Giant', label_es: 'Gigante Gaseoso' },
        ],
        target: { x: 450, y: 450, radius: 15 },
        startX: 50, startY: 50,
    },
    {
        bodies: [
            { x: 200, y: 200, mass: 450, radius: 18, color: '#fbbf24', label: 'Star Alpha', label_es: 'Estrella Alfa' },
            { x: 300, y: 200, mass: 450, radius: 18, color: '#f97316', label: 'Star Beta', label_es: 'Estrella Beta' },
            { x: 250, y: 300, mass: 450, radius: 18, color: '#ef4444', label: 'Star Gamma', label_es: 'Estrella Gamma' },
        ],
        target: { x: 420, y: 80, radius: 16 },
        startX: 80, startY: 420,
    },
    {
        bodies: [
            { x: 250, y: 150, mass: 700, radius: 23, color: '#fbbf24', label: 'Primary Star', label_es: 'Estrella Primaria' },
            { x: 150, y: 350, mass: 300, radius: 15, color: '#3b82f6', label: 'Planet 1', label_es: 'Planeta 1' },
            { x: 350, y: 350, mass: 300, radius: 15, color: '#8b5cf6', label: 'Planet 2', label_es: 'Planeta 2' },
            { x: 250, y: 400, mass: 150, radius: 10, color: '#ef4444', label: 'Moon', label_es: 'Luna' },
        ],
        target: { x: 480, y: 250, radius: 14 },
        startX: 20, startY: 250,
    },
    {
        bodies: [
            { x: 180, y: 180, mass: 400, radius: 17, color: '#fbbf24', label: 'Star 1', label_es: 'Estrella 1' },
            { x: 320, y: 180, mass: 400, radius: 17, color: '#f97316', label: 'Star 2', label_es: 'Estrella 2' },
            { x: 180, y: 320, mass: 400, radius: 17, color: '#3b82f6', label: 'Star 3', label_es: 'Estrella 3' },
            { x: 320, y: 320, mass: 400, radius: 17, color: '#8b5cf6', label: 'Star 4', label_es: 'Estrella 4' },
        ],
        target: { x: 250, y: 250, radius: 12 },
        startX: 250, startY: 50,
    },
    {
        bodies: [
            { x: 250, y: 250, mass: 1200, radius: 32, color: '#fbbf24', label: 'Hypergiant', label_es: 'Hiper gigante' },
            { x: 80, y: 80, mass: 120, radius: 9, color: '#ef4444', label: 'Dwarf A', label_es: 'Enana A' },
            { x: 420, y: 80, mass: 120, radius: 9, color: '#3b82f6', label: 'Dwarf B', label_es: 'Enana B' },
            { x: 80, y: 420, mass: 120, radius: 9, color: '#8b5cf6', label: 'Dwarf C', label_es: 'Enana C' },
            { x: 420, y: 420, mass: 120, radius: 9, color: '#10b981', label: 'Dwarf D', label_es: 'Enana D' },
        ],
        target: { x: 250, y: 100, radius: 12 },
        startX: 250, startY: 400,
    },
    {
        bodies: [
            { x: 150, y: 250, mass: 350, radius: 16, color: '#fbbf24', label: 'Star A', label_es: 'Estrella A' },
            { x: 250, y: 150, mass: 350, radius: 16, color: '#f97316', label: 'Star B', label_es: 'Estrella B' },
            { x: 350, y: 250, mass: 350, radius: 16, color: '#3b82f6', label: 'Star C', label_es: 'Estrella C' },
            { x: 250, y: 350, mass: 350, radius: 16, color: '#8b5cf6', label: 'Star D', label_es: 'Estrella D' },
            { x: 250, y: 250, mass: 200, radius: 12, color: '#ef4444', label: 'Core', label_es: 'Núcleo' },
        ],
        target: { x: 50, y: 50, radius: 12 },
        startX: 450, startY: 450,
    },
    {
        bodies: [
            { x: 200, y: 200, mass: 500, radius: 19, color: '#fbbf24', label: 'Centauri A', label_es: 'Centauri A' },
            { x: 300, y: 200, mass: 500, radius: 19, color: '#f97316', label: 'Centauri B', label_es: 'Centauri B' },
            { x: 150, y: 300, mass: 250, radius: 14, color: '#3b82f6', label: 'Planet X', label_es: 'Planeta X' },
            { x: 350, y: 300, mass: 250, radius: 14, color: '#8b5cf6', label: 'Planet Y', label_es: 'Planeta Y' },
            { x: 250, y: 380, mass: 100, radius: 8, color: '#ef4444', label: 'Asteroid', label_es: 'Asteroide' },
        ],
        target: { x: 250, y: 50, radius: 10 },
        startX: 250, startY: 450,
    },
    {
        bodies: [
            { x: 250, y: 250, mass: 1500, radius: 35, color: '#fbbf24', label: 'Quasar', label_es: 'Cuásar' },
            { x: 100, y: 100, mass: 200, radius: 12, color: '#ef4444', label: 'Pulsar A', label_es: 'Púlsar A' },
            { x: 400, y: 100, mass: 200, radius: 12, color: '#3b82f6', label: 'Pulsar B', label_es: 'Púlsar B' },
            { x: 100, y: 400, mass: 200, radius: 12, color: '#8b5cf6', label: 'Pulsar C', label_es: 'Púlsar C' },
            { x: 400, y: 400, mass: 200, radius: 12, color: '#10b981', label: 'Pulsar D', label_es: 'Púlsar D' },
            { x: 250, y: 100, mass: 80, radius: 7, color: '#f97316', label: 'Comet', label_es: 'Cometa' },
        ],
        target: { x: 250, y: 480, radius: 10 },
        startX: 250, startY: 20,
    },
    {
        bodies: [
            { x: 125, y: 125, mass: 300, radius: 15, color: '#fbbf24', label: 'Star 1', label_es: 'Estrella 1' },
            { x: 375, y: 125, mass: 300, radius: 15, color: '#f97316', label: 'Star 2', label_es: 'Estrella 2' },
            { x: 125, y: 375, mass: 300, radius: 15, color: '#3b82f6', label: 'Star 3', label_es: 'Estrella 3' },
            { x: 375, y: 375, mass: 300, radius: 15, color: '#8b5cf6', label: 'Star 4', label_es: 'Estrella 4' },
            { x: 250, y: 250, mass: 400, radius: 17, color: '#ef4444', label: 'Central Star', label_es: 'Estrella Central' },
            { x: 200, y: 250, mass: 100, radius: 8, color: '#10b981', label: 'Orbiter 1', label_es: 'Orbitador 1' },
            { x: 300, y: 250, mass: 100, radius: 8, color: '#f59e0b', label: 'Orbiter 2', label_es: 'Orbitador 2' },
        ],
        target: { x: 470, y: 250, radius: 8 },
        startX: 30, startY: 250,
    },
    {
        bodies: [
            { x: 250, y: 250, mass: 2000, radius: 40, color: '#fbbf24', label: 'Black Hole', label_es: 'Agujero Negro' },
            { x: 150, y: 150, mass: 150, radius: 10, color: '#ef4444', label: 'Dwarf 1', label_es: 'Enana 1' },
            { x: 350, y: 150, mass: 150, radius: 10, color: '#3b82f6', label: 'Dwarf 2', label_es: 'Enana 2' },
            { x: 150, y: 350, mass: 150, radius: 10, color: '#8b5cf6', label: 'Dwarf 3', label_es: 'Enana 3' },
            { x: 350, y: 350, mass: 150, radius: 10, color: '#10b981', label: 'Dwarf 4', label_es: 'Enana 4' },
            { x: 250, y: 100, mass: 100, radius: 8, color: '#f97316', label: 'Satellite A', label_es: 'Satélite A' },
            { x: 100, y: 250, mass: 100, radius: 8, color: '#f59e0b', label: 'Satellite B', label_es: 'Satélite B' },
            { x: 400, y: 250, mass: 100, radius: 8, color: '#ec4899', label: 'Satellite C', label_es: 'Satélite C' },
        ],
        target: { x: 250, y: 20, radius: 8 },
        startX: 250, startY: 480,
    },
    {
        bodies: [
            { x: 250, y: 250, mass: 2500, radius: 45, color: '#1f2937', label: 'Singularity', label_es: 'Singularidad' },
            { x: 100, y: 100, mass: 180, radius: 11, color: '#ef4444', label: 'Quark Star A', label_es: 'Estrella de Quarks A' },
            { x: 400, y: 100, mass: 180, radius: 11, color: '#3b82f6', label: 'Quark Star B', label_es: 'Estrella de Quarks B' },
            { x: 100, y: 400, mass: 180, radius: 11, color: '#8b5cf6', label: 'Quark Star C', label_es: 'Estrella de Quarks C' },
            { x: 400, y: 400, mass: 180, radius: 11, color: '#10b981', label: 'Quark Star D', label_es: 'Estrella de Quarks D' },
            { x: 200, y: 200, mass: 120, radius: 9, color: '#f97316', label: 'Neutron Star', label_es: 'Estrella de Neutrones' },
            { x: 300, y: 200, mass: 120, radius: 9, color: '#f59e0b', label: 'Magnetar', label_es: 'Magnetar' },
            { x: 200, y: 300, mass: 120, radius: 9, color: '#ec4899', label: 'White Dwarf', label_es: 'Enana Blanca' },
            { x: 300, y: 300, mass: 120, radius: 9, color: '#06b6d4', label: 'Brown Dwarf', label_es: 'Enana Marrón' },
        ],
        target: { x: 15, y: 15, radius: 6 },
        startX: 485, startY: 485,
    },
];

export default function OrbitalSlingshotGame() {
    const { language } = useLanguage();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [levelIdx, setLevelIdx] = useState(0);
    const [gameState, setGameState] = useState<'aiming' | 'flying' | 'won' | 'lost'>('aiming');
    const [aimEnd, setAimEnd] = useState<{ x: number; y: number } | null>(null);
    const [attempts, setAttempts] = useState(0);
    const probeRef = useRef<Probe | null>(null);
    const animRef = useRef<number>(0);
    const gameStateRef = useRef(gameState);
    const levelRef = useRef(levels[0]);

    gameStateRef.current = gameState;
    levelRef.current = levels[levelIdx];

    const level = levels[levelIdx];

    const launch = useCallback((dirX: number, dirY: number) => {
        const speed = 4;
        probeRef.current = {
            x: level.startX,
            y: level.startY,
            vx: dirX * speed,
            vy: dirY * speed,
            trail: [],
            alive: true,
        };
        setGameState('flying');
        setAttempts(prev => prev + 1);
    }, [level]);

    // Canvas rendering and physics
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = 500;
        const H = 500;

        const render = () => {
            const lv = levelRef.current;
            ctx.clearRect(0, 0, W, H);

            // Background
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            // Stars background
            for (let i = 0; i < 80; i++) {
                const sx = (i * 137.5) % W;
                const sy = (i * 97.3) % H;
                ctx.fillStyle = `rgba(255,255,255,${0.1 + (i % 5) * 0.08})`;
                ctx.fillRect(sx, sy, 1, 1);
            }

            // Target
            ctx.beginPath();
            ctx.arc(lv.target.x, lv.target.y, lv.target.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
            ctx.fill();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#10b981';
            ctx.fillText('🎯', lv.target.x, lv.target.y + 5);

            // Bodies (planets/stars)
            for (const body of lv.bodies) {
                // Gravity well visualization
                const gradient = ctx.createRadialGradient(body.x, body.y, body.radius, body.x, body.y, body.radius * 4);
                gradient.addColorStop(0, body.color + '22');
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(body.x, body.y, body.radius * 4, 0, Math.PI * 2);
                ctx.fill();

                // Body itself
                ctx.beginPath();
                ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
                ctx.fillStyle = body.color;
                ctx.fill();

                // Label
                ctx.font = '10px sans-serif';
                ctx.fillStyle = body.color;
                ctx.textAlign = 'center';
                ctx.fillText(language === 'es' ? body.label_es : body.label, body.x, body.y + body.radius + 14);
            }

            // Start position
            if (gameStateRef.current === 'aiming') {
                ctx.beginPath();
                ctx.arc(lv.startX, lv.startY, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#60a5fa';
                ctx.fill();
                ctx.strokeStyle = '#93c5fd';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Aim line
                if (aimEnd) {
                    ctx.beginPath();
                    ctx.moveTo(lv.startX, lv.startY);
                    ctx.lineTo(aimEnd.x, aimEnd.y);
                    ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Arrow head
                    ctx.beginPath();
                    ctx.arc(aimEnd.x, aimEnd.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#60a5fa';
                    ctx.fill();
                }
            }

            // Probe physics & rendering
            const probe = probeRef.current;
            if (probe && probe.alive && gameStateRef.current === 'flying') {
                // Physics step (multiple substeps for stability)
                for (let step = 0; step < 3; step++) {
                    let ax = 0, ay = 0;
                    for (const body of lv.bodies) {
                        const dx = body.x - probe.x;
                        const dy = body.y - probe.y;
                        const distSq = dx * dx + dy * dy;
                        const dist = Math.sqrt(distSq);

                        // Collision with body
                        if (dist < body.radius + 3) {
                            probe.alive = false;
                            setGameState('lost');
                            break;
                        }

                        const force = (G * body.mass) / distSq;
                        ax += (force * dx) / dist;
                        ay += (force * dy) / dist;
                    }

                    if (!probe.alive) break;

                    probe.vx += ax;
                    probe.vy += ay;
                    probe.x += probe.vx / 3;
                    probe.y += probe.vy / 3;
                }

                // Trail
                probe.trail.push({ x: probe.x, y: probe.y });
                if (probe.trail.length > 300) probe.trail.shift();

                // Out of bounds
                if (probe.x < -50 || probe.x > W + 50 || probe.y < -50 || probe.y > H + 50) {
                    probe.alive = false;
                    setGameState('lost');
                }

                // Check target
                const tdx = lv.target.x - probe.x;
                const tdy = lv.target.y - probe.y;
                if (Math.sqrt(tdx * tdx + tdy * tdy) < lv.target.radius) {
                    probe.alive = false;
                    setGameState('won');
                }

                // Draw trail
                if (probe.trail.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(probe.trail[0].x, probe.trail[0].y);
                    for (let i = 1; i < probe.trail.length; i++) {
                        ctx.lineTo(probe.trail[i].x, probe.trail[i].y);
                    }
                    ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                // Draw probe
                if (probe.alive) {
                    ctx.beginPath();
                    ctx.arc(probe.x, probe.y, 5, 0, Math.PI * 2);
                    ctx.fillStyle = '#60a5fa';
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            animRef.current = requestAnimationFrame(render);
        };

        animRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animRef.current);
    }, [levelIdx, aimEnd, language]);

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (gameState !== 'aiming') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 500;
        const y = ((e.clientY - rect.top) / rect.height) * 500;
        setAimEnd({ x, y });
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (gameState !== 'aiming' || !aimEnd) return;
        const dx = aimEnd.x - level.startX;
        const dy = aimEnd.y - level.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5) return;
        launch(dx / dist, dy / dist);
    };

    const retry = () => {
        probeRef.current = null;
        setGameState('aiming');
        setAimEnd(null);
    };

    const nextLevel = () => {
        const next = (levelIdx + 1) % levels.length;
        setLevelIdx(next);
        probeRef.current = null;
        setGameState('aiming');
        setAimEnd(null);
    };

    return (
        <div className="h-full bg-[#0a0a1a] text-white flex flex-col items-center p-2 sm:p-4 md:p-6 overflow-auto">
            <div className="text-center mb-4">
                <h1 className="text-2xl md:text-3xl font-black mb-1">
                    {language === 'es' ? '🚀 Lanzamiento Orbital' : '🚀 Orbital Slingshot'}
                </h1>
                <p className="text-gray-400 text-sm">
                    {language === 'es'
                        ? 'Haz clic para lanzar la sonda hacia el objetivo. Usa la gravedad a tu favor.'
                        : 'Click to launch the probe toward the target. Use gravity to your advantage.'}
                </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-xs">
                <span className="text-gray-400">{language === 'es' ? 'Nivel' : 'Level'}: <span className="text-indigo-400 font-bold">{levelIdx + 1}/{levels.length}</span></span>
                <span className="text-gray-400">{language === 'es' ? 'Intentos' : 'Attempts'}: <span className="text-amber-400 font-bold">{attempts}</span></span>
            </div>

            {/* Canvas */}
            <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl cursor-crosshair w-full max-w-[500px]">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    className="block w-full h-auto"
                    onMouseMove={handleCanvasMouseMove}
                    onClick={handleCanvasClick}
                />
            </div>

            {/* Result overlay */}
            {gameState === 'won' && (
                <div className="mt-4 text-center">
                    <div className="text-4xl mb-2">🎯</div>
                    <h2 className="text-xl font-bold text-emerald-400 mb-3">
                        {language === 'es' ? '¡Objetivo alcanzado!' : 'Target reached!'}
                    </h2>
                    <button
                        onClick={nextLevel}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
                    >
                        {language === 'es' ? 'Siguiente Nivel →' : 'Next Level →'}
                    </button>
                </div>
            )}

            {gameState === 'lost' && (
                <div className="mt-4 text-center">
                    <div className="text-4xl mb-2">💥</div>
                    <h2 className="text-xl font-bold text-red-400 mb-3">
                        {language === 'es' ? '¡Sonda perdida!' : 'Probe lost!'}
                    </h2>
                    <button
                        onClick={retry}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors"
                    >
                        {language === 'es' ? 'Reintentar' : 'Retry'}
                    </button>
                </div>
            )}

            {gameState === 'aiming' && (
                <p className="mt-3 text-gray-500 text-xs text-center">
                    {language === 'es' ? '🖱️ Mueve el ratón para apuntar, haz clic para lanzar' : '🖱️ Move mouse to aim, click to launch'}
                </p>
            )}
        </div>
    );
}
