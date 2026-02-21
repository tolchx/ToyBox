"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

export default function WarpStars({ speed }: { speed: number }) {
    const ref = useRef<THREE.Points>(null);
    const count = 5000;

    const [positions, colors] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            // Random spread
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            // Color variation
            color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.8); // Blueish
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        return [positions, colors];
    }, [count]);

    useFrame((state, delta) => {
        if (ref.current) {
            // Rotate the star field slowly
            ref.current.rotation.z += delta * 0.05;

            const positions = ref.current.geometry.attributes.position.array as Float32Array;

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                let z = positions[i3 + 2];

                // Move stars towards camera
                // Distribute speeds slightly for depth
                const starSpeed = 2 + speed * 25;
                z += delta * starSpeed;

                // Reset if too close or passed the camera
                if (z > 20) {
                    z = -150 - Math.random() * 50; // Respawn far back with random depth
                    positions[i3] = (Math.random() - 0.5) * 200; // Wider X
                    positions[i3 + 1] = (Math.random() - 0.5) * 200; // Wider Y
                }

                positions[i3 + 2] = z;
            }
            ref.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <group>
            <points ref={ref}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        args={[colors, 3]}
                    />
                </bufferGeometry>
                <PointMaterial
                    transparent
                    vertexColors
                    size={speed > 5 ? 0.05 : 0.15}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Visual speed streaks when going fast */}
            {speed > 10 && (
                <group rotation={[0, 0, 0]}>
                    {/* We could add a more complex line system here, but Bloom will handle the points stretching visually if we use enough of them */}
                </group>
            )}
        </group>
    );
}
