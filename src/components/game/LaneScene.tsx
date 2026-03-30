/**
 * LaneScene — immersive neon bowling alley with React Three Fiber.
 *
 * Features: neon-lit environment, post-processing bloom, camera follow
 * during ball roll, dramatic spotlights, and glossy materials.
 * Designed to match the Rowans Bowling dark neon aesthetic.
 * Supports multiplayer with name entry and left-side scoreboard.
 */

"use client";

import { Physics } from "@react-three/cannon";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";

import { Ball } from "@/components/game/Ball";
import { HUD } from "@/components/game/HUD";
import { Lane } from "@/components/game/Lane";
import { NeonAlley } from "@/components/game/NeonAlley";
import { Pin } from "@/components/game/Pin";
import { useBowlingGame } from "@/hooks/useBowlingGame";
import type { BowlingPhase } from "@/hooks/useBowlingGame";
import { getBallById } from "@/data/bowlingBalls";
import type { BallStyle } from "@/data/bowlingBalls";
import {
  BALL_START_Z,
  GRAVITY,
  LANE_LENGTH,
  LANE_WIDTH,
  PIN_POSITIONS,
  SETTLE_TIME,
} from "@/lib/physics";

/* ── Camera controller with follow mode ─────────────────── */

function GameCamera({ phase }: { phase: BowlingPhase }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 4, BALL_START_Z + 3));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const lookAtVec = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 4, BALL_START_Z + 3);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame(() => {
    if (phase === "AIMING" || phase === "CHARGING") {
      // Behind ball, elevated view down the lane
      targetPos.current.set(0, 3.5, BALL_START_Z + 4);
      targetLook.current.set(0, 0, -LANE_LENGTH / 4);
    } else if (phase === "ROLLING") {
      // Slightly higher and further back during roll for dramatic view
      targetPos.current.set(0, 5, BALL_START_Z + 6);
      targetLook.current.set(0, 0, -LANE_LENGTH / 3);
    } else if (phase === "SETTLING" || phase === "SCORING") {
      // Focus on pin area
      targetPos.current.set(1.5, 3, -LANE_LENGTH / 4);
      targetLook.current.set(0, 0.5, -LANE_LENGTH / 2 + 2);
    } else if (phase === "GAME_OVER") {
      // Cinematic wide shot
      targetPos.current.set(3, 4, 2);
      targetLook.current.set(0, 1, -LANE_LENGTH / 4);
    }

    // Smooth camera interpolation
    camera.position.lerp(targetPos.current, 0.03);
    lookAtVec.current.lerp(targetLook.current, 0.03);
    camera.lookAt(lookAtVec.current);
  });

  return null;
}

/* ── Pin group ──────────────────────────────────────────── */

function PinGroup({
  standingPins,
  onPinFallen,
}: {
  standingPins: boolean[];
  onPinFallen: (index: number) => void;
}) {
  return (
    <>
      {PIN_POSITIONS.map((pos, i) => (
        <Pin
          key={`pin-${i}-${standingPins[i]}`}
          position={pos}
          index={i}
          isStanding={standingPins[i]}
          onFallen={onPinFallen}
        />
      ))}
    </>
  );
}

/* ── Neon aim laser ─────────────────────────────────────── */

function AimLaser({ aimX, visible }: { aimX: number; visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Subtle pulse animation
      const pulse = 0.3 + Math.sin(clock.getElapsedTime() * 4) * 0.15;
      const mat = groupRef.current.children[1] as THREE.Mesh;
      if (mat?.material && "opacity" in mat.material) {
        (mat.material as THREE.MeshBasicMaterial).opacity = pulse;
      }
    }
  });

  if (!visible) return null;
  const x = aimX * (LANE_WIDTH / 2 - 0.3);

  return (
    <group ref={groupRef}>
      {/* Laser core */}
      <mesh position={[x, 0.025, BALL_START_Z - 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.015, 10]} />
        <meshBasicMaterial color="#ff0033" toneMapped={false} />
      </mesh>
      {/* Laser glow */}
      <mesh position={[x, 0.024, BALL_START_Z - 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 10]} />
        <meshBasicMaterial color="#ff0033" toneMapped={false} transparent opacity={0.3} />
      </mesh>
      {/* Target dot at far end */}
      <mesh position={[x, 0.03, BALL_START_Z - 9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color="#ff0033" toneMapped={false} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ── Strike flash effect ────────────────────────────────── */

function StrikeFlash({ flashMessage }: { flashMessage: string | null }) {
  const ref = useRef<THREE.PointLight>(null);
  const active = flashMessage?.includes("STRIKE");

  useFrame(({ clock }) => {
    if (ref.current && active) {
      const t = clock.getElapsedTime();
      ref.current.intensity = 15 * Math.max(0, 1 - ((t % 2) * 2));
    } else if (ref.current) {
      ref.current.intensity = 0;
    }
  });

  return (
    <pointLight
      ref={ref}
      position={[0, 4, -LANE_LENGTH / 2 + 2]}
      color="#ffaa00"
      intensity={0}
      distance={20}
      decay={2}
    />
  );
}

/* ── Main Scene Internals ───────────────────────────────── */

function SceneInternals({
  gameState,
  activeBallStyle,
  onBallStopped,
  onPinFallen,
}: {
  gameState: ReturnType<typeof useBowlingGame>["state"];
  activeBallStyle?: BallStyle;
  onBallStopped: () => void;
  onPinFallen: (index: number) => void;
}) {
  return (
    <>
      <GameCamera phase={gameState.phase} />

      {/* Ambient — brighter for visibility while keeping mood */}
      <ambientLight intensity={0.25} color="#1a1a33" />

      {/* Neon bowling alley environment */}
      <NeonAlley />

      {/* Strike flash */}
      <StrikeFlash flashMessage={gameState.flashMessage} />

      <Physics gravity={GRAVITY} iterations={10} tolerance={0.001}>
        <Lane />
        <PinGroup standingPins={gameState.standingPins} onPinFallen={onPinFallen} />
        <Ball
          key={`ball-${gameState.turnKey}`}
          phase={gameState.phase}
          aimX={gameState.aimX}
          power={gameState.power}
          spin={gameState.spin}
          onStopped={onBallStopped}
          ballStyle={activeBallStyle}
        />
      </Physics>

      <AimLaser aimX={gameState.aimX} visible={gameState.phase === "AIMING" || gameState.phase === "CHARGING"} />

      {/* Deep fog for drama — pushed further out for brighter feel */}
      <fog attach="fog" args={["#050510", 16, 35]} />
      <color attach="background" args={["#050510"]} />

      {/* Post-processing: bloom for neon glow + vignette for mood */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.4}
          intensity={1.2}
          mipmapBlur
        />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

/* ── Controls handler ───────────────────────────────────── */

function usePointerControls(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  game: ReturnType<typeof useBowlingGame>,
) {
  const chargeInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const chargeStart = useRef(0);
  const lastX = useRef(0);
  const dragStartX = useRef(0);

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (game.state.phase === "AIMING") {
        dragStartX.current = e.clientX;
        game.startCharge();
        chargeStart.current = Date.now();

        chargeInterval.current = setInterval(() => {
          const elapsed = (Date.now() - chargeStart.current) / 2000;
          game.setPower(Math.min(elapsed, 1));
        }, 16);
      }
    },
    [game],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      lastX.current = e.clientX;

      if (game.state.phase === "AIMING") {
        game.setAim(normalizedX);
      }
    },
    [game, canvasRef],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (chargeInterval.current) {
        clearInterval(chargeInterval.current);
        chargeInterval.current = null;
      }

      if (game.state.phase === "CHARGING") {
        const dragDx = e.clientX - dragStartX.current;
        const rect = canvasRef.current?.getBoundingClientRect();
        const spin = rect ? (dragDx / rect.width) * 2 : 0;
        game.releaseBall(spin);
      }
    },
    [game, canvasRef],
  );

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerup", handlePointerUp);

    return () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerup", handlePointerUp);
      if (chargeInterval.current) clearInterval(chargeInterval.current);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, canvasRef]);
}

/* ── Main Export ─────────────────────────────────────────── */

export function LanePlayGame({ playerNames, ballSelections }: { playerNames: string[]; ballSelections?: string[] }) {
  const game = useBowlingGame(playerNames, 2);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fallenPins = useRef<Set<number>>(new Set());
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  usePointerControls(canvasRef, game);

  // Resolve the active player's ball style
  const activeBallStyle = ballSelections
    ? getBallById(ballSelections[game.state.activePlayerIndex]).style
    : undefined;

  const handleBallStopped = useCallback(() => {
    game.ballStopped();

    settleTimer.current = setTimeout(() => {
      const standing = game.state.standingPins.map(
        (wasStanding, i) => wasStanding && !fallenPins.current.has(i),
      );
      game.reportPinStates(standing);
      fallenPins.current.clear();
    }, SETTLE_TIME);
  }, [game]);

  const handlePinFallen = useCallback((index: number) => {
    fallenPins.current.add(index);
  }, []);

  useEffect(() => {
    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  return (
    <div ref={canvasRef} className="relative h-full w-full" style={{ touchAction: "none" }}>
      <Canvas
        shadows="basic"
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Suspense fallback={null}>
          <SceneInternals
            gameState={game.state}
            activeBallStyle={activeBallStyle}
            onBallStopped={handleBallStopped}
            onPinFallen={handlePinFallen}
          />
        </Suspense>
      </Canvas>

      <HUD state={game.state} onNextRoll={game.nextRoll} onReset={game.resetGame} />
    </div>
  );
}
