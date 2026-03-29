/**
 * NeonAlley — immersive bowling alley environment with neon lighting.
 *
 * Creates the dark, moody interior reminiscent of Rowans bowling:
 * side walls with neon strip lights, ceiling with spots, back wall
 * with neon signage glow, and polished floor reflections.
 */

"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { LANE_LENGTH, LANE_WIDTH, GUTTER_WIDTH } from "@/lib/physics";

const ALLEY_WIDTH = LANE_WIDTH + GUTTER_WIDTH * 2 + 4; // extra space on sides
const ALLEY_HEIGHT = 6;
const TOTAL_WIDTH = LANE_WIDTH + GUTTER_WIDTH * 2;

/* ── Neon tube mesh ─────────────────────────────────────── */

function NeonTube({
  position,
  rotation = [0, 0, 0],
  length = 2,
  color = "#ff0033",
  intensity = 2,
  radius = 0.03,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  color?: string;
  intensity?: number;
  radius?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Glowing tube core */}
      <mesh>
        <cylinderGeometry args={[radius, radius, length, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Outer glow halo */}
      <mesh>
        <cylinderGeometry args={[radius * 3, radius * 3, length, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} toneMapped={false} />
      </mesh>
      {/* Point light for scene illumination */}
      <pointLight color={color} intensity={intensity} distance={8} decay={2} />
    </group>
  );
}

/* ── Animated neon sign behind pins ─────────────────────── */

function NeonSign() {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      // Subtle flicker effect
      mat.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 3) * 0.1 +
        Math.sin(clock.getElapsedTime() * 7.3) * 0.05;
    }
  });

  return (
    <group position={[0, 3.5, -LANE_LENGTH / 2 - 1.5]}>
      {/* "ROWANS" text panel glow */}
      <mesh ref={glowRef}>
        <planeGeometry args={[3, 0.8]} />
        <meshBasicMaterial color="#00ccff" transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Backing plate */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[3.2, 1]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      {/* TENPIN BOWL sub-sign */}
      <mesh position={[0, -0.8, 0]}>
        <planeGeometry args={[2.4, 0.5]} />
        <meshBasicMaterial color="#ff0033" transparent opacity={0.5} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Neon glow light */}
      <pointLight color="#00ccff" intensity={4} distance={10} decay={2} />
      <pointLight color="#ff0033" intensity={2} distance={8} decay={2} position={[0, -0.8, 0.5]} />
    </group>
  );
}

/* ── Floor beyond lane ──────────────────────────────────── */

function AlleyFloor() {
  return (
    <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[ALLEY_WIDTH, LANE_LENGTH + 10]} />
      <meshStandardMaterial
        color="#080810"
        roughness={0.3}
        metalness={0.6}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

/* ── Side walls ─────────────────────────────────────────── */

function SideWalls() {
  const wallMaterial = (
    <meshStandardMaterial color="#0a0a12" roughness={0.8} metalness={0.2} />
  );

  const halfW = ALLEY_WIDTH / 2;

  return (
    <>
      {/* Left wall */}
      <mesh position={[-halfW, ALLEY_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.15, ALLEY_HEIGHT, LANE_LENGTH + 10]} />
        {wallMaterial}
      </mesh>
      {/* Right wall */}
      <mesh position={[halfW, ALLEY_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.15, ALLEY_HEIGHT, LANE_LENGTH + 10]} />
        {wallMaterial}
      </mesh>
      {/* Back wall */}
      <mesh position={[0, ALLEY_HEIGHT / 2, -LANE_LENGTH / 2 - 2]}>
        <boxGeometry args={[ALLEY_WIDTH + 0.3, ALLEY_HEIGHT, 0.15]} />
        {wallMaterial}
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, ALLEY_HEIGHT, 0]}>
        <boxGeometry args={[ALLEY_WIDTH + 0.3, 0.15, LANE_LENGTH + 10]} />
        <meshStandardMaterial color="#050508" roughness={0.95} />
      </mesh>
    </>
  );
}

/* ── Neon strip lights along walls ──────────────────────── */

function NeonStrips() {
  const halfW = ALLEY_WIDTH / 2 - 0.2;

  return (
    <>
      {/* Left wall — red neon strips */}
      <NeonTube position={[-halfW, 1.5, 2]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#ff0033" intensity={1.5} />
      <NeonTube position={[-halfW, 1.5, -2]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#ff0033" intensity={1.5} />
      <NeonTube position={[-halfW, 1.5, -6]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#ff0033" intensity={1.5} />
      {/* Left wall — vertical accent */}
      <NeonTube position={[-halfW, 2.5, 0]} length={3} color="#ff0033" intensity={0.8} />

      {/* Right wall — cyan neon strips */}
      <NeonTube position={[halfW, 1.5, 2]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#00ccff" intensity={1.5} />
      <NeonTube position={[halfW, 1.5, -2]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#00ccff" intensity={1.5} />
      <NeonTube position={[halfW, 1.5, -6]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#00ccff" intensity={1.5} />
      {/* Right wall — vertical accent */}
      <NeonTube position={[halfW, 2.5, 0]} length={3} color="#00ccff" intensity={0.8} />

      {/* Ceiling runner lights — warm overhead */}
      <NeonTube position={[0, ALLEY_HEIGHT - 0.3, 4]} rotation={[Math.PI / 2, 0, 0]} length={0.6} color="#ffaa44" intensity={1} radius={0.02} />
      <NeonTube position={[0, ALLEY_HEIGHT - 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.6} color="#ffaa44" intensity={1} radius={0.02} />
      <NeonTube position={[0, ALLEY_HEIGHT - 0.3, -4]} rotation={[Math.PI / 2, 0, 0]} length={0.6} color="#ffaa44" intensity={1} radius={0.02} />
    </>
  );
}

/* ── Overhead pin spotlights ────────────────────────────── */

function PinSpotlights() {
  return (
    <>
      {/* Main pin spot — dramatic overhead */}
      <spotLight
        position={[0, ALLEY_HEIGHT - 0.5, -LANE_LENGTH / 2 + 2]}
        target-position={[0, 0, -LANE_LENGTH / 2 + 2]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Approach area spot */}
      <spotLight
        position={[0, ALLEY_HEIGHT - 0.5, LANE_LENGTH / 2 - 2]}
        target-position={[0, 0, LANE_LENGTH / 2 - 2]}
        angle={Math.PI / 5}
        penumbra={0.6}
        intensity={4}
        color="#eeddcc"
      />
    </>
  );
}

/* ── Main export ────────────────────────────────────────── */

export function NeonAlley() {
  return (
    <group>
      <AlleyFloor />
      <SideWalls />
      <NeonStrips />
      <NeonSign />
      <PinSpotlights />
    </group>
  );
}
