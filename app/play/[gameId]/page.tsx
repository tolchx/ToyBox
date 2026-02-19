"use client";

import { games } from '@/lib/games';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/lib/language';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback, use } from 'react';
import { useUser } from '@/lib/user-context';
import SpendMoneyGame from '@/components/games/SpendMoneyGame';
import DeadPixelGame from '@/components/games/DeadPixelGame';
import LoadingSimulatorGame from '@/components/games/LoadingSimulatorGame';
import MouseBalancerGame from '@/components/games/MouseBalancerGame';
import PerfectAlignmentGame from '@/components/games/PerfectAlignmentGame';
import PocketEcosystemGame from '@/components/games/PocketEcosystemGame';
import SpeedOfLightGame from '@/components/games/SpeedOfLightGame';
import ChaosConductorGame from '@/components/games/ChaosConductorGame';
import OrbitalSlingshotGame from '@/components/games/OrbitalSlingshotGame';
import InfiniteTimelineGame from '@/components/games/InfiniteTimelineGame';
import LieDetectorGame from '@/components/games/LieDetectorGame';
import InfiniteDebateGame from '@/components/games/InfiniteDebateGame';
import CityGuesserAudioGame from '@/components/games/CityGuesserAudioGame';
import PrecariousArchitectGame from '@/components/games/PrecariousArchitectGame';
import GameTutorial from '@/components/GameTutorial';
import { gameTutorials } from '@/lib/tutorials';

interface PageProps {
    params: Promise<{
        gameId: string;
    }>;
}

const nativeGames: Record<string, React.ComponentType> = {
    'spend-money': SpendMoneyGame,
    'dead-pixel': DeadPixelGame,
    'loading-simulator': LoadingSimulatorGame,
    'mouse-balancer': MouseBalancerGame,
    'perfect-alignment': PerfectAlignmentGame,
    'pocket-ecosystem': PocketEcosystemGame,
    'speed-of-light': SpeedOfLightGame,
    'chaos-conductor': ChaosConductorGame,
    'orbital-slingshot': OrbitalSlingshotGame,
    'infinite-timeline': InfiniteTimelineGame,
    'lie-detector': LieDetectorGame,
    'infinite-debate': InfiniteDebateGame,
    'city-guesser-audio': CityGuesserAudioGame,
    'precarious-architect': PrecariousArchitectGame,
};

export default function GamePage({ params }: PageProps) {
    const { t, language } = useLanguage();
    const { gameId } = use(params);
    const game = games.find((g) => g.id === gameId);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    if (!game) {
        notFound();
    }

    const { isPremium } = useUser();
    const [bgImage, setBgImage] = useState('');
    const [musicUrl, setMusicUrl] = useState('');
    const [showTutorial, setShowTutorial] = useState(false);
    const hasTutorial = !!gameTutorials[gameId];

    useEffect(() => {
        if (hasTutorial) {
            const key = `tutorial_seen_${gameId}`;
            const seen = localStorage.getItem(key);
            if (!seen) {
                setShowTutorial(true);
                localStorage.setItem(key, 'true');
            }
        }
    }, [gameId, hasTutorial]);

    const handleCloseTutorial = useCallback(() => {
        setShowTutorial(false);
    }, []);

    const NativeGame = nativeGames[gameId];
    const isNative = !!NativeGame;
    const isIframe = !isNative && game.path.startsWith('/games/');
    const isComingSoon = !isNative && !isIframe;

    useEffect(() => {
        if (isIframe && iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'LANGUAGE_CHANGE', language }, '*');
        }
    }, [language, isIframe]);

    const handleIframeLoad = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'LANGUAGE_CHANGE', language }, '*');
        }
    };

    return (
        <div className="w-full h-screen bg-gray-100 dark:bg-gray-950 flex flex-col transition-all duration-500"
            style={{
                backgroundImage: bgImage ? `url(${bgImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
            <header className="h-12 sm:h-14 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b dark:border-gray-800 flex items-center px-3 sm:px-6 justify-between shrink-0 font-sans z-10 transition-colors">
                <Link href="/" className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('back')}</Link>
                <h1 className="font-semibold text-gray-700 dark:text-gray-300">{language === 'es' && game.title_es ? game.title_es : game.title}</h1>
                <div className="w-24 flex justify-end">
                    {hasTutorial && (
                        <button
                            onClick={() => setShowTutorial(true)}
                            className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                            title={language === 'es' ? 'Ver tutorial' : 'View tutorial'}
                        >
                            ?
                        </button>
                    )}
                </div>
            </header>

            {isPremium && (
                <div className="absolute top-20 right-4 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 rounded-xl shadow-lg border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-bold text-sm mb-2 text-yellow-600 dark:text-yellow-400">{t('premium_controls')}</h3>

                    <div className="mb-3">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">{t('bg_image_label')}</label>
                        <input
                            type="text"
                            value={bgImage}
                            onChange={(e) => setBgImage(e.target.value)}
                            placeholder="https://..."
                            className="w-48 text-xs p-1 border dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">{t('music_label')}</label>
                        <input
                            type="text"
                            value={musicUrl}
                            onChange={(e) => setMusicUrl(e.target.value)}
                            placeholder={t('music_placeholder')}
                            className="w-48 text-xs p-1 border dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    {musicUrl && (
                        <div className="mt-2 w-48 h-28 bg-black rounded overflow-hidden">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${musicUrl}?autoplay=1&loop=1`}
                                title="Music"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </div>
            )}

            <div className="flex-1 w-full relative z-0 flex items-stretch overflow-hidden">
                {isNative ? (
                    <div className="w-full h-full bg-white dark:bg-gray-900 overflow-auto">
                        <NativeGame />
                    </div>
                ) : isIframe ? (
                    <div className="w-full h-full bg-white dark:bg-gray-900 overflow-hidden">
                        <iframe
                            ref={iframeRef}
                            src={game.path}
                            className="w-full h-full border-0"
                            title={language === 'es' && game.title_es ? game.title_es : game.title}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            onLoad={handleIframeLoad}
                        />
                    </div>
                ) : (
                    <div className="w-full max-w-lg text-center py-20">
                        <div className="text-7xl mb-6">{game.theme.icon}</div>
                        <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-3">
                            {language === 'es' ? 'Próximamente' : 'Coming Soon'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {language === 'es'
                                ? 'Este juego está en desarrollo. ¡Vuelve pronto!'
                                : 'This game is under development. Check back soon!'}
                        </p>
                        <div
                            className="inline-block px-6 py-3 rounded-xl text-white font-bold text-sm"
                            style={{ background: `linear-gradient(135deg, ${game.theme.gradient[0]}, ${game.theme.gradient[1]})` }}
                        >
                            {game.theme.icon} {language === 'es' && game.title_es ? game.title_es : game.title}
                        </div>
                    </div>
                )}
            </div>

            {showTutorial && hasTutorial && (
                <GameTutorial gameId={gameId} onClose={handleCloseTutorial} />
            )}
        </div>
    );
}
