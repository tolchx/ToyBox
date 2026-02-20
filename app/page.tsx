"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import GameCard from '@/components/GameCard';
import { useLanguage } from '@/lib/language';
import { useGames } from '@/lib/game-context';
import { categories, GameCategory } from '@/lib/games';

export default function Home() {
  const { t, language } = useLanguage();
  const { games } = useGames();
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Drag-to-scroll for featured carousel
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
    carouselRef.current.style.cursor = 'grabbing';
    carouselRef.current.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) hasDragged.current = true;
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const handleMouseUpOrLeave = useCallback(() => {
    isDragging.current = false;
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
      carouselRef.current.style.removeProperty('user-select');
    }
  }, []);

  // Auto-scroll and Arrows
  const [isPaused, setIsPaused] = useState(false);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 300; // Approx card width + gap
    const targetScroll = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    carouselRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      if (!carouselRef.current) return;
      
      // Check if we reached the end
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        // Reset to start gently
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scroll('right');
      }
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(interval);
  }, [isPaused, scroll]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const featuredGames = useMemo(() => games.filter(g => g.isFeatured), [games]);

  const filteredGames = useMemo(() => {
    let filtered = games;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(g => g.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(g =>
        g.title.toLowerCase().includes(q) ||
        (g.title_es && g.title_es.toLowerCase().includes(q)) ||
        g.description.toLowerCase().includes(q) ||
        (g.description_es && g.description_es.toLowerCase().includes(q)) ||
        (g.tags && g.tags.some(tag => tag.includes(q)))
      );
    }
    return filtered;
  }, [games, activeCategory, searchQuery]);

  const gameCount = filteredGames.length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {t('hero_badge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
            {t('hero_subtitle')}
          </p>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all text-lg"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{games.length}</span>
              {t('stat_games')}
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{categories.length - 1}</span>
              {t('stat_categories')}
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{games.filter(g => g.isNew).length}</span>
              {t('stat_new')}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games Carousel */}
      {!searchQuery && activeCategory === 'all' && featuredGames.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 mb-8 group"
                 onMouseEnter={() => setIsPaused(true)}
                 onMouseLeave={() => setIsPaused(false)}>
          
          {/* Left Arrow */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ cursor: 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            {featuredGames.map((game) => (
              <div key={game.id} className="flex-shrink-0 w-72" onClickCapture={handleCardClick}>
                <GameCard game={game} variant="featured" />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </section>
      )}

      {/* Category Tabs */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const catLabel = language === 'es' ? cat.label_es : cat.label;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
                style={isActive ? { backgroundColor: cat.color, boxShadow: `0 4px 14px ${cat.color}44` } : {}}
              >
                <span>{cat.icon}</span>
                <span>{catLabel}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Results Count */}
      <section className="max-w-7xl mx-auto px-6 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('showing_games', { count: gameCount.toString() })}
          </p>
          {(searchQuery || activeCategory !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium"
            >
              {t('clear_filters')}
            </button>
          )}
        </div>
      </section>

      {/* Games Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">{t('no_results_title')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('no_results_desc')}</p>
          </div>
        )}
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-gray-400 dark:text-gray-600 text-sm">
        <p>{t('footer', { year: new Date().getFullYear().toString() })}</p>
      </footer>
    </main>
  );
}
