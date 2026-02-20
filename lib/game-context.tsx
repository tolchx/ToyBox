"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game, GameCategory, games as initialGames } from './games';

interface GameContextType {
    games: Game[];
    addGame: (game: Game) => void;
    deleteGame: (id: string, isGlobal?: boolean) => void;
    hideGame: (id: string) => void; // User only
    editMode: boolean;
    toggleEditMode: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [internalGames, setInternalGames] = useState<Game[]>(initialGames);
    const [editMode, setEditMode] = useState(false);
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
    const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

    // Fetch status on mount
    useEffect(() => {
        fetch('/api/games/status')
            .then(res => res.json())
            .then(data => {
                if (data.hidden) setHiddenIds(new Set(data.hidden));
                if (data.deleted) setDeletedIds(new Set(data.deleted));
            })
            .catch(err => console.error("Failed to fetch game status", err));
    }, []);

    const games = internalGames.filter(g => !hiddenIds.has(g.id) && !deletedIds.has(g.id));

    const addGame = (game: Game) => {
        setInternalGames(prev => [...prev, game]);
    };

    const deleteGame = async (id: string, isGlobal: boolean = true) => {
        // Optimistic update
        if (isGlobal) {
            setDeletedIds(prev => new Set(prev).add(id));
        } else {
            // Fallback for non-global delete if interpreted as hide? 
            // Actually deleteGame in current context implies removing custom games OR global delete.
            // For now, assume global delete for built-ins.
        }

        try {
            await fetch('/api/games/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: id, action: 'delete' })
            });
        } catch (e) {
            console.error("Failed to delete game", e);
            // Revert on error? For now simple optimistic.
        }
    };

    const hideGame = async (id: string) => {
        setHiddenIds(prev => new Set(prev).add(id));
        try {
            await fetch('/api/games/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: id, action: 'hide' })
            });
        } catch (e) {
            console.error("Failed to hide game", e);
        }
    };

    const toggleEditMode = () => setEditMode(prev => !prev);

    return (
        <GameContext.Provider value={{ games, addGame, deleteGame, hideGame, editMode, toggleEditMode }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGames() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGames must be used within a GameProvider');
    }
    return context;
}
