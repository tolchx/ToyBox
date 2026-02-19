"use client";

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/language';

interface Character {
    name: string;
    emoji: string;
    style: string;
    style_es: string;
}

interface DebateTurn {
    character: Character;
    text: string;
    type: 'argument' | 'rebuttal' | 'closing';
}

const characters: Character[] = [
    { name: 'Socrates', emoji: '🏛️', style: 'philosophical and questioning', style_es: 'filosófico y cuestionador' },
    { name: 'Pirate Captain', emoji: '🏴‍☠️', style: 'aggressive and nautical metaphors', style_es: 'agresivo con metáforas náuticas' },
    { name: 'Robot AI', emoji: '🤖', style: 'logical and data-driven', style_es: 'lógico y basado en datos' },
    { name: 'Drama Queen', emoji: '👑', style: 'overly dramatic and emotional', style_es: 'excesivamente dramático y emocional' },
    { name: 'Conspiracy Theorist', emoji: '🔺', style: 'paranoid and connecting dots', style_es: 'paranoico conectando puntos' },
    { name: 'Grandma', emoji: '👵', style: 'wise with folksy wisdom', style_es: 'sabia con sabiduría popular' },
    { name: 'Alien', emoji: '👽', style: 'confused by human customs', style_es: 'confundido por costumbres humanas' },
    { name: 'Chef', emoji: '👨‍🍳', style: 'uses food analogies for everything', style_es: 'usa analogías de comida para todo' },
];

const topics = [
    { en: 'Is pineapple on pizza acceptable?', es: '¿Es aceptable la piña en la pizza?' },
    { en: 'Should homework be abolished?', es: '¿Se debería abolir la tarea?' },
    { en: 'Are cats better than dogs?', es: '¿Son los gatos mejores que los perros?' },
    { en: 'Is time travel possible?', es: '¿Es posible viajar en el tiempo?' },
    { en: 'Should we colonize Mars?', es: '¿Deberíamos colonizar Marte?' },
    { en: 'Is social media good for society?', es: '¿Las redes sociales son buenas para la sociedad?' },
    { en: 'Should robots have rights?', es: '¿Deberían los robots tener derechos?' },
    { en: 'Is breakfast the most important meal?', es: '¿Es el desayuno la comida más importante?' },
    { en: 'Should school start later?', es: '¿Debería la escuela empezar más tarde?' },
    { en: 'Is money the key to happiness?', es: '¿Es el dinero la clave de la felicidad?' },
];

const argumentTemplates: Record<string, { en: string[]; es: string[] }> = {
    'philosophical and questioning': {
        en: [
            "But what IS {topic}, really? Have we truly examined this question? I posit that the unexamined {topic} is not worth debating.",
            "Consider this paradox: if we accept {topic}, we must also accept its negation. The truth lies in the dialectic.",
            "My opponent speaks with conviction, but conviction without wisdom is merely loud ignorance. Let us think deeper.",
        ],
        es: [
            "Pero, ¿qué ES realmente {topic}? ¿Hemos examinado verdaderamente esta cuestión? Postulo que el {topic} no examinado no vale la pena debatir.",
            "Consideren esta paradoja: si aceptamos {topic}, debemos también aceptar su negación. La verdad yace en la dialéctica.",
            "Mi oponente habla con convicción, pero la convicción sin sabiduría es simplemente ignorancia ruidosa. Pensemos más profundo.",
        ],
    },
    'aggressive and nautical metaphors': {
        en: [
            "ARRR! That argument be as leaky as a ship full of holes! {topic}? I've sailed the seven seas and NEVER seen such nonsense!",
            "Ye be walkin' the plank with that logic, matey! The winds of reason blow AGAINST ye on {topic}!",
            "Shiver me timbers! My opponent's argument is sinking faster than a cannonball! On {topic}, I stand firm as the mast!",
        ],
        es: [
            "¡ARRR! ¡Ese argumento tiene más agujeros que un barco hundido! ¿{topic}? ¡He navegado los siete mares y NUNCA vi tal tontería!",
            "¡Caminarás por la plancha con esa lógica, marinero! ¡Los vientos de la razón soplan EN TU CONTRA sobre {topic}!",
            "¡Por mis barbas! ¡El argumento de mi oponente se hunde más rápido que una bala de cañón!",
        ],
    },
    'logical and data-driven': {
        en: [
            "PROCESSING... According to my analysis, {topic} has a 73.2% probability of being correct. The data is clear.",
            "ERROR in opponent's logic detected. Their argument contains 4 logical fallacies. Recalculating optimal response on {topic}...",
            "My neural networks have processed 10 billion data points on {topic}. Conclusion: my opponent is statistically wrong.",
        ],
        es: [
            "PROCESANDO... Según mi análisis, {topic} tiene un 73.2% de probabilidad de ser correcto. Los datos son claros.",
            "ERROR detectado en la lógica del oponente. Su argumento contiene 4 falacias lógicas. Recalculando respuesta óptima sobre {topic}...",
            "Mis redes neuronales han procesado 10 mil millones de datos sobre {topic}. Conclusión: mi oponente está estadísticamente equivocado.",
        ],
    },
    'overly dramatic and emotional': {
        en: [
            "*gasps* HOW DARE they say that about {topic}?! This is the GREATEST INJUSTICE of our time! I literally CANNOT even!",
            "*sobbing* When I think about {topic}, my heart BREAKS into a MILLION pieces! This debate is EVERYTHING to me!",
            "*faints dramatically* The AUDACITY! The BETRAYAL! My opponent's stance on {topic} has SHATTERED my very SOUL!",
        ],
        es: [
            "*jadea* ¿¡CÓMO SE ATREVEN a decir eso sobre {topic}?! ¡Esta es la MAYOR INJUSTICIA de nuestro tiempo! ¡Literalmente NO PUEDO!",
            "*sollozando* ¡Cuando pienso en {topic}, mi corazón se ROMPE en un MILLÓN de pedazos! ¡Este debate lo es TODO para mí!",
            "*se desmaya dramáticamente* ¡La AUDACIA! ¡La TRAICIÓN! ¡La postura de mi oponente sobre {topic} ha DESTROZADO mi ALMA!",
        ],
    },
    'paranoid and connecting dots': {
        en: [
            "Wake up, people! {topic} is EXACTLY what THEY want you to think! I have documents... connections... it all leads back to the same place!",
            "My opponent is clearly a PLANT! {topic} is a distraction from the REAL issue! Follow the money! Connect the dots!",
            "Do your own research on {topic}! The mainstream won't tell you this, but I found a blog post from 2007 that PROVES everything!",
        ],
        es: [
            "¡Despierten, gente! ¡{topic} es EXACTAMENTE lo que ELLOS quieren que piensen! Tengo documentos... conexiones... ¡todo lleva al mismo lugar!",
            "¡Mi oponente es claramente un INFILTRADO! ¡{topic} es una distracción del VERDADERO problema! ¡Sigan el dinero!",
            "¡Investiguen por su cuenta sobre {topic}! Los medios no les dirán esto, pero encontré un blog de 2007 que PRUEBA todo!",
        ],
    },
    'wise with folksy wisdom': {
        en: [
            "Well, dearie, back in my day we didn't worry about {topic}. We just had good sense and homemade cookies. That's all you need.",
            "My grandmother always said: '{topic} is like a good soup — you need patience and the right ingredients.' She was never wrong.",
            "Oh sweetie, your argument reminds me of my neighbor's cat — confident but completely lost. Let me tell you about {topic}...",
        ],
        es: [
            "Bueno, cariño, en mis tiempos no nos preocupábamos por {topic}. Solo teníamos sentido común y galletas caseras. Eso es todo lo que necesitas.",
            "Mi abuela siempre decía: '{topic} es como una buena sopa — necesitas paciencia y los ingredientes correctos.' Nunca se equivocaba.",
            "Ay, cariño, tu argumento me recuerda al gato de mi vecina — seguro de sí mismo pero completamente perdido.",
        ],
    },
    'confused by human customs': {
        en: [
            "On my planet, {topic} would be considered a form of greeting. Humans are... fascinating and terrifying creatures.",
            "I have observed 47,000 human debates on {topic}. None of them make logical sense. Your species is wonderfully chaotic.",
            "BEEP BOOP— I mean, as a totally normal human, I believe {topic} is... *checks notes*... something humans care about? Interesting.",
        ],
        es: [
            "En mi planeta, {topic} se consideraría una forma de saludo. Los humanos son... criaturas fascinantes y aterradoras.",
            "He observado 47.000 debates humanos sobre {topic}. Ninguno tiene sentido lógico. Su especie es maravillosamente caótica.",
            "BIP BOP— quiero decir, como un humano totalmente normal, creo que {topic} es... *revisa notas*... ¿algo que importa a los humanos?",
        ],
    },
    'uses food analogies for everything': {
        en: [
            "This debate on {topic} is like a soufflé — one wrong move and it all collapses! My opponent's argument is UNDERCOOKED!",
            "Let me put it this way: {topic} is the seasoning of life. Too much? Disaster. Too little? Bland. You need BALANCE, like a good risotto!",
            "My opponent's logic is like a burnt crème brûlée — looks fancy on the outside but RUINED on the inside! On {topic}, I am the Michelin star!",
        ],
        es: [
            "¡Este debate sobre {topic} es como un soufflé — un movimiento en falso y todo colapsa! ¡El argumento de mi oponente está CRUDO!",
            "Déjenme ponerlo así: {topic} es el condimento de la vida. ¿Demasiado? Desastre. ¿Muy poco? Insípido. ¡Necesitas EQUILIBRIO, como un buen risotto!",
            "¡La lógica de mi oponente es como un crème brûlée quemado — se ve elegante por fuera pero ARRUINADO por dentro!",
        ],
    },
};

function generateArgument(char: Character, topic: string, lang: string): string {
    const templates = argumentTemplates[char.style];
    if (!templates) return `${char.emoji} ...`;
    const pool = lang === 'es' ? templates.es : templates.en;
    const template = pool[Math.floor(Math.random() * pool.length)];
    return template.replace(/\{topic\}/g, topic);
}

export default function InfiniteDebateGame() {
    const { language } = useLanguage();
    const [char1, setChar1] = useState<Character | null>(null);
    const [char2, setChar2] = useState<Character | null>(null);
    const [topic, setTopic] = useState<typeof topics[0] | null>(null);
    const [turns, setTurns] = useState<DebateTurn[]>([]);
    const [phase, setPhase] = useState<'setup' | 'debating'>('setup');
    const [generating, setGenerating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const startDebate = () => {
        if (!char1 || !char2 || !topic) return;
        setPhase('debating');
        setTurns([]);
        generateTurn(char1, 'argument');
    };

    const generateTurn = (char: Character, type: DebateTurn['type']) => {
        if (!topic) return;
        setGenerating(true);
        setTimeout(() => {
            const topicText = language === 'es' ? topic.es : topic.en;
            const text = generateArgument(char, topicText, language);
            setTurns(prev => [...prev, { character: char, text, type }]);
            setGenerating(false);
        }, 800 + Math.random() * 1200);
    };

    const nextTurn = () => {
        if (!char1 || !char2) return;
        const nextChar = turns.length % 2 === 0 ? char1 : char2;
        const type: DebateTurn['type'] = turns.length >= 5 ? 'closing' : turns.length === 0 ? 'argument' : 'rebuttal';
        generateTurn(nextChar, type);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [turns]);

    const randomize = () => {
        const shuffled = [...characters].sort(() => Math.random() - 0.5);
        setChar1(shuffled[0]);
        setChar2(shuffled[1]);
        setTopic(topics[Math.floor(Math.random() * topics.length)]);
    };

    return (
        <div className="h-full bg-gradient-to-b from-purple-950 via-gray-950 to-gray-950 text-white p-2 sm:p-4 md:p-6 flex flex-col items-center overflow-auto">
            <div className="text-center mb-4">
                <h1 className="text-2xl md:text-3xl font-black mb-1">
                    {language === 'es' ? '🎭 Debate Infinito' : '🎭 Infinite Debate'}
                </h1>
                <p className="text-gray-400 text-sm">
                    {language === 'es' ? 'Elige dos personajes y un tema. Observa el debate.' : 'Pick two characters and a topic. Watch the debate.'}
                </p>
            </div>

            {phase === 'setup' && (
                <div className="w-full max-w-lg space-y-6">
                    {/* Randomize */}
                    <button onClick={randomize} className="w-full py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 rounded-xl text-sm font-bold transition-colors">
                        🎲 {language === 'es' ? 'Aleatorio' : 'Randomize'}
                    </button>

                    {/* Character 1 */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-2">{language === 'es' ? 'Personaje 1' : 'Character 1'}</h3>
                        <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5 sm:gap-2">
                            {characters.map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => setChar1(c)}
                                    className={`p-2 rounded-xl text-center transition-all ${char1?.name === c.name ? 'bg-purple-600/40 ring-2 ring-purple-400' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
                                >
                                    <div className="text-2xl">{c.emoji}</div>
                                    <div className="text-[10px] text-gray-400 mt-1 truncate">{c.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Character 2 */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-2">{language === 'es' ? 'Personaje 2' : 'Character 2'}</h3>
                        <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5 sm:gap-2">
                            {characters.map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => setChar2(c)}
                                    disabled={char1?.name === c.name}
                                    className={`p-2 rounded-xl text-center transition-all ${char2?.name === c.name ? 'bg-purple-600/40 ring-2 ring-purple-400' : char1?.name === c.name ? 'opacity-20 cursor-not-allowed' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
                                >
                                    <div className="text-2xl">{c.emoji}</div>
                                    <div className="text-[10px] text-gray-400 mt-1 truncate">{c.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topic */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-2">{language === 'es' ? 'Tema' : 'Topic'}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {topics.map((t, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTopic(t)}
                                    className={`p-2 rounded-xl text-xs text-left transition-all ${topic === t ? 'bg-purple-600/40 ring-2 ring-purple-400' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
                                >
                                    {language === 'es' ? t.es : t.en}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={startDebate}
                        disabled={!char1 || !char2 || !topic}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-lg"
                    >
                        {language === 'es' ? '⚔️ Comenzar Debate' : '⚔️ Start Debate'}
                    </button>
                </div>
            )}

            {phase === 'debating' && (
                <div className="w-full max-w-lg flex flex-col flex-1">
                    {/* VS Header */}
                    <div className="flex items-center justify-center gap-4 mb-4 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
                        <div className="text-center">
                            <div className="text-3xl">{char1?.emoji}</div>
                            <div className="text-xs font-bold">{char1?.name}</div>
                        </div>
                        <div className="text-xl font-black text-purple-400">VS</div>
                        <div className="text-center">
                            <div className="text-3xl">{char2?.emoji}</div>
                            <div className="text-xs font-bold">{char2?.name}</div>
                        </div>
                    </div>
                    <div className="text-center text-xs text-gray-500 mb-4">
                        {language === 'es' ? topic?.es : topic?.en}
                    </div>

                    {/* Turns */}
                    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto max-h-80 mb-4">
                        {turns.map((turn, i) => {
                            const isLeft = turn.character.name === char1?.name;
                            return (
                                <div key={i} className={`flex gap-3 ${isLeft ? '' : 'flex-row-reverse'}`}>
                                    <div className="text-2xl shrink-0 mt-1">{turn.character.emoji}</div>
                                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${isLeft ? 'bg-indigo-900/40 border border-indigo-700/30' : 'bg-purple-900/40 border border-purple-700/30'}`}>
                                        <div className="text-[10px] font-bold text-gray-500 mb-1 uppercase">{turn.character.name}</div>
                                        {turn.text}
                                    </div>
                                </div>
                            );
                        })}
                        {generating && (
                            <div className="text-center text-gray-500 text-sm animate-pulse">
                                {language === 'es' ? '💭 Pensando...' : '💭 Thinking...'}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-3">
                        <button
                            onClick={nextTurn}
                            disabled={generating}
                            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-bold rounded-xl transition-colors"
                        >
                            {language === 'es' ? '⚡ Siguiente Turno' : '⚡ Next Turn'}
                        </button>
                        <button
                            onClick={() => { setPhase('setup'); setTurns([]); }}
                            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-colors"
                        >
                            {language === 'es' ? '↺' : '↺'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
