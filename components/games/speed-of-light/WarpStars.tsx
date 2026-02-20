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
                // Move stars towards camera (z-axis) based on speed
                const i3 = i * 3;

                // Base movement + speed boost
                let z = positions[i3 + 2];
                z += delta * (2 + speed * 10);

                // Reset if too close
                if (z > 20) {
                    z = -80;
                    // Respawn x/y randomly to avoid tunnels
                    positions[i3] = (Math.random() - 0.5) * 100;
                    positions[i3 + 1] = (Math.random() - 0.5) * 100;
                }

                positions[i3 + 2] = z;
            }
            ref.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <PointMaterial
                transparent
                vertexColors
                size={0.15}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </points>
    );
}
