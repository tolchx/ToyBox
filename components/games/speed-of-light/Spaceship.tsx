"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

export default function Spaceship({ traveling }: { traveling: boolean }) {
    const shipRef = useRef<Group>(null);

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
            <group rotation={[-Math.PI / 2, 0, 0]}>
                {/* Main Hull */}
                <mesh position={[0, 0, 0]}>
                    <coneGeometry args={[1, 4, 8]} />
                    <meshStandardMaterial
                        color="#e0e0e0"
                        roughness={0.2}
                        metalness={0.6}
                        emissive="#111111"
                        emissiveIntensity={0.2}
                    />
                </mesh>

                {/* Cockpit */}
                <mesh position={[0, 0.5, 0.5]}>
                    <capsuleGeometry args={[0.3, 1, 4, 8]} />
                    <meshStandardMaterial
                        color="#00aaff"
                        emissive="#0044aa"
                        emissiveIntensity={2}
                        roughness={0.1}
                        metalness={0.9}
                        transparent
                        opacity={0.9}
                    />
                </mesh>

                {/* Wings */}
                <mesh position={[1.2, -1, 0.5]} rotation={[0, 0, -0.5]}>
                    <boxGeometry args={[2, 0.1, 1]} />
                    <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
                </mesh>
                <mesh position={[-1.2, -1, 0.5]} rotation={[0, 0, 0.5]}>
                    <boxGeometry args={[2, 0.1, 1]} />
                    <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
                </mesh>

                {/* Engine Glows */}
                {traveling && (
                    <group position={[0, -2.5, 0]}>
                        <mesh>
                            <coneGeometry args={[0.5, 2, 8, 1, true]} />
                            <meshBasicMaterial color="#00ffff" transparent opacity={0.5} depthWrite={false} blending={2} />
                        </mesh>
                    </group>
                )}

                {/* Engines */}
                <group position={[0.8, -1.2, 1]}>
                    <mesh>
                        <cylinderGeometry args={[0.3, 0.5, 1, 16]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[0, -0.5, 0]}>
                        <cylinderGeometry args={[0.2, 0.1, 0.2, 16]} />
                        <meshBasicMaterial color="#00ffff" toneMapped={false} />
                    </mesh>
                    {traveling && (
                        <pointLight position={[0, -1, 0]} color="#00ffff" intensity={5} distance={10} />
                    )}
                </group>
                <group position={[-0.8, -1.2, 1]}>
                    <mesh>
                        <cylinderGeometry args={[0.3, 0.5, 1, 16]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>
                    <mesh position={[0, -0.5, 0]}>
                        <cylinderGeometry args={[0.2, 0.1, 0.2, 16]} />
                        <meshBasicMaterial color="#00ffff" />
                    </mesh>
                    {traveling && (
                        <pointLight position={[0, -1, 0]} color="#00ffff" intensity={2} distance={5} />
                    )}
                </group>
            </group>
        </group>
    );
}
