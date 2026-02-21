"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense } from "react";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { Vector2 } from "three";
import WarpStars from "./WarpStars";
import Spaceship from "./Spaceship";
import MilestoneMarker from "./MilestoneMarker";
import { useEngineSound } from "./useEngineSound";

interface SceneProps {
    traveling: boolean;
    timeScale: number;
    distanceTraveled: number;
    milestones: any[];
    muted: boolean;
}

export default function Scene({ traveling, timeScale, distanceTraveled, milestones, muted }: SceneProps) {
    // Calculate a visual "warp speed" factor based on timeScale and traveling state
    const warpSpeed = traveling ? Math.min(timeScale, 100) / 2 : 0;

    // Audio Hook
    useEngineSound(traveling, timeScale, muted);

    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 2, 10], fov: 60 }} dpr={[1, 2]}>
                <color attach="background" args={["#000005"]} />

                {/* Global Illumination */}
                <ambientLight intensity={0.5} />
                <hemisphereLight args={["#ffffff", "#000000", 0.5]} />

                {/* Main Key Light */}
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#aaddff" />

                {/* Rim Light for shape definition */}
                <spotLight position={[-10, 10, -10]} angle={0.3} penumbra={1} intensity={1} color="#ff00ff" />

                <Suspense fallback={null}>
                    <WarpStars speed={warpSpeed} />
                    <Spaceship traveling={traveling} />
                    <MilestoneMarker distanceTraveled={distanceTraveled} milestones={milestones} />

                    {/* Post-processing Effects */}
                    <EffectComposer>
                        <Bloom
                            intensity={1.5}
                            luminanceThreshold={0.1}
                            luminanceSmoothing={0.9}
                            mipmapBlur
                        />
                        <ChromaticAberration
                            offset={new Vector2(traveling ? 0.002 : 0.0005, 0.002)}
                        />
                    </EffectComposer>
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={2}
                    maxDistance={30}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.5}
                    autoRotate={!traveling}
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    );
}
