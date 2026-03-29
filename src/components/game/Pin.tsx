/**
 * Pin — a single bowling pin with physics body.
 *
 * Uses cannon-es cylinder shape for collision. Renders as a simple
 * cylinder+sphere procedural mesh (no glTF needed for fallback).
 * Reports its rotation to the parent for pin-down detection.
 */

"use client";

import { useCylinder } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
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

interface PinProps {
  position: Triplet;
  index: number;
  isStanding: boolean;
  onFallen?: (index: number) => void;
}

export function Pin({ position, index, isStanding, onFallen }: PinProps) {
  const hasFallen = useRef(false);

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
      {/* Pin body — tapered cylinder */}
      <mesh castShadow>
        <cylinderGeometry args={[PIN_RADIUS * 0.6, PIN_RADIUS, PIN_HEIGHT, 12]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Red stripe */}
      <mesh position={[0, PIN_HEIGHT * 0.22, 0]}>
        <cylinderGeometry args={[PIN_RADIUS * 0.65, PIN_RADIUS * 0.68, PIN_HEIGHT * 0.08, 12]} />
        <meshStandardMaterial color="#cc0000" roughness={0.4} />
      </mesh>
      {/* Pin head — small sphere */}
      <mesh position={[0, PIN_HEIGHT * 0.42, 0]} castShadow>
        <sphereGeometry args={[PIN_RADIUS * 0.5, 12, 8]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.3} metalness={0.05} />
      </mesh>
    </group>
  );
}
