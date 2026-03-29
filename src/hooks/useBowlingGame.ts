/**
 * useBowlingGame — manages the full game state machine for Lane Play.
 *
 * State flow:
 *   IDLE → AIMING → CHARGING → ROLLING → SETTLING → SCORING → (repeat or GAME_OVER)
 *
 * Tracks rolls, fallen pins, frame progression, and integrates with the
 * scoring engine. The 3D scene reads state from this hook and dispatches
 * actions back into it.
 */

"use client";

import { useCallback, useRef, useState } from "react";

import { calculateGame, getMaxPins, validateRoll } from "@/lib/scoring";
import type { GameState } from "@/types/scoring";

/* ── Types ──────────────────────────────────────────────── */

export type BowlingPhase =
  | "IDLE"
  | "AIMING"
  | "CHARGING"
  | "ROLLING"
  | "SETTLING"
  | "SCORING"
  | "RESETTING"
  | "GAME_OVER";

export interface BowlingGameState {
  phase: BowlingPhase;
  /** Scoring engine state (derived from rolls). */
  game: GameState;
  /** Lateral aim position (-1 to 1: left to right of lane). */
  aimX: number;
  /** Power level 0–1. */
  power: number;
  /** Spin direction (-1 left, 0 straight, 1 right). */
  spin: number;
  /** Which pins are currently standing (indices 0–9). */
  standingPins: boolean[];
  /** Number of pins knocked down on the current roll. */
  lastKnockdown: number;
  /** Message to flash on screen (e.g. "Strike!", "Spare!"). */
  flashMessage: string | null;
}

const INITIAL_PINS = () => Array.from({ length: 10 }, () => true);

function initialState(): BowlingGameState {
  return {
    phase: "AIMING",
    game: calculateGame([]),
    aimX: 0,
    power: 0,
    spin: 0,
    standingPins: INITIAL_PINS(),
    lastKnockdown: 0,
    flashMessage: null,
  };
}

/* ── Hook ───────────────────────────────────────────────── */

export function useBowlingGame() {
  const [state, setState] = useState<BowlingGameState>(initialState);
  const rollsRef = useRef<number[]>([]);

  /** Update aim position (called continuously during AIMING phase). */
  const setAim = useCallback((x: number) => {
    setState((s) => (s.phase === "AIMING" ? { ...s, aimX: Math.max(-1, Math.min(1, x)) } : s));
  }, []);

  /** Start charging power (transition from AIMING → CHARGING). */
  const startCharge = useCallback(() => {
    setState((s) => (s.phase === "AIMING" ? { ...s, phase: "CHARGING", power: 0 } : s));
  }, []);

  /** Update power level (called continuously during CHARGING). */
  const setPower = useCallback((power: number) => {
    setState((s) => (s.phase === "CHARGING" ? { ...s, power: Math.max(0, Math.min(1, power)) } : s));
  }, []);

  /** Release the ball (transition from CHARGING → ROLLING). */
  const releaseBall = useCallback((spin: number = 0) => {
    setState((s) =>
      s.phase === "CHARGING"
        ? { ...s, phase: "ROLLING", spin: Math.max(-1, Math.min(1, spin)) }
        : s,
    );
  }, []);

  /** Ball has stopped — transition to SETTLING. */
  const ballStopped = useCallback(() => {
    setState((s) => (s.phase === "ROLLING" ? { ...s, phase: "SETTLING" } : s));
  }, []);

  /** Report which pins are still standing after the roll settles. */
  const reportPinStates = useCallback((standing: boolean[]) => {
    setState((prev) => {
      if (prev.phase !== "SETTLING") return prev;

      const prevStanding = prev.standingPins;
      let knockedDown = 0;
      for (let i = 0; i < 10; i++) {
        if (prevStanding[i] && !standing[i]) knockedDown++;
      }

      // Record the roll
      const newRolls = [...rollsRef.current];
      if (validateRoll(newRolls, knockedDown)) {
        newRolls.push(knockedDown);
      } else {
        // Fallback: record max valid roll
        const maxPins = getMaxPins(newRolls);
        newRolls.push(Math.min(knockedDown, maxPins));
      }
      rollsRef.current = newRolls;

      const newGame = calculateGame(newRolls);

      // Determine flash message
      let flash: string | null = null;
      const currentFrameIdx = prev.game.currentFrame;
      const newFrameIdx = newGame.currentFrame;

      if (knockedDown === 10 && prevStanding.filter(Boolean).length === 10) {
        flash = "STRIKE!";
      } else if (knockedDown > 0 && standing.every((s) => !s)) {
        flash = "SPARE!";
      } else if (knockedDown === 0) {
        flash = "Gutter ball...";
      }

      // Determine next phase
      const frameAdvanced = newFrameIdx > currentFrameIdx || newGame.isComplete;
      const needsSecondRoll = !frameAdvanced && !newGame.isComplete;

      if (newGame.isComplete) {
        return {
          ...prev,
          phase: "GAME_OVER",
          game: newGame,
          standingPins: standing,
          lastKnockdown: knockedDown,
          flashMessage: flash,
        };
      }

      return {
        ...prev,
        phase: "SCORING",
        game: newGame,
        standingPins: needsSecondRoll ? standing : standing,
        lastKnockdown: knockedDown,
        flashMessage: flash,
      };
    });
  }, []);

  /** Transition from SCORING to next roll (RESETTING then AIMING). */
  const nextRoll = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "SCORING") return prev;

      const game = prev.game;

      // Check if pins need to be reset (new frame or 10th-frame strike/spare reset)
      const prevRollCount = rollsRef.current.length;
      const frameIdx = game.currentFrame;
      const frame = game.frames[frameIdx];

      // Pins reset on: new frame start (all pins standing), or frame 10 after strike/spare
      const allDown = prev.standingPins.every((s) => !s);
      const needsReset = allDown || frame?.rolls.length === 0;

      return {
        ...prev,
        phase: "AIMING",
        aimX: 0,
        power: 0,
        spin: 0,
        standingPins: needsReset ? INITIAL_PINS() : prev.standingPins,
        flashMessage: null,
      };
    });
  }, []);

  /** Reset the entire game. */
  const resetGame = useCallback(() => {
    rollsRef.current = [];
    setState(initialState());
  }, []);

  return {
    state,
    setAim,
    startCharge,
    setPower,
    releaseBall,
    ballStopped,
    reportPinStates,
    nextRoll,
    resetGame,
  };
}
