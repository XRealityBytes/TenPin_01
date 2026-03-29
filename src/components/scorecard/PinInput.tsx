/**
 * PinInput — tap-to-select pin count input for the scorecard.
 *
 * Shows buttons 0–10 (or up to maxPins), plus quick-entry buttons for
 * strike (X) and spare (/). Disabled buttons are greyed out.
 */

"use client";

import { cn } from "@/lib/cn";

interface PinInputProps {
  /** Maximum number of pins that can be knocked down on this roll. */
  maxPins: number;
  /** Called when the player selects a pin count. */
  onRoll: (pins: number) => void;
  /** Whether the input is disabled (game over or not this player's turn). */
  disabled?: boolean;
}

export function PinInput({ maxPins, onRoll, disabled }: PinInputProps) {
  const pins = Array.from({ length: 11 }, (_, i) => i); // 0–10

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Tap a pin count to record your roll
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {pins.map((pin) => {
          const isAllowed = !disabled && pin <= maxPins;
          const isStrike = pin === 10 && maxPins === 10;

          return (
            <button
              key={pin}
              type="button"
              disabled={!isAllowed}
              onClick={() => onRoll(pin)}
              aria-label={`Knock down ${pin} pin${pin !== 1 ? "s" : ""}`}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold transition-colors",
                "border border-[var(--color-border-subtle)]",
                isAllowed
                  ? "cursor-pointer bg-[var(--color-surface-elevated)] hover:bg-[var(--color-brand-accent)] hover:text-white active:scale-95"
                  : "cursor-not-allowed opacity-30",
                isStrike && isAllowed && "bg-[var(--color-score-strike)]/20 text-[var(--color-score-strike)]",
              )}
            >
              {pin}
            </button>
          );
        })}
      </div>

      {/* Quick action buttons */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          disabled={disabled || maxPins !== 10}
          onClick={() => onRoll(10)}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
            "border border-[var(--color-border-subtle)]",
            !disabled && maxPins === 10
              ? "cursor-pointer bg-[var(--color-score-strike)]/20 text-[var(--color-score-strike)] hover:bg-[var(--color-score-strike)]/40"
              : "cursor-not-allowed opacity-30",
          )}
          aria-label="Strike — knock down all 10 pins"
        >
          Strike X
        </button>
        <button
          type="button"
          disabled={disabled || maxPins === 10 || maxPins === 0}
          onClick={() => onRoll(maxPins)}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
            "border border-[var(--color-border-subtle)]",
            !disabled && maxPins !== 10 && maxPins !== 0
              ? "cursor-pointer bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent)]/40"
              : "cursor-not-allowed opacity-30",
          )}
          aria-label={`Spare — knock down remaining ${maxPins} pins`}
        >
          Spare /
        </button>
      </div>
    </div>
  );
}
