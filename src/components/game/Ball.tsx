/**
 * Ball — the bowling ball with physics body and visual mesh.
 *
 * The ball is controlled by the game state: positioned during aim,
 * launched with velocity during roll, and hidden during reset.
 */

"use client";

import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import {
  BALL_FRICTION,
  BALL_MASS,
  BALL_MAX_SPEED,
  BALL_MIN_SPEED,
  BALL_RADIUS,
  BALL_RESTITUTION,
  BALL_START_Z,
  LANE_WIDTH,
} from "@/lib/physics";
import type { BowlingPhase } from "@/hooks/useBowlingGame";

import type { Triplet } from "@react-three/cannon";

interface BallProps {
  phase: BowlingPhase;
  aimX: number;
  power: number;
  spin: number;
  onStopped: () => void;
}

export function Ball({ phase, aimX, power, spin, onStopped }: BallProps) {
  const hasLaunched = useRef(false);
  const stoppedFrames = useRef(0);

  const startX = aimX * (LANE_WIDTH / 2 - BALL_RADIUS * 2);
  const startPos: Triplet = [startX, BALL_RADIUS + 0.1, BALL_START_Z];

  const [ref, api] = useSphere<THREE.Mesh>(() => ({
    mass: BALL_MASS,
    position: startPos,
    args: [BALL_RADIUS],
    material: { friction: BALL_FRICTION, restitution: BALL_RESTITUTION },
    linearDamping: 0.1,
    angularDamping: 0.2,
    type: phase === "ROLLING" ? "Dynamic" : "Kinematic",
  }));

  // Position ball during aiming
  useEffect(() => {
    if (phase === "AIMING" || phase === "CHARGING") {
      hasLaunched.current = false;
      stoppedFrames.current = 0;
      api.position.set(startX, BALL_RADIUS + 0.1, BALL_START_Z);
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
    }
  }, [phase, startX, api]);

  // Launch ball
  useEffect(() => {
    if (phase === "ROLLING" && !hasLaunched.current) {
      hasLaunched.current = true;
      const speed = BALL_MIN_SPEED + power * (BALL_MAX_SPEED - BALL_MIN_SPEED);
      const spinForce = spin * 3;
      api.velocity.set(spinForce, 0, -speed);
      api.angularVelocity.set(-speed * 2, spin * 5, 0);
    }
  }, [phase, power, spin, api]);

  // Detect when ball stops
  const velocity = useRef<Triplet>([0, 0, 0]);
  useEffect(() => {
    const unsub = api.velocity.subscribe((v) => {
      velocity.current = v;
    });
    return unsub;
  }, [api]);

  useFrame(() => {
    if (phase !== "ROLLING") return;
    const [vx, vy, vz] = velocity.current;
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

    if (speed < 0.3) {
      stoppedFrames.current++;
      if (stoppedFrames.current > 90) {
        // ~1.5s at 60fps
        onStopped();
      }
    } else {
      stoppedFrames.current = 0;
    }

    // Ball fell off the lane or went too far
    if (ref.current) {
      const pos = ref.current.position;
      if (pos.y < -2 || pos.z < -15 || pos.z > 15) {
        onStopped();
      }
    }
  });

  const visible = phase !== "RESETTING" && phase !== "GAME_OVER" && phase !== "IDLE";

  return (
    <mesh ref={ref} castShadow visible={visible}>
      <sphereGeometry args={[BALL_RADIUS, 24, 16]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.2} metalness={0.4} />
      {/* Finger holes - decorative */}
      <mesh position={[0, BALL_RADIUS * 0.8, 0]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 8]} />
        <meshStandardMaterial color="#0d0d0d" />
      </mesh>
    </mesh>
  );
}
