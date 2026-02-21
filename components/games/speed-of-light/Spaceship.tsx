"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

export default function Spaceship({ traveling }: { traveling: boolean }) {
    const shipRef = useRef<Group>(null);
    // Path relative to public folder
    const { scene } = useGLTF("/games/Starship/star-cruiser-x-enigma.glb");

    useFrame((state) => {
        if (shipRef.current) {
            // Floating animation
            shipRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
            shipRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05;

            // Tilt forward when traveling
            const targetRotationX = traveling ? -0.2 : 0;
            shipRef.current.rotation.x += (targetRotationX - shipRef.current.rotation.x) * 0.1;
        }
    });

    return (
        <group ref={shipRef} position={[0, 0, 0]}>
            <primitive
                object={scene}
                scale={1.5}
                rotation={[0, Math.PI, 0]}
            />

            {/* Added engine lights that respond to traveling state */}
            {traveling && (
                <group position={[0, 0, 2]}>
                    <pointLight position={[1, 0, 0]} color="#00ffff" intensity={20} distance={10} />
                    <pointLight position={[-1, 0, 0]} color="#00ffff" intensity={20} distance={10} />
                </group>
            )}
        </group>
    );
}

// Pre-load the model
useGLTF.preload("/games/Starship/star-cruiser-x-enigma.glb");
