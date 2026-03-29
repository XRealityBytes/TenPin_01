/**
 * ScorecardView — the full interactive scorecard client component.
 *
 * Handles the setup screen (new game / resume), player management,
 * scorecard grid display for all players, pin input, undo, and
 * new-game actions. Delegates state to the useScorecard hook.
 */

"use client";

import { useCallback, useState } from "react";

import { PinInput } from "@/components/scorecard/PinInput";
import { ScorecardGrid } from "@/components/scorecard/ScorecardGrid";
import { Container } from "@/components/Container";
import { cn } from "@/lib/cn";
import { useScorecard } from "@/hooks/useScorecard";

export function ScorecardView() {
  const {
    match,
    hasSaved,
    activePlayer,
    maxPins,
    newMatch,
    clearMatch,
    recordRoll,
    undoLastRoll,
  } = useScorecard();

  /* ── Setup Screen ─────────────────────────────────────── */
  if (!match) {
    return <SetupScreen hasSaved={hasSaved} onStart={newMatch} onResume={() => {}} />;
  }

  /* ── Active Game ──────────────────────────────────────── */
  return (
    <Container className="flex flex-col gap-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider">Scorecard</h1>
          {match.isComplete ? (
            <p className="text-sm text-[var(--color-score-strike)]">Game Over!</p>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">
              {activePlayer?.name}&apos;s turn — Frame{" "}
              {activePlayer ? activePlayer.game.currentFrame + 1 : ""}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={undoLastRoll}
            className="rounded-full border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-[var(--color-surface-elevated)]"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={clearMatch}
            className="rounded-full border border-[var(--color-brand-accent)]/40 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-accent)] transition-colors hover:bg-[var(--color-brand-accent)]/10"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Scorecard grids for all players */}
      <div className="flex flex-col gap-3">
        {match.players.map((player, i) => (
          <ScorecardGrid
            key={player.id}
            game={player.game}
            playerName={player.name}
            isActive={i === match.activePlayerIndex && !match.isComplete}
          />
        ))}
      </div>

      {/* Pin input (only when game is not complete) */}
      {!match.isComplete && (
        <PinInput maxPins={maxPins} onRoll={recordRoll} disabled={match.isComplete} />
      )}

      {/* Final scores banner */}
      {match.isComplete && <FinalScores match={match} onNewGame={clearMatch} />}
    </Container>
  );
}

/* ── Setup Screen ───────────────────────────────────────── */

function SetupScreen({
  hasSaved,
  onStart,
  onResume,
}: {
  hasSaved: boolean;
  onStart: (names: string[]) => void;
  onResume: () => void;
}) {
  const [playerNames, setPlayerNames] = useState<string[]>(["Player 1"]);

  const addPlayer = useCallback(() => {
    if (playerNames.length >= 6) return;
    setPlayerNames((prev) => [...prev, `Player ${prev.length + 1}`]);
  }, [playerNames.length]);

  const removePlayer = useCallback((index: number) => {
    if (playerNames.length <= 1) return;
    setPlayerNames((prev) => prev.filter((_, i) => i !== index));
  }, [playerNames.length]);

  const updateName = useCallback((index: number, name: string) => {
    setPlayerNames((prev) => prev.map((n, i) => (i === index ? name : n)));
  }, []);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-8 py-8">
      <div className="text-center">
        <span className="text-6xl" aria-hidden="true">🎳</span>
        <h1 className="mt-4 text-3xl font-bold uppercase tracking-wider">Scorecard</h1>
        <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
          Track your real-world bowling matches with automatic scoring for up to
          6 players.
        </p>
      </div>

      {/* Player name inputs */}
      <div className="flex w-full max-w-sm flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          Players
        </h2>
        {playerNames.map((name, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => updateName(i, e.target.value)}
              maxLength={20}
              aria-label={`Player ${i + 1} name`}
              className="flex-1 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-brand-accent)]"
              placeholder={`Player ${i + 1}`}
            />
            {playerNames.length > 1 && (
              <button
                type="button"
                onClick={() => removePlayer(i)}
                aria-label={`Remove player ${i + 1}`}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)]"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {playerNames.length < 6 && (
          <button
            type="button"
            onClick={addPlayer}
            className="rounded-lg border border-dashed border-[var(--color-border-subtle)] px-3 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-text-primary)] hover:text-[var(--color-text-primary)]"
          >
            + Add Player
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onStart(playerNames.map((n) => n.trim() || "Player"))}
          className="rounded-full bg-[var(--color-brand-accent)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        >
          Start Game
        </button>
        {hasSaved && (
          <button
            type="button"
            onClick={onResume}
            className="rounded-full border border-[var(--color-border-subtle)] px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-[var(--color-surface-elevated)]"
          >
            Resume
          </button>
        )}
      </div>
    </Container>
  );
}

/* ── Final Scores Banner ────────────────────────────────── */

function FinalScores({
  match,
  onNewGame,
}: {
  match: import("@/types/scoring").MatchState;
  onNewGame: () => void;
}) {
  // Sort players by score descending
  const sorted = [...match.players].sort((a, b) => b.game.totalScore - a.game.totalScore);
  const winner = sorted[0];

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-[var(--color-score-strike)]/30 bg-[var(--color-surface-panel)] p-6 text-center">
      <span className="text-5xl" aria-hidden="true">🏆</span>
      <h2 className="text-xl font-bold uppercase tracking-wider">
        {match.players.length > 1 ? `${winner.name} Wins!` : "Game Complete!"}
      </h2>

      <div className="flex flex-wrap justify-center gap-4">
        {sorted.map((player, i) => (
          <div
            key={player.id}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border px-4 py-3",
              i === 0
                ? "border-[var(--color-score-strike)]/40 bg-[var(--color-score-strike)]/10"
                : "border-[var(--color-border-subtle)]",
            )}
          >
            <span className="text-xs text-[var(--color-text-muted)]">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
            </span>
            <span className="text-sm font-bold">{player.name}</span>
            <span className="text-2xl font-black tabular-nums text-[var(--color-brand-accent)]">
              {player.game.totalScore}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onNewGame}
        className="mt-2 rounded-full bg-[var(--color-brand-accent)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
      >
        New Game
      </button>
    </div>
  );
}
