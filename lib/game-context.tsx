"use client";

import React, { createContext, useContext, useState } from 'react';
import { Game, GameCategory, games as initialGames } from './games';

interface GameContextType {
    games: Game[];
    addGame: (game: Game) => void;
    deleteGame: (id: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [games, setGames] = useState<Game[]>(initialGames);

    const addGame = (game: Game) => {
        setGames(prev => [...prev, game]);
    };

    const deleteGame = (id: string) => {
        setGames(prev => prev.filter(g => g.id !== id));
    };

    return (
        <GameContext.Provider value={{ games, addGame, deleteGame }}>
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
