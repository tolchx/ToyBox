"use client";

import Link from 'next/link';
import { Game } from '@/lib/games';
import { useLanguage } from '@/lib/language';
import { useGames } from '@/lib/game-context';
import { useUser } from '@/lib/user-context';

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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pb-14">
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
        { emoji: '💧', labelKey: 'water', x: '22%', y: '18%', delay: '0s' },
        { emoji: '🔥', labelKey: 'fire', x: '78%', y: '16%', delay: '0.5s' },
        { emoji: '🌍', labelKey: 'earth', x: '20%', y: '52%', delay: '1s' },
        { emoji: '💨', labelKey: 'wind', x: '80%', y: '50%', delay: '1.5s' },
    ];

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-14">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pb-14">
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
            <div className="font-mono text-sm font-bold opacity-50 mb-6" style={{ color: accent }}>
                $100,000,000,000
            </div>
        </div>
    );
}

function LoadingCover({ accent }: { accent: string }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pb-14">
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
        <div className="absolute inset-0 flex items-center justify-center pb-14">
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
        <div className="absolute inset-0 flex items-center justify-center pb-14">
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
        <div className="absolute inset-0 flex items-center justify-center pb-14">
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
    'precarious-architect', 'level-devil',
]);

export default function GameCard({ game, variant = 'default' }: GameCardProps) {
    const { language, t } = useLanguage();
    const { editMode, deleteGame, hideGame } = useGames();
    const { isAdmin: isContextAdmin } = useUser();
    // Using context for admin check is unreliable in some renders if not updated? 
    // Actually useUser is robust.
    const isSessionAdmin = isContextAdmin;

    // Wait, useUser sets isAdmin based on session.
    // If user is not logged in, useUser might throw? No, useUser returns user: null.
    // But we need to use 'useUser' from context.

    // Check if useUser needs to be imported? It is not imported in original snippet but used inside Navbar.
    // I need to import it.
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

                {/* Edit Mode Delete Overlay */}
                {/* Edit Mode Overlay */}
                {editMode && (
                    <div className="absolute top-3 right-3 z-20">
                        {isSessionAdmin ? (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (confirm(t('confirm_delete_global'))) {
                                        deleteGame(game.id);
                                    }
                                }}
                                className="p-2 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 hover:scale-110 transition-all animate-bounce"
                                title={t('admin_delete')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (confirm(t('confirm_hide'))) {
                                        hideGame(game.id);
                                    }
                                }}
                                className="p-2 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:scale-110 transition-all"
                                title={t('game_hidden')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                    <line x1="2" y1="2" x2="22" y2="22" />
                                </svg>
                            </button>
                        )}
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
        </Link >
    );
}
