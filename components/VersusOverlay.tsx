'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVersusMatch } from '@/app/actions';
import { useSession } from 'next-auth/react';

interface Player {
    id: string;
    name: string | null;
    image: string | null;
    alias: string | null;
}

interface ScoreData {
    distance?: string;
    time?: string;
    milestones?: number;
    level?: number;
    points?: number;
    [key: string]: any;
}

interface VersusOverlayProps {
    matchId: string;
}

export default function VersusOverlay({ matchId }: VersusOverlayProps) {
    const { data: session } = useSession();
    const [match, setMatch] = useState<any>(null);
    const [collapsed, setCollapsed] = useState(false);

    const fetchMatch = useCallback(async () => {
        const data = await getVersusMatch(matchId);
        if (data) setMatch(data);
    }, [matchId]);

    useEffect(() => {
        fetchMatch();
        const interval = setInterval(fetchMatch, 3000);
        return () => clearInterval(interval);
    }, [fetchMatch]);

    if (!match) return null;

    const myId = (session?.user as any)?.id;
    const isChallenger = myId === match.challengerId;
    const me: Player = isChallenger ? match.challenger : match.challenged;
    const opponent: Player = isChallenger ? match.challenged : match.challenger;

    const myScoreRaw = isChallenger ? match.challengerScore : match.challengedScore;
    const opponentScoreRaw = isChallenger ? match.challengedScore : match.challengerScore;

    let myScore: ScoreData = {};
    let opponentScore: ScoreData = {};
    try { if (myScoreRaw) myScore = JSON.parse(myScoreRaw); } catch (e) { }
    try { if (opponentScoreRaw) opponentScore = JSON.parse(opponentScoreRaw); } catch (e) { }

    const statusLabel = match.status === 'pending'
        ? '⏳ Esperando oponente...'
        : match.status === 'active'
            ? '⚔️ EN VIVO'
            : '🏆 Completado';

    const statusColor = match.status === 'active' ? 'text-green-400' : match.status === 'pending' ? 'text-yellow-400' : 'text-purple-400';

    if (collapsed) {
        return (
            <button
                onClick={() => setCollapsed(false)}
                className="fixed top-16 right-4 z-50 bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-2 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
            >
                ⚔️ VS
                <span className={`w-2 h-2 rounded-full ${match.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></span>
            </button>
        );
    }

    const renderScore = (score: ScoreData, label: string) => (
        <div className="flex-1 text-center">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{label}</div>
            {Object.keys(score).length === 0 ? (
                <div className="text-gray-500 text-xs italic">Sin datos</div>
            ) : (
                <div className="space-y-1">
                    {score.distance && (
                        <div className="text-xs">
                            <span className="text-gray-400">📏</span> <span className="text-white font-mono">{score.distance}</span>
                        </div>
                    )}
                    {score.time && (
                        <div className="text-xs">
                            <span className="text-gray-400">⏱️</span> <span className="text-white font-mono">{score.time}</span>
                        </div>
                    )}
                    {score.milestones !== undefined && (
                        <div className="text-xs">
                            <span className="text-gray-400">🏁</span> <span className="text-white font-mono">{score.milestones}</span>
                        </div>
                    )}
                    {score.level !== undefined && (
                        <div className="text-xs">
                            <span className="text-gray-400">📊</span> <span className="text-white font-mono">Lv.{score.level}</span>
                        </div>
                    )}
                    {score.points !== undefined && (
                        <div className="text-xs">
                            <span className="text-gray-400">⭐</span> <span className="text-white font-mono">{score.points} pts</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed top-16 right-4 z-50 w-72 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 flex justify-between items-center">
                <span className={`font-bold text-sm ${statusColor}`}>{statusLabel}</span>
                <button onClick={() => setCollapsed(true)} className="text-white/70 hover:text-white text-lg">−</button>
            </div>

            {/* Players */}
            <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                        <img src={me.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${me.name}`} className="w-8 h-8 rounded-full border-2 border-cyan-500" />
                        <div>
                            <div className="text-xs font-bold text-cyan-400 truncate max-w-[70px]">{me.alias || me.name}</div>
                            <div className="text-[9px] text-gray-500">TÚ</div>
                        </div>
                    </div>
                    <div className="text-xl font-black text-orange-500 px-2">VS</div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="text-right">
                            <div className="text-xs font-bold text-red-400 truncate max-w-[70px]">{opponent.alias || opponent.name}</div>
                            <div className="text-[9px] text-gray-500">RIVAL</div>
                        </div>
                        <img src={opponent.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent.name}`} className="w-8 h-8 rounded-full border-2 border-red-500" />
                    </div>
                </div>

                {/* Scores */}
                <div className="flex gap-2 border-t border-white/5 pt-2">
                    {renderScore(myScore, me.alias || me.name || 'Tú')}
                    <div className="w-px bg-white/10"></div>
                    {renderScore(opponentScore, opponent.alias || opponent.name || 'Rival')}
                </div>
            </div>
        </div>
    );
}
