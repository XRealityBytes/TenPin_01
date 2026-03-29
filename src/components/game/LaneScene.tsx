/**
 * LaneScene — the main React Three Fiber canvas scene for Lane Play.
 *
 * Sets up the 3D environment: camera, lighting, physics world, lane,
 * pins, ball, and ties into the game state hook for controls.
 */

"use client";

import { Physics } from "@react-three/cannon";
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { Ball } from "@/components/game/Ball";
import { HUD } from "@/components/game/HUD";
import { Lane } from "@/components/game/Lane";
import { Pin } from "@/components/game/Pin";
import { useBowlingGame } from "@/hooks/useBowlingGame";
import {
  BALL_START_Z,
  GRAVITY,
  LANE_LENGTH,
  LANE_WIDTH,
  PIN_POSITIONS,
  SETTLE_TIME,
} from "@/lib/physics";

/* ── Camera controller ──────────────────────────────────── */

function GameCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 4, BALL_START_Z + 3);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

/* ── Scene lighting ─────────────────────────────────────── */

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
      />
      {/* Neon red accent lights (Rowans aesthetic) */}
      <pointLight position={[-LANE_WIDTH, 3, -LANE_LENGTH / 4]} color="#ff0000" intensity={0.5} distance={12} />
      <pointLight position={[LANE_WIDTH, 3, -LANE_LENGTH / 4]} color="#ff0000" intensity={0.5} distance={12} />
      {/* Overhead lane light */}
      <pointLight position={[0, 5, 0]} intensity={0.8} distance={20} />
    </>
  );
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

/* ── Aim indicator ──────────────────────────────────────── */

function AimLine({ aimX, visible }: { aimX: number; visible: boolean }) {
  if (!visible) return null;
  const x = aimX * (LANE_WIDTH / 2 - 0.3);
  return (
    <mesh position={[x, 0.02, BALL_START_Z - 4]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.02, 8]} />
      <meshBasicMaterial color="#ff0000" transparent opacity={0.4} />
    </mesh>
  );
}

/* ── Main Scene Internals ───────────────────────────────── */

function SceneInternals({
  gameState,
  onBallStopped,
  onPinFallen,
}: {
  gameState: ReturnType<typeof useBowlingGame>["state"];
  onBallStopped: () => void;
  onPinFallen: (index: number) => void;
}) {
  return (
    <>
      <GameCamera />
      <Lighting />

      <Physics gravity={GRAVITY} iterations={10} tolerance={0.001}>
        <Lane />
        <PinGroup standingPins={gameState.standingPins} onPinFallen={onPinFallen} />
        <Ball
          phase={gameState.phase}
          aimX={gameState.aimX}
          power={gameState.power}
          spin={gameState.spin}
          onStopped={onBallStopped}
        />
      </Physics>

      <AimLine aimX={gameState.aimX} visible={gameState.phase === "AIMING" || gameState.phase === "CHARGING"} />

      {/* Dark environment for mood */}
      <fog attach="fog" args={["#000000", 15, 30]} />
      <color attach="background" args={["#0a0a0a"]} />
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

        // Start power bar animation
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

export function LanePlayGame() {
  const game = useBowlingGame();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fallenPins = useRef<Set<number>>(new Set());
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  usePointerControls(canvasRef, game);

  const handleBallStopped = useCallback(() => {
    game.ballStopped();

    // Wait for pins to settle, then report
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

  // Clean up settle timer
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
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <Suspense fallback={null}>
          <SceneInternals
            gameState={game.state}
            onBallStopped={handleBallStopped}
            onPinFallen={handlePinFallen}
          />
        </Suspense>
      </Canvas>

      <HUD state={game.state} onNextRoll={game.nextRoll} onReset={game.resetGame} />
    </div>
  );
}
