"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useUser } from '@/lib/user-context';
import { useLanguage } from '@/lib/language';

interface Track {
    id: string; // YouTube ID
    url: string;
}

export default function GlobalMusicPlayer() {
    const { isPremium } = useUser();
    const { t } = useLanguage();
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
    const [inputUrl, setInputUrl] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(100);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const pipContainerRef = useRef<HTMLDivElement>(null);
    const [isPiP, setIsPiP] = useState(false);
    const pipWindowRef = useRef<any>(null);

    const togglePiP = useCallback(async () => {
        try {
            // If already in PiP, close it
            if (isPiP && pipWindowRef.current) {
                pipWindowRef.current.close();
                pipWindowRef.current = null;
                setIsPiP(false);
                return;
            }

            // Try Document Picture-in-Picture API (Chrome 116+)
            if ('documentPictureInPicture' in window) {
                const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
                    width: 320,
                    height: 180,
                });
                pipWindowRef.current = pipWindow;

                // Add styles to the PiP window
                const style = pipWindow.document.createElement('style');
                style.textContent = `
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        background: #0a0a0a; 
                        color: white; 
                        font-family: system-ui, -apple-system, sans-serif;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                        justify-content: center;
                        align-items: center;
                        transition: all 0.3s ease;
                    }
                    body.mini-mode {
                        background: transparent;
                        cursor: pointer;
                    }
                    body.ghost-mode {
                        background: transparent;
                    }
                    body.ghost-mode .pip-header,
                    body.ghost-mode .pip-track,
                    body.ghost-mode .btn-row {
                        display: none;
                    }
                    body.ghost-mode .pip-controls {
                        background: rgba(0,0,0,0.4);
                        border-radius: 50px;
                        padding: 6px 16px;
                        backdrop-filter: blur(8px);
                    }
                    body.ghost-mode .pip-controls button {
                        font-size: 20px;
                        color: rgba(255,255,255,0.9);
                    }
                    body.ghost-mode .ghost-back {
                        display: block;
                    }
                    .ghost-back {
                        display: none;
                        background: rgba(255,255,255,0.1);
                        border: none;
                        color: #9ca3af;
                        font-size: 10px;
                        cursor: pointer;
                        padding: 2px 8px;
                        border-radius: 10px;
                        margin-top: 6px;
                        transition: all 0.2s;
                    }
                    .ghost-back:hover {
                        background: rgba(255,255,255,0.2);
                        color: white;
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .mini-icon {
                        display: none;
                        width: 100%;
                        height: 100%;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                        gap: 4px;
                    }
                    body.mini-mode .mini-icon { display: flex; }
                    body.mini-mode .full-player { display: none; }
                    .mini-icon .icon {
                        font-size: 36px;
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                    .mini-icon .disc {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: conic-gradient(#facc15, #f97316, #facc15);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        animation: spin 3s linear infinite;
                    }
                    .mini-icon .disc-center {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: #0a0a0a;
                    }
                    .mini-icon .mini-label {
                        font-size: 9px;
                        color: #facc15;
                        font-weight: bold;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                    }
                    .full-player {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        width: 100%;
                    }
                    .pip-header {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 8px 12px 2px;
                        flex-shrink: 0;
                    }
                    .pip-header span {
                        font-size: 13px;
                        color: #facc15;
                        font-weight: bold;
                    }
                    .pip-track {
                        font-size: 11px;
                        color: #9ca3af;
                        text-align: center;
                        padding: 4px 12px;
                    }
                    .pip-controls {
                        display: flex;
                        gap: 12px;
                        align-items: center;
                        justify-content: center;
                        padding: 8px 12px;
                    }
                    .pip-controls button {
                        background: none;
                        border: none;
                        color: white;
                        font-size: 22px;
                        cursor: pointer;
                        padding: 6px 10px;
                        border-radius: 6px;
                        transition: background 0.2s;
                    }
                    .pip-controls button:hover {
                        background: rgba(255,255,255,0.1);
                    }
                    .minimize-btn {
                        background: rgba(255,255,255,0.08);
                        border: 1px solid rgba(255,255,255,0.15);
                        color: #d1d5db;
                        font-size: 11px;
                        cursor: pointer;
                        padding: 3px 10px;
                        border-radius: 4px;
                        transition: all 0.2s;
                        margin-top: 4px;
                    }
                    .minimize-btn:hover {
                        background: rgba(255,255,255,0.15);
                        color: white;
                    }
                `;
                pipWindow.document.head.appendChild(style);

                // --- Mini icon view (shown when minimized) ---
                const miniIcon = pipWindow.document.createElement('div');
                miniIcon.className = 'mini-icon';
                const disc = pipWindow.document.createElement('div');
                disc.className = 'disc';
                const discCenter = pipWindow.document.createElement('div');
                discCenter.className = 'disc-center';
                disc.appendChild(discCenter);
                const miniLabel = pipWindow.document.createElement('div');
                miniLabel.className = 'mini-label';
                miniLabel.textContent = 'ToyBox';
                miniIcon.appendChild(disc);
                miniIcon.appendChild(miniLabel);

                // Click mini icon to expand back
                miniIcon.onclick = () => {
                    pipWindow.document.body.classList.remove('mini-mode');
                    pipWindow.resizeTo(320, 180);
                };

                // --- Full player view ---
                const fullPlayer = pipWindow.document.createElement('div');
                fullPlayer.className = 'full-player';

                // Header
                const header = pipWindow.document.createElement('div');
                header.className = 'pip-header';
                header.innerHTML = `<span>♫ ToyBox Player</span>`;

                // Track info
                const trackInfo = pipWindow.document.createElement('div');
                trackInfo.className = 'pip-track';
                const currentTrk = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;
                trackInfo.textContent = currentTrk ? `Playing: ${currentTrk.id}` : 'No track loaded';

                // Controls
                const controls = pipWindow.document.createElement('div');
                controls.className = 'pip-controls';

                const prevBtn = pipWindow.document.createElement('button');
                prevBtn.textContent = '⏮';
                prevBtn.title = 'Previous';
                prevBtn.onclick = () => prevTrack();

                const playPauseBtn = pipWindow.document.createElement('button');
                playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
                playPauseBtn.title = 'Play/Pause';
                playPauseBtn.onclick = () => togglePlay();

                const nextBtn = pipWindow.document.createElement('button');
                nextBtn.textContent = '⏭';
                nextBtn.title = 'Next';
                nextBtn.onclick = () => nextTrack();

                controls.appendChild(prevBtn);
                controls.appendChild(playPauseBtn);
                controls.appendChild(nextBtn);

                // Button row (minimize + transparency)
                const btnRow = pipWindow.document.createElement('div');
                btnRow.className = 'btn-row';
                btnRow.style.cssText = 'display:flex;gap:6px;margin-top:4px;';

                const minimizeBtn = pipWindow.document.createElement('button');
                minimizeBtn.className = 'minimize-btn';
                minimizeBtn.textContent = '⬇ Minimize';
                minimizeBtn.title = 'Shrink to floating icon';
                minimizeBtn.onclick = () => {
                    pipWindow.document.body.classList.add('mini-mode');
                    pipWindow.resizeTo(80, 80);
                };

                const transparentBtn = pipWindow.document.createElement('button');
                transparentBtn.className = 'minimize-btn';
                transparentBtn.textContent = '👻 Transparent';
                transparentBtn.title = 'Only show controls floating';
                transparentBtn.onclick = () => {
                    pipWindow.document.body.classList.add('ghost-mode');
                    pipWindow.resizeTo(200, 80);
                };

                btnRow.appendChild(minimizeBtn);
                btnRow.appendChild(transparentBtn);

                // Ghost-back button (only visible in ghost mode)
                const ghostBack = pipWindow.document.createElement('button');
                ghostBack.className = 'ghost-back';
                ghostBack.textContent = '← Back';
                ghostBack.title = 'Return to full player';
                ghostBack.onclick = () => {
                    pipWindow.document.body.classList.remove('ghost-mode');
                    pipWindow.resizeTo(320, 180);
                };

                fullPlayer.appendChild(header);
                fullPlayer.appendChild(trackInfo);
                fullPlayer.appendChild(controls);
                fullPlayer.appendChild(ghostBack);
                fullPlayer.appendChild(btnRow);

                pipWindow.document.body.appendChild(miniIcon);
                pipWindow.document.body.appendChild(fullPlayer);

                setIsPiP(true);

                // When PiP window is closed
                pipWindow.addEventListener('pagehide', () => {
                    pipWindowRef.current = null;
                    setIsPiP(false);
                });
            } else {
                alert(t('pip_not_supported'));
            }
        } catch (err) {
            console.error('PiP error:', err);
        }
    }, [isPiP, isPlaying, currentTrackIndex, playlist]);

    // Cleanup PiP window on unmount
    useEffect(() => {
        return () => {
            if (pipWindowRef.current) {
                pipWindowRef.current.close();
            }
        };
    }, []);

    // If not premium, return null (or maybe show teaser?)
    if (!isPremium) return null;

    const addTrack = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Simple ID extraction
            let id = '';
            if (inputUrl.includes('v=')) {
                id = inputUrl.split('v=')[1].split('&')[0];
            } else if (inputUrl.includes('youtu.be/')) {
                id = inputUrl.split('youtu.be/')[1].split('?')[0];
            } else {
                // Assume it's an ID if no URL structure found, or basic handling
                id = inputUrl;
            }

            if (id.length > 5) {
                const newTrack = { id, url: inputUrl };
                setPlaylist([...playlist, newTrack]);
                if (currentTrackIndex === -1) {
                    setCurrentTrackIndex(0); // Start playing if first track
                    setIsPlaying(true);
                }
                setInputUrl('');
            } else {
                alert(t('invalid_url'));
            }
        } catch (e) {
            alert(t('parse_error'));
        }
    };

    const nextTrack = () => {
        if (currentTrackIndex < playlist.length - 1) {
            setCurrentTrackIndex(currentTrackIndex + 1);
            setIsPlaying(true);
        } else {
            setCurrentTrackIndex(0); // Loop
            setIsPlaying(true);
        }
    };

    const prevTrack = () => {
        if (currentTrackIndex > 0) {
            setCurrentTrackIndex(currentTrackIndex - 1);
            setIsPlaying(true);
        }
    };

    const togglePlay = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            const command = isPlaying ? 'pauseVideo' : 'playVideo';
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
                'event': 'command',
                'func': command,
                'args': []
            }), '*');
            setIsPlaying(!isPlaying);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
                'event': 'command',
                'func': 'setVolume',
                'args': [newVolume]
            }), '*');
        }
    };

    const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;

    return (
        <div className={`bg-black/90 text-white backdrop-blur-md border-t border-gray-800 transition-all duration-300 ${isExpanded ? 'h-64' : 'h-16'}`}>
            <div className="container mx-auto h-full flex flex-col">

                {/* Control Bar */}
                <div className="flex items-center justify-between p-3 h-16 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                        >
                            {isExpanded ? '▼' : '▲'}
                        </button>
                        <span className="font-bold text-sm text-yellow-400">{t('global_player')}</span>
                        {currentTrack && (
                            <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                {t('playing')} {currentTrack.id}
                            </span>
                        )}
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center gap-4">
                        <button onClick={prevTrack} className="p-2 hover:bg-gray-700 rounded text-xl" title={t('previous')}>⏮</button>

                        <button onClick={togglePlay} className="p-2 hover:bg-gray-700 rounded text-xl w-10 flex justify-center" title={t('play_pause')}>
                            {isPlaying ? '⏸' : '▶'}
                        </button>

                        <button onClick={nextTrack} className="p-2 hover:bg-gray-700 rounded text-xl" title={t('next')}>⏭</button>

                        {/* Picture-in-Picture */}
                        <button
                            onClick={togglePiP}
                            className={`p-2 hover:bg-gray-700 rounded text-sm font-bold transition-colors ${isPiP ? 'text-yellow-400 bg-gray-700' : 'text-gray-400'
                                }`}
                            title={isPiP ? t('pip_exit') : t('pip')}
                        >
                            {isPiP ? '🖼️ PiP ON' : '🖼️ PiP'}
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 ml-2 group">
                            <span className="text-xs text-gray-400">🔊</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                title={`Volume: ${volume}%`}
                            />
                        </div>
                    </div>

                    <form onSubmit={addTrack} className="flex gap-2">
                        <input
                            type="text"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            className="bg-gray-800 border-none rounded px-2 py-1 text-xs w-48 text-white focus:ring-1 focus:ring-yellow-500"
                            placeholder={t('paste_youtube')}
                        />
                        <button type="submit" className="text-xs bg-yellow-600 px-2 py-1 rounded hover:bg-yellow-500">
                            {t('add')}
                        </button>
                    </form>
                </div>

                {/* Expanded Content: Visualizer / Playlist / Video */}
                {isExpanded && (
                    <div className="flex-1 flex p-4 gap-4 overflow-hidden relative">
                        {/* Playlist Info */}
                        <div className="w-1/3 overflow-y-auto bg-gray-900/50 rounded p-2">
                            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">{t('queue')} ({playlist.length})</h4>
                            <ul className="space-y-1">
                                {playlist.map((track, i) => (
                                    <li
                                        key={i}
                                        className={`text-xs p-2 rounded cursor-pointer flex justify-between ${i === currentTrackIndex ? 'bg-yellow-900/30 text-yellow-200 indent-1' : 'hover:bg-gray-800 text-gray-300'}`}
                                        onClick={() => {
                                            setCurrentTrackIndex(i);
                                            setIsPlaying(true);
                                        }}
                                    >
                                        <span className="truncate">{i + 1}. {track.id}</span>
                                        {i === currentTrackIndex && <span>♪</span>}
                                    </li>
                                ))}
                                {playlist.length === 0 && <li className="text-gray-600 italic text-xs">{t('queue_empty')}</li>}
                            </ul>
                        </div>

                        {/* Video Placeholder (Actual iframe is hidden below to persist state when collapsed) */}
                        <div className="flex-1 bg-black rounded overflow-hidden shadow-lg border border-gray-800 flex items-center justify-center relative">
                            {/* We just overlay a transparent click blocker or let them interact with the iframe below if we position it here. 
                                Actually, to persist playback when minimized, the iframe must exist OUTSIDE this conditional block if we conditionally render "isExpanded". 
                                BUT, if we keep iframe always rendered, we can just use CSS to position it.
                            */}
                            <div className="text-gray-500 text-sm">{t('video_controls')}</div>
                        </div>
                    </div>
                )}

                {/* 
                    PERSISTENT PLAYER 
                    This iframe stays mounted regardless of isExpanded state.
                    We use CSS to move it into view or hide it.
                */}
                <div
                    className={`
                        transition-all duration-300 ease-in-out
                        ${isExpanded
                            ? 'absolute top-16 right-4 w-[60%] h-[calc(100%-5rem)] z-10'  // Expanded: Take up space in the expanded panel
                            : 'absolute bottom-20 right-4 w-48 h-28 opacity-0 pointer-events-none translate-y-10' // Collapsed: Hidden/Mini
                        } 
                        bg-black rounded-lg overflow-hidden border border-gray-800 shadow-2xl
                    `}
                >
                    <div ref={pipContainerRef} className="w-full h-full">
                        {currentTrack ? (
                            <iframe
                                ref={iframeRef}
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&enablejsapi=1`}
                                title="YouTube music player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                {t('no_track')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
