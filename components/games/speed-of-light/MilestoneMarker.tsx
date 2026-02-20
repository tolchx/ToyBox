"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";

interface MilestoneMarkerProps {
    distanceTraveled: number;
    milestones: any[];
}

export default function MilestoneMarker({ distanceTraveled, milestones }: MilestoneMarkerProps) {
    // We only render one "upcoming" or "just passed" milestone dynamically
    // A simplified approach: If a milestone is within visual range, render it.
    // Visual range in this simplified space: let's map distanceKm to some Z-depth check.
    // But since "distanceTraveled" grows infinitely, we can't map it 1:1 to 3D units easily without floating point issues.

    // Alternative: We just show a visual representation (like a planet or sign) passing by 
    // when we cross a milestone threshold.

    // Let's grab the milestone that is closest to current distance.
    const closest = useMemo(() => {
        return milestones.reduce((prev, curr) => {
            return (Math.abs(curr.distanceKm - distanceTraveled) < Math.abs(prev.distanceKm - distanceTraveled) ? curr : prev);
        });
    }, [distanceTraveled, milestones]);

    const groupRef = useRef<THREE.Group>(null);
    const passedRef = useRef<boolean>(false);

    // Logic:
    // If we approach a milestone (distance diff < X), we animate it from -Z to +Z.
    // We need a mapping factor. Real scale is too huge.
    // Let's just say "when within 10% of distance or 100,000km", we start showing it.

    // Simpler visual trick:
    // Just render random "space debris" or objects, AND render specific milestones when the HUD says we passed them?
    // Let's try to animate the specific milestone.

    const diff = closest.distanceKm - distanceTraveled;
    const isVisible = Math.abs(diff) < (closest.distanceKm * 0.5) || Math.abs(diff) < 1000000;

    useFrame(() => {
        if (groupRef.current && isVisible) {
            // Map the difference in km to Z position. 
            // Positive diff (ahead) -> Negative Z (far away)
            // Negative diff (passed) -> Positive Z (behind camera)

            // Scale factor needs to be logarithmic or dynamic because distances vary wildly (Moon vs Pluto).
            // Let's try a fixed visual window. 
            // If it's within "visual range", map that range to -50 -> +10 Z.

            // Visual range definition: +/- 20% of the milestone's own distance?
            const range = Math.max(closest.distanceKm * 0.2, 50000);
            const normalized = -diff / range; // 0 when at milestone

            // Map normalized (-1 to 1) to Z (-50 to 20)
            const zPos = normalized * 50;

            groupRef.current.position.z = zPos;
            groupRef.current.position.x = 2; // Offset to right

            groupRef.current.visible = zPos > -50 && zPos < 20;
        }
    });

    if (!isVisible) return null;

    return (
        <group ref={groupRef}>
            <Text
                fontSize={1}
                color="#facc15"
                anchorX="center"
                anchorY="middle"
                position={[0, 2, 0]}
            >
                {closest.emoji}
            </Text>
            <Text
                fontSize={0.5}
                color="white"
                anchorX="center"
                anchorY="middle"
                position={[0, 1.2, 0]}
            >
                {closest.name}
            </Text>
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="cyan" wireframe />
            </mesh>
        </group>
    );
}
