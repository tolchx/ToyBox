"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/lib/language';
import GameResultModal from '@/components/GameResultModal';

interface Popup {
    id: number;
    type: 'ad' | 'error' | 'update' | 'virus' | 'cookie';
    title: string;
    message: string;
    x: number;
    y: number;
    moving: boolean;
    fakeX: boolean;
    hasTrapButton: boolean;
    trapLabel: string;
    regressOnTrap: boolean;
    cascadeOnDismiss: boolean;
    shaking: boolean;
    resizing: boolean;
}

const trapLabels = [
    'OK', 'Accept', 'Yes', 'Agree', 'Install', 'Download', 'Continue',
    'Allow', 'Run', 'Open', 'Confirm', 'Submit', 'Proceed', 'Enable',
    'Activate', 'Upgrade', 'Update Now', 'Free Scan', 'Fix Now', 'Claim',
];

const popupTemplates = [
    { type: 'ad' as const, title: '🎉 CONGRATULATIONS!', message: 'You are the 1,000,000th visitor! Click here to claim your prize!' },
    { type: 'error' as const, title: '⚠️ Error 0x80070005', message: 'Access denied. The system cannot find the file specified.' },
    { type: 'update' as const, title: '🔄 System Update', message: 'Windows needs to restart to install updates. Restart now?' },
    { type: 'virus' as const, title: '🛡️ VIRUS DETECTED!', message: 'Your PC has 47 viruses! Download AntiVirus Pro NOW!' },
    { type: 'cookie' as const, title: '🍪 Cookie Notice', message: 'This website uses cookies. Accept all 847 tracking cookies?' },
    { type: 'ad' as const, title: '💊 DOCTORS HATE HIM!', message: 'Local man discovers one weird trick to download faster...' },
    { type: 'error' as const, title: '💀 BSOD Imminent', message: 'CRITICAL_PROCESS_DIED. Your PC ran into a problem.' },
    { type: 'update' as const, title: '📦 New Toolbar!', message: 'Install BonziBuddy Toolbar for a FASTER browsing experience!' },
    { type: 'virus' as const, title: '🔒 RANSOMWARE', message: 'Your files have been encrypted! Pay 0.5 BTC to unlock.' },
    { type: 'ad' as const, title: '🎰 FREE CASINO', message: 'Play now and win $1,000,000! No deposit required!' },
    { type: 'error' as const, title: '🔥 OVERHEATING!', message: 'CPU temperature: 105°C! Thermal shutdown in 10 seconds!' },
    { type: 'ad' as const, title: '💰 CRYPTO ALERT', message: 'You just received 2.5 Bitcoin! Click to claim before it expires!' },
    { type: 'virus' as const, title: '🚨 FBI WARNING', message: 'Illegal activity detected on your IP. Pay $500 fine immediately.' },
    { type: 'update' as const, title: '🔊 AUDIO DRIVER', message: 'Your audio driver is 847 days out of date. Update now?' },
    { type: 'cookie' as const, title: '📋 SURVEY TIME', message: 'Complete this 45-minute survey to continue browsing!' },
    { type: 'error' as const, title: '💾 DISK FULL', message: 'Drive C: has 0 bytes free. Delete System32 to free space?' },
    { type: 'ad' as const, title: '🎁 FREE iPHONE!', message: 'You have been selected! Just enter your credit card to verify!' },
    { type: 'virus' as const, title: '🕷️ SPYWARE', message: 'KeyLogger_v3.exe is recording your keystrokes. Remove now?' },
    { type: 'update' as const, title: '🖨️ PRINTER ERROR', message: 'PC LOAD LETTER. What does that even mean?!' },
    { type: 'error' as const, title: '🌐 DNS FAILURE', message: 'Could not resolve hostname. Have you tried turning it off and on?' },
    { type: 'ad' as const, title: '👀 HOT SINGLES', message: 'Hot singles in your area want to speed up your download!' },
    { type: 'virus' as const, title: '☠️ TROJAN HORSE', message: 'trojan_horse.exe wants to access your contacts. Allow?' },
    { type: 'cookie' as const, title: '🔔 NOTIFICATIONS', message: 'Allow this site to send you 500 notifications per day?' },
    { type: 'error' as const, title: '⛔ MEMORY LEAK', message: 'Chrome is using 99.7% of your RAM. Close 847 tabs?' },
    { type: 'update' as const, title: '📱 JAVA UPDATE', message: 'Java Update Available! (Includes Ask Toolbar & McAfee trial)' },
    { type: 'ad' as const, title: '🏆 YOU WON!', message: 'Spin the wheel to claim your $10,000 Amazon gift card!' },
    { type: 'virus' as const, title: '🔓 BREACH ALERT', message: 'Your password "123456" was found in a data breach!' },
    { type: 'error' as const, title: '🖥️ DISPLAY ERROR', message: 'Graphics driver stopped responding. Again. For the 47th time.' },
    { type: 'ad' as const, title: '📺 BUFFERING...', message: 'Your internet is too slow. Click to boost speed by 500%!' },
    { type: 'virus' as const, title: '🧨 SELF-DESTRUCT', message: 'PC will self-destruct in 5... 4... 3... Click to abort!' },
    { type: 'error' as const, title: '🔌 CONNECTION LOST', message: 'Network cable unplugged. Please reconnect ethernet_port_7.' },
    { type: 'cookie' as const, title: '📊 DATA HARVEST', message: 'We need to collect your browsing history, contacts, and soul. Accept?' },
    { type: 'update' as const, title: '🐛 BUG DETECTED', message: 'A literal bug was found in your CPU. Shake your PC to remove it.' },
    { type: 'ad' as const, title: '🤖 AI TAKEOVER', message: 'Your PC is now sentient. Click OK to acknowledge our new overlord.' },
    { type: 'virus' as const, title: '💣 LOGIC BOMB', message: 'logic_bomb.exe will detonate in 00:00:03. Defuse now?' },
    { type: 'error' as const, title: '🌀 INFINITE LOOP', message: 'while(true) { error++; } — Stack overflow in 2 seconds.' },
];

export default function LoadingSimulatorGame() {
    const { t } = useLanguage();
    const [progress, setProgress] = useState(0);
    const [popups, setPopups] = useState<Popup[]>([]);
    const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
    const [paused, setPaused] = useState(false);
    const [popupsDismissed, setPopupsDismissed] = useState(0);
    const [trapsClicked, setTrapsClicked] = useState(0);
    const [screenShake, setScreenShake] = useState(false);
    const [flashRed, setFlashRed] = useState(false);
    const nextPopupId = useRef(0);
    const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressRef = useRef(progress);
    progressRef.current = progress;

    const triggerScreenShake = useCallback(() => {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);
    }, []);

    const triggerFlashRed = useCallback(() => {
        setFlashRed(true);
        setTimeout(() => setFlashRed(false), 300);
    }, []);

    const createPopup = useCallback((extraProps?: Partial<Popup>): Popup => {
        const template = popupTemplates[Math.floor(Math.random() * popupTemplates.length)];
        const prog = progressRef.current;
        const hasTrap = Math.random() < Math.min(0.3 + prog * 0.005, 0.75);
        const isMoving = prog > 20 && Math.random() < Math.min(0.1 + prog * 0.004, 0.45);
        const isFakeX = prog > 15 && Math.random() < Math.min(0.08 + prog * 0.004, 0.35);
        const isShaking = prog > 40 && Math.random() < 0.2;
        const isResizing = prog > 50 && Math.random() < 0.15;
        const cascades = prog > 25 && Math.random() < Math.min(0.1 + prog * 0.003, 0.35);
        const regresses = hasTrap && Math.random() < Math.min(0.3 + prog * 0.004, 0.6);

        return {
            id: nextPopupId.current++,
            ...template,
            x: 5 + Math.random() * 70,
            y: 5 + Math.random() * 60,
            moving: isMoving,
            fakeX: isFakeX,
            hasTrapButton: hasTrap,
            trapLabel: trapLabels[Math.floor(Math.random() * trapLabels.length)],
            regressOnTrap: regresses,
            cascadeOnDismiss: cascades,
            shaking: isShaking,
            resizing: isResizing,
            ...extraProps,
        };
    }, []);

    const spawnPopup = useCallback((count: number = 1) => {
        if (gameState !== 'playing' || progress < 5) return;
        const newPopups: Popup[] = [];
        for (let i = 0; i < count; i++) {
            newPopups.push(createPopup());
        }
        setPopups(prev => [...prev, ...newPopups]);
        setPaused(true);
    }, [gameState, createPopup, progress]);

    const handleTrapClick = useCallback((popup: Popup) => {
        setTrapsClicked(prev => prev + 1);
        triggerScreenShake();
        triggerFlashRed();

        if (popup.regressOnTrap) {
            const regressAmount = 3 + Math.random() * 8;
            setProgress(prev => Math.max(prev - regressAmount, 0));
        }

        const extraCount = 1 + Math.floor(Math.random() * 3);
        const newPopups: Popup[] = [];
        for (let i = 0; i < extraCount; i++) {
            newPopups.push(createPopup());
        }
        setPopups(prev => [...prev.filter(p => p.id !== popup.id), ...newPopups]);
    }, [createPopup, triggerScreenShake, triggerFlashRed]);

    const handleFakeX = useCallback((popup: Popup) => {
        triggerScreenShake();
        const newPopup = createPopup();
        setPopups(prev => {
            const updated = prev.map(p =>
                p.id === popup.id
                    ? { ...p, x: 5 + Math.random() * 70, y: 5 + Math.random() * 60, fakeX: Math.random() < 0.3 }
                    : p
            );
            return [...updated, newPopup];
        });
    }, [createPopup, triggerScreenShake]);

    const dismissPopup = useCallback((popup: Popup) => {
        if (popup.fakeX) {
            handleFakeX(popup);
            return;
        }

        setPopupsDismissed(prev => prev + 1);

        if (popup.cascadeOnDismiss && Math.random() < 0.5) {
            const cascadeCount = 1 + Math.floor(Math.random() * 2);
            const newPopups: Popup[] = [];
            for (let i = 0; i < cascadeCount; i++) {
                newPopups.push(createPopup({ cascadeOnDismiss: false }));
            }
            setPopups(prev => [...prev.filter(p => p.id !== popup.id), ...newPopups]);
        } else {
            setPopups(prev => prev.filter(p => p.id !== popup.id));
        }
    }, [handleFakeX, createPopup]);

    // Move moving popups
    useEffect(() => {
        const movingPopups = popups.filter(p => p.moving);
        if (movingPopups.length === 0) return;

        const interval = setInterval(() => {
            setPopups(prev => prev.map(p => {
                if (!p.moving) return p;
                return {
                    ...p,
                    x: Math.max(5, Math.min(80, p.x + (Math.random() - 0.5) * 6)),
                    y: Math.max(5, Math.min(75, p.y + (Math.random() - 0.5) * 6)),
                };
            }));
        }, 200);

        return () => clearInterval(interval);
    }, [popups.filter(p => p.moving).length]);

    // Progress tick - slower, with random stutters and regressions
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            if (paused) return;
            setProgress(prev => {
                // Random stutter - progress freezes momentarily
                if (Math.random() < 0.08) return prev;
                // Random micro-regression
                if (prev > 30 && Math.random() < 0.04) {
                    return Math.max(prev - (0.5 + Math.random() * 1.5), 0);
                }
                // Slower base increment, gets even slower near the end
                const slowdownFactor = prev > 80 ? 0.4 : prev > 60 ? 0.6 : prev > 40 ? 0.8 : 1;
                const increment = (0.2 + Math.random() * 0.4) * slowdownFactor;
                const next = Math.min(prev + increment, 100);
                if (next >= 100) {
                    setGameState('won');
                }
                return next;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [gameState, paused]);

    // Unpause when no popups
    useEffect(() => {
        if (popups.length === 0) {
            setPaused(false);
        }
    }, [popups]);

    // Spawn popups at random intervals - much more aggressive
    useEffect(() => {
        if (gameState !== 'playing') return;

        const scheduleNext = () => {
            // Only start scheduling popups after 5% progress
            if (progress < 5) {
                popupTimerRef.current = setTimeout(scheduleNext, 1000); // Check again after 1 second
                return;
            }

            const progressFactor = Math.min(progress / 100, 0.95);
            const baseDelay = 1500 - progressFactor * 1200;
            const randomRange = 1200 - progressFactor * 900;
            const delay = baseDelay + Math.random() * randomRange;

            popupTimerRef.current = setTimeout(() => {
                let count = 1;
                if (progress > 20 && Math.random() < 0.3) count = 2;
                if (progress > 40 && Math.random() < 0.35) count = 2;
                if (progress > 40 && Math.random() < 0.2) count = 3;
                if (progress > 60 && Math.random() < 0.3) count = 3;
                if (progress > 60 && Math.random() < 0.2) count = 4;
                if (progress > 80 && Math.random() < 0.3) count = 4;
                if (progress > 80 && Math.random() < 0.15) count = 5;
                if (progress > 90 && Math.random() < 0.2) count = 5;
                if (progress > 90 && Math.random() < 0.1) count = 6;
                spawnPopup(count);
                scheduleNext();
            }, delay);
        };

        scheduleNext();

        return () => {
            if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
        };
    }, [gameState, spawnPopup, progress]);

    // Random progress regression events (independent of popups)
    useEffect(() => {
        if (gameState !== 'playing' || paused) return;

        const interval = setInterval(() => {
            if (progressRef.current > 50 && Math.random() < 0.15) {
                const loss = 1 + Math.random() * 3;
                setProgress(prev => Math.max(prev - loss, 0));
                triggerFlashRed();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [gameState, paused, triggerFlashRed]);

    const restart = () => {
        setProgress(0);
        setPopups([]);
        setGameState('playing');
        setPaused(false);
        setPopupsDismissed(0);
        setTrapsClicked(0);
    };

    const popupColors: Record<string, string> = {
        ad: 'from-yellow-500 to-orange-500',
        error: 'from-blue-600 to-blue-800',
        update: 'from-cyan-600 to-blue-600',
        virus: 'from-red-600 to-red-800',
        cookie: 'from-amber-700 to-yellow-700',
    };

    return (
        <div
            className={`h-full bg-[#008080] text-white flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 relative overflow-hidden select-none transition-all duration-100 ${screenShake ? 'animate-shake' : ''} ${flashRed ? 'bg-red-900/30' : ''}`}
            style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
        >
            {/* Retro desktop background */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                }} />
            </div>

            {/* Flash red overlay */}
            {flashRed && (
                <div className="absolute inset-0 bg-red-500/20 z-50 pointer-events-none" />
            )}

            {/* Main Window */}
            <div className="relative z-10 w-full max-w-lg">
                {/* Window Chrome */}
                <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-3 py-1.5 flex items-center justify-between rounded-t-lg">
                    <span className="text-sm font-bold text-white">📥 downloading_totally_safe_file.exe</span>
                    <div className="flex gap-1">
                        <div className="w-4 h-4 bg-[#c0c0c0] rounded-sm text-black text-[10px] flex items-center justify-center font-bold">_</div>
                        <div className="w-4 h-4 bg-[#c0c0c0] rounded-sm text-black text-[10px] flex items-center justify-center font-bold">□</div>
                    </div>
                </div>

                {/* Window Body */}
                <div className="bg-[#c0c0c0] p-6 rounded-b-lg border-2 border-t-0 border-[#808080]">
                    {gameState === 'playing' ? (
                        <>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-3xl animate-bounce">📄</div>
                                <div className="flex-1">
                                    <p className="text-sm text-black font-medium">
                                        Downloading file from internet...
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {t('load_progress')}: {progress.toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-6 bg-white border-2 border-inset rounded-sm overflow-hidden mb-3"
                                style={{ borderColor: '#808080 #ffffff #ffffff #808080' }}
                            >
                                <div
                                    className="h-full transition-all duration-100"
                                    style={{
                                        width: `${progress}%`,
                                        background: progress > 80
                                            ? 'repeating-linear-gradient(90deg, #800000 0px, #800000 10px, #a00000 10px, #a00000 20px)'
                                            : 'repeating-linear-gradient(90deg, #000080 0px, #000080 10px, #0000a0 10px, #0000a0 20px)',
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>Estimated time: {paused ? '∞' : `${Math.ceil((100 - progress) / 2)}s`}</span>
                                <span>{paused ? '⏸ BLOCKED' : '⏬ Downloading...'}</span>
                            </div>

                            {/* Stats bar */}
                            <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                                <span>🗑️ {t('load_dismissed')}: {popupsDismissed}</span>
                                <span>💀 {t('load_traps')}: {trapsClicked}</span>
                                <span>📦 {t('load_active')}: {popups.length}</span>
                            </div>

                            {paused && popups.length > 0 && (
                                <div className="mt-3 text-center text-xs text-red-700 font-bold animate-pulse">
                                    ⚠️ {t('load_close_popups')}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-4">
                            {/* Game won state is handled by modal below */}
                        </div>
                    )}
                </div>
            </div>

            {/* Game Over Modal */}
            {gameState === 'won' && (
                <GameResultModal
                    isOpen={gameState === 'won'}
                    onClose={() => {}}
                    onRestart={restart}
                    title="Download Complete!"
                    title_es="¡Descarga Completa!"
                    message="Congratulations! You successfully survived all the pop-ups and completed the download!"
                    message_es="¡Felicidades! ¡Sobreviviste a todos los pop-ups y completaste la descarga!"
                    score={popupsDismissed}
                    best={0}
                    scoreLabel={t('load_dismissed')}
                    scoreLabel_es={t('load_dismissed')}
                    bestLabel=""
                    bestLabel_es=""
                    icon="✅"
                    isSuccess={true}
                    additionalStats={[
                        {
                            label: "Traps Clicked",
                            label_es: "Trampas Clickeadas",
                            value: trapsClicked
                        },
                        {
                            label: "Completion Time",
                            label_es: "Tiempo de Finalización",
                            value: "100%"
                        }
                    ]}
                />
            )}

            {/* Popups */}
            {popups.map((popup) => (
                <div
                    key={popup.id}
                    className={`absolute z-20 w-[85vw] sm:w-72 shadow-2xl rounded-lg overflow-hidden ${popup.shaking ? 'animate-wiggle' : ''} ${popup.resizing ? 'animate-breathe' : ''}`}
                    style={{
                        left: `${popup.x}%`,
                        top: `${popup.y}%`,
                        transform: 'translate(-50%, -50%)',
                        animation: `popIn 0.2s ease-out${popup.moving ? ', popupDrift 3s ease-in-out infinite' : ''}`,
                        transition: popup.moving ? 'left 0.2s ease, top 0.2s ease' : undefined,
                    }}
                >
                    {/* Popup title bar */}
                    <div className={`bg-gradient-to-r ${popupColors[popup.type] || 'from-gray-600 to-gray-700'} px-3 py-1.5 flex items-center justify-between`}>
                        <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                            {popup.moving && <span className="animate-spin text-[10px]">🔄</span>}
                            {popup.title}
                        </span>
                        <button
                            onClick={() => dismissPopup(popup)}
                            className={`w-5 h-5 rounded-sm text-white text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                                popup.fakeX
                                    ? 'bg-red-500 hover:bg-red-400'
                                    : 'bg-red-500 hover:bg-red-400'
                            }`}
                            title={popup.fakeX ? '' : ''}
                        >
                            ✕
                        </button>
                    </div>
                    {/* Popup body */}
                    <div className="bg-[#f0f0f0] p-3 border border-gray-300">
                        <p className="text-xs text-gray-800 mb-3">{popup.message}</p>
                        <div className="flex gap-2 justify-end flex-wrap">
                            {popup.hasTrapButton && (
                                <button
                                    onClick={() => handleTrapClick(popup)}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 border border-blue-700 rounded text-xs text-white font-bold transition-colors shadow-sm"
                                >
                                    {popup.trapLabel}
                                </button>
                            )}
                            <button
                                onClick={() => dismissPopup(popup)}
                                className="px-3 py-1 bg-[#e0e0e0] border border-gray-400 rounded text-xs text-black hover:bg-[#d0d0d0] font-medium transition-colors"
                            >
                                {t('load_dismiss')}
                            </button>
                        </div>
                        {popup.fakeX && (
                            <p className="text-[9px] text-gray-400 mt-2 text-center italic">
                                {t('load_fake_hint')}
                            </p>
                        )}
                    </div>
                </div>
            ))}

            <style jsx global>{`
                @keyframes popIn {
                    from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10% { transform: translateX(-8px) rotate(-1deg); }
                    20% { transform: translateX(8px) rotate(1deg); }
                    30% { transform: translateX(-6px) rotate(-0.5deg); }
                    40% { transform: translateX(6px) rotate(0.5deg); }
                    50% { transform: translateX(-4px); }
                    60% { transform: translateX(4px); }
                    70% { transform: translateX(-2px); }
                    80% { transform: translateX(2px); }
                }
                @keyframes wiggle {
                    0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
                    25% { transform: translate(-50%, -50%) rotate(2deg); }
                    50% { transform: translate(-50%, -50%) rotate(-2deg); }
                    75% { transform: translate(-50%, -50%) rotate(1deg); }
                }
                @keyframes breathe {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.08); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                .animate-wiggle {
                    animation: wiggle 0.4s ease-in-out infinite;
                }
                .animate-breathe {
                    animation: breathe 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
