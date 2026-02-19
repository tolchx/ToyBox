"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/language';

interface PathSegment {
    x: number;
    y: number;
    width: number;
}

export default function MouseBalancerGame() {
    const { t } = useLanguage();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const scoreRef = useRef(0);
    const gameStateRef = useRef<'idle' | 'playing' | 'gameover'>('idle');
    const mousePos = useRef({ x: 0, y: 0 });
    const pathRef = useRef<PathSegment[]>([]);
    const animFrameRef = useRef<number>(0);
    const scrollOffsetRef = useRef(0);

    const generatePath = useCallback(() => {
        const segments: PathSegment[] = [];
        let x = 250;
        const pathWidth = 120;
        for (let i = 0; i < 2000; i++) {
            const widthShrink = Math.max(pathWidth - i * 0.3, 25);
            x += (Math.random() - 0.5) * 8;
            x = Math.max(widthShrink / 2 + 10, Math.min(490 - widthShrink / 2, x));
            segments.push({ x, y: i * 4, width: widthShrink });
        }
        return segments;
    }, []);

    const startGame = useCallback(() => {
        pathRef.current = generatePath();
        scrollOffsetRef.current = 0;
        scoreRef.current = 0;
        setScore(0);
        setGameState('playing');
        gameStateRef.current = 'playing';
    }, [generatePath]);

    const endGame = useCallback(() => {
        setGameState('gameover');
        gameStateRef.current = 'gameover';
        const finalScore = scoreRef.current;
        setScore(finalScore);
        setBest(prev => Math.max(prev, finalScore));
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mousePos.current = {
                x: ((e.clientX - rect.left) / rect.width) * 500,
                y: ((e.clientY - rect.top) / rect.height) * 600,
            };
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        const gameLoop = () => {
            ctx.clearRect(0, 0, 500, 600);

            if (gameStateRef.current === 'idle') {
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(0, 0, 500, 600);
                ctx.fillStyle = '#e0e0e0';
                ctx.font = 'bold 20px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(t('mouse_start'), 250, 300);

                // Draw start zone
                ctx.strokeStyle = '#4ade80';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(175, 260, 150, 80);
                ctx.setLineDash([]);

                // Check if mouse is in start zone
                const mx = mousePos.current.x;
                const my = mousePos.current.y;
                if (mx > 175 && mx < 325 && my > 260 && my < 340) {
                    startGame();
                }
            } else if (gameStateRef.current === 'playing') {
                ctx.fillStyle = '#0f0f1a';
                ctx.fillRect(0, 0, 500, 600);

                scrollOffsetRef.current += 2.5;
                scoreRef.current = Math.floor(scrollOffsetRef.current / 10);
                setScore(scoreRef.current);

                const path = pathRef.current;
                const offset = scrollOffsetRef.current;

                // Draw path
                for (let i = 0; i < path.length; i++) {
                    const screenY = path[i].y - offset + 400;
                    if (screenY < -10 || screenY > 610) continue;

                    const seg = path[i];
                    const halfW = seg.width / 2;

                    // Path fill
                    ctx.fillStyle = `rgba(30, 58, 95, 0.6)`;
                    ctx.fillRect(seg.x - halfW, screenY, seg.width, 5);

                    // Path edges
                    ctx.fillStyle = '#f87171';
                    ctx.fillRect(seg.x - halfW - 2, screenY, 3, 5);
                    ctx.fillRect(seg.x + halfW - 1, screenY, 3, 5);
                }

                // Draw cursor
                const mx = mousePos.current.x;
                const my = mousePos.current.y;

                ctx.beginPath();
                ctx.arc(mx, my, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#4ade80';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Glow
                ctx.beginPath();
                ctx.arc(mx, my, 12, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
                ctx.fill();

                // Collision check
                const segIndex = Math.floor((offset - 400 + my) / 4);
                if (segIndex >= 0 && segIndex < path.length) {
                    const seg = path[segIndex];
                    const halfW = seg.width / 2;
                    if (mx < seg.x - halfW || mx > seg.x + halfW) {
                        endGame();
                    }
                }

                // Score display
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 16px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(`${t('mouse_score')}: ${scoreRef.current}`, 15, 30);
            } else {
                // Game over
                ctx.fillStyle = '#1a0a0a';
                ctx.fillRect(0, 0, 500, 600);
            }

            animFrameRef.current = requestAnimationFrame(gameLoop);
        };

        animFrameRef.current = requestAnimationFrame(gameLoop);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animFrameRef.current);
        };
    }, [startGame, endGame, t]);

    return (
        <div className="h-full bg-gray-950 text-white flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-black mb-1">{t('mouse_title')}</h1>
                <p className="text-gray-400 text-sm">{t('mouse_instruction')}</p>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-gray-800 shadow-2xl" style={{ cursor: 'none' }}>
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={600}
                    className="block"
                    style={{ maxWidth: '100%', height: 'auto' }}
                />
            </div>

            {gameState === 'gameover' && (
                <div className="mt-6 text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-1">{t('mouse_gameover')}</h2>
                    <p className="text-gray-400 mb-1">{t('mouse_score')}: <span className="text-white font-bold">{score}</span></p>
                    <p className="text-gray-500 text-sm mb-4">{t('mouse_best')}: <span className="text-amber-400 font-bold">{best}</span></p>
                    <button
                        onClick={startGame}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors"
                    >
                        {t('mouse_retry')}
                    </button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="mt-3 flex items-center gap-6 text-sm">
                    <span className="text-gray-400">{t('mouse_score')}: <span className="text-white font-bold">{score}</span></span>
                    <span className="text-gray-500">{t('mouse_best')}: <span className="text-amber-400 font-bold">{best}</span></span>
                </div>
            )}
        </div>
    );
}
