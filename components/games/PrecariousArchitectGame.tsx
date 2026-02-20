"use client";

import { useState, useEffect, useRef, useMemo, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { OrbitControls, Text, Stars, Cloud, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from '@/lib/language';
import GameResultModal from '@/components/GameResultModal';

// --- Constants & Types ---
// Adjust scale:  1 unit = approx 10 pixels in original?
// Original: Width 400. Blocks 25-100 wide. 
// 3D: Platform 40 wide. Blocks 2.5 - 10 wide.
const SCENE_WIDTH = 40;
const PLATFORM_Y = -10;
const SPAWN_Y = 15;
const MAX_HEIGHT_3D = 30; // Approx target height

// Colors for blocks
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

interface BlockData {
    id: number;
    width: number;
    height: number;
    depth: number;
    color: string;
    x: number;
    y: number;
    z: number;
}

// --- Components ---

function Ground() {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, PLATFORM_Y, 0],
        type: 'Static',
        material: { friction: 1, restitution: 0.1 }
    }));

    return (
        <group>
            {/* Visual Ground */}
            <mesh ref={ref as any} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#4a5568" />
            </mesh>
            {/* Platform Marker */}
            <mesh position={[0, PLATFORM_Y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[SCENE_WIDTH, 10]} />
                <meshStandardMaterial color="#2d3748" />
            </mesh>
        </group>
    );
}

function Block({ data }: { data: BlockData }) {
    const [ref] = useBox(() => ({
        mass: 1,
        position: [data.x, data.y, data.z],
        args: [data.width, data.height, data.depth],
        material: { friction: 0.8, restitution: 0.2 } // High friction, low bounce
    }));

    return (
        <mesh ref={ref as any} castShadow receiveShadow>
            <boxGeometry args={[data.width, data.height, data.depth]} />
            <meshStandardMaterial color={data.color} />
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(data.width, data.height, data.depth)]} />
                <lineBasicMaterial color="rgba(0,0,0,0.3)" />
            </lineSegments>
        </mesh>
    );
}

// Component to handle the swinging block (Kinematic/Visual only)
function CurrentBlock({
    data,
    onDrop,
    isGameOver
}: {
    data: BlockData,
    onDrop: (x: number) => void,
    isGameOver: boolean
}) {
    const ref = useRef<THREE.Mesh>(null);
    const time = useRef(0);
    const { camera } = useThree();

    useFrame((state, delta) => {
        if (isGameOver || !ref.current) return;

        time.current += delta * 2; // Swing speed
        // Swing range: +/- 15 units
        const x = Math.sin(time.current) * 15;

        ref.current.position.x = x;
        ref.current.position.y = SPAWN_Y;
        ref.current.position.z = 0;
    });

    const handleClick = (e: any) => {
        e.stopPropagation(); // Prevent clicking through to other things
        if (isGameOver || !ref.current) return;
        onDrop(ref.current.position.x);
    };

    // Add a global click listener for the canvas area via this component since it's always there
    useEffect(() => {
        const handleGlobalClick = () => {
            if (isGameOver || !ref.current) return;
            onDrop(ref.current.position.x);
        }
        // This is a bit hacky, but the canvas handles pointer events. 
        // We can attach a listener to the window or just use the mesh's onClick 
        // using a large transparent plane might be better for mobile/easy clicking
    }, []);

    return (
        <group>
            {/* The swinging block */}
            <mesh ref={ref} castShadow>
                <boxGeometry args={[data.width, data.height, data.depth]} />
                <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={0.2} />
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(data.width, data.height, data.depth)]} />
                    <lineBasicMaterial color="white" />
                </lineSegments>
            </mesh>

            {/* A rope visual */}
            <mesh position={[0, SPAWN_Y + 10, 0]}>
                {/* Logic to draw a line from top center to block would go here, simplified for now */}
            </mesh>

            {/* Clickable area catcher */}
            <mesh
                position={[0, 0, 0]}
                visible={false}
                onClick={handleClick}
            >
                <planeGeometry args={[100, 100]} />
            </mesh>
        </group>
    );
}

function GameScene({
    blocks,
    currentBlockData,
    onDrop,
    isGameOver
}: {
    blocks: BlockData[],
    currentBlockData: BlockData | null,
    onDrop: (x: number) => void,
    isGameOver: boolean
}) {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={1}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
            {/* <spotLight position={[-10, 20, 5]} intensity={0.5} angle={0.5} /> */}

            <Environment preset="night" />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <Physics gravity={[0, -15, 0]}> {/* Stronger gravity for snappy feel */}
                <Ground />
                {blocks.map(b => (
                    <Block key={b.id} data={b} />
                ))}
            </Physics>

            {currentBlockData && (
                <CurrentBlock
                    data={currentBlockData}
                    onDrop={onDrop}
                    isGameOver={isGameOver}
                />
            )}
        </>
    );
}

// --- Main Game Component ---

export default function PrecariousArchitectGame() {
    const { language } = useLanguage();

    // Game State
    const [blocks, setBlocks] = useState<BlockData[]>([]);
    const [currentBlock, setCurrentBlock] = useState<BlockData | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);

    // Initial Spawn
    const spawnNext = useCallback(() => {
        const width = 3 + Math.random() * 4; // 3 to 7
        const height = 1 + Math.random() * 2; // 1 to 3
        const depth = 3 + Math.random() * 2;  // 3 to 5

        setCurrentBlock({
            id: Date.now(),
            width,
            height,
            depth,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            x: 0,
            y: SPAWN_Y,
            z: 0
        });
    }, []);

    useEffect(() => {
        if (!currentBlock && !gameOver) {
            spawnNext();
        }
    }, [currentBlock, gameOver, spawnNext]);

    const handleDrop = (x: number) => {
        if (!currentBlock || gameOver) return;

        // Convert current block to a rigid body block
        const newBlock = {
            ...currentBlock,
            x: x,
            y: SPAWN_Y
        };

        setBlocks(prev => [...prev, newBlock]);
        setCurrentBlock(null); // Will trigger spawnNext via useEffect

        // Update score
        setScore(prev => prev + 1);

        // Wait a bit before checking for game over conditions in a real loop, 
        // but for now we just rely on the user seeing it fall

        setTimeout(() => {
            // In a full physics engine integration we'd check standard deviation of positions or collision events
            // For this simplified version, we just let them pile up.
        }, 1000);
    };

    const handleRestart = () => {
        setBlocks([]);
        setCurrentBlock(null);
        setGameOver(false);
        setGameWon(false);
        setScore(0);
        // spawnNext will be triggered by useEffect
    };

    // Height Checker (Simplified for now - strictly visuals + simple count)
    // A robust version would need to subscribe to cannon physics positions.
    // For this demo, we assume if you drop 20 blocks without resetting, you're doing well,
    // or we could add a "height" heuristic based on count * average height.
    const towerHeight = useMemo(() => {
        // Estimate height
        // Base is -10. Each block is ~2 units high.
        return Math.floor(blocks.length * 0.8);
    }, [blocks.length]);

    // Check Loss Condition (Manual Trigger for now or simple limit)
    const endGame = (won: boolean) => {
        setGameOver(true);
        setGameWon(won);
        if (score > best) setBest(score);
    };

    return (
        <div className="h-full w-full bg-gradient-to-b from-indigo-950 to-gray-950 text-white flex flex-col relative overflow-hidden">
            {/* Header UI */}
            <div className="absolute top-0 left-0 right-0 p-4 z-10 flex flex-col items-center pointer-events-none">
                <h1 className="text-2xl md:text-3xl font-black mb-1 drop-shadow-md">
                    {language === 'es' ? '🏗️ Arquitecto Precario 3D' : '🏗️ Precarious Architect 3D'}
                </h1>
                <div className="flex gap-4 text-sm font-bold bg-black/30 p-2 rounded-lg backdrop-blur-sm">
                    <span>{language === 'es' ? 'Bloques' : 'Blocks'}: {score}</span>
                    {/* <span>{language === 'es' ? 'Altura' : 'Height'}: {towerHeight}</span> */}
                    <span>{language === 'es' ? 'Mejor' : 'Best'}: {best}</span>
                </div>
                {/* Manual Game Over Button for when things fall over (since tracking physics state is complex in this setup) */}
                <button
                    className="mt-2 pointer-events-auto bg-red-500/80 hover:bg-red-600 px-3 py-1 rounded text-xs transition"
                    onClick={() => endGame(false)}
                >
                    {language === 'es' ? 'Derrumbar / Reiniciar' : 'Collapse / Restart'}
                </button>
            </div>

            {/* 3D Scene */}
            <div className="flex-1 w-full h-full cursor-pointer">
                <Canvas shadows camera={{ position: [0, 5, 40], fov: 45 }}>
                    <Suspense fallback={null}>
                        <GameScene
                            blocks={blocks}
                            currentBlockData={currentBlock}
                            onDrop={handleDrop}
                            isGameOver={gameOver}
                        />
                        {/* Camera Controls - restricted to keep game view but allow some looking around */}
                        <OrbitControls
                            enablePan={false}
                            minPolarAngle={Math.PI / 4}
                            maxPolarAngle={Math.PI / 1.8}
                            minAzimuthAngle={-Math.PI / 8}
                            maxAzimuthAngle={Math.PI / 8}
                            maxDistance={60}
                            minDistance={20}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Modal */}
            {gameOver && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <GameResultModal
                        isOpen={gameOver}
                        onClose={() => { }}
                        onRestart={handleRestart}
                        title={gameWon ? "Maximum Height Reached!" : "Tower Collapsed!"}
                        title_es={gameWon ? "¡Altura máxima alcanzada!" : "¡Torre derrumbada!"}
                        message={gameWon
                            ? "Congratulations! You've reached the maximum tower height!"
                            : "Your tower has collapsed. Try again to build a more stable structure!"
                        }
                        message_es={gameWon
                            ? "¡Felicidades! ¡Has alcanzado la altura máxima de la torre!"
                            : "Tu torre se ha derrumbado. ¡Intenta de nuevo construir una estructura más estable!"
                        }
                        score={score}
                        best={best}
                        scoreLabel={language === 'es' ? 'Bloques' : 'Blocks'}
                        scoreLabel_es={language === 'es' ? 'Bloques' : 'Blocks'}
                        bestLabel={language === 'es' ? 'Mejor' : 'Best'}
                        bestLabel_es={language === 'es' ? 'Mejor' : 'Best'}
                        icon={gameWon ? '🏆' : '💥'}
                        isSuccess={gameWon}
                    />
                </div>
            )}
        </div>
    );
}
