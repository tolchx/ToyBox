'use client';

import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '@/app/actions';
import { useSession } from 'next-auth/react';

export default function NotificationSystem() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!session) return;

        const fetchNotifications = async () => {
            const notes = await getNotifications();
            if (notes.length > 0) {
                setNotifications(notes);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Check every 10s

        return () => clearInterval(interval);
    }, [session]);

    const handleDismiss = async (id: string) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {notifications.map(note => (
                <div key={note.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border-l-4 border-blue-500 flex items-start gap-3 w-80 animate-slide-in">
                    <div className="flex-1">
                        <p className="text-sm font-medium dark:text-gray-200">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(note.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <button onClick={() => handleDismiss(note.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
