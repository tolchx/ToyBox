"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense } from "react";
import WarpStars from "./WarpStars";
import Spaceship from "./Spaceship";
import MilestoneMarker from "./MilestoneMarker";

interface SceneProps {
    traveling: boolean;
    timeScale: number;
    distanceTraveled: number;
    milestones: any[];
}

export default function Scene({ traveling, timeScale, distanceTraveled, milestones }: SceneProps) {
    // Calculate a visual "warp speed" factor based on timeScale and traveling state
    const warpSpeed = traveling ? Math.min(timeScale, 100) / 2 : 0;

    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
                <color attach="background" args={["#050510"]} />
                {/* Global Illumination */}
                <ambientLight intensity={1.5} />
                <hemisphereLight args={["#ffffff", "#000000", 1]} />

                {/* Main Key Light */}
                <directionalLight position={[10, 10, 5]} intensity={3} color="#aaddff" />

                {/* Rim Light for shape definition */}
                <spotLight position={[-10, 10, -10]} angle={0.3} penumbra={1} intensity={2} color="#ff00ff" />

                {/* Engine Glow Helper Light */}
                <pointLight position={[0, -2, 2]} intensity={1} color="#00ffff" distance={10} />

                <Suspense fallback={null}>
                    <WarpStars speed={warpSpeed} />
                    <Spaceship traveling={traveling} />
                    <MilestoneMarker distanceTraveled={distanceTraveled} milestones={milestones} />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.5}
                    autoRotate={!traveling}
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    );
}
