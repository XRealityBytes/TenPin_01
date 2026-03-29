/**
 * Lane — glossy bowling lane with neon markings, metallic gutters, and gutter bumper rails.
 *
 * Features a polished wood surface with subtle grain (via emissive accents),
 * neon-glowing lane arrows and foul line, metallic gutter channels with
 * neon edge strips, and an illuminated pin deck.
 */

"use client";

import { useBox } from "@react-three/cannon";
import { useMemo } from "react";
import * as THREE from "three";

import {
  GUTTER_DEPTH,
  GUTTER_WIDTH,
  LANE_HEIGHT,
  LANE_LENGTH,
  LANE_WIDTH,
} from "@/lib/physics";

/* ── Lane arrow (neon chevron) ──────────────────────────── */

function LaneArrow({ z, color = "#ff0033" }: { z: number; color?: string }) {
  return (
    <group position={[0, 0.015, z]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Arrow body */}
      <mesh>
        <planeGeometry args={[0.15, 0.3]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      {/* Arrow glow */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[0.3, 0.5]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

/* ── Lane dot row (guide dots) ──────────────────────────── */

function LaneDots({ z }: { z: number }) {
  const dots = [-0.8, -0.4, -0.15, 0, 0.15, 0.4, 0.8];
  return (
    <group position={[0, 0.015, z]} rotation={[-Math.PI / 2, 0, 0]}>
      {dots.map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <circleGeometry args={[0.03, 12]} />
          <meshBasicMaterial
            color={Math.abs(x) < 0.2 ? "#ff0033" : "#00ccff"}
            toneMapped={false}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Gutter edge neon strip ─────────────────────────────── */

function GutterNeonStrip({ side }: { side: "left" | "right" }) {
  const x = side === "left"
    ? -(LANE_WIDTH / 2 + 0.02)
    : LANE_WIDTH / 2 + 0.02;

  return (
    <group position={[x, 0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.02, LANE_LENGTH]} />
        <meshBasicMaterial
          color={side === "left" ? "#ff0033" : "#00ccff"}
          toneMapped={false}
        />
      </mesh>
      {/* Glow halo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.001]}>
        <planeGeometry args={[0.12, LANE_LENGTH]} />
        <meshBasicMaterial
          color={side === "left" ? "#ff0033" : "#00ccff"}
          toneMapped={false}
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}

/* ── Lane surface board lines (wood grain effect) ───────── */

function WoodGrainLines() {
  const lines = useMemo(() => {
    const positions: number[] = [];
    const boardWidth = LANE_WIDTH / 39; // 39 boards on a bowling lane
    for (let i = 1; i < 39; i++) {
      positions.push(-LANE_WIDTH / 2 + i * boardWidth);
    }
    return positions;
  }, []);

  return (
    <group position={[0, 0.005, 0]}>
      {lines.map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.004, LANE_LENGTH]} />
          <meshBasicMaterial color="#7a5a20" transparent opacity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Main Lane component ────────────────────────────────── */

export function Lane() {
  // Lane surface (physics body)
  const [laneRef] = useBox<THREE.Mesh>(() => ({
    type: "Static",
    position: [0, -LANE_HEIGHT / 2, 0],
    args: [LANE_WIDTH, LANE_HEIGHT, LANE_LENGTH],
    material: { friction: 0.15, restitution: 0.1 },
  }));

  // Left gutter
  const [leftGutterRef] = useBox<THREE.Mesh>(() => ({
    type: "Static",
    position: [-(LANE_WIDTH / 2 + GUTTER_WIDTH / 2), -GUTTER_DEPTH / 2, 0],
    args: [GUTTER_WIDTH, GUTTER_DEPTH, LANE_LENGTH],
    material: { friction: 0.6, restitution: 0.05 },
  }));

  // Right gutter
  const [rightGutterRef] = useBox<THREE.Mesh>(() => ({
    type: "Static",
    position: [LANE_WIDTH / 2 + GUTTER_WIDTH / 2, -GUTTER_DEPTH / 2, 0],
    args: [GUTTER_WIDTH, GUTTER_DEPTH, LANE_LENGTH],
    material: { friction: 0.6, restitution: 0.05 },
  }));

  // Back wall (stops the ball)
  const [backWallRef] = useBox<THREE.Mesh>(() => ({
    type: "Static",
    position: [0, 0.5, -LANE_LENGTH / 2 - 0.5],
    args: [LANE_WIDTH + GUTTER_WIDTH * 2, 2, 1],
    material: { friction: 0.8, restitution: 0.3 },
  }));

  return (
    <group>
      {/* ── Lane surface — polished wood ─────────────────── */}
      <mesh ref={laneRef} receiveShadow>
        <boxGeometry args={[LANE_WIDTH, LANE_HEIGHT, LANE_LENGTH]} />
        <meshStandardMaterial
          color="#b8862a"
          roughness={0.15}
          metalness={0.08}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* Board lines for wood grain effect */}
      <WoodGrainLines />

      {/* ── Lane arrows (neon red) ───────────────────────── */}
      {[-0.6, -0.3, 0, 0.3, 0.6].map((x, i) => (
        <group key={`arrow-${i}`} position={[x, 0, 3]}>
          <LaneArrow z={0} color={Math.abs(x) < 0.15 ? "#ff0033" : "#cc2200"} />
        </group>
      ))}

      {/* ── Guide dots ────────────────────────────────────── */}
      <LaneDots z={5} />
      <LaneDots z={1} />

      {/* ── Foul line — neon glow ─────────────────────────── */}
      <mesh position={[0, 0.015, LANE_LENGTH / 2 - 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LANE_WIDTH, 0.05]} />
        <meshBasicMaterial color="#ff0033" toneMapped={false} />
      </mesh>
      {/* Foul line glow halo */}
      <mesh position={[0, 0.014, LANE_LENGTH / 2 - 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LANE_WIDTH + 0.1, 0.2]} />
        <meshBasicMaterial color="#ff0033" toneMapped={false} transparent opacity={0.15} />
      </mesh>

      {/* ── Gutter edge neon strips ───────────────────────── */}
      <GutterNeonStrip side="left" />
      <GutterNeonStrip side="right" />

      {/* ── Left gutter — dark metallic ──────────────────── */}
      <mesh ref={leftGutterRef}>
        <boxGeometry args={[GUTTER_WIDTH, GUTTER_DEPTH, LANE_LENGTH]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* ── Right gutter — dark metallic ─────────────────── */}
      <mesh ref={rightGutterRef}>
        <boxGeometry args={[GUTTER_WIDTH, GUTTER_DEPTH, LANE_LENGTH]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* ── Back wall — invisible physics ────────────────── */}
      <mesh ref={backWallRef} visible={false}>
        <boxGeometry args={[LANE_WIDTH + GUTTER_WIDTH * 2, 2, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* ── Pin deck — lighter, polished area ────────────── */}
      <mesh position={[0, 0.012, -LANE_LENGTH / 2 + 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LANE_WIDTH, 3]} />
        <meshStandardMaterial
          color="#d4a855"
          roughness={0.12}
          metalness={0.1}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* ── Approach area — darker, textured ─────────────── */}
      <mesh position={[0, 0.012, LANE_LENGTH / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LANE_WIDTH, 3]} />
        <meshStandardMaterial
          color="#8a6520"
          roughness={0.2}
          metalness={0.05}
        />
      </mesh>

      {/* ── Bumper rails — chrome-like, along gutter edges ──*/}
      {/* Left rail */}
      <mesh position={[-(LANE_WIDTH / 2), 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, LANE_LENGTH]} />
        <meshStandardMaterial color="#333340" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Right rail */}
      <mesh position={[LANE_WIDTH / 2, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, LANE_LENGTH]} />
        <meshStandardMaterial color="#333340" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
}
