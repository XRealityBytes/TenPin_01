/**
 * Physics configuration for the 3D bowling game.
 *
 * Defines body properties (mass, friction, restitution) and geometry
 * dimensions for pins, ball, lane, and gutters. All values are in
 * Three.js units (1 unit ≈ 1 foot for the bowling lane).
 */

import type { Triplet } from "@react-three/cannon";

/* ── Lane dimensions ────────────────────────────────────── */
export const LANE_LENGTH = 20; // units (scaled, not real 60ft)
export const LANE_WIDTH = 3.5;
export const LANE_HEIGHT = 0.2;
export const GUTTER_WIDTH = 0.5;
export const GUTTER_DEPTH = 0.3;

/* ── Pin layout ─────────────────────────────────────────── */
export const PIN_RADIUS = 0.12;
export const PIN_HEIGHT = 0.45;
export const PIN_MASS = 1.5;
export const PIN_FRICTION = 0.4;
export const PIN_RESTITUTION = 0.3;

/** Standard 10-pin triangle formation positions (x, z) relative to lane end. */
export const PIN_POSITIONS: Triplet[] = [
  // Row 1 (headpin)
  [0, PIN_HEIGHT / 2, -LANE_LENGTH / 2 + 2],
  // Row 2
  [-0.3, PIN_HEIGHT / 2, -LANE_LENGTH / 2 + 2 - 0.52],
  [0.3, PIN_HEIGHT / 2, -LANE_LENGTH / 2 + 2 - 0.52],
  // Row 3
  [-0.6, PIN_HEIGHT / 2, -LANE_LENGTH / 2 + 2 - 1.04],
  [0, PIN_HEIGHT / 2, -LANE_LENGTH / 2 + 2 - 1.04],
  [0.6, PIN_HEIGHT / 2, -LANE_LENGTH / 2 + 2 - 1.04],
  // Row 4
  [-0.9, PIN_HEIGHT / 2, -LANE_LENGTH / 2 + 2 - 1.56],
  [-0.3, PIN_HEIGHT / 2, -LANE_LENGTH / 2 + 2 - 1.56],
  [0.3, PIN_HEIGHT / 2, -LANE_LENGTH / 2 + 2 - 1.56],
  [0.9, PIN_HEIGHT / 2, -LANE_LENGTH / 2 + 2 - 1.56],
];

/** Threshold angle (radians) — pin is "down" if tilted beyond this. */
export const PIN_DOWN_ANGLE = Math.PI / 4; // 45 degrees

/* ── Ball properties ────────────────────────────────────── */
export const BALL_RADIUS = 0.22;
export const BALL_MASS = 6;
export const BALL_FRICTION = 0.3;
export const BALL_RESTITUTION = 0.1;
export const BALL_START_Z = LANE_LENGTH / 2 - 1;
export const BALL_MAX_SPEED = 18;
export const BALL_MIN_SPEED = 6;

/* ── Physics world ──────────────────────────────────────── */
export const GRAVITY: Triplet = [0, -9.81, 0];
export const PHYSICS_ITERATIONS = 10;

/** How long to wait (ms) after ball stops to count fallen pins. */
export const SETTLE_TIME = 2000;
