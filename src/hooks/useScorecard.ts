/**
 * useScorecard — manages multi-player match state with localStorage persistence.
 *
 * Provides all state and actions for the scorecard UI:
 * - Create / resume matches
 * - Add / remove players (1–6)
 * - Record rolls (with validation)
 * - Auto-advance to next player / next frame
 * - Persist to and hydrate from localStorage
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { calculateGame, getMaxPins, validateRoll } from "@/lib/scoring";
import type { MatchState, PlayerState } from "@/types/scoring";

/* ── Constants ──────────────────────────────────────────── */
const STORAGE_KEY = "tenpin-scorecard";
const MAX_PLAYERS = 6;
const MIN_PLAYERS = 1;

/* ── Helpers ────────────────────────────────────────────── */

/** Generate a simple unique ID (crypto.randomUUID where available, otherwise fallback). */
function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Create a fresh player state. */
function createPlayer(name: string): PlayerState {
  return {
    id: uid(),
    name,
    game: calculateGame([]),
  };
}

/** Create a fresh match state. */
function createMatch(playerNames: string[]): MatchState {
  const now = new Date().toISOString();
  return {
    id: uid(),
    createdAt: now,
    updatedAt: now,
    players: playerNames.map(createPlayer),
    activePlayerIndex: 0,
    isComplete: false,
  };
}

/* ── Hook ───────────────────────────────────────────────── */

export function useScorecard() {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const hydrated = useRef(false);

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: MatchState = JSON.parse(raw);
        // Recompute game states from rolls (the source of truth)
        parsed.players = parsed.players.map((p) => ({
          ...p,
          game: calculateGame(p.game.rolls),
        }));
        setMatch(parsed);
        setHasSaved(true);
      }
    } catch {
      // corrupt data — ignore
    }
  }, []);

  /* Persist to localStorage on every state change */
  useEffect(() => {
    if (!match) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
    } catch {
      // quota exceeded — ignore
    }
  }, [match]);

  /** Start a new match with the given player names. */
  const newMatch = useCallback((names: string[]) => {
    const clamped = names.slice(0, MAX_PLAYERS);
    if (clamped.length < MIN_PLAYERS) clamped.push("Player 1");
    setMatch(createMatch(clamped));
    setHasSaved(true);
  }, []);

  /** Resume the saved match (no-op if already loaded). */
  const resumeMatch = useCallback(() => {
    // Already loaded via hydration
  }, []);

  /** Clear saved state and go back to the setup screen. */
  const clearMatch = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMatch(null);
    setHasSaved(false);
  }, []);

  /** Record a roll for the active player. */
  const recordRoll = useCallback((pins: number) => {
    setMatch((prev) => {
      if (!prev || prev.isComplete) return prev;

      const activePlayer = prev.players[prev.activePlayerIndex];
      if (!validateRoll(activePlayer.game.rolls, pins)) return prev;

      const newRolls = [...activePlayer.game.rolls, pins];
      const newGame = calculateGame(newRolls);

      const updatedPlayers = prev.players.map((p, i) =>
        i === prev.activePlayerIndex ? { ...p, game: newGame } : p,
      );

      // Determine if we should advance to the next player.
      // Advance when: the current player's frame has progressed or game is complete.
      const prevFrame = activePlayer.game.currentFrame;
      const newFrame = newGame.currentFrame;
      const frameAdvanced = newFrame > prevFrame || newGame.isComplete;

      let nextActiveIndex = prev.activePlayerIndex;
      let matchComplete = false;

      if (frameAdvanced) {
        // Move to next player, or wrap around
        nextActiveIndex = prev.activePlayerIndex + 1;
        if (nextActiveIndex >= updatedPlayers.length) {
          nextActiveIndex = 0;
          // Check if all players are done
          matchComplete = updatedPlayers.every((p) => p.game.isComplete);
        }
        // If the next player's game is already complete (shouldn't happen normally),
        // find the next non-complete player
        if (!matchComplete) {
          let attempts = 0;
          while (
            updatedPlayers[nextActiveIndex].game.isComplete &&
            attempts < updatedPlayers.length
          ) {
            nextActiveIndex = (nextActiveIndex + 1) % updatedPlayers.length;
            attempts++;
          }
          if (attempts >= updatedPlayers.length) matchComplete = true;
        }
      }

      return {
        ...prev,
        players: updatedPlayers,
        activePlayerIndex: nextActiveIndex,
        isComplete: matchComplete,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  /** Undo the last roll for the active player. */
  const undoLastRoll = useCallback(() => {
    setMatch((prev) => {
      if (!prev) return prev;

      // Find the last player who has rolls to undo.
      // If the active player has rolls, undo theirs. Otherwise look backwards.
      let targetIndex = prev.activePlayerIndex;
      let found = false;

      for (let i = 0; i < prev.players.length; i++) {
        const idx = (prev.activePlayerIndex - i + prev.players.length) % prev.players.length;
        if (prev.players[idx].game.rolls.length > 0) {
          targetIndex = idx;
          found = true;
          break;
        }
      }

      if (!found) return prev;

      const targetPlayer = prev.players[targetIndex];
      const newRolls = targetPlayer.game.rolls.slice(0, -1);
      const newGame = calculateGame(newRolls);

      const updatedPlayers = prev.players.map((p, i) =>
        i === targetIndex ? { ...p, game: newGame } : p,
      );

      return {
        ...prev,
        players: updatedPlayers,
        activePlayerIndex: targetIndex,
        isComplete: false,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  /** Add a player (up to MAX_PLAYERS). */
  const addPlayer = useCallback((name: string) => {
    setMatch((prev) => {
      if (!prev || prev.players.length >= MAX_PLAYERS) return prev;
      return {
        ...prev,
        players: [...prev.players, createPlayer(name)],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  /** Remove a player by index (must keep at least MIN_PLAYERS). */
  const removePlayer = useCallback((index: number) => {
    setMatch((prev) => {
      if (!prev || prev.players.length <= MIN_PLAYERS) return prev;
      const updatedPlayers = prev.players.filter((_, i) => i !== index);
      return {
        ...prev,
        players: updatedPlayers,
        activePlayerIndex: Math.min(prev.activePlayerIndex, updatedPlayers.length - 1),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  /* Derived state */
  const activePlayer = match?.players[match.activePlayerIndex] ?? null;
  const maxPins = activePlayer ? getMaxPins(activePlayer.game.rolls) : 10;

  return {
    match,
    hasSaved,
    activePlayer,
    maxPins,
    newMatch,
    resumeMatch,
    clearMatch,
    recordRoll,
    undoLastRoll,
    addPlayer,
    removePlayer,
  };
}
