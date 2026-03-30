/**
 * Ball — glossy reflective bowling ball with physics body.
 *
 * Features a deep dark surface with metallic sheen, finger holes,
 * and a subtle colour swirl. Controlled by the game state machine:
 * positioned during aim, launched with velocity during roll.
 */

"use client";

import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
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
import type { BallStyle } from "@/data/bowlingBalls";

import type { Triplet } from "@react-three/cannon";

const DEFAULT_STYLE: BallStyle = {
  color: "#0c0c1e",
  roughness: 0.05,
  metalness: 0.6,
  envMapIntensity: 1.2,
  swirlColor: "#660022",
  swirlEmissive: "#330011",
  swirlEmissiveIntensity: 0.3,
  holeColor: "#020208",
};

interface BallProps {
  phase: BowlingPhase;
  aimX: number;
  power: number;
  spin: number;
  onStopped: () => void;
  ballStyle?: BallStyle;
}

export function Ball({ phase, aimX, power, spin, onStopped, ballStyle }: BallProps) {
  const s = ballStyle ?? DEFAULT_STYLE;
  const hasLaunched = useRef(false);
  const stoppedFrames = useRef(0);

  // Load texture map if the style specifies one
  const texture = useMemo(() => {
    if (!s.texturePath) return null;
    const tex = new THREE.TextureLoader().load(s.texturePath);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [s.texturePath]);

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
    <group>
      <mesh ref={ref} castShadow visible={visible}>
        <sphereGeometry args={[BALL_RADIUS, 32, 24]} />
        <meshStandardMaterial
          color={texture ? "#ffffff" : s.color}
          map={texture}
          roughness={s.roughness}
          metalness={s.metalness}
          envMapIntensity={s.envMapIntensity}
        />
        {/* Finger holes */}
        <group rotation={[0.3, 0.2, 0]}>
          <mesh position={[0, BALL_RADIUS * 0.75, BALL_RADIUS * 0.3]}>
            <cylinderGeometry args={[0.025, 0.025, 0.04, 8]} />
            <meshStandardMaterial color={s.holeColor} roughness={0.8} />
          </mesh>
          <mesh position={[0.05, BALL_RADIUS * 0.75, BALL_RADIUS * 0.15]}>
            <cylinderGeometry args={[0.025, 0.025, 0.04, 8]} />
            <meshStandardMaterial color={s.holeColor} roughness={0.8} />
          </mesh>
          <mesh position={[-0.05, BALL_RADIUS * 0.75, BALL_RADIUS * 0.15]}>
            <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
            <meshStandardMaterial color={s.holeColor} roughness={0.8} />
          </mesh>
        </group>
        {/* Deep red swirl accent band */}
        <mesh rotation={[0.4, 0, 0.3]}>
          <torusGeometry args={[BALL_RADIUS * 0.95, 0.008, 8, 48, Math.PI * 1.3]} />
          <meshStandardMaterial
            color={s.swirlColor}
            roughness={0.15}
            metalness={0.4}
            emissive={s.swirlEmissive}
            emissiveIntensity={s.swirlEmissiveIntensity}
          />
        </mesh>
      </mesh>
    </group>
  );
}
