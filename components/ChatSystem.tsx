'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { sendMessage, getMessages, getUsers } from '@/app/actions';

interface Message {
    id: string;
    content: string;
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
}

export default function ChatSystem() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [activeGroup, setActiveGroup] = useState('global'); // 'global' or userId
    const [users, setUsers] = useState<User[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling for messages
    useEffect(() => {
        const fetchMessages = async () => {
            const msgs = await getMessages(activeGroup === 'global' ? 'global' : undefined, activeGroup !== 'global' ? activeGroup : undefined);
            setMessages(msgs as any);
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [activeGroup]);

    // Fetch users list
    useEffect(() => {
        const fetchUsers = async () => {
            const u = await getUsers();
            setUsers(u);
        };
        fetchUsers();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const content = input;
        setInput('');

        // Optimistic update
        const tempMsg: Message = {
            id: 'temp-' + Date.now(),
            content,
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

    if (!session) return <div className="text-center p-4">Please login to chat.</div>;

    return (
        <div className="flex h-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Sidebar / User List */}
            <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-bold text-gray-800 dark:text-gray-200">Conversations</h2>
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
                                <img src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-8 h-8 rounded-full" alt="avatar" />
                                <span className="font-medium text-sm dark:text-gray-200 truncate">{u.alias || u.name}</span>
                            </button>
                        )
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <h3 className="font-bold dark:text-white">
                        {activeGroup === 'global' ? 'Global Chat' : users.find(u => u.id === activeGroup)?.name || 'Chat'}
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/50">
                    {messages.map((msg) => {
                        const isMe = msg.senderId === (session?.user as any).id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-end max-w-[70%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <img
                                        src={msg.sender.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.name}`}
                                        className="w-8 h-8 rounded-full mb-1"
                                        alt="avatar"
                                    />
                                    <div className={`p-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'}`}>
                                        {!isMe && <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{msg.sender.alias || msg.sender.name}</div>}
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white dark:bg-gray-800"
                            placeholder="Type a message..."
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
