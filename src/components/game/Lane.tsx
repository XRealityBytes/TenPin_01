/**
 * Lane — bowling lane geometry with gutters, rendered as simple boxes.
 *
 * Static physics bodies for the lane surface, two gutters, and back wall.
 * The lane uses warm wood tones; gutters are dark channels.
 */

"use client";

import { useBox, usePlane } from "@react-three/cannon";
import * as THREE from "three";

import {
  GUTTER_DEPTH,
  GUTTER_WIDTH,
  LANE_HEIGHT,
  LANE_LENGTH,
  LANE_WIDTH,
} from "@/lib/physics";

export function Lane() {
  // Lane surface
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
      {/* Lane surface */}
      <mesh ref={laneRef} receiveShadow>
        <boxGeometry args={[LANE_WIDTH, LANE_HEIGHT, LANE_LENGTH]} />
        <meshStandardMaterial color="#c4943a" roughness={0.25} metalness={0.05} />
      </mesh>

      {/* Lane markings — arrows and dots as subtle lines */}
      <mesh position={[0, 0.01, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LANE_WIDTH * 0.6, 0.02]} />
        <meshBasicMaterial color="#b8862a" />
      </mesh>
      <mesh position={[0, 0.01, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LANE_WIDTH * 0.4, 0.02]} />
        <meshBasicMaterial color="#b8862a" />
      </mesh>

      {/* Foul line */}
      <mesh position={[0, 0.01, LANE_LENGTH / 2 - 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LANE_WIDTH, 0.03]} />
        <meshBasicMaterial color="#333333" />
      </mesh>

      {/* Left gutter */}
      <mesh ref={leftGutterRef}>
        <boxGeometry args={[GUTTER_WIDTH, GUTTER_DEPTH, LANE_LENGTH]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.7} />
      </mesh>

      {/* Right gutter */}
      <mesh ref={rightGutterRef}>
        <boxGeometry args={[GUTTER_WIDTH, GUTTER_DEPTH, LANE_LENGTH]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.7} />
      </mesh>

      {/* Back wall — invisible but stops ball */}
      <mesh ref={backWallRef} visible={false}>
        <boxGeometry args={[LANE_WIDTH + GUTTER_WIDTH * 2, 2, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Pin deck - slightly lighter area behind pins */}
      <mesh position={[0, 0.01, -LANE_LENGTH / 2 + 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LANE_WIDTH, 3]} />
        <meshStandardMaterial color="#dbb76a" roughness={0.2} metalness={0.05} />
      </mesh>
    </group>
  );
}
