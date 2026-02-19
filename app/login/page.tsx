"use client";

import { useState } from 'react';
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language';

export default function LoginPage() {
    const { login } = useUser();
    const { t } = useLanguage();
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            login('admin');
            router.push('/admin');
        } else {
            setError(t('login_error'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">{t('login_title')}</h1>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login_username')}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white dark:bg-gray-800 transition-all"
                            placeholder="admin"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('login_password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white dark:bg-gray-800 transition-all"
                            placeholder="admin"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-transform active:scale-95"
                    >
                        {t('login_submit')}
                    </button>
                </form>
            </div>
        </div>
    );
}
