/**
 * useBowlingGame — manages a multiplayer bowling game state machine.
 *
 * State flow per turn:
 *   AIMING → CHARGING → ROLLING → SETTLING → SCORING → (next roll / next player / GAME_OVER)
 *
 * Supports 1–3 players with configurable frame count (default 2).
 * Players take turns completing one frame each before the next player goes.
 * Integrates with the scoring engine for per-player score tracking.
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

export interface PlayerData {
  name: string;
  rolls: number[];
  game: GameState;
}

export interface BowlingGameState {
  phase: BowlingPhase;
  /** All players and their scoring state. */
  players: PlayerData[];
  /** Index of the player currently bowling. */
  activePlayerIndex: number;
  /** Scoring engine state for the active player. */
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
  /** Total frames per player. */
  totalFrames: number;
  /** Incremented on every roll reset — used as Ball key to force remount. */
  turnKey: number;
  /** True when every player has completed all frames. */
  matchComplete: boolean;
}

const INITIAL_PINS = () => Array.from({ length: 10 }, () => true);

function buildInitialState(playerNames: string[], totalFrames: number): BowlingGameState {
  const players = playerNames.map((name) => ({
    name,
    rolls: [] as number[],
    game: calculateGame([], totalFrames),
  }));

  return {
    phase: "AIMING",
    players,
    activePlayerIndex: 0,
    game: players[0].game,
    aimX: 0,
    power: 0,
    spin: 0,
    standingPins: INITIAL_PINS(),
    lastKnockdown: 0,
    flashMessage: null,
    totalFrames,
    turnKey: 0,
    matchComplete: false,
  };
}

/* ── Hook ───────────────────────────────────────────────── */

export function useBowlingGame(playerNames: string[], totalFrames: number = 2) {
  const [state, setState] = useState<BowlingGameState>(() =>
    buildInitialState(playerNames, totalFrames),
  );

  // Use refs for mutable roll data so setState closures stay correct
  const rollsRefs = useRef<number[][]>(playerNames.map(() => []));

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
    setState((s) =>
      s.phase === "CHARGING" ? { ...s, power: Math.max(0, Math.min(1, power)) } : s,
    );
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
  const reportPinStates = useCallback(
    (standing: boolean[]) => {
      setState((prev) => {
        if (prev.phase !== "SETTLING") return prev;

        const pidx = prev.activePlayerIndex;
        const prevStanding = prev.standingPins;
        let knockedDown = 0;
        for (let i = 0; i < 10; i++) {
          if (prevStanding[i] && !standing[i]) knockedDown++;
        }

        // Record the roll for the active player
        const newRolls = [...rollsRefs.current[pidx]];
        if (validateRoll(newRolls, knockedDown, prev.totalFrames)) {
          newRolls.push(knockedDown);
        } else {
          const maxPins = getMaxPins(newRolls, prev.totalFrames);
          newRolls.push(Math.min(knockedDown, maxPins));
        }
        rollsRefs.current[pidx] = newRolls;

        const newGame = calculateGame(newRolls, prev.totalFrames);

        // Update player record
        const newPlayers = prev.players.map((p, i) =>
          i === pidx ? { ...p, rolls: newRolls, game: newGame } : p,
        );

        // Determine flash message
        let flash: string | null = null;
        if (knockedDown === 10 && prevStanding.filter(Boolean).length === 10) {
          flash = "STRIKE!";
        } else if (knockedDown > 0 && standing.every((s) => !s)) {
          flash = "SPARE!";
        } else if (knockedDown === 0) {
          flash = "Gutter ball...";
        }

        // Check if this player's game is now complete
        const allPlayersComplete = newPlayers.every((p) => p.game.isComplete);

        if (allPlayersComplete) {
          return {
            ...prev,
            phase: "GAME_OVER",
            players: newPlayers,
            game: newGame,
            standingPins: standing,
            lastKnockdown: knockedDown,
            flashMessage: flash,
            matchComplete: true,
          };
        }

        return {
          ...prev,
          phase: "SCORING",
          players: newPlayers,
          game: newGame,
          standingPins: standing,
          lastKnockdown: knockedDown,
          flashMessage: flash,
        };
      });
    },
    [],
  );

  /** Transition from SCORING to next roll, next player, or game over. */
  const nextRoll = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "SCORING") return prev;

      const pidx = prev.activePlayerIndex;
      const activeGame = prev.players[pidx].game;

      // Detect whether the player's frame just completed:
      // - Their game is fully complete, OR
      // - The current frame has 0 rolls (meaning we've advanced past the previous one)
      const currentFrame = activeGame.isComplete
        ? null
        : activeGame.frames[activeGame.currentFrame];
      const frameJustCompleted = activeGame.isComplete || (currentFrame != null && currentFrame.rolls.length === 0);

      if (frameJustCompleted) {
        // This player finished their frame — move to next player or next round
        const nextPidx = findNextPlayer(prev.players, pidx);

        if (nextPidx === -1) {
          // All players complete
          return {
            ...prev,
            phase: "GAME_OVER",
            matchComplete: true,
            flashMessage: null,
          };
        }

        // Switch to next player — always reset pins for new player's turn
        const nextPlayerGame = prev.players[nextPidx].game;
        return {
          ...prev,
          phase: "AIMING",
          activePlayerIndex: nextPidx,
          game: nextPlayerGame,
          aimX: 0,
          power: 0,
          spin: 0,
          standingPins: INITIAL_PINS(),
          flashMessage: null,
          turnKey: prev.turnKey + 1,
        };
      }

      // Same player, same frame, next roll (e.g. second roll of frame)
      const allDown = prev.standingPins.every((s) => !s);
      return {
        ...prev,
        phase: "AIMING",
        aimX: 0,
        power: 0,
        spin: 0,
        standingPins: allDown ? INITIAL_PINS() : prev.standingPins,
        flashMessage: null,
        turnKey: prev.turnKey + 1,
      };
    });
  }, []);

  /** Reset the entire game. */
  const resetGame = useCallback(() => {
    rollsRefs.current = playerNames.map(() => []);
    setState(buildInitialState(playerNames, totalFrames));
  }, [playerNames, totalFrames]);

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

/** Find the next player who hasn't completed all frames, cycling round-robin. */
function findNextPlayer(players: PlayerData[], currentIdx: number): number {
  const n = players.length;
  for (let offset = 1; offset <= n; offset++) {
    const idx = (currentIdx + offset) % n;
    if (!players[idx].game.isComplete) return idx;
  }
  return -1; // all complete
}
