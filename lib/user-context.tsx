"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface User {
    username: string;
    role: 'user' | 'admin';
    image?: string;
    id?: string;
}

interface UserContextType {
    user: User | null;
    login: (username: string) => void;
    logout: () => void;
    isPremium: boolean;
    setIsPremium: (isPremium: boolean) => void;
    isAdmin: boolean;
    isLoading: boolean;
    preferences: { bgImage: string; musicUrl: string };
    updatePreferences: (newPrefs: { bgImage?: string; musicUrl?: string }) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [isPremium, setIsPremium] = useState(false); // Default to false for free tier testing
    const [preferences, setPreferences] = useState({ bgImage: '', musicUrl: '' });

    useEffect(() => {
        const stored = localStorage.getItem('toybox_preferences');
        if (stored) {
            try {
                setPreferences(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse preferences", e);
            }
        }
    }, []);

    const updatePreferences = (newPrefs: Partial<typeof preferences>) => {
        const updated = { ...preferences, ...newPrefs };
        setPreferences(updated);
        localStorage.setItem('toybox_preferences', JSON.stringify(updated));
    };

    // Derived user state from session
    const user: User | null = session?.user ? {
        username: session.user.name || session.user.email || 'User',
        // @ts-ignore
        role: session.user.role || 'user',
        image: session.user.image || undefined,
        // @ts-ignore
        id: session.user.id
    } : null;

    useEffect(() => {
        if (user?.role === 'admin') {
            setIsPremium(true);
        }
    }, [user?.role]);

    const login = (username: string) => {
        // Redundant with NextAuth, but kept for compatibility if called manually
        signIn();
    };

    const handleLogout = () => {
        signOut();
    };

    return (
        <UserContext.Provider value={{
            user,
            login,
            logout: handleLogout,
            isPremium,
            setIsPremium,
            isAdmin: user?.role === 'admin',
            isLoading: status === 'loading',
            preferences,
            updatePreferences
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
