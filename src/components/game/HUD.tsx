/**
 * HUD — heads-up display overlay for the 3D bowling game.
 *
 * Shows frame/roll indicator, running score, power meter, pin count,
 * flash messages (Strike!, Spare!), and game-over summary.
 * Positioned with absolute CSS over the Canvas.
 */

"use client";

import { cn } from "@/lib/cn";
import type { BowlingGameState } from "@/hooks/useBowlingGame";

interface HUDProps {
  state: BowlingGameState;
  onNextRoll: () => void;
  onReset: () => void;
}

export function HUD({ state, onNextRoll, onReset }: HUDProps) {
  const { phase, game, power, flashMessage } = state;
  const currentFrame = game.currentFrame + 1;
  const currentRoll = game.currentRoll + 1;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      {/* Top bar — score info */}
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-xs text-[var(--color-text-muted)]">Frame </span>
          <span className="text-sm font-bold tabular-nums">{Math.min(currentFrame, 10)}</span>
          <span className="mx-1 text-[var(--color-text-muted)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Roll </span>
          <span className="text-sm font-bold tabular-nums">{currentRoll}</span>
        </div>

        <div className="rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-xs text-[var(--color-text-muted)]">Score </span>
          <span className="text-lg font-black tabular-nums text-[var(--color-brand-accent)]">
            {game.totalScore}
          </span>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="pointer-events-auto rounded-lg bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm transition-colors hover:bg-[var(--color-brand-accent)]/20"
        >
          Reset
        </button>
      </div>

      {/* Mini scorecard - frame scores */}
      <div className="mx-4 mt-2 flex justify-center">
        <div className="flex rounded-md bg-black/60 backdrop-blur-sm">
          {game.frames.map((frame, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col items-center border-r border-white/10 px-1.5 py-0.5 last:border-r-0",
                i === game.currentFrame && phase !== "GAME_OVER" && "bg-[var(--color-brand-accent)]/20",
              )}
            >
              <span className="text-[9px] text-[var(--color-text-muted)]">{i + 1}</span>
              <div className="flex gap-0.5">
                {frame.marks.map((mark, j) => (
                  <span
                    key={j}
                    className={cn(
                      "text-[10px] font-bold",
                      mark === "X" && "text-[var(--color-score-strike)]",
                      mark === "/" && "text-[var(--color-brand-accent)]",
                    )}
                  >
                    {mark}
                  </span>
                ))}
              </div>
              <span className="text-[10px] font-bold tabular-nums">
                {frame.cumulativeScore ?? ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Center flash message */}
      {flashMessage && (
        <div className="flex flex-1 items-center justify-center">
          <div role="alert" aria-live="assertive" className="animate-pulse rounded-xl bg-black/80 px-8 py-4 backdrop-blur-sm">
            <p
              className={cn(
                "text-3xl font-black uppercase tracking-wider",
                flashMessage.includes("Strike") && "text-[var(--color-score-strike)]",
                flashMessage.includes("Spare") && "text-[var(--color-brand-accent)]",
                flashMessage.includes("Gutter") && "text-[var(--color-text-muted)]",
              )}
            >
              {flashMessage}
            </p>
          </div>
        </div>
      )}

      {/* Bottom controls area */}
      <div className="mt-auto flex flex-col items-center gap-3 pb-4">
        {/* Power meter (visible during charging) */}
        {phase === "CHARGING" && (
          <div className="flex items-center gap-2 rounded-lg bg-black/70 px-4 py-2 backdrop-blur-sm">
            <span className="text-xs text-[var(--color-text-muted)]">Power</span>
            <div className="h-3 w-32 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--color-brand-accent)] transition-all duration-75"
                style={{ width: `${power * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums">{Math.round(power * 100)}%</span>
          </div>
        )}

        {/* Instructions */}
        {phase === "AIMING" && (
          <p className="rounded-lg bg-black/60 px-4 py-2 text-xs text-[var(--color-text-muted)] backdrop-blur-sm">
            Drag left/right to aim · Click & hold to charge power
          </p>
        )}

        {/* Next roll / Continue button */}
        {phase === "SCORING" && (
          <button
            type="button"
            onClick={onNextRoll}
            className="pointer-events-auto rounded-full bg-[var(--color-brand-accent)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          >
            Next Roll
          </button>
        )}

        {/* Game over */}
        {phase === "GAME_OVER" && (
          <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-xl bg-black/80 px-8 py-6 backdrop-blur-sm">
            <span className="text-4xl" aria-hidden="true">🏆</span>
            <p className="text-xl font-bold uppercase tracking-wider">Game Over</p>
            <p className="text-3xl font-black tabular-nums text-[var(--color-brand-accent)]">
              {game.totalScore}
            </p>
            <button
              type="button"
              onClick={onReset}
              className="rounded-full bg-[var(--color-brand-accent)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
