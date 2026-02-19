"use client";

import React, { createContext, useContext, useState } from 'react';

interface User {
    username: string;
    role: 'user' | 'admin';
}

interface UserContextType {
    user: User | null;
    login: (username: string) => void;
    logout: () => void;
    isPremium: boolean;
    setIsPremium: (isPremium: boolean) => void;
    isAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isPremium, setIsPremium] = useState(true);

    const login = (username: string) => {
        // Demo logic: "admin" user gets admin role
        const role = username === 'admin' ? 'admin' : 'user';
        setUser({ username, role });
        if (role === 'admin') setIsPremium(true); // Admins are premium by default
    };

    const logout = () => {
        setUser(null);
        setIsPremium(false);
    };

    return (
        <UserContext.Provider value={{
            user,
            login,
            logout,
            isPremium,
            setIsPremium,
            isAdmin: user?.role === 'admin'
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
