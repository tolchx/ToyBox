"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/language';

function generateLevel(level: number) {
    const gridSize = Math.min(8 + level * 2, 32);
    const baseHue = Math.floor(Math.random() * 360);
    const baseSat = 40 + Math.random() * 30;
    const baseLight = 40 + Math.random() * 20;

    const diffAmount = Math.max(12 - level * 1.5, 1.5);
    const targetIndex = Math.floor(Math.random() * (gridSize * gridSize));

    const baseColor = `hsl(${baseHue}, ${baseSat}%, ${baseLight}%)`;
    const targetColor = `hsl(${baseHue}, ${baseSat}%, ${baseLight + diffAmount}%)`;

    return { gridSize, baseColor, targetColor, targetIndex, diffAmount };
}

export default function DeadPixelGame() {
    const { t } = useLanguage();
    const [level, setLevel] = useState(1);
    const [clicks, setClicks] = useState(0);
    const [found, setFound] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [levelData, setLevelData] = useState(() => generateLevel(1));

    useEffect(() => {
        setStartTime(Date.now());
        setElapsed(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setElapsed(Math.floor((Date.now() - Date.now()) / 100) / 10);
        }, 100);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [level]);

    useEffect(() => {
        if (found) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        const id = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 100) / 10);
        }, 100);
        timerRef.current = id;
        return () => clearInterval(id);
    }, [found, startTime]);

    const handleClick = useCallback((index: number) => {
        if (found) return;
        setClicks(prev => prev + 1);
        if (index === levelData.targetIndex) {
            setFound(true);
        }
    }, [found, levelData.targetIndex]);

    const nextLevel = () => {
        const next = level + 1;
        setLevel(next);
        setLevelData(generateLevel(next));
        setFound(false);
        setClicks(0);
        setStartTime(Date.now());
    };

    const { gridSize, baseColor, targetColor, targetIndex } = levelData;
    const totalCells = gridSize * gridSize;

    return (
        <div className="h-full bg-gray-950 text-white flex flex-col items-center p-2 sm:p-4 md:p-8 overflow-auto">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-black mb-2">{t('pixel_title')}</h1>
                <p className="text-gray-400 text-sm">{t('pixel_instruction')}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 text-sm">
                <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{level}</div>
                    <div className="text-gray-500 text-xs">{t('pixel_level')}</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-cyan-400">{elapsed.toFixed(1)}s</div>
                    <div className="text-gray-500 text-xs">{t('pixel_time')}</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-amber-400">{clicks}</div>
                    <div className="text-gray-500 text-xs">{t('pixel_clicks')}</div>
                </div>
            </div>

            {/* Grid */}
            <div
                className="inline-grid gap-0 border border-gray-800 rounded-lg overflow-hidden"
                style={{
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    maxWidth: 'min(500px, 90vw)',
                    width: '100%',
                    aspectRatio: '1',
                }}
            >
                {Array.from({ length: totalCells }).map((_, i) => {
                    const isTarget = i === targetIndex;
                    const isFound = found && isTarget;
                    return (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            className={`transition-all duration-150 ${isFound ? 'ring-2 ring-emerald-400 z-10 scale-150 rounded-sm' : 'hover:opacity-90'}`}
                            style={{
                                backgroundColor: isTarget ? targetColor : baseColor,
                                aspectRatio: '1',
                            }}
                        />
                    );
                })}
            </div>

            {/* Found overlay */}
            {found && (
                <div className="mt-6 text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <h2 className="text-xl font-bold text-emerald-400 mb-1">{t('pixel_found')}</h2>
                    <p className="text-gray-400 text-sm mb-4">
                        {elapsed.toFixed(1)}s · {clicks} {t('pixel_clicks').toLowerCase()}
                    </p>
                    <button
                        onClick={nextLevel}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
                    >
                        {t('pixel_next')} →
                    </button>
                </div>
            )}
        </div>
    );
}
