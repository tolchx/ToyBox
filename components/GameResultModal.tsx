"use client";

import { useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/language';

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart?: () => void;
  title: string;
  title_es: string;
  message: string;
  message_es: string;
  score: number;
  best: number;
  scoreLabel?: string;
  scoreLabel_es?: string;
  bestLabel?: string;
  bestLabel_es?: string;
  icon: string;
  isSuccess: boolean;
  additionalStats?: Array<{
    label: string;
    label_es: string;
    value: string | number;
  }>;
}

export default function GameResultModal({
  isOpen,
  onClose,
  onRestart,
  title,
  title_es,
  message,
  message_es,
  score,
  best,
  scoreLabel = "Score",
  scoreLabel_es = "Puntuación",
  bestLabel = "Best",
  bestLabel_es = "Mejor",
  icon,
  isSuccess,
  additionalStats = []
}: GameResultModalProps) {
  const { language } = useLanguage();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && onRestart) onRestart();
    if (e.key === 'r' && onRestart) onRestart();
  }, [onClose, onRestart]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const currentTitle = language === 'es' ? title_es : title;
  const currentMessage = language === 'es' ? message_es : message;
  const currentScoreLabel = language === 'es' ? scoreLabel_es : scoreLabel;
  const currentBestLabel = language === 'es' ? bestLabel_es : bestLabel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success/Error indicator bar */}
        <div className={`h-1 ${isSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-orange-600'}`} />

        {/* Close button */}
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-sm font-medium"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          <div className={`text-6xl mb-4 ${isSuccess ? 'animate-[bounce_2s_ease-in-out_infinite]' : 'animate-[wiggle_1s_ease-in-out_infinite]'}`}>
            {icon}
          </div>
          
          <h3 className={`text-2xl font-bold mb-3 ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {currentTitle}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm mb-6">
            {currentMessage}
          </p>

          {/* Score display */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold text-white dark:text-white mb-1">
                  {score}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {currentScoreLabel}
                </div>
              </div>
              
              {best > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400 dark:text-amber-400 mb-1">
                    {best}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {currentBestLabel}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional stats */}
          {additionalStats.length > 0 && (
            <div className="space-y-2 mb-6">
              {additionalStats.map((stat, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {language === 'es' ? stat.label_es : stat.label}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {language === 'es' ? 'Cerrar' : 'Close'}
          </button>
          
          {onRestart && (
            <button
              onClick={onRestart}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isSuccess
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {language === 'es' ? '🔄 Jugar de nuevo' : '🔄 Play Again'}
            </button>
          )}
        </div>

        {/* Keyboard hint */}
        <div className="text-center text-[10px] text-gray-400 dark:text-gray-600 pb-3">
          {language === 'es' ? 'Enter o R para reiniciar, Esc para cerrar' : 'Enter or R to restart, Esc to close'}
        </div>

        {/* Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes scaleIn {
            from { 
              opacity: 0;
              transform: scale(0.9);
            }
            to { 
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translateY(0);
            }
            40%, 43% {
              transform: translateY(-10px);
            }
            70% {
              transform: translateY(-5px);
            }
            90% {
              transform: translateY(-2px);
            }
          }
          
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-3deg); }
            75% { transform: rotate(3deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
