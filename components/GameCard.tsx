"use client";

import Link from 'next/link';
import { Game } from '@/lib/games';
import { useLanguage } from '@/lib/language';

interface GameCardProps {
    game: Game;
    variant?: 'default' | 'featured';
}

const difficultyConfig: Record<string, { label: string; label_es: string; color: string }> = {
    easy: { label: 'Easy', label_es: 'Fácil', color: '#4ade80' },
    medium: { label: 'Medium', label_es: 'Medio', color: '#fbbf24' },
    hard: { label: 'Hard', label_es: 'Difícil', color: '#f87171' },
    insane: { label: 'Insane', label_es: 'Extremo', color: '#c084fc' },
};

function PasswordGameCover({ accent }: { accent: string }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="absolute top-6 left-6 text-2xl opacity-20 animate-pulse">🔑</div>
            <div className="absolute top-10 right-8 text-lg opacity-15">🔐</div>
            <div className="absolute bottom-28 left-10 text-lg opacity-15 animate-pulse" style={{ animationDelay: '1s' }}>✱</div>
            <div className="absolute bottom-32 right-6 text-2xl opacity-20">🛡️</div>
            <div className="relative">
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: `${accent}22`, border: `2px solid ${accent}44` }}
                >
                    <span className="text-4xl">🔒</span>
                </div>
            </div>
            <div className="flex gap-1.5 mt-1">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full animate-pulse"
                        style={{
                            backgroundColor: accent,
                            opacity: 0.4 + (i * 0.1),
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

function InfiniteCraftCover({ accent }: { accent: string }) {
    const { t } = useLanguage();
    const elements = [
        { emoji: '💧', labelKey: 'water', x: '22%', y: '22%', delay: '0s' },
        { emoji: '🔥', labelKey: 'fire', x: '78%', y: '20%', delay: '0.5s' },
        { emoji: '🌍', labelKey: 'earth', x: '20%', y: '60%', delay: '1s' },
        { emoji: '💨', labelKey: 'wind', x: '80%', y: '58%', delay: '1.5s' },
    ];

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            {elements.map((el, i) => (
                <div
                    key={i}
                    className="absolute flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shadow-md animate-pulse"
                    style={{
                        left: el.x,
                        top: el.y,
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        border: `1px solid ${accent}44`,
                        color: 'rgba(255,255,255,0.9)',
                        animationDelay: el.delay,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <span>{el.emoji}</span>
                    <span>{t(el.labelKey)}</span>
                </div>
            ))}
            <div className="relative z-10">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: `${accent}22`, border: `2px solid ${accent}55` }}
                >
                    <span className="text-3xl">✨</span>
                </div>
            </div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100">
                <line x1="22" y1="22" x2="50" y2="45" stroke={accent} strokeWidth="0.3" strokeDasharray="2,2" />
                <line x1="78" y1="20" x2="50" y2="45" stroke={accent} strokeWidth="0.3" strokeDasharray="2,2" />
                <line x1="20" y1="60" x2="50" y2="45" stroke={accent} strokeWidth="0.3" strokeDasharray="2,2" />
                <line x1="80" y1="58" x2="50" y2="45" stroke={accent} strokeWidth="0.3" strokeDasharray="2,2" />
            </svg>
        </div>
    );
}

function MoneyCover({ accent }: { accent: string }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="absolute top-4 left-5 text-xl opacity-20 animate-pulse">💵</div>
            <div className="absolute top-8 right-6 text-lg opacity-15" style={{ animationDelay: '0.5s' }}>💎</div>
            <div className="absolute bottom-24 left-8 text-lg opacity-15 animate-pulse" style={{ animationDelay: '1s' }}>🏠</div>
            <div className="absolute bottom-28 right-5 text-xl opacity-20">🚗</div>
            <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${accent}22`, border: `2px solid ${accent}44` }}
            >
                <span className="text-4xl">💰</span>
            </div>
            <div className="font-mono text-sm font-bold opacity-50" style={{ color: accent }}>
                $100,000,000,000
            </div>
        </div>
    );
}

function LoadingCover({ accent }: { accent: string }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="text-xs font-mono opacity-40" style={{ color: accent }}>C:\WINDOWS\system32&gt;</div>
            <div className="w-32 h-4 rounded-full overflow-hidden" style={{ backgroundColor: `${accent}22`, border: `1px solid ${accent}44` }}>
                <div
                    className="h-full rounded-full animate-pulse"
                    style={{ width: '67%', backgroundColor: accent, opacity: 0.6 }}
                />
            </div>
            <div className="text-xs font-mono opacity-40" style={{ color: accent }}>67% complete...</div>
            <div className="absolute top-5 right-5 px-2 py-1 rounded text-xs font-bold opacity-30" style={{ backgroundColor: `${accent}22`, color: accent }}>
                ERROR
            </div>
        </div>
    );
}

function seededRandom(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
}

function PixelsCover({ accent }: { accent: string }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-8 gap-0.5 opacity-40">
                {[...Array(64)].map((_, i) => (
                    <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{
                            backgroundColor: i === 27 ? '#ff0000' : accent,
                            opacity: i === 27 ? 0.8 : Math.round((0.15 + seededRandom(i) * 0.1) * 10000) / 10000,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

function OrbitalCover({ accent }: { accent: string }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border border-dashed opacity-20" style={{ borderColor: accent }} />
                <div className="absolute inset-4 rounded-full border border-dashed opacity-20" style={{ borderColor: accent }} />
                <div className="absolute inset-8 rounded-full border border-dashed opacity-20" style={{ borderColor: accent }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full" style={{ backgroundColor: accent, opacity: 0.6 }} />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#fbbf24' }} />
                <div className="absolute bottom-4 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444', opacity: 0.8 }} />
            </div>
            <div className="absolute bottom-20 text-3xl">🚀</div>
        </div>
    );
}

function DefaultCover({ icon, accent }: { icon: string; accent: string }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${accent}22`, border: `2px solid ${accent}44` }}
            >
                <span className="text-4xl">{icon}</span>
            </div>
        </div>
    );
}

function GameCoverArt({ game }: { game: Game }) {
    const { accent, pattern } = game.theme;

    switch (pattern) {
        case 'locks':
            return <PasswordGameCover accent={accent} />;
        case 'elements':
            return <InfiniteCraftCover accent={accent} />;
        case 'money':
            return <MoneyCover accent={accent} />;
        case 'loading':
            return <LoadingCover accent={accent} />;
        case 'pixels':
            return <PixelsCover accent={accent} />;
        case 'orbital':
            return <OrbitalCover accent={accent} />;
        default:
            return <DefaultCover icon={game.theme.icon} accent={accent} />;
    }
}

const PLAYABLE_IDS = new Set([
    'password-game', 'infinite-craft',
    'spend-money', 'dead-pixel', 'loading-simulator', 'mouse-balancer', 'perfect-alignment',
    'pocket-ecosystem', 'speed-of-light', 'chaos-conductor', 'orbital-slingshot',
    'infinite-timeline', 'lie-detector', 'infinite-debate', 'city-guesser-audio',
    'precarious-architect',
]);

export default function GameCard({ game, variant = 'default' }: GameCardProps) {
    const { language } = useLanguage();
    const [gradFrom, gradTo] = game.theme.gradient;
    const gameTitle = language === 'es' && game.title_es ? game.title_es : game.title;
    const gameDescription = language === 'es' && game.description_es ? game.description_es : game.description;
    const diff = game.difficulty ? difficultyConfig[game.difficulty] : null;
    const diffLabel = diff ? (language === 'es' ? diff.label_es : diff.label) : null;
    const isComingSoon = !PLAYABLE_IDS.has(game.id);

    const isFeatured = variant === 'featured';

    return (
        <Link href={`/play/${game.id}`} className="block group">
            <div className={`relative rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 ${isFeatured ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}>
                {/* Gradient background */}
                <div
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                        background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                    }}
                />

                {/* Subtle grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `radial-gradient(circle, ${game.theme.accent} 1px, transparent 1px)`,
                        backgroundSize: '20px 20px',
                    }}
                />

                {/* Glow effect on hover */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(circle at 50% 40%, ${game.theme.accent}15, transparent 70%)`,
                    }}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    {game.isNew && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-sm">
                            NEW
                        </span>
                    )}
                    {game.isFeatured && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                            ★
                        </span>
                    )}
                </div>

                {/* Difficulty badge */}
                {diff && (
                    <div className="absolute top-3 right-3 z-10">
                        <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm"
                            style={{ backgroundColor: `${diff.color}22`, color: diff.color, border: `1px solid ${diff.color}44` }}
                        >
                            {diffLabel}
                        </span>
                    </div>
                )}

                {/* Cover art */}
                <GameCoverArt game={game} />

                {/* Coming Soon overlay */}
                {isComingSoon && (
                    <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-lg bg-black/60 text-white/80 text-xs font-bold uppercase tracking-wider border border-white/10">
                            {language === 'es' ? 'Próximamente' : 'Coming Soon'}
                        </span>
                    </div>
                )}

                {/* Bottom info bar */}
                <div
                    className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-md border-t"
                    style={{
                        backgroundColor: `${gradFrom}dd`,
                        borderColor: `${game.theme.accent}22`,
                    }}
                >
                    <h3 className="font-bold text-sm text-white mb-0.5 truncate">{gameTitle}</h3>
                    <p className="text-xs text-white/50 line-clamp-1">{gameDescription}</p>
                </div>
            </div>
        </Link>
    );
}
