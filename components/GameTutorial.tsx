"use client";

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/language';
import { TutorialStep, gameTutorials } from '@/lib/tutorials';

interface GameTutorialProps {
  gameId: string;
  onClose: () => void;
}

export default function GameTutorial({ gameId, onClose }: GameTutorialProps) {
  const { language, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps = gameTutorials[gameId];

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (!steps) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  }, [currentStep, steps, onClose]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') onClose();
  }, [handleNext, handlePrev, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!steps || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const title = language === 'es' ? step.title_es : step.title;
  const description = language === 'es' ? step.description_es : step.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'bg-blue-500 w-6'
                    : i < currentStep
                    ? 'bg-blue-300 dark:bg-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-sm font-medium"
          >
            {language === 'es' ? 'Saltar' : 'Skip'}
          </button>
        </div>

        {/* Content */}
        <div className={`px-6 py-8 text-center transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <div className="text-5xl mb-4 animate-[bounce_2s_ease-in-out_infinite]">
            {step.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            {description}
          </p>
        </div>

        {/* Step counter */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-600 mb-3">
          {currentStep + 1} / {steps.length}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              ← {language === 'es' ? 'Anterior' : 'Back'}
            </button>
          )}
          <button
            onClick={handleNext}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isLast
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
          >
            {isLast
              ? (language === 'es' ? '¡Jugar! 🎮' : 'Play! 🎮')
              : (language === 'es' ? 'Siguiente →' : 'Next →')
            }
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="text-center text-[10px] text-gray-400 dark:text-gray-600 pb-3">
          {language === 'es' ? 'Usa ← → o Esc' : 'Use ← → or Esc'}
        </div>
      </div>
    </div>
  );
}
