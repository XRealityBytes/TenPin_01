/**
 * NeonAlley — immersive bowling alley environment with neon lighting.
 *
 * Creates the dark, moody interior reminiscent of Rowans bowling:
 * side walls with neon strip lights, ceiling with spots, back wall
 * with neon signage glow, and polished floor reflections.
 */

"use client";

import { Text } from "@react-three/drei";
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
      <NeonTube position={[-halfW, 1.5, 2]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#ff0033" intensity={3} />
      <NeonTube position={[-halfW, 1.5, -2]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#ff0033" intensity={3} />
      <NeonTube position={[-halfW, 1.5, -6]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#ff0033" intensity={3} />
      {/* Left wall — vertical accent */}
      <NeonTube position={[-halfW, 2.5, 0]} length={3} color="#ff0033" intensity={1.5} />

      {/* Right wall — cyan neon strips */}
      <NeonTube position={[halfW, 1.5, 2]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#00ccff" intensity={3} />
      <NeonTube position={[halfW, 1.5, -2]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#00ccff" intensity={3} />
      <NeonTube position={[halfW, 1.5, -6]} rotation={[0, 0, Math.PI / 2]} length={0.8} color="#00ccff" intensity={3} />
      {/* Right wall — vertical accent */}
      <NeonTube position={[halfW, 2.5, 0]} length={3} color="#00ccff" intensity={1.5} />

      {/* Ceiling runner lights — warm overhead */}
      <NeonTube position={[0, ALLEY_HEIGHT - 0.3, 4]} rotation={[Math.PI / 2, 0, 0]} length={0.6} color="#ffaa44" intensity={2} radius={0.02} />
      <NeonTube position={[0, ALLEY_HEIGHT - 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.6} color="#ffaa44" intensity={2} radius={0.02} />
      <NeonTube position={[0, ALLEY_HEIGHT - 0.3, -4]} rotation={[Math.PI / 2, 0, 0]} length={0.6} color="#ffaa44" intensity={2} radius={0.02} />
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
        intensity={12}
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
        intensity={6}
        color="#eeddcc"
      />
      {/* Mid-lane overhead fill */}
      <spotLight
        position={[0, ALLEY_HEIGHT - 0.5, 0]}
        target-position={[0, 0, 0]}
        angle={Math.PI / 4}
        penumbra={0.7}
        intensity={4}
        color="#ddeeff"
      />
    </>
  );
}

/* ── Rowans neon sign on right wall ──────────────────────── */

function NeonTextLine({
  text,
  position,
  color,
  fontSize = 0.35,
}: {
  text: string;
  position: [number, number, number];
  color: string;
  fontSize?: number;
}) {
  return (
    <group position={position}>
      {/* Bright neon text */}
      <Text
        fontSize={fontSize}
        anchorX="center"
        anchorY="middle"
        rotation={[0, -Math.PI / 2, 0]}
        fontWeight="bold"
      >
        {text}
        <meshBasicMaterial color={color} toneMapped={false} />
      </Text>
      {/* Glow halo behind text */}
      <pointLight color={color} intensity={1.5} distance={4} decay={2} />
    </group>
  );
}

function RowansSideSign() {
  const glowRef = useRef<THREE.Mesh>(null);
  const halfW = ALLEY_WIDTH / 2 - 0.05;

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity =
        0.08 + Math.sin(clock.getElapsedTime() * 2.5) * 0.03;
    }
  });

  return (
    <group position={[halfW, 3, -2]}>
      {/* Dark backing plate on the wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#060608" roughness={0.95} />
      </mesh>
      {/* Subtle glow wash behind sign */}
      <mesh ref={glowRef} rotation={[0, -Math.PI / 2, 0]} position={[0, 0, 0.01]}>
        <planeGeometry args={[5.5, 3.5]} />
        <meshBasicMaterial color="#00ccff" transparent opacity={0.08} toneMapped={false} />
      </mesh>

      {/* ROWANS — large cyan */}
      <NeonTextLine text="ROWANS" position={[-0.05, 1.2, 0]} color="#00ccff" fontSize={0.55} />
      {/* TEN PIN BOWLING — red */}
      <NeonTextLine text="TEN PIN BOWLING" position={[-0.05, 0.5, 0]} color="#ff0033" fontSize={0.3} />
      {/* LATE BARS — cyan */}
      <NeonTextLine text="LATE BARS" position={[-0.05, -0.1, 0]} color="#00ccff" fontSize={0.3} />
      {/* DJ'S — blue/purple */}
      <NeonTextLine text="DJ'S" position={[-0.05, -0.65, 0]} color="#6644ff" fontSize={0.35} />
      {/* STOP WARS — red */}
      <NeonTextLine text="STOP WARS" position={[-0.05, -1.2, 0]} color="#ff0033" fontSize={0.3} />

      {/* Additional glow lights for the sign */}
      <pointLight color="#00ccff" intensity={3} distance={8} decay={2} position={[-0.3, 1, 0]} />
      <pointLight color="#ff0033" intensity={2} distance={6} decay={2} position={[-0.3, -0.5, 0]} />
    </group>
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
      <RowansSideSign />
    </group>
  );
}
