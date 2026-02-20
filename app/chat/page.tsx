'use client';

import ChatSystem from '@/components/ChatSystem';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 dark:text-white">Community Chat</h1>
                <ChatSystem />
            </div>
        </div>
    );
}
