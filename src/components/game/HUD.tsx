/**
 * HUD — multiplayer scoreboard overlay for the 3D bowling game.
 *
 * Shows a left-side vertical scoreboard with all players' names, scores,
 * and frame progress. Highlights the active player. Also shows power meter,
 * flash messages, and game-over summary.
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
  const { phase, players, activePlayerIndex, power, flashMessage } = state;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex">
      {/* Left-side scoreboard */}
      <div className="flex flex-col gap-2 p-3">
        <div className="rounded-lg bg-black/75 p-2 backdrop-blur-sm">
          <h2 className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-accent)]">
            Scoreboard
          </h2>
          {players.map((player, pidx) => {
            const isActive = pidx === activePlayerIndex && phase !== "GAME_OVER";
            return (
              <div
                key={pidx}
                className={cn(
                  "mb-1 rounded-md border px-2 py-1 transition-colors last:mb-0",
                  isActive
                    ? "border-[var(--color-brand-accent)]/60 bg-[var(--color-brand-accent)]/15"
                    : "border-white/5 bg-white/5",
                )}
              >
                {/* Player name + score */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="text-[8px] text-[var(--color-brand-accent)]">▶</span>
                    )}
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isActive ? "text-[var(--color-brand-accent)]" : "text-white/70",
                      )}
                    >
                      {player.name}
                    </span>
                  </div>
                  <span className="text-sm font-black tabular-nums text-[var(--color-brand-accent)]">
                    {player.game.totalScore}
                  </span>
                </div>

                {/* Mini frame scores */}
                <div className="mt-1 flex gap-px">
                  {player.game.frames.map((frame, fi) => (
                    <div
                      key={fi}
                      className={cn(
                        "flex flex-col items-center rounded-sm px-1 py-0.5",
                        isActive &&
                          fi === player.game.currentFrame &&
                          "bg-[var(--color-brand-accent)]/20",
                      )}
                    >
                      <span className="text-[7px] text-white/30">{fi + 1}</span>
                      <div className="flex gap-0.5">
                        {frame.marks.map((mark, j) => (
                          <span
                            key={j}
                            className={cn(
                              "text-[8px] font-bold",
                              mark === "X" && "text-[var(--color-score-strike)]",
                              mark === "/" && "text-[var(--color-brand-accent)]",
                              mark !== "X" && mark !== "/" && "text-white/50",
                            )}
                          >
                            {mark}
                          </span>
                        ))}
                      </div>
                      <span className="text-[8px] font-bold tabular-nums text-white/40">
                        {frame.cumulativeScore ?? ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset button */}
        <button
          type="button"
          onClick={onReset}
          className="pointer-events-auto rounded-lg bg-black/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm transition-colors hover:bg-[var(--color-brand-accent)]/20"
        >
          Reset
        </button>
      </div>

      {/* Center area — flash messages + controls */}
      <div className="flex flex-1 flex-col items-center">
        {/* Active player indicator at top */}
        {phase !== "GAME_OVER" && (
          <div className="mt-3 rounded-lg bg-black/60 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs text-white/50">Now bowling: </span>
            <span className="text-sm font-bold text-[var(--color-brand-accent)]">
              {players[activePlayerIndex]?.name}
            </span>
          </div>
        )}

        {/* Center flash message */}
        {flashMessage && (
          <div className="flex flex-1 items-center justify-center">
            <div
              role="alert"
              aria-live="assertive"
              className="animate-pulse rounded-xl bg-black/80 px-8 py-4 backdrop-blur-sm"
            >
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

        {/* Bottom controls */}
        <div className="mt-auto flex flex-col items-center gap-3 pb-4">
          {/* Power meter */}
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
              Drag left/right to aim · Click &amp; hold to charge power
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
              <span className="text-4xl" aria-hidden="true">
                🏆
              </span>
              <p className="text-xl font-bold uppercase tracking-wider">Game Over</p>
              {/* Show winner or single player score */}
              {players.length > 1 ? (
                <div className="flex flex-col items-center gap-1">
                  {[...players]
                    .sort((a, b) => b.game.totalScore - a.game.totalScore)
                    .map((p, i) => (
                      <p
                        key={p.name}
                        className={cn(
                          "text-sm tabular-nums",
                          i === 0
                            ? "text-lg font-black text-[var(--color-brand-accent)]"
                            : "text-white/60",
                        )}
                      >
                        {i === 0 && "👑 "}
                        {p.name}: {p.game.totalScore}
                      </p>
                    ))}
                </div>
              ) : (
                <p className="text-3xl font-black tabular-nums text-[var(--color-brand-accent)]">
                  {players[0]?.game.totalScore}
                </p>
              )}
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
    </div>
  );
}
