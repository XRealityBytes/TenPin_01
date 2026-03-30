/**
 * PinPickerCanvas — 2D canvas mini-game for the Pin Picker route.
 *
 * Top-down view: player aims and launches a ball to knock down pin
 * formations. Progressively harder levels, star rating per level.
 * Uses native Canvas 2D API (no Three.js). Responsive with devicePixelRatio.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LEVELS, PIN_LAYOUT } from "@/content/pin-picker-levels";

/* ── Constants ──────────────────────────────────────────── */

const BALL_RADIUS = 14;
const PIN_RADIUS = 10;
const PIN_HIT_RADIUS = 18; // slightly larger than visual for forgiving hits
const BALL_SPEED = 8; // pixels per frame
const BALL_COLOR = "#ff0000";
const PIN_COLOR = "#f5f0e8";
const PIN_SHADOW = "rgba(0,0,0,0.3)";
const LANE_COLOR = "#c4943a";
const BG_COLOR = "#0a0a0a";
const GUTTER_COLOR = "#0d0d0d";

/* ── Types ──────────────────────────────────────────────── */

interface PinState {
  x: number;
  y: number;
  standing: boolean;
  fallProgress: number; // 0 = standing, 1 = fully fallen
}

interface BallState {
  x: number;
  y: number;
  active: boolean;
  dx: number;
}

type Phase = "AIMING" | "ROLLING" | "RESULT" | "LEVEL_COMPLETE" | "GAME_OVER";

/* ── Component ──────────────────────────────────────────── */

export function PinPickerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  // Game state
  const [currentLevel, setCurrentLevel] = useState(0);
  const [rolls, setRolls] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [phase, setPhase] = useState<Phase>("AIMING");
  const [aimX, setAimX] = useState(0.5);
  const [, setLevelStars] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Mutable game refs (don't re-render on every frame)
  const pinsRef = useRef<PinState[]>([]);
  const ballRef = useRef<BallState>({ x: 0, y: 0, active: false, dx: 0 });
  const phaseRef = useRef<Phase>("AIMING");
  const aimXRef = useRef(0.5);
  const rollsRef = useRef(0);
  const canvasSizeRef = useRef({ w: 0, h: 0 });

  // Sync state refs
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { aimXRef.current = aimX; }, [aimX]);

  /** Initialise pins for a given level. */
  const initLevel = useCallback((levelIdx: number) => {
    const level = LEVELS[levelIdx];
    if (!level) return;
    const { w, h } = canvasSizeRef.current;
    const laneLeft = w * 0.15;
    const laneRight = w * 0.85;
    const laneTop = h * 0.05;
    const laneBottom = h * 0.75;
    const laneW = laneRight - laneLeft;
    const laneH = laneBottom - laneTop;

    pinsRef.current = PIN_LAYOUT.map(([px, py], i) => ({
      x: laneLeft + px * laneW,
      y: laneTop + py * laneH,
      standing: level.pins.includes(i),
      fallProgress: level.pins.includes(i) ? 0 : 1,
    }));

    rollsRef.current = 0;
    setRolls(0);
    setPhase("AIMING");
    setAimX(0.5);
  }, []);

  /** Size the canvas to its container. */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    canvasSizeRef.current = { w: rect.width, h: rect.height };
  }, []);

  /** Draw one frame. */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = canvasSizeRef.current;
    const laneLeft = w * 0.15;
    const laneRight = w * 0.85;
    const laneTop = h * 0.05;
    const laneBottom = h * 0.75;

    // Clear
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, w, h);

    // Gutters
    ctx.fillStyle = GUTTER_COLOR;
    ctx.fillRect(laneLeft - 15, laneTop, 15, laneBottom - laneTop);
    ctx.fillRect(laneRight, laneTop, 15, laneBottom - laneTop);

    // Lane
    ctx.fillStyle = LANE_COLOR;
    ctx.fillRect(laneLeft, laneTop, laneRight - laneLeft, laneBottom - laneTop);

    // Lane approach (ball launch area)
    ctx.fillStyle = "#b8862a";
    ctx.fillRect(laneLeft, laneBottom, laneRight - laneLeft, h - laneBottom);

    // Foul line
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(laneLeft, laneBottom);
    ctx.lineTo(laneRight, laneBottom);
    ctx.stroke();

    // Aim guide line
    if (phaseRef.current === "AIMING") {
      const bx = laneLeft + aimXRef.current * (laneRight - laneLeft);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(255,0,0,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx, h * 0.9);
      ctx.lineTo(bx, laneTop);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ball preview
      ctx.beginPath();
      ctx.arc(bx, h * 0.9, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = BALL_COLOR;
      ctx.fill();
    }

    // Draw pins
    for (const pin of pinsRef.current) {
      if (pin.fallProgress >= 1) continue;

      const scale = 1 - pin.fallProgress * 0.6;
      const alpha = 1 - pin.fallProgress;
      const r = PIN_RADIUS * scale;

      // Shadow
      ctx.beginPath();
      ctx.arc(pin.x + 2, pin.y + 2, r, 0, Math.PI * 2);
      ctx.fillStyle = PIN_SHADOW;
      ctx.globalAlpha = alpha * 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Pin
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, r, 0, Math.PI * 2);
      ctx.fillStyle = PIN_COLOR;
      ctx.globalAlpha = alpha;
      ctx.fill();

      // Red stripe
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, r * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = "#cc0000";
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw ball
    const ball = ballRef.current;
    if (ball.active) {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = BALL_COLOR;
      ctx.fill();

      // Finger holes
      ctx.fillStyle = "#0d0d0d";
      ctx.beginPath();
      ctx.arc(ball.x - 3, ball.y - 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ball.x + 3, ball.y - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  /** Update game state per frame. */
  const update = useCallback(() => {
    const ball = ballRef.current;
    const { h } = canvasSizeRef.current;
    const laneTop = h * 0.05;

    // Animate falling pins (immutable update to satisfy React compiler)
    pinsRef.current = pinsRef.current.map((pin) =>
      !pin.standing && pin.fallProgress < 1
        ? { ...pin, fallProgress: Math.min(1, pin.fallProgress + 0.08) }
        : pin,
    );

    if (phaseRef.current !== "ROLLING" || !ball.active) return;

    // Move ball
    ball.y -= BALL_SPEED;
    ball.x += ball.dx;

    // Check pin collisions
    pinsRef.current = pinsRef.current.map((pin) => {
      if (!pin.standing) return pin;
      const dx = ball.x - pin.x;
      const dy = ball.y - pin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < PIN_HIT_RADIUS + BALL_RADIUS) {
        ball.dx += (dx > 0 ? -0.3 : 0.3);
        return { ...pin, standing: false };
      }
      return pin;
    });

    // Ball off screen or past pins
    if (ball.y < laneTop - 20) {
      ball.active = false;

      const anyStanding = pinsRef.current.some((p) => p.standing);
      if (!anyStanding) {
        setPhase("LEVEL_COMPLETE");
      } else {
        setPhase("RESULT");
      }
    }
  }, []);

  /** Launch the ball. */
  const launchBall = useCallback(() => {
    if (phaseRef.current !== "AIMING") return;

    const { w, h } = canvasSizeRef.current;
    const laneLeft = w * 0.15;
    const laneRight = w * 0.85;

    ballRef.current = {
      x: laneLeft + aimXRef.current * (laneRight - laneLeft),
      y: h * 0.9,
      active: true,
      dx: 0,
    };

    rollsRef.current++;
    setRolls((r) => r + 1);
    setPhase("ROLLING");
  }, []);

  /** Continue rolling after a non-clearing roll. */
  const continueRolling = useCallback(() => {
    setPhase("AIMING");
    setAimX(0.5);
  }, []);

  /** Advance to next level. */
  const nextLevel = useCallback(() => {
    const level = LEVELS[currentLevel];
    if (!level) return;

    const r = rollsRef.current;
    const stars = r <= level.stars[0] ? 3 : r <= level.stars[1] ? 2 : 1;
    setLevelStars(stars);
    setTotalStars((s) => s + stars);

    if (currentLevel + 1 >= LEVELS.length) {
      setPhase("GAME_OVER");
    } else {
      setCurrentLevel((l) => l + 1);
      initLevel(currentLevel + 1);
    }
  }, [currentLevel, initLevel]);

  /** Start or restart the game. */
  const startGame = useCallback(() => {
    setCurrentLevel(0);
    setTotalStars(0);
    setGameStarted(true);
    resizeCanvas();
    initLevel(0);
  }, [resizeCanvas, initLevel]);

  // Handle pointer events
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (phaseRef.current !== "AIMING") return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width;
    setAimX(Math.max(0.15, Math.min(0.85, relX)));
  }, []);

  const handlePointerUp = useCallback(() => {
    launchBall();
  }, [launchBall]);

  // Set up canvas and game loop
  useEffect(() => {
    if (!gameStarted) return;
    resizeCanvas();

    const tick = () => {
      update();
      draw();
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    const handleResize = () => {
      resizeCanvas();
      initLevel(currentLevel);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [gameStarted, update, draw, resizeCanvas, initLevel, currentLevel]);

  /* ── Render ───────────────────────────────────────── */

  if (!gameStarted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <span className="text-6xl" aria-hidden="true">🎯</span>
        <h1 className="text-3xl font-bold uppercase tracking-wider">Pin Picker</h1>
        <p className="max-w-md text-sm text-text-muted">
          Aim and roll to knock down pin formations in as few rolls as possible.
          15 levels from easy full racks to nasty splits!
        </p>
        <button
          type="button"
          onClick={startGame}
          className="rounded-full bg-accent px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        >
          Start Game
        </button>
      </div>
    );
  }

  const level = LEVELS[currentLevel];

  return (
    <div className="flex h-full flex-col">
      {/* Level info bar */}
      <div className="flex items-center justify-between bg-black/60 px-4 py-2 backdrop-blur-sm">
        <div>
          <span className="text-xs text-text-muted">Level {level?.id ?? 0} </span>
          <span className="text-sm font-bold">{level?.name ?? ""}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            Rolls: <span className="font-bold">{rolls}</span>
          </span>
          <span className="text-xs text-text-muted">
            Stars: <span className="font-bold text-(--color-score-strike)">{totalStars}⭐</span>
          </span>
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative flex-1 touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <canvas ref={canvasRef} className="block h-full w-full" aria-label="Pin Picker game canvas — aim and launch the ball to knock down pins" />

        {/* Result overlay */}
        {phase === "RESULT" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <button
              type="button"
              onClick={continueRolling}
              className="rounded-full bg-surface-elevated px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-accent"
            >
              Roll Again
            </button>
          </div>
        )}

        {/* Level complete overlay */}
        {phase === "LEVEL_COMPLETE" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-panel p-6">
              <span className="text-4xl" aria-hidden="true">🎉</span>
              <p className="text-lg font-bold uppercase tracking-wider">Level Clear!</p>
              <p className="text-sm text-text-muted">
                {rolls} {rolls === 1 ? "roll" : "rolls"}
              </p>
              <button
                type="button"
                onClick={nextLevel}
                className="rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
              >
                {currentLevel + 1 < LEVELS.length ? "Next Level" : "See Results"}
              </button>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {phase === "GAME_OVER" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="flex flex-col items-center gap-4 rounded-xl bg-panel p-8">
              <span className="text-5xl" aria-hidden="true">🏆</span>
              <p className="text-xl font-bold uppercase tracking-wider">All Levels Complete!</p>
              <p className="text-3xl font-black text-(--color-score-strike)">{totalStars}⭐</p>
              <p className="text-sm text-text-muted">
                out of {LEVELS.length * 3} possible stars
              </p>
              <button
                type="button"
                onClick={startGame}
                className="rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
