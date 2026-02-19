"use client";

import { useState, useCallback } from 'react';
import { useLanguage } from '@/lib/language';

interface LevelConfig {
    type: 'frame' | 'book' | 'tile';
    emoji: string;
    initialRotation: number;
    targetRotation: number;
    tolerance: number;
}

function generateLevel(level: number): LevelConfig {
    const types: LevelConfig['type'][] = ['frame', 'book', 'tile'];
    const emojis: Record<string, string> = { frame: '🖼️', book: '📚', tile: '🔲' };
    const type = types[(level - 1) % types.length];

    const maxAngle = Math.min(15 + level * 3, 45);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const initialRotation = direction * (5 + Math.random() * maxAngle);
    const tolerance = Math.max(3 - level * 0.2, 0.3);

    return {
        type,
        emoji: emojis[type],
        initialRotation,
        targetRotation: 0,
        tolerance,
    };
}

export default function PerfectAlignmentGame() {
    const { t } = useLanguage();
    const [level, setLevel] = useState(1);
    const [totalScore, setTotalScore] = useState(0);
    const [config, setConfig] = useState<LevelConfig>(() => generateLevel(1));
    const [currentRotation, setCurrentRotation] = useState(config.initialRotation);
    const [isDragging, setIsDragging] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [lastAccuracy, setLastAccuracy] = useState(0);

    const accuracy = Math.max(0, 100 - Math.abs(currentRotation - config.targetRotation) * 10);
    const isPerfect = Math.abs(currentRotation - config.targetRotation) <= config.tolerance;

    const handleMouseDown = () => {
        if (submitted) return;
        setIsDragging(true);
    };

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || submitted) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        setCurrentRotation(Math.max(-60, Math.min(60, angle * 0.5)));
    }, [isDragging, submitted]);

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
    };

    const submit = () => {
        const acc = Math.max(0, 100 - Math.abs(currentRotation - config.targetRotation) * 10);
        setLastAccuracy(Math.round(acc));
        setTotalScore(prev => prev + Math.round(acc));
        setSubmitted(true);
    };

    const nextLevel = () => {
        const next = level + 1;
        const newConfig = generateLevel(next);
        setLevel(next);
        setConfig(newConfig);
        setCurrentRotation(newConfig.initialRotation);
        setSubmitted(false);
    };

    const getObjectStyle = () => {
        const base = "transition-transform duration-75 select-none";
        switch (config.type) {
            case 'frame':
                return {
                    className: `${base} w-48 h-36 border-8 border-amber-700 bg-amber-100 dark:bg-amber-900/30 rounded-sm shadow-lg flex items-center justify-center`,
                    inner: <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-4xl">🌄</div>,
                };
            case 'book':
                return {
                    className: `${base} w-32 h-44 bg-gradient-to-b from-red-700 to-red-900 rounded-r-md shadow-lg flex items-center justify-center border-l-4 border-red-950`,
                    inner: <div className="text-center"><div className="text-3xl mb-1">📖</div><div className="text-[8px] text-red-200 font-serif">ENCYCLOPEDIA</div></div>,
                };
            case 'tile':
                return {
                    className: `${base} w-40 h-40 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 rounded-sm shadow-lg border border-slate-500 flex items-center justify-center`,
                    inner: <div className="w-full h-full grid grid-cols-2 gap-px p-1">{[0,1,2,3].map(i => <div key={i} className="bg-slate-200 dark:bg-slate-600 rounded-sm" />)}</div>,
                };
            default:
                return { className: base, inner: null };
        }
    };

    const objStyle = getObjectStyle();

    // Reference line color
    const lineColor = submitted
        ? (isPerfect ? '#4ade80' : lastAccuracy > 80 ? '#fbbf24' : '#f87171')
        : '#6366f1';

    return (
        <div className="h-full bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col items-center p-2 sm:p-4 md:p-8 overflow-auto">
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="text-2xl md:text-3xl font-black mb-1">{t('align_title')}</h1>
                <p className="text-gray-400 text-sm">{t('align_instruction')}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 text-sm">
                <div className="text-center">
                    <div className="text-xl font-bold text-indigo-400">{level}</div>
                    <div className="text-gray-500 text-xs">{t('align_level')}</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-amber-400">{totalScore}</div>
                    <div className="text-gray-500 text-xs">{t('align_score')}</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold" style={{ color: lineColor }}>{Math.round(accuracy)}%</div>
                    <div className="text-gray-500 text-xs">{t('align_accuracy')}</div>
                </div>
            </div>

            {/* Game Area */}
            <div
                className="relative w-[80vw] h-[80vw] max-w-80 max-h-80 bg-slate-800/50 rounded-2xl border border-slate-700 flex items-center justify-center cursor-grab active:cursor-grabbing mb-6"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Reference line (horizontal) */}
                <div className="absolute left-4 right-4 h-px opacity-30" style={{ backgroundColor: lineColor }} />
                <div className="absolute top-4 bottom-4 w-px left-1/2 -translate-x-1/2 opacity-30" style={{ backgroundColor: lineColor }} />

                {/* Reference marks */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs opacity-30" style={{ color: lineColor }}>—</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-30" style={{ color: lineColor }}>—</div>

                {/* The object to align */}
                <div
                    style={{ transform: `rotate(${currentRotation}deg)` }}
                    className={objStyle.className}
                >
                    {objStyle.inner}
                </div>

                {/* Angle indicator */}
                <div className="absolute bottom-3 right-3 text-xs font-mono text-gray-500">
                    {currentRotation.toFixed(1)}°
                </div>
            </div>

            {/* Action buttons */}
            {!submitted ? (
                <button
                    onClick={submit}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors text-lg"
                >
                    ✓ {t('align_accuracy')}
                </button>
            ) : (
                <div className="text-center">
                    <div className="text-3xl mb-2">
                        {isPerfect ? '🎯' : lastAccuracy > 80 ? '👏' : '😬'}
                    </div>
                    <h3 className="text-xl font-bold mb-1" style={{ color: lineColor }}>
                        {isPerfect ? t('align_perfect') : t('align_close')}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                        {t('align_accuracy')}: {lastAccuracy}% · +{lastAccuracy} pts
                    </p>
                    <button
                        onClick={nextLevel}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
                    >
                        {t('align_next')} →
                    </button>
                </div>
            )}
        </div>
    );
}
