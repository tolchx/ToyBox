"use client";

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/language';

type Verdict = 'truth' | 'lie' | null;

interface Analysis {
    verdict: Verdict;
    confidence: number;
    reasons: { text: string; text_es: string; type: 'suspicious' | 'credible' }[];
}

const suspiciousPatterns = [
    { pattern: /always|never|every time|100%/i, reason: { text: 'Absolute language detected — real stories have nuance', text_es: 'Lenguaje absoluto detectado — las historias reales tienen matices', type: 'suspicious' as const } },
    { pattern: /trust me|believe me|honestly|i swear/i, reason: { text: 'Persuasion phrases — liars over-emphasize truthfulness', text_es: 'Frases de persuasión — los mentirosos enfatizan demasiado la veracidad', type: 'suspicious' as const } },
    { pattern: /million|billion|thousand/i, reason: { text: 'Exaggerated numbers detected', text_es: 'Números exagerados detectados', type: 'suspicious' as const } },
    { pattern: /celebrity|famous|president|king|queen/i, reason: { text: 'Celebrity name-dropping raises suspicion', text_es: 'Mencionar celebridades levanta sospechas', type: 'suspicious' as const } },
    { pattern: /suddenly|out of nowhere|magically/i, reason: { text: 'Implausible transitions detected', text_es: 'Transiciones inverosímiles detectadas', type: 'suspicious' as const } },
];

const crediblePatterns = [
    { pattern: /i think|maybe|probably|around|about/i, reason: { text: 'Hedging language — truthful people express uncertainty', text_es: 'Lenguaje cauteloso — las personas sinceras expresan incertidumbre', type: 'credible' as const } },
    { pattern: /felt|feeling|emotion|scared|happy|sad/i, reason: { text: 'Emotional detail — liars focus on facts, not feelings', text_es: 'Detalle emocional — los mentirosos se enfocan en hechos, no sentimientos', type: 'credible' as const } },
    { pattern: /remember|recall|i think it was/i, reason: { text: 'Memory uncertainty — consistent with genuine recall', text_es: 'Incertidumbre de memoria — consistente con recuerdo genuino', type: 'credible' as const } },
    { pattern: /small|little|minor|slightly/i, reason: { text: 'Modest details — liars tend to exaggerate', text_es: 'Detalles modestos — los mentirosos tienden a exagerar', type: 'credible' as const } },
];

function analyzeStory(text: string): Analysis {
    const reasons: Analysis['reasons'] = [];
    let suspicionScore = 0;
    let credibilityScore = 0;

    for (const sp of suspiciousPatterns) {
        if (sp.pattern.test(text)) {
            reasons.push(sp.reason);
            suspicionScore += 20;
        }
    }
    for (const cp of crediblePatterns) {
        if (cp.pattern.test(text)) {
            reasons.push(cp.reason);
            credibilityScore += 15;
        }
    }

    // Length analysis
    if (text.length < 50) {
        reasons.push({ text: 'Very short story — lacking detail is suspicious', text_es: 'Historia muy corta — la falta de detalle es sospechosa', type: 'suspicious' });
        suspicionScore += 15;
    } else if (text.length > 300) {
        reasons.push({ text: 'Detailed narrative — consistent with genuine memory', text_es: 'Narrativa detallada — consistente con memoria genuina', type: 'credible' });
        credibilityScore += 10;
    }

    // Exclamation marks
    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations > 3) {
        reasons.push({ text: 'Excessive exclamation marks — overcompensating?', text_es: 'Excesivos signos de exclamación — ¿sobrecompensando?', type: 'suspicious' });
        suspicionScore += 10;
    }

    // Add some randomness for fun
    const randomFactor = Math.random() * 20 - 10;
    suspicionScore += randomFactor;

    if (reasons.length === 0) {
        reasons.push({ text: 'No strong indicators found — inconclusive', text_es: 'No se encontraron indicadores fuertes — inconcluso', type: 'credible' });
    }

    const totalScore = credibilityScore - suspicionScore;
    const verdict: Verdict = totalScore > 5 ? 'truth' : 'lie';
    const confidence = Math.min(95, Math.max(30, 50 + Math.abs(totalScore)));

    return { verdict, confidence, reasons: reasons.slice(0, 5) };
}

export default function LieDetectorGame() {
    const { language } = useLanguage();
    const [story, setStory] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<Analysis | null>(null);
    const [scanProgress, setScanProgress] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const analyze = () => {
        if (story.trim().length < 10) return;
        setAnalyzing(true);
        setResult(null);
        setScanProgress(0);

        intervalRef.current = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setAnalyzing(false);
                    setResult(analyzeStory(story));
                    return 100;
                }
                return prev + 2;
            });
        }, 40);
    };

    useEffect(() => {
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    const reset = () => {
        setStory('');
        setResult(null);
        setAnalyzing(false);
        setScanProgress(0);
    };

    return (
        <div className="h-full bg-gradient-to-b from-red-950 via-gray-950 to-gray-950 text-white p-2 sm:p-4 md:p-8 flex flex-col items-center overflow-auto">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-black mb-1">
                    {language === 'es' ? '🔍 Detector de Mentiras IA' : '🔍 AI Lie Detector'}
                </h1>
                <p className="text-gray-400 text-sm max-w-md">
                    {language === 'es'
                        ? 'Cuenta una historia. La IA analizará si es verdad o mentira.'
                        : 'Tell a story. The AI will analyze if it\'s truth or a lie.'}
                </p>
            </div>

            {/* Input */}
            {!result && !analyzing && (
                <div className="w-full max-w-lg">
                    <textarea
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                        placeholder={language === 'es'
                            ? 'Escribe tu historia aquí... (¿Es verdad o mentira?)'
                            : 'Write your story here... (Is it truth or a lie?)'}
                        className="w-full h-40 bg-gray-900/80 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none text-sm"
                    />
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">{story.length} {language === 'es' ? 'caracteres' : 'characters'}</span>
                        <button
                            onClick={analyze}
                            disabled={story.trim().length < 10}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                        >
                            {language === 'es' ? '🔍 Analizar' : '🔍 Analyze'}
                        </button>
                    </div>
                </div>
            )}

            {/* Scanning animation */}
            {analyzing && (
                <div className="w-full max-w-lg text-center py-12">
                    <div className="text-5xl mb-4 animate-pulse">🔍</div>
                    <h3 className="text-lg font-bold mb-3 text-red-400">
                        {language === 'es' ? 'Analizando patrones lingüísticos...' : 'Analyzing linguistic patterns...'}
                    </h3>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden max-w-xs mx-auto mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-100"
                            style={{ width: `${scanProgress}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{scanProgress}%</div>
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="w-full max-w-lg">
                    {/* Verdict */}
                    <div className={`text-center p-8 rounded-2xl border mb-6 ${
                        result.verdict === 'truth'
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                    }`}>
                        <div className="text-6xl mb-3">
                            {result.verdict === 'truth' ? '✅' : '🚨'}
                        </div>
                        <h2 className={`text-3xl font-black mb-2 ${
                            result.verdict === 'truth' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                            {result.verdict === 'truth'
                                ? (language === 'es' ? 'VERDAD' : 'TRUTH')
                                : (language === 'es' ? 'MENTIRA' : 'LIE')}
                        </h2>
                        <div className="text-sm text-gray-400">
                            {language === 'es' ? 'Confianza' : 'Confidence'}: <span className="font-bold text-white">{result.confidence}%</span>
                        </div>
                    </div>

                    {/* Reasons */}
                    <div className="space-y-2 mb-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                            {language === 'es' ? 'Análisis' : 'Analysis'}
                        </h3>
                        {result.reasons.map((r, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-3 p-3 rounded-xl border ${
                                    r.type === 'suspicious'
                                        ? 'bg-red-500/5 border-red-500/20'
                                        : 'bg-emerald-500/5 border-emerald-500/20'
                                }`}
                            >
                                <span className="text-lg shrink-0">{r.type === 'suspicious' ? '🚩' : '✓'}</span>
                                <span className="text-sm text-gray-300">{language === 'es' ? r.text_es : r.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Quoted story */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
                        <div className="text-xs text-gray-500 mb-2">{language === 'es' ? 'Tu historia:' : 'Your story:'}</div>
                        <p className="text-sm text-gray-300 italic">&ldquo;{story}&rdquo;</p>
                    </div>

                    <button
                        onClick={reset}
                        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                    >
                        {language === 'es' ? '🔄 Analizar otra historia' : '🔄 Analyze another story'}
                    </button>
                </div>
            )}
        </div>
    );
}
