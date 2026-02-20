"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLanguage } from '@/lib/language';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Cylinder, Box, Sphere, Cloud, Stars } from '@react-three/drei';
import * as THREE from 'three';

type Weather = 'sunny' | 'rain' | 'storm' | 'tornado' | 'ufo' | 'snow';
type Mood = 'happy' | 'neutral' | 'scared' | 'panicked';

interface Citizen {
    id: number;
    x: number;
    z: number;
    vx: number;
    vz: number;
    mood: Mood;
    emoji: string;
}

const WEATHER_CONFIG: Record<Weather, { label: string; label_es: string; emoji: string; color: string; skyColor: string; fogColor: string }> = {
    sunny: { label: 'Sunny', label_es: 'Soleado', emoji: '☀️', color: '#fbbf24', skyColor: '#87CEEB', fogColor: '#E0F7FA' },
    rain: { label: 'Rain', label_es: 'Lluvia', emoji: '🌧️', color: '#3b82f6', skyColor: '#546E7A', fogColor: '#78909C' },
    storm: { label: 'Storm', label_es: 'Tormenta', emoji: '⛈️', color: '#6366f1', skyColor: '#1a1a2e', fogColor: '#37474F' },
    tornado: { label: 'Tornado', label_es: 'Tornado', emoji: '🌪️', color: '#ef4444', skyColor: '#2d1b1b', fogColor: '#4a2c2c' },
    ufo: { label: 'UFO Invasion', label_es: 'Invasión OVNI', emoji: '🛸', color: '#10b981', skyColor: '#0a1628', fogColor: '#1a2744' },
    snow: { label: 'Blizzard', label_es: 'Ventisca', emoji: '❄️', color: '#67e8f9', skyColor: '#B0BEC5', fogColor: '#CFD8DC' },
};

const CITIZEN_EMOJIS = ['🧑', '👩', '👨', '🧒', '👴', '👵', '🧑‍💼', '👷'];

function createCitizens(count: number): Citizen[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 0.1,
        vz: (Math.random() - 0.5) * 0.1,
        mood: 'happy' as Mood,
        emoji: CITIZEN_EMOJIS[Math.floor(Math.random() * CITIZEN_EMOJIS.length)],
    }));
}

// --- 3D Components ---

function Lighting({ weather }: { weather: Weather }) {
    const config = WEATHER_CONFIG[weather];

    return (
        <>
            <ambientLight intensity={weather === 'storm' || weather === 'ufo' || weather === 'tornado' ? 0.2 : 0.6} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={weather === 'sunny' ? 1.5 : 0.5}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
            {weather === 'storm' && <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" distance={20} decay={2} />}
            <color attach="background" args={[config.skyColor]} />
            <fog attach="fog" args={[config.fogColor, 10, 60]} />
        </>
    );
}

function Ground({ weather }: { weather: Weather }) {
    const color = weather === 'snow' ? '#ffffff' : '#4a7c3f';
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

function CitizenModel({ citizen }: { citizen: Citizen }) {
    const zOffset = useRef(Math.random() * 100);
    const ref = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            // Simple hop animation
            const hop = Math.abs(Math.sin(clock.getElapsedTime() * 5 + zOffset.current)) * 0.2;
            ref.current.position.y = hop;

            // Mood shake
            if (citizen.mood === 'panicked') {
                ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 20) * 0.2;
            } else {
                ref.current.rotation.z = 0;
            }
        }
    });

    return (
        <group position={[citizen.x, 0, citizen.z]} ref={ref}>
            <Text
                position={[0, 0.5, 0]}
                fontSize={0.8}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000000"
            >
                {citizen.emoji}
                {/* Mood indicator */}
                {citizen.mood === 'panicked' && <Html position={[0, 1, 0]}><div className="text-xl">😱</div></Html>}
                {citizen.mood === 'scared' && <Html position={[0, 1, 0]}><div className="text-xl">😨</div></Html>}
            </Text>
            <mesh position={[0, 0.05, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    );
}

function Building({ x, z, h, color }: { x: number, z: number, h: number, color: string }) {
    return (
        <group position={[x, h / 2, z]}>
            <Box args={[2, h, 2]} castShadow receiveShadow>
                <meshStandardMaterial color={color} />
            </Box>
            {/* Windows */}
            {Array.from({ length: Math.floor(h / 1.5) }).map((_, i) => (
                <group key={i} position={[0, -h / 2 + 1 + i * 1.5, 0]}>
                    <Box args={[0.4, 0.6, 2.1]} position={[-0.6, 0, 0]}>
                        <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.5} />
                    </Box>
                    <Box args={[0.4, 0.6, 2.1]} position={[0.6, 0, 0]}>
                        <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.5} />
                    </Box>
                </group>
            ))}
        </group>
    );
}

function City() {
    // Determine static layout
    return (
        <group>
            <Building x={-5} z={-5} h={6} color="#78909C" />
            <Building x={5} z={-5} h={8} color="#8D6E63" />
            <Building x={-5} z={5} h={10} color="#607D8B" />
            <Building x={5} z={5} h={5} color="#795548" />

            <Building x={-12} z={0} h={7} color="#546E7A" />
            <Building x={12} z={0} h={6} color="#8D6E63" />
            <Building x={0} z={12} h={4} color="#A1887F" />
            <Building x={0} z={-12} h={9} color="#455A64" />

            {/* Roads (Visual approximation using flat boxes) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                <planeGeometry args={[40, 4]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.01, 0]} receiveShadow>
                <planeGeometry args={[40, 4]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    );
}

function Rain({ count = 200 }) {
    const drops = useMemo(() => {
        return Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 40,
            y: Math.random() * 20,
            z: (Math.random() - 0.5) * 40,
            speed: 0.5 + Math.random() * 0.5
        }));
    }, [count]);

    const ref = useRef<THREE.Group>(null);

    useFrame(() => {
        if (ref.current) {
            ref.current.children.forEach((mesh: any, i) => {
                mesh.position.y -= drops[i].speed;
                if (mesh.position.y < 0) mesh.position.y = 20;
            });
        }
    });

    return (
        <group ref={ref}>
            {drops.map((d, i) => (
                <mesh key={i} position={[d.x, d.y, d.z]}>
                    <boxGeometry args={[0.05, 0.8, 0.05]} />
                    <meshBasicMaterial color="#a5f3fc" transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    );
}

function Snow({ count = 200 }) {
    const flakes = useMemo(() => {
        return Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 40,
            y: Math.random() * 20,
            z: (Math.random() - 0.5) * 40,
            speed: 0.1 + Math.random() * 0.1,
            wobble: Math.random() * Math.PI
        }));
    }, [count]);

    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (ref.current) {
            ref.current.children.forEach((mesh: any, i) => {
                const flake = flakes[i];
                mesh.position.y -= flake.speed;
                mesh.position.x += Math.sin(state.clock.elapsedTime + flake.wobble) * 0.05;
                if (mesh.position.y < 0) mesh.position.y = 20;
            });
        }
    });

    return (
        <group ref={ref}>
            {flakes.map((d, i) => (
                <mesh key={i} position={[d.x, d.y, d.z]}>
                    <sphereGeometry args={[0.1, 4, 4]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            ))}
        </group>
    );
}

function Tornado() {
    const ref = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.y = clock.getElapsedTime() * 5;
            ref.current.position.x = Math.sin(clock.getElapsedTime() * 0.5) * 10;
            ref.current.position.z = Math.cos(clock.getElapsedTime() * 0.3) * 10;
        }
    });

    return (
        <group ref={ref} position={[0, 0, 0]}>
            {/* Funnel parts */}
            <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[2, 0.1, 4, 8]} />
                <meshStandardMaterial color="#555" transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 5, 0]}>
                <cylinderGeometry args={[4, 1.5, 4, 8]} />
                <meshStandardMaterial color="#666" transparent opacity={0.7} />
            </mesh>
            <mesh position={[0, 8, 0]}>
                <cylinderGeometry args={[6, 3, 4, 8]} />
                <meshStandardMaterial color="#777" transparent opacity={0.6} />
            </mesh>
            {/* Swirling debris */}
            {Array.from({ length: 10 }).map((_, i) => (
                <mesh key={i} position={[Math.random() * 4 - 2, Math.random() * 8, Math.random() * 4 - 2]}>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshStandardMaterial color="#4a4a4a" />
                </mesh>
            ))}
        </group>
    );
}

function Ufo() {
    const ref = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime();
            ref.current.position.x = Math.sin(t) * 8;
            ref.current.position.z = Math.cos(t * 1.3) * 8;
            ref.current.position.y = 10 + Math.sin(t * 2) * 1;
            ref.current.rotation.y = t * 2;
        }
    });

    return (
        <group ref={ref}>
            {/* Ship */}
            <mesh>
                <cylinderGeometry args={[0.5, 2, 0.5]} />
                <meshStandardMaterial color="#555" metallic roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
                <sphereGeometry args={[1.2, 32, 16]} />
                <meshStandardMaterial color="#888" metallic roughness={0.2} />
            </mesh>
            <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[0.8, 32, 16]} />
                <meshStandardMaterial color="#5cc" emissive="#5cc" emissiveIntensity={0.5} transparent opacity={0.8} />
            </mesh>
            {/* Beam */}
            <mesh position={[0, -5, 0]}>
                <cylinderGeometry args={[3, 0.5, 10, 16]} />
                <meshBasicMaterial color="#10b981" transparent opacity={0.2} />
            </mesh>
        </group>
    );
}


export default function ChaosConductorGame() {
    const { language } = useLanguage();
    const [weather, setWeather] = useState<Weather>('sunny');
    const [citizens, setCitizens] = useState<Citizen[]>(() => createCitizens(50));
    const [happiness, setHappiness] = useState(100);
    const [chaos, setChaos] = useState(0);
    const [events, setEvents] = useState<string[]>([]);
    const weatherRef = useRef(weather);

    weatherRef.current = weather;

    const addEvent = useCallback((msg: string) => {
        setEvents(prev => [msg, ...prev].slice(0, 5));
    }, []);

    // Game Logic Loop
    useEffect(() => {
        const moodMap: Record<Weather, Mood> = {
            sunny: 'happy',
            rain: 'neutral',
            storm: 'scared',
            tornado: 'panicked',
            ufo: 'panicked',
            snow: 'neutral',
        };

        const speedMap: Record<Weather, number> = {
            sunny: 0.05,
            rain: 0.1,
            storm: 0.2,
            tornado: 0.3,
            ufo: 0.25,
            snow: 0.02,
        };

        const interval = setInterval(() => {
            // Update stats
            const happinessMap: Record<Weather, number> = { sunny: 2, rain: -1, storm: -3, tornado: -8, ufo: -10, snow: -2 };
            const chaosMap: Record<Weather, number> = { sunny: -3, rain: 1, storm: 5, tornado: 15, ufo: 20, snow: 2 };

            setHappiness(prev => Math.max(0, Math.min(100, prev + happinessMap[weatherRef.current])));
            setChaos(prev => Math.max(0, Math.min(100, prev + chaosMap[weatherRef.current])));

            // Move citizens
            setCitizens(prev => prev.map(c => {
                let vx = c.vx;
                let vz = c.vz;
                const speed = speedMap[weatherRef.current];

                // Change direction randomly
                if (Math.random() < 0.05) {
                    vx = (Math.random() - 0.5) * speed;
                    vz = (Math.random() - 0.5) * speed;
                }

                let nx = c.x + vx;
                let nz = c.z + vz;

                // Bounds check (stay within -20 to 20)
                if (nx < -20 || nx > 20) vx *= -1;
                if (nz < -20 || nz > 20) vz *= -1;

                return {
                    ...c,
                    x: c.x + vx,
                    z: c.z + vz,
                    vx,
                    vz,
                    mood: moodMap[weatherRef.current]
                };
            }));

        }, 1000 / 30); // 30 FPS logic update

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (weather === 'tornado') {
            addEvent(language === 'es' ? '🌪️ ¡Un tornado azota la ciudad!' : '🌪️ A tornado hits the city!');
        } else if (weather === 'ufo') {
            addEvent(language === 'es' ? '🛸 ¡Naves alienígenas detectadas!' : '🛸 Alien ships detected!');
        } else if (weather === 'storm') {
            addEvent(language === 'es' ? '⛈️ Tormenta eléctrica en progreso' : '⛈️ Thunderstorm in progress');
        } else if (weather === 'sunny') {
            addEvent(language === 'es' ? '☀️ Un hermoso día soleado' : '☀️ A beautiful sunny day');
        }
    }, [weather, language, addEvent]);

    return (
        <div className="h-full w-full relative bg-slate-900 border-none">
            {/* UI Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
                <div className="text-center mb-4 pointer-events-auto">
                    <h1 className="text-3xl font-black text-white drop-shadow-md mb-1">
                        {language === 'es' ? '🌪️ Director del Caos 3D' : '🌪️ Chaos Conductor 3D'}
                    </h1>
                    <p className="text-gray-200 text-sm drop-shadow-md">
                        {language === 'es' ? 'Controla el clima. Girar/Zoom con Mouse.' : 'Control the weather. Rotate/Zoom with Mouse.'}
                    </p>
                </div>

                {/* Weather buttons */}
                <div className="flex items-center gap-2 mb-4 flex-wrap justify-center pointer-events-auto">
                    {(Object.entries(WEATHER_CONFIG) as [Weather, typeof WEATHER_CONFIG[Weather]][]).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setWeather(key)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${weather === key
                                    ? 'ring-2 ring-white scale-105 text-white'
                                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-gray-300'
                                }`}
                            style={{ backgroundColor: weather === key ? cfg.color : undefined }}
                        >
                            <span className="text-lg">{cfg.emoji}</span>
                            <span>{language === 'es' ? cfg.label_es : cfg.label}</span>
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-4 mb-4 text-sm font-bold bg-black/30 backdrop-blur-md p-2 rounded-full max-w-md mx-auto pointer-events-auto">
                    <div className="flex items-center gap-2">
                        <span>😊</span>
                        <div className="w-24 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${happiness}%` }} />
                        </div>
                        <span className="text-white w-8">{happiness}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>💥</span>
                        <div className="w-24 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                            <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${chaos}%` }} />
                        </div>
                        <span className="text-white w-8">{chaos}%</span>
                    </div>
                    <span className="text-white bg-slate-700 px-2 py-0.5 rounded-md">👥 {citizens.length}</span>
                </div>
            </div>

            {/* Event Log */}
            <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none flex flex-col items-center">
                <div className="w-full max-w-md space-y-1">
                    {events.map((evt, i) => (
                        <div key={i} className={`text-sm px-4 py-2 rounded-lg transition-all shadow-md backdrop-blur-sm pointer-events-auto ${i === 0 ? 'bg-slate-900/90 text-white scale-105 border-l-4 border-indigo-500' : 'bg-slate-800/60 text-gray-400 scale-95 opacity-70'}`}>
                            {evt}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3D Scene */}
            <Canvas shadows camera={{ position: [20, 20, 20], fov: 45 }}>
                <Lighting weather={weather} />
                <Ground weather={weather} />
                <City />

                {citizens.map(c => (
                    <CitizenModel key={c.id} citizen={c} />
                ))}

                {(weather === 'rain' || weather === 'storm') && <Rain />}
                {(weather === 'snow') && <Snow />}
                {weather === 'tornado' && <Tornado />}
                {weather === 'ufo' && <Ufo />}

                <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} maxDistance={60} minDistance={10} />
            </Canvas>
        </div>
    );
}
