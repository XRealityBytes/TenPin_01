/**
 * Pin — a bowling pin with lathe-profile geometry and physics body.
 *
 * Uses cannon-es cylinder for collision. Renders a lathe geometry
 * that closely approximates a real bowling pin silhouette — tapered
 * body, narrow neck, round head. Glossy white with red stripe and
 * subtle neon rim light catch.
 */

"use client";

import { useCylinder } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import {
  PIN_DOWN_ANGLE,
  PIN_FRICTION,
  PIN_HEIGHT,
  PIN_MASS,
  PIN_RADIUS,
  PIN_RESTITUTION,
} from "@/lib/physics";

import type { Triplet } from "@react-three/cannon";

/**
 * Build a lathe geometry that approximates a bowling pin profile.
 * Points define half the cross-section; THREE.LatheGeometry revolves them.
 */
function usePinGeometry() {
  return useMemo(() => {
    const h = PIN_HEIGHT;
    const r = PIN_RADIUS;
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0, -h * 0.48),         // bottom center
      new THREE.Vector2(r * 1.0, -h * 0.48),   // bottom edge
      new THREE.Vector2(r * 1.1, -h * 0.38),   // lower belly
      new THREE.Vector2(r * 1.15, -h * 0.2),   // widest belly
      new THREE.Vector2(r * 1.1, -h * 0.05),   // upper belly
      new THREE.Vector2(r * 0.85, h * 0.1),    // waist start
      new THREE.Vector2(r * 0.55, h * 0.2),    // neck (narrowest)
      new THREE.Vector2(r * 0.5, h * 0.25),    // neck
      new THREE.Vector2(r * 0.55, h * 0.32),   // head start
      new THREE.Vector2(r * 0.6, h * 0.38),    // head widest
      new THREE.Vector2(r * 0.5, h * 0.44),    // head top curve
      new THREE.Vector2(r * 0.25, h * 0.48),   // crown
      new THREE.Vector2(0, h * 0.5),           // top center
    ];
    return new THREE.LatheGeometry(points, 16);
  }, []);
}

interface PinProps {
  position: Triplet;
  index: number;
  isStanding: boolean;
  onFallen?: (index: number) => void;
}

export function Pin({ position, index, isStanding, onFallen }: PinProps) {
  const hasFallen = useRef(false);
  const pinGeo = usePinGeometry();

  const [ref, api] = useCylinder<THREE.Group>(() => ({
    mass: isStanding ? PIN_MASS : 0,
    position,
    args: [PIN_RADIUS * 0.6, PIN_RADIUS, PIN_HEIGHT, 8],
    material: { friction: PIN_FRICTION, restitution: PIN_RESTITUTION },
    linearDamping: 0.3,
    angularDamping: 0.3,
    allowSleep: true,
    sleepSpeedLimit: 0.1,
  }));

  // Track rotation to detect fallen pins
  useFrame(() => {
    if (!ref.current || hasFallen.current || !isStanding) return;

    const euler = new THREE.Euler();
    ref.current.getWorldQuaternion(new THREE.Quaternion()).normalize();
    euler.setFromQuaternion(ref.current.quaternion);

    const tilt = Math.abs(euler.x) + Math.abs(euler.z);
    if (tilt > PIN_DOWN_ANGLE) {
      hasFallen.current = true;
      onFallen?.(index);
    }
  });

  if (!isStanding) return null;

  return (
    <group ref={ref}>
      {/* Pin body — lathe profile for realistic shape */}
      <mesh castShadow geometry={pinGeo}>
        <meshStandardMaterial
          color="#f0ece4"
          roughness={0.18}
          metalness={0.05}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Red neck stripe — signature bowling pin band */}
      <mesh position={[0, PIN_HEIGHT * 0.2, 0]}>
        <cylinderGeometry args={[PIN_RADIUS * 0.6, PIN_RADIUS * 0.65, PIN_HEIGHT * 0.06, 16]} />
        <meshStandardMaterial
          color="#cc0000"
          roughness={0.3}
          emissive="#660000"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Second red stripe (thinner) */}
      <mesh position={[0, PIN_HEIGHT * 0.14, 0]}>
        <cylinderGeometry args={[PIN_RADIUS * 0.72, PIN_RADIUS * 0.75, PIN_HEIGHT * 0.03, 16]} />
        <meshStandardMaterial
          color="#cc0000"
          roughness={0.3}
          emissive="#660000"
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}
