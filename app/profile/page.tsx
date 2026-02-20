'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '../actions';
import { useLanguage } from '@/lib/language';
import { useUser } from '@/lib/user-context';
import { useGames } from '@/lib/game-context';

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();
    const { isPremium, preferences, updatePreferences, isAdmin } = useUser();
    // @ts-ignore
    const { games, addGame, deleteGame } = useGames();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [path, setPath] = useState('');

    const handleSubmitGame = (e: React.FormEvent) => {
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
        setTitle('');
        setDesc('');
        setPath('');
    };
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center dark:text-white">Loading...</div>;
    }

    if (!session?.user) {
        return null;
    }

    async function handleUpdate(formData: FormData) {
        setIsLoading(true);
        // @ts-ignore
        const result = await updateProfile(null, formData);
        if (result?.success) {
            await update(); // Update session
            setIsEditing(false);
        } else {
            alert('Failed to update profile');
        }
        setIsLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 pt-24 text-black dark:text-white relative">
            <button
                onClick={() => router.push('/')}
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Games
            </button>

            <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="absolute top-8 right-8 flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
            </button>

            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <img
                                src={session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`}
                                alt="Profile"
                                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 bg-white"
                            />
                            <div className="flex gap-2">
                                <button
                                    // @ts-ignore
                                    onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    title="Switch Language"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    {isEditing ? 'Cancel' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>

                        {isEditing ? (
                            <form action={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                    <input
                                        name="name"
                                        defaultValue={session.user.name || ''}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alias</label>
                                    <input
                                        name="alias"
                                        // @ts-ignore
                                        defaultValue={session.user.alias || ''}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                                    <textarea
                                        name="bio"
                                        // @ts-ignore
                                        defaultValue={session.user.bio || ''}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white px-3 py-2"
                                        rows={3}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold">{session.user.name}</h1>
                                {/* @ts-ignore */}
                                {session.user.alias && <p className="text-lg text-blue-500">@{session.user.alias}</p>}
                                <p className="text-gray-500 dark:text-gray-400">{session.user.email}</p>

                                {/* Bio Section */}
                                <div className="mt-6">
                                    <h2 className="text-xl font-bold mb-2">About</h2>
                                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                        {/* @ts-ignore */}
                                        {session.user.bio || "This user hasn't written a bio yet."}
                                    </p>
                                </div>
                            </>
                        )}


                        {/* Stats Section */}
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                                <span className="block text-2xl font-bold">0</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Games Played</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                                <span className="block text-2xl font-bold">0</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Score</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                                <span className="block text-2xl font-bold">0</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Friends</span>
                            </div>
                        </div>

                        <div className="mt-8 border-t dark:border-gray-800 pt-8">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-yellow-500">👑</span>
                                {t('premium_controls')}
                                {!isPremium && (
                                    <span className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded ml-2 font-normal flex items-center gap-1">
                                        🔒 Locked
                                    </span>
                                )}
                            </h2>

                            <div className={`grid gap-4 md:grid-cols-2 ${!isPremium ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">{t('bg_image_label')}</label>
                                    <input
                                        type="text"
                                        value={preferences.bgImage}
                                        onChange={(e) => updatePreferences({ bgImage: e.target.value })}
                                        placeholder="https://..."
                                        disabled={!isPremium}
                                        className="w-full text-sm p-3 border dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Paste a URL to an image to set a global background.</p>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">{t('music_label')}</label>
                                    <input
                                        type="text"
                                        value={preferences.musicUrl}
                                        onChange={(e) => updatePreferences({ musicUrl: e.target.value })}
                                        placeholder={t('music_placeholder')}
                                        disabled={!isPremium}
                                        className="w-full text-sm p-3 border dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Enter a YouTube Video ID to play background music globally.</p>
                                </div>
                            </div>

                            {!isPremium && (
                                <p className="text-sm text-center text-gray-500 mt-4 italic">
                                    Unlock Premium to customize your experience with backgrounds and music!
                                </p>
                            )}
                        </div>

                        {isAdmin && (
                            <div className="mt-12 border-t dark:border-gray-800 pt-8">
                                <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">{t('add_game')}</h1>

                                <form onSubmit={handleSubmitGame} className="space-y-6 mb-12">
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
