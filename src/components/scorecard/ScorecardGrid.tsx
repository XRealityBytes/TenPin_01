/**
 * ScorecardGrid — 10-frame scorecard display for a single player.
 *
 * Renders a CSS Grid with one column per frame (frame 10 is wider to
 * accommodate 3 rolls). Shows roll marks, running totals, and highlights
 * the active frame with the brand accent.
 */

"use client";

import { cn } from "@/lib/cn";
import type { FrameResult, GameState } from "@/types/scoring";

interface ScorecardGridProps {
  game: GameState;
  playerName: string;
  isActive: boolean;
}

/** Render a single mark cell (X, /, -, or number). */
function MarkCell({ mark, isStrike }: { mark: string | number; isStrike: boolean }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded text-xs font-bold",
        mark === "X" && "text-[var(--color-score-strike)]",
        mark === "/" && "text-[var(--color-brand-accent)]",
        mark === "-" && "text-[var(--color-text-muted)]",
        typeof mark === "number" && "text-[var(--color-text-primary)]",
      )}
    >
      {mark}
    </span>
  );
}

/** Render a single frame column. */
function FrameCell({
  frame,
  isCurrent,
}: {
  frame: FrameResult;
  isCurrent: boolean;
}) {
  const isTenth = frame.frameNumber === 10;

  return (
    <div
      className={cn(
        "flex flex-col border-r border-[var(--color-border-subtle)]",
        isTenth && "col-span-2",
        isCurrent && "bg-[var(--color-brand-accent)]/10 ring-1 ring-inset ring-[var(--color-brand-accent)]/40",
      )}
    >
      {/* Frame number */}
      <div className="border-b border-[var(--color-border-subtle)] px-1 py-0.5 text-center text-[10px] text-[var(--color-text-muted)]">
        {frame.frameNumber}
      </div>

      {/* Roll marks */}
      <div className="flex min-h-[28px] items-center justify-center gap-0.5 border-b border-[var(--color-border-subtle)] px-1 py-1">
        {frame.marks.length > 0 ? (
          frame.marks.map((mark, i) => (
            <MarkCell key={i} mark={mark} isStrike={frame.isStrike} />
          ))
        ) : (
          <span className="h-7 w-7" />
        )}
      </div>

      {/* Cumulative score */}
      <div className="flex min-h-[28px] items-center justify-center px-1 py-1 text-sm font-bold tabular-nums">
        {frame.cumulativeScore ?? ""}
      </div>
    </div>
  );
}

export function ScorecardGrid({ game, playerName, isActive }: ScorecardGridProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-[var(--color-border-subtle)]",
        isActive && "ring-2 ring-[var(--color-brand-accent)]/30",
      )}
    >
      <div className="flex min-w-[600px]">
        {/* Player name column */}
        <div className="sticky left-0 z-10 flex w-24 shrink-0 flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)]">
          <div className="flex flex-1 items-center px-2 py-1">
            <span className="truncate text-sm font-bold">{playerName}</span>
          </div>
          {/* Total score */}
          <div className="border-t border-[var(--color-border-subtle)] px-2 py-1 text-center">
            <span className="text-lg font-black tabular-nums text-[var(--color-brand-accent)]">
              {game.totalScore}
            </span>
          </div>
        </div>

        {/* Frame columns — 9 regular + frame 10 (takes 2 cols) = 11 col units */}
        <div className="grid flex-1 grid-cols-[repeat(9,1fr)_2fr]">
          {game.frames.map((frame) => (
            <FrameCell
              key={frame.frameNumber}
              frame={frame}
              isCurrent={isActive && frame.frameNumber === game.currentFrame + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
