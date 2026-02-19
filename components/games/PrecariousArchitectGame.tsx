"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/language';
import GameResultModal from '@/components/GameResultModal';

interface Block {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    settled: boolean;
    vx: number;
    vy: number;
    angle: number;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
const GRAVITY = 0.8; // Increased for faster falling
const FRICTION = 0.95; // Friction to slow down horizontal movement
const BOUNCE_DAMPING = 0.3; // Energy loss on bounce
const GROUND_Y = 480;
const CANVAS_W = 400;
const CANVAS_H = 520;
const MAX_HEIGHT = 15; // Maximum height levels
const DROP_VELOCITY = 5; // Initial drop velocity

export default function PrecariousArchitectGame() {
    const { language } = useLanguage();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [currentBlock, setCurrentBlock] = useState<Block | null>(null);

    const blocksRef = useRef<Block[]>([]);
    const currentBlockRef = useRef<Block | null>(null);
    const gameOverRef = useRef(false);
    const nextIdRef = useRef(0);
    const animRef = useRef<number>(0);
    const swingRef = useRef(0);

    blocksRef.current = blocks;
    currentBlockRef.current = currentBlock;
    gameOverRef.current = gameOver;

    const spawnBlock = useCallback(() => {
        // Variable block sizes: some small, some large
        const sizeType = Math.random();
        let width, height;
        
        if (sizeType < 0.25) {
            // Small blocks (25% chance)
            width = 25 + Math.random() * 20;
            height = 12 + Math.random() * 13;
        } else if (sizeType < 0.75) {
            // Medium blocks (50% chance)
            width = 40 + Math.random() * 30;
            height = 20 + Math.random() * 20;
        } else {
            // Large blocks (25% chance)
            width = 60 + Math.random() * 40;
            height = 30 + Math.random() * 25;
        }
        
        const block: Block = {
            id: nextIdRef.current++,
            x: CANVAS_W / 2 - width / 2,
            y: 20,
            width,
            height,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            settled: false,
            vx: 0,
            vy: 0,
            angle: 0,
        };
        setCurrentBlock(block);
    }, []);

    const dropBlock = useCallback(() => {
        const block = currentBlockRef.current;
        if (!block || gameOverRef.current) return;

        // Drop it — give it faster downward velocity
        const droppedBlock = { ...block, vy: DROP_VELOCITY, settled: false };
        setBlocks(prev => [...prev, droppedBlock]);
        setCurrentBlock(null);

        // Spawn next after delay
        setTimeout(() => {
            if (!gameOverRef.current) spawnBlock();
        }, 800);
    }, [spawnBlock]);

    // Initialize
    useEffect(() => {
        spawnBlock();
    }, [spawnBlock]);

    // Physics & rendering loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

            // Sky gradient
            const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
            grad.addColorStop(0, '#1e1b4b');
            grad.addColorStop(1, '#312e81');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            // Ground
            ctx.fillStyle = '#4a5568';
            ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(0, GROUND_Y, CANVAS_W, 3);

            // Height markers and check for max height
            const maxHeight = blocksRef.current.reduce((max, b) => {
                if (b.settled) return Math.min(max, b.y);
                return max;
            }, GROUND_Y);
            const towerHeight = Math.floor((GROUND_Y - maxHeight) / 25);

            // Check if maximum height reached
            if (towerHeight >= MAX_HEIGHT && !gameOverRef.current) {
                setGameOver(true);
                setGameWon(true);
                const finalScore = blocksRef.current.filter(bl => bl.settled).length;
                setScore(finalScore);
                setBest(prev => Math.max(prev, finalScore));
            }

            for (let h = 1; h <= 15; h++) {
                const markerY = GROUND_Y - h * 25;
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.fillRect(0, markerY, CANVAS_W, 1);
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.font = '9px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(`${h}`, 5, markerY - 2);
            }

            // Update physics for unsettled blocks
            const updatedBlocks = blocksRef.current.map(b => {
                if (b.settled) return b;

                const newB = { ...b };
                newB.vy += GRAVITY;
                newB.y += newB.vy;
                newB.x += newB.vx;

                // Apply friction to horizontal movement
                newB.vx *= FRICTION;

                // Ground collision
                if (newB.y + newB.height >= GROUND_Y) {
                    newB.y = GROUND_Y - newB.height;
                    newB.vy = -newB.vy * BOUNCE_DAMPING; // Bounce with damping
                    newB.vx *= FRICTION; // More friction on ground

                    // Stop bouncing if velocity is too small
                    if (Math.abs(newB.vy) < 0.5) {
                        newB.vy = 0;
                        newB.settled = true;
                        newB.vx = 0;
                    }
                }

                // Collision with other blocks (both settled and falling)
                for (const other of blocksRef.current) {
                    if (other.id === newB.id) continue;

                    const overlapX = Math.min(newB.x + newB.width, other.x + other.width) - Math.max(newB.x, other.x);
                    const overlapY = Math.min(newB.y + newB.height, other.y + other.height) - Math.max(newB.y, other.y);

                    if (overlapX > 0 && overlapY > 0) {
                        // Determine collision direction
                        const overlapXRatio = overlapX / Math.min(newB.width, other.width);
                        const overlapYRatio = overlapY / Math.min(newB.height, other.height);

                        if (overlapYRatio < overlapXRatio) {
                            // Vertical collision (top/bottom)
                            if (newB.y < other.y) {
                                // Landing on top
                                newB.y = other.y - newB.height;
                                newB.vy = 0;

                                // Check if block is balanced (enough overlap)
                                if (overlapX > newB.width * 0.25) {
                                    newB.settled = true;
                                    newB.vx = 0;
                                } else {
                                    // Slide off with more realistic physics
                                    newB.vx = newB.x < other.x ? -2.5 : 2.5;
                                    newB.vy = -2;
                                }
                            } else {
                                // Hit from below (shouldn't happen normally)
                                newB.y = other.y + other.height;
                                newB.vy = -newB.vy * BOUNCE_DAMPING;
                            }
                        } else {
                            // Horizontal collision (sides)
                            if (newB.x < other.x) {
                                // Hit from left
                                newB.x = other.x - newB.width;
                            } else {
                                // Hit from right
                                newB.x = other.x + other.width;
                            }
                            newB.vx = -newB.vx * BOUNCE_DAMPING;
                            
                            // Add some bounce effect
                            if (Math.abs(newB.vy) > 1) {
                                newB.vy *= -BOUNCE_DAMPING;
                            }
                        }
                    }
                }

                // Out of bounds = game over (tower collapse)
                if (newB.y > GROUND_Y + 50 || newB.x < -100 || newB.x > CANVAS_W + 100) {
                    if (!gameOverRef.current) {
                        setGameOver(true);
                        setGameWon(false);
                        const finalScore = blocksRef.current.filter(bl => bl.settled).length;
                        setScore(finalScore);
                        setBest(prev => Math.max(prev, finalScore));
                    }
                }

                // Check for tower instability (blocks falling off the sides)
                if (newB.settled && (newB.x < 0 || newB.x + newB.width > CANVAS_W)) {
                    if (!gameOverRef.current) {
                        setGameOver(true);
                        setGameWon(false);
                        const finalScore = blocksRef.current.filter(bl => bl.settled).length;
                        setScore(finalScore);
                        setBest(prev => Math.max(prev, finalScore));
                    }
                }

                return newB;
            });

            // Update blocks state (only if changed)
            const hasChanges = updatedBlocks.some((b, i) => b !== blocksRef.current[i]);
            if (hasChanges) {
                blocksRef.current = updatedBlocks;
                setBlocks(updatedBlocks);
            }

            // Draw settled blocks
            for (const b of blocksRef.current) {
                ctx.save();
                ctx.fillStyle = b.color;
                ctx.shadowColor = b.color;
                ctx.shadowBlur = b.settled ? 0 : 8;
                ctx.fillRect(b.x, b.y, b.width, b.height);

                // Block border
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.lineWidth = 1;
                ctx.strokeRect(b.x, b.y, b.width, b.height);

                // Highlight
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(b.x, b.y, b.width, 3);
                ctx.restore();
            }

            // Draw current swinging block
            const cur = currentBlockRef.current;
            if (cur && !gameOverRef.current) {
                swingRef.current += 0.03;
                const swingX = CANVAS_W / 2 + Math.sin(swingRef.current) * 120 - cur.width / 2;

                ctx.save();
                // Rope
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(CANVAS_W / 2, 0);
                ctx.lineTo(swingX + cur.width / 2, cur.y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Block
                ctx.fillStyle = cur.color;
                ctx.shadowColor = cur.color;
                ctx.shadowBlur = 10;
                ctx.fillRect(swingX, cur.y, cur.width, cur.height);
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1;
                ctx.strokeRect(swingX, cur.y, cur.width, cur.height);
                ctx.restore();

                // Update current block position for drop
                currentBlockRef.current = { ...cur, x: swingX };
            }

            // Score display
            const settledCount = blocksRef.current.filter(b => b.settled).length;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${language === 'es' ? 'Bloques' : 'Blocks'}: ${settledCount}`, CANVAS_W - 10, 25);
            ctx.fillText(`${language === 'es' ? 'Altura' : 'Height'}: ${towerHeight}`, CANVAS_W - 10, 45);

            animRef.current = requestAnimationFrame(render);
        };

        animRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animRef.current);
    }, [language]);

    const handleClick = () => {
        if (gameOver) return;
        dropBlock();
    };

    const restart = () => {
        blocksRef.current = [];
        setBlocks([]);
        setGameOver(false);
        setGameWon(false);
        setScore(0);
        gameOverRef.current = false;
        swingRef.current = 0;
        spawnBlock();
    };

    return (
        <div className="h-full bg-gradient-to-b from-indigo-950 to-gray-950 text-white flex flex-col items-center p-2 sm:p-4 md:p-6 overflow-auto">
            <div className="text-center mb-4">
                <h1 className="text-2xl md:text-3xl font-black mb-1">
                    {language === 'es' ? '🏗️ Arquitecto Precario' : '🏗️ Precarious Architect'}
                </h1>
                <p className="text-gray-400 text-sm">
                    {language === 'es'
                        ? 'Haz clic para soltar bloques. Construye la torre más alta.'
                        : 'Click to drop blocks. Build the tallest tower.'}
                </p>
            </div>

            <div
                className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl cursor-pointer w-full max-w-[400px]"
                onClick={handleClick}
            >
                <canvas
                    ref={canvasRef}
                    width={CANVAS_W}
                    height={CANVAS_H}
                    className="block w-full h-auto"
                />
            </div>

            {gameOver && (
                <GameResultModal
                    isOpen={gameOver}
                    onClose={() => {}}
                    onRestart={restart}
                    title={gameWon ? "Maximum Height Reached!" : "Tower Collapsed!"}
                    title_es={gameWon ? "¡Altura máxima alcanzada!" : "¡Torre derrumbada!"}
                    message={gameWon 
                        ? "Congratulations! You've reached the maximum tower height!"
                        : "Your tower has collapsed. Try again to build a more stable structure!"
                    }
                    message_es={gameWon 
                        ? "¡Felicidades! ¡Has alcanzado la altura máxima de la torre!"
                        : "Tu torre se ha derrumbado. ¡Intenta de nuevo construir una estructura más estable!"
                    }
                    score={score}
                    best={best}
                    scoreLabel={language === 'es' ? 'Bloques' : 'Blocks'}
                    scoreLabel_es={language === 'es' ? 'Bloques' : 'Blocks'}
                    bestLabel={language === 'es' ? 'Mejor' : 'Best'}
                    bestLabel_es={language === 'es' ? 'Mejor' : 'Best'}
                    icon={gameWon ? '🏆' : '💥'}
                    isSuccess={gameWon}
                    additionalStats={[
                        {
                            label: "Tower Height",
                            label_es: "Altura de la Torre",
                            value: `${Math.floor((GROUND_Y - blocks.reduce((max, b) => b.settled ? Math.min(max, b.y) : max, GROUND_Y)) / 25)}`
                        }
                    ]}
                />
            )}

            {!gameOver && (
                <p className="mt-3 text-gray-500 text-xs">
                    {language === 'es' ? '🖱️ Clic para soltar el bloque' : '🖱️ Click to drop the block'}
                </p>
            )}
        </div>
    );
}
