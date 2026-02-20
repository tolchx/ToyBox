"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { useUser } from '@/lib/user-context';

// --- Types ---
interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface Player extends Rect {
    vx: number;
    vy: number;
    grounded: boolean;
    dead: boolean;
    win: boolean;
}

interface Platform extends Rect {
    type: 'normal' | 'disappear' | 'move' | 'fake';
    visible: boolean;
    triggerDist?: number; // Distance to player to trigger effect
    moveSpeed?: { x: number; y: number };
    id: number;
}

interface Spike extends Rect {
    type: 'static' | 'fall' | 'hidden';
    triggered?: boolean;
    vy?: number;
    id: number;
}

interface Level {
    id: number;
    start: { x: number; y: number };
    goal: Rect;
    platforms: Platform[];
    spikes: Spike[];
    width: number;
    height: number;
}

// --- Constants ---
const TILE_SIZE = 40;
const GRAVITY = 0.6; // Slightly heavier feel
const JUMP_FORCE = -11;
const SPEED = 5;
const FRICTION = 0.8;

// --- Levels ---
const levels: Level[] = [
    // Level 1: The Basics (Safe)
    {
        id: 1,
        start: { x: 100, y: 300 },
        goal: { x: 700, y: 260, w: 40, h: 60 },
        width: 800,
        height: 400,
        platforms: [
            { id: 1, x: 0, y: 350, w: 800, h: 50, type: 'normal', visible: true },
            { id: 2, x: 200, y: 250, w: 100, h: 20, type: 'normal', visible: true },
            { id: 3, x: 400, y: 200, w: 100, h: 20, type: 'normal', visible: true },
            { id: 4, x: 600, y: 320, w: 200, h: 30, type: 'normal', visible: true },
        ],
        spikes: []
    },
    // Level 2: Simple Jumps (Introduction to gaps)
    {
        id: 2,
        start: { x: 50, y: 300 },
        goal: { x: 700, y: 300, w: 40, h: 60 },
        width: 800,
        height: 400,
        platforms: [
            { id: 1, x: 0, y: 360, w: 250, h: 40, type: 'normal', visible: true },
            { id: 2, x: 350, y: 360, w: 150, h: 40, type: 'normal', visible: true },
            { id: 3, x: 600, y: 360, w: 200, h: 40, type: 'normal', visible: true },
        ],
        spikes: []
    },
    // Level 3: The Hole (Disappearing platform)
    {
        id: 3,
        start: { x: 50, y: 300 },
        goal: { x: 700, y: 300, w: 40, h: 60 },
        width: 800,
        height: 400,
        platforms: [
            { id: 1, x: 0, y: 360, w: 300, h: 40, type: 'normal', visible: true },
            { id: 2, x: 300, y: 360, w: 200, h: 40, type: 'disappear', visible: true, triggerDist: 60 },
            { id: 3, x: 500, y: 360, w: 300, h: 40, type: 'normal', visible: true },
        ],
        spikes: [
            { id: 1, x: 350, y: 380, w: 100, h: 20, type: 'static' }
        ]
    },
    // Level 4: Falling Spikes (Introduction to traps)
    {
        id: 4,
        start: { x: 50, y: 300 },
        goal: { x: 700, y: 300, w: 40, h: 60 },
        width: 800,
        height: 400,
        platforms: [
            { id: 1, x: 0, y: 360, w: 800, h: 40, type: 'normal', visible: true },
        ],
        spikes: [
            { id: 1, x: 300, y: 50, w: 40, h: 25, type: 'fall', triggered: false }, // Shorter height (25 instead of 40)
            { id: 2, x: 350, y: 50, w: 40, h: 25, type: 'fall', triggered: false },
            { id: 3, x: 400, y: 50, w: 40, h: 25, type: 'fall', triggered: false },
        ]
    },
    // Level 5: Moving Goal & Spikes
    {
        id: 5,
        start: { x: 50, y: 200 },
        goal: { x: 600, y: 200, w: 40, h: 60 },
        width: 800,
        height: 400,
        platforms: [
            { id: 1, x: 0, y: 300, w: 200, h: 40, type: 'normal', visible: true },
            { id: 2, x: 300, y: 300, w: 100, h: 40, type: 'normal', visible: true },
            { id: 3, x: 500, y: 300, w: 300, h: 40, type: 'normal', visible: true },
        ],
        spikes: [
            { id: 1, x: 200, y: 340, w: 100, h: 20, type: 'static' }, // 20px is already short/easy
            { id: 2, x: 400, y: 340, w: 100, h: 20, type: 'static' }
        ]
    }
];

export default function LevelDevilGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { t, language } = useLanguage();
    const { isPremium } = useUser();
    const [levelIndex, setLevelIndex] = useState(0);
    const [deathCount, setDeathCount] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'won' | 'level_complete' | 'premium_wall'>('playing');

    // Game state refs (to avoid closure staleness in loop)
    const playerRef = useRef<Player>({ x: 0, y: 0, w: 30, h: 30, vx: 0, vy: 0, grounded: false, dead: false, win: false });
    const keys = useRef<{ [key: string]: boolean }>({});
    const levelRef = useRef<Level>(JSON.parse(JSON.stringify(levels[0]))); // Deep copy
    const frameRef = useRef<number>(0);

    const MAX_LEVELS_FREE = 5;
    const MAX_LEVELS_PREMIUM = 100;

    // Helper to get level data (loops for premium)
    const getLevel = (index: number): Level => {
        const templateIndex = index % levels.length;
        const template = levels[templateIndex];

        // Deep copy
        const level = JSON.parse(JSON.stringify(template));

        // Add variations based on loop count (optional, for now just loop)
        // e.g., increase spike speed, decrease platform width?
        const loopCount = Math.floor(index / levels.length);
        if (loopCount > 0) {
            // Example variation: slightly faster spikes or moving platforms?
            // Keeping it simple for now to ensures playability.
            // Maybe shift start position slightly?
        }

        return level;
    };

    // Init level
    useEffect(() => {
        resetLevel();
    }, [levelIndex]);

    const resetLevel = () => {
        const level = getLevel(levelIndex);
        if (!level) return;

        levelRef.current = level;
        playerRef.current = {
            x: level.start.x,
            y: level.start.y,
            w: 30,
            h: 30,
            vx: 0,
            vy: 0,
            grounded: false,
            dead: false,
            win: false
        };

        // Check if we are in a valid state
        if (gameState !== 'premium_wall' && gameState !== 'won') {
            setGameState('playing');
        }
    };

    // Input handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const loop = () => {
            update();
            render(ctx, canvas);
            frameRef.current = requestAnimationFrame(loop);
        };

        frameRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameRef.current);
    }, [levelIndex, gameState, isPremium]); // Re-bind if level changes, though refs handle state

    function update() {
        if (gameState !== 'playing') return;

        const player = playerRef.current;
        const level = levelRef.current;

        if (player.dead) {
            // Simple respawn delay logic could go here, for now instant reset
            setDeathCount(prev => prev + 1);
            resetLevel();
            return;
        }

        // --- Physics ---
        if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
            player.vx -= SPEED * 0.2;
        }
        if (keys.current['ArrowRight'] || keys.current['KeyD']) {
            player.vx += SPEED * 0.2;
        }

        player.vx *= FRICTION;
        player.vy += GRAVITY;

        // Jump
        if ((keys.current['ArrowUp'] || keys.current['Space'] || keys.current['KeyW']) && player.grounded) {
            player.vy = JUMP_FORCE;
            player.grounded = false;
        }

        player.x += player.vx;
        handleCollisions(player, level, 'x');

        player.y += player.vy;
        handleCollisions(player, level, 'y');

        // Check boundaries
        if (player.y > level.height + 100) {
            die();
        }

        // --- Triggers & Trolls ---
        updateLevelMechanics(player, level);

        // --- Goal ---
        if (checkRectOverlap(player, level.goal)) {
            levelComplete();
        }

        // --- Spikes ---
        for (const spike of level.spikes) {
            if (checkRectOverlap(player, spike)) {
                die();
            }
        }
    }

    function updateLevelMechanics(player: Player, level: Level) {
        // Disappearing platforms
        level.platforms.forEach(p => {
            if (p.type === 'disappear' && p.visible && p.triggerDist) {
                const dx = (player.x + player.w / 2) - (p.x + p.w / 2);
                const dy = (player.y + player.h / 2) - (p.y + p.h / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < p.triggerDist) {
                    p.visible = false;
                }
            }
        });

        // Falling spikes
        level.spikes.forEach(s => {
            if (s.type === 'fall' && !s.triggered) {
                // Trigger if player is roughly under it
                if (Math.abs((player.x + player.w / 2) - (s.x + s.w / 2)) < 50 && player.y > s.y) {
                    s.triggered = true;
                    s.vy = 0;
                }
            }
            if (s.type === 'fall' && s.triggered) {
                s.vy = (s.vy || 0) + 0.5;
                s.y += s.vy;
            }
        });

        // Moving goal (Simple troll implementation)
        // Original Level 5 is index 4
        if (levelIndex % levels.length === 4) {
            const distToGoal = Math.abs(player.x - level.goal.x);
            if (distToGoal < 100 && level.goal.x === 600) {
                level.goal.x = 750; // Teleport goal away
            }
        }
    }

    function handleCollisions(player: Player, level: Level, axis: 'x' | 'y') {
        player.grounded = false;

        for (const p of level.platforms) {
            if (!p.visible) continue;

            if (checkRectOverlap(player, p)) {
                if (axis === 'x') {
                    if (player.vx > 0) player.x = p.x - player.w;
                    else if (player.vx < 0) player.x = p.x + p.w;
                    player.vx = 0;
                } else {
                    if (player.vy > 0) {
                        player.y = p.y - player.h;
                        player.grounded = true;
                        player.vy = 0;
                    } else if (player.vy < 0) {
                        player.y = p.y + p.h;
                        player.vy = 0;
                    }
                }
            }
        }

        // Floor check if we fell out of bounds (handled in update, but simple floor here if needed)
    }

    function checkRectOverlap(r1: Rect, r2: Rect) {
        return r1.x < r2.x + r2.w &&
            r1.x + r1.w > r2.x &&
            r1.y < r2.y + r2.h &&
            r1.y + r1.h > r2.y;
    }

    function die() {
        if (playerRef.current.dead) return;
        playerRef.current.dead = true;
        // Particle effects could go here
    }

    function levelComplete() {
        if (gameState === 'level_complete' || gameState === 'premium_wall' || gameState === 'won') return;

        setGameState('level_complete');

        setTimeout(() => {
            const nextLevel = levelIndex + 1;

            // Limit checks
            if (!isPremium && nextLevel >= MAX_LEVELS_FREE) {
                setGameState('premium_wall');
                return;
            }

            if (nextLevel >= MAX_LEVELS_PREMIUM) {
                setGameState('won');
                return;
            }

            setLevelIndex(nextLevel);
            setGameState('playing');
        }, 1000);
    }

    function render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        // Clear
        ctx.fillStyle = '#1e293b'; // Dark background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const level = levelRef.current;
        const player = playerRef.current;

        // Camera follow (simple centering)
        // ctx.save();
        // ctx.translate ... (not needed for small levels yet)

        // Draw Platforms
        level.platforms.forEach(p => {
            if (!p.visible) return;
            // Draw walls/floor
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(p.x, p.y, p.w, p.h);

            // Decoration (border)
            ctx.strokeStyle = '#e2e8f0';
            ctx.strokeRect(p.x, p.y, p.w, p.h);
        });

        // Draw Spikes
        ctx.fillStyle = '#1e293b'; // Invisible (same as bg) -> or just don't draw
        // Actually for "Level Devil" style, they are often invisible until you hit them or they trigger
        // Let's make them same color as background if not triggered, or just not draw them.

        level.spikes.forEach(s => {
            // If static, they are invisible (troll). If fall, visible only when falling? 
            // Or maybe subtle hint?
            // User asked for "trampas no se vean" (traps not visible)

            if (s.triggered || s.type === 'static') {
                // Wait, if static is invisible, how do you see it? You don't. That's the devil.
                // But once you die, maybe we should show them? 
                // For now, let's make them invisible unless triggered or if player is dead (to show what killed them)

                const isVisible = s.triggered || player.dead; // Reveal on death

                if (isVisible) {
                    ctx.fillStyle = '#f87171';
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y + s.h);
                    ctx.lineTo(s.x + s.w / 2, s.y);
                    ctx.lineTo(s.x + s.w, s.y + s.h);
                    ctx.fill();
                }
            }
        });

        // Draw Goal
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(level.goal.x, level.goal.y, level.goal.w, level.goal.h);
        ctx.fillStyle = '#000';
        ctx.fillRect(level.goal.x + 5, level.goal.y + 5, level.goal.w - 10, level.goal.h - 5); // Doorway

        // Draw Player
        ctx.fillStyle = '#facc15'; // Yellow guy
        if (player.dead) ctx.fillStyle = '#ef4444'; // Red if dead

        ctx.fillRect(player.x, player.y, player.w, player.h);

        // Eyes
        ctx.fillStyle = '#000';
        if (player.vx > 0) {
            ctx.fillRect(player.x + 20, player.y + 8, 4, 4);
            ctx.fillRect(player.x + 10, player.y + 8, 4, 4);
        } else if (player.vx < 0) {
            ctx.fillRect(player.x + 4, player.y + 8, 4, 4);
            ctx.fillRect(player.x + 14, player.y + 8, 4, 4);
        } else {
            ctx.fillRect(player.x + 8, player.y + 8, 4, 4);
            ctx.fillRect(player.x + 18, player.y + 8, 4, 4);
        }

        // UI
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`Level ${levelIndex + 1}`, 20, 30);
        ctx.fillText(`Deaths: ${deathCount}`, 20, 60);

        if (gameState === 'level_complete') {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#4ade80';
            ctx.font = '40px Arial';
            ctx.fillText("Level Complete!", canvas.width / 2 - 140, canvas.height / 2);
        }

        if (gameState === 'premium_wall') {
            ctx.fillStyle = 'rgba(0,0,0,0.9)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#facc15';
            ctx.font = '40px Arial';
            ctx.fillText("Free Version Completed", canvas.width / 2 - 220, canvas.height / 2 - 40);
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.fillText("Unlock Premium for 100 Levels!", canvas.width / 2 - 160, canvas.height / 2 + 10);
        }

        if (gameState === 'won') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#4ade80';
            ctx.font = '50px Arial';
            ctx.fillText("YOU WIN!", canvas.width / 2 - 120, canvas.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText(`Total Deaths: ${deathCount}`, canvas.width / 2 - 80, canvas.height / 2 + 50);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Devil Level</h2>
            <div className="relative border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className="bg-gray-900 block"
                />
            </div>
            <div className="mt-4 text-gray-400 text-sm">
                <p>Controls: Arrows / WASD to move and Jump</p>
                {!isPremium && <p className="text-yellow-500 mt-2">Free Version: 5 Levels (Premium: 100)</p>}
            </div>
            {(gameState === 'won' || gameState === 'premium_wall') && (
                <div className="flex gap-4 mt-4">
                    <button
                        onClick={() => { setLevelIndex(0); setDeathCount(0); setGameState('playing'); }}
                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded"
                    >
                        Play Again
                    </button>
                    {gameState === 'premium_wall' && (
                        <button
                            onClick={() => window.location.href = '/profile'} // Assuming profile has upgrade
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
                        >
                            Get Premium
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
