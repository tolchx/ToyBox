"use client";

import Link from 'next/link';
import { useLanguage } from '@/lib/language';
import { useUser } from '@/lib/user-context';
import { useTheme } from '@/lib/theme-context';

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();
    const { isPremium, setIsPremium } = useUser();
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                ToyBox
            </Link>

            <div className="flex items-center gap-4">
                {/* User / Premium Status */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPremium(!isPremium)}
                        className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${isPremium
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {isPremium ? t('premium_label') : t('free_label')}
                    </button>

                    <Link href="/admin" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                        {t('admin_panel')}
                    </Link>
                </div>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title={theme === 'dark' ? t('switch_light') : t('switch_dark')}
                >
                    {theme === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </button>

                {/* Language Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1 text-sm rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => setLanguage('es')}
                        className={`px-3 py-1 text-sm rounded-md transition-all ${language === 'es' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        ES
                    </button>
                </div>
            </div>
        </nav>
    );
}
