'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { sendMessage, getMessages, getUsers, createVersusMatch, acceptVersusMatch } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface Message {
    id: string;
    content: string;
    type: string;
    metadata: string | null;
    senderId: string;
    sender: {
        name: string | null;
        image: string | null;
        alias: string | null;
    };
    createdAt: Date;
}

interface User {
    id: string;
    name: string | null;
    image: string | null;
    alias: string | null;
    lastSeen: Date | null;
}

export default function ChatWidget() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [activeGroup, setActiveGroup] = useState('global'); // 'global' or userId
    const [users, setUsers] = useState<User[]>([]);
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Polling for messages
    useEffect(() => {
        if (!isOpen) return;

        const fetchMessages = async () => {
            const msgs = await getMessages(activeGroup === 'global' ? 'global' : undefined, activeGroup !== 'global' ? activeGroup : undefined);
            setMessages(msgs as any);
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [activeGroup, isOpen]);

    // Fetch users list
    useEffect(() => {
        if (!isOpen) return;

        const fetchUsers = async () => {
            const u = await getUsers();
            setUsers(u as any);
        };
        fetchUsers();
        const interval = setInterval(fetchUsers, 10000); // Refresh users every 10s
        return () => clearInterval(interval);
    }, [isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const content = input;
        setInput('');

        // Optimistic update
        const tempMsg: Message = {
            id: 'temp-' + Date.now(),
            content,
            type: 'text',
            metadata: null,
            senderId: (session?.user as any).id,
            sender: {
                name: session?.user?.name || 'Me',
                image: session?.user?.image || null,
                alias: (session?.user as any).name || 'Me'
            },
            createdAt: new Date()
        };
        setMessages(prev => [...prev, tempMsg]);

        await sendMessage(content, activeGroup === 'global' ? 'global' : undefined, activeGroup !== 'global' ? activeGroup : undefined);
    };

    const sendChallenge = async (gameId: string) => {
        setShowChallengeModal(false);

        // Create a real versus match in the DB
        const targetUserId = activeGroup !== 'global' ? activeGroup : undefined;
        if (!targetUserId) return;

        const result = await createVersusMatch(gameId, targetUserId);
        if ('error' in result) return;

        const content = `¡Te reto a ${gameId}!`;
        const metadata = JSON.stringify({ gameId, matchId: result.matchId, status: 'pending' });

        await sendMessage(content, undefined, targetUserId, 'challenge', metadata);
        // Refresh messages immediately
        const msgs = await getMessages(undefined, targetUserId);
        setMessages(msgs as any);

        // Navigate to game immediately as challenger
        router.push(`/play/${gameId}?vs=${result.matchId}`);
    };

    const isOnline = (date: Date | string | null) => {
        if (!date) return false;
        const d = new Date(date);
        const now = new Date();
        return (now.getTime() - d.getTime()) < 2 * 60 * 1000; // < 2 minutes
    };

    if (!session) return null;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
            >
                <span>💬 Chat</span>
                <span className="bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-20 right-4 w-[800px] h-[500px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 flex overflow-hidden z-50 flex-col md:flex-row">
            {/* Header for Mobile */}
            <div className="md:hidden p-3 bg-gray-100 dark:bg-gray-800 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <span className="font-bold">Chat</span>
                <button onClick={() => setIsOpen(false)} className="text-gray-500">✕</button>
            </div>

            {/* Sidebar / User List */}
            <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 md:flex justify-between items-center hidden">
                    <h2 className="font-bold text-gray-800 dark:text-gray-200">Conversations</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <button
                        onClick={() => setActiveGroup('global')}
                        className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${activeGroup === 'global' ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''}`}
                    >
                        <span className="font-medium dark:text-gray-200">Global Chat</span>
                    </button>
                    <div className="p-2 text-xs font-semibold text-gray-500 uppercase mt-2">Users</div>
                    {users.map(u => (
                        u.id !== (session?.user as any).id && (
                            <button
                                key={u.id}
                                onClick={() => setActiveGroup(u.id)}
                                className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${activeGroup === u.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''}`}
                            >
                                <div className="relative">
                                    <img src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-8 h-8 rounded-full" alt="avatar" />
                                    {isOnline(u.lastSeen) && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-medium text-sm dark:text-gray-200 truncate">{u.alias || u.name}</span>
                                    <span className="text-[10px] text-gray-400">{isOnline(u.lastSeen) ? 'Online' : 'Offline'}</span>
                                </div>
                            </button>
                        )
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center">
                    <h3 className="font-bold dark:text-white flex items-center gap-2">
                        {activeGroup === 'global' ? 'Global Chat' : (
                            <>
                                <img src={users.find(u => u.id === activeGroup)?.image || ''} className="w-6 h-6 rounded-full" />
                                <span className="cursor-pointer hover:underline" onClick={() => router.push(`/profile/${activeGroup}`)}>
                                    {users.find(u => u.id === activeGroup)?.name || 'Chat'}
                                </span>
                            </>
                        )}
                    </h3>
                    {activeGroup !== 'global' && (
                        <button
                            onClick={() => setShowChallengeModal(true)}
                            className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition-colors"
                        >
                            ⚔️ Versus
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/50">
                    {messages.map((msg) => {
                        const isMe = msg.senderId === (session?.user as any).id;
                        const isChallenge = msg.type === 'challenge';
                        let challengeData = null;
                        if (isChallenge && msg.metadata) {
                            try { challengeData = JSON.parse(msg.metadata); } catch (e) { }
                        }

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-end max-w-[80%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <img
                                        src={msg.sender.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.name}`}
                                        className="w-8 h-8 rounded-full mb-1 cursor-pointer"
                                        alt="avatar"
                                        onClick={() => router.push(`/profile/${msg.senderId}`)}
                                    />
                                    <div className={`p-3 rounded-2xl ${isChallenge
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none'
                                        : isMe
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                                        }`}>
                                        {!isMe && <div className="text-xs text-opacity-70 mb-1">{msg.sender.alias || msg.sender.name}</div>}

                                        {isChallenge ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="font-bold">⚔️ ¡Invitación a Versus!</div>
                                                <div>Juguemos <span className="font-bold">{challengeData?.gameId}</span>!</div>
                                                {!isMe && challengeData?.matchId && (
                                                    <button
                                                        onClick={async () => {
                                                            const result = await acceptVersusMatch(challengeData.matchId);
                                                            if (result && 'success' in result) {
                                                                router.push(`/play/${challengeData.gameId}?vs=${challengeData.matchId}`);
                                                            }
                                                        }}
                                                        className="bg-white text-orange-600 text-sm font-bold px-3 py-1 rounded shadow hover:bg-gray-100 mt-1"
                                                    >
                                                        Aceptar Desafío
                                                    </button>
                                                )}
                                                {isMe && challengeData?.matchId && (
                                                    <div className="text-xs opacity-70">⏳ Esperando aceptación...</div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white dark:bg-gray-800"
                            placeholder="Type a message..."
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>

            {/* Challenge Modal */}
            {showChallengeModal && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 p-4">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl w-full max-w-sm shadow-xl">
                        <h3 className="font-bold mb-4 dark:text-white">Select Game to Challenge</h3>
                        <div className="grid grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto">
                            {['speed-of-light', 'password-game', 'convert-case', 'lorem-ipsum'].map(game => (
                                <button
                                    key={game}
                                    onClick={() => sendChallenge(game)}
                                    className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm dark:text-gray-200"
                                >
                                    {game}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowChallengeModal(false)}
                            className="w-full p-2 bg-gray-200 dark:bg-gray-800 rounded text-gray-800 dark:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
