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
