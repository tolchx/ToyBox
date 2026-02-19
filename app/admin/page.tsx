"use client";

import { useState, useEffect } from 'react';
import { useGames } from '@/lib/game-context';
import { useLanguage } from '@/lib/language';
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    // @ts-ignore
    const { games, addGame, deleteGame } = useGames();
    const { t } = useLanguage();
    const { user, isAdmin } = useUser();
    const router = useRouter();

    // Protect route
    useEffect(() => {
        if (!isAdmin) {
            router.push('/login');
        }
    }, [isAdmin, router]);

    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [path, setPath] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !desc || !path) return;

        const newGame: import('@/lib/games').Game = {
            id: title.toLowerCase().replace(/\s+/g, '-'),
            title,
            description: desc,
            path,
            category: 'skill',
            theme: {
                gradient: ['#1e3a5f', '#2d5a87'] as [string, string],
                accent: '#60a5fa',
                icon: '🎮',
                pattern: 'dots',
            },
        };

        addGame(newGame);
        alert(t('admin_game_added'));
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 transition-colors">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{t('add_game')}</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('admin_title_label')}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white dark:bg-gray-800"
                            placeholder={t('admin_title_placeholder')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('admin_desc_label')}</label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 text-black dark:text-white dark:bg-gray-800"
                            placeholder={t('admin_desc_placeholder')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('admin_path_label')}</label>
                        <input
                            type="text"
                            value={path}
                            onChange={(e) => setPath(e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white dark:bg-gray-800"
                            placeholder={t('admin_path_placeholder')}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('admin_path_hint')}
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                        {t('admin_submit')}
                    </button>
                </form>

                <div className="mt-12">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('admin_manage')}</h2>
                    <div className="space-y-4">
                        {games.map(game => (
                            <div key={game.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">{game.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{game.path}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm(t('admin_confirm_delete'))) {
                                            deleteGame(game.id);
                                        }
                                    }}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium px-3 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                    {t('admin_delete')}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
