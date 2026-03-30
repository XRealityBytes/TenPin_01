/**
 * BallPicker — visual grid for players to select their bowling ball.
 *
 * Shows all 10 bowling balls in a responsive grid. Each player picks
 * one ball before the game starts. Displays ball name, description,
 * and a colour preview orb. Multiple players can pick the same ball.
 */

"use client";

import { useState } from "react";
import { BOWLING_BALLS } from "@/data/bowlingBalls";
import type { BowlingBallDef } from "@/data/bowlingBalls";

interface BallPickerProps {
  playerNames: string[];
  onComplete: (selections: string[]) => void;
}

function BallOrb({ ball, selected }: { ball: BowlingBallDef; selected: boolean }) {
  const thumbnailPath = ball.style.texturePath
    ? ball.style.texturePath.replace("/textures/balls/", "/textures/ball-thumbnails/")
    : null;

  return (
    <div
      className="relative h-16 w-16 overflow-hidden rounded-full transition-transform"
      style={{
        background: ball.previewGradient,
        boxShadow: selected
          ? `0 0 20px ${ball.style.swirlColor}80, 0 0 40px ${ball.style.swirlColor}40`
          : `0 4px 12px rgba(0,0,0,0.4)`,
        transform: selected ? "scale(1.15)" : "scale(1)",
      }}
    >
      {thumbnailPath && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={thumbnailPath}
          alt={ball.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Glossy highlight */}
      <div
        className="absolute left-[25%] top-[20%] h-4 w-6 rounded-full opacity-40"
        style={{ background: "radial-gradient(ellipse, white, transparent)" }}
      />
    </div>
  );
}

function CategoryLabel({ label }: { label: string }) {
  return (
    <div className="col-span-full mb-1 mt-3 text-[10px] font-bold uppercase tracking-widest text-white/30 first:mt-0">
      {label}
    </div>
  );
}

export function BallPicker({ playerNames, onComplete }: BallPickerProps) {
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selections, setSelections] = useState<string[]>(() =>
    playerNames.map(() => BOWLING_BALLS[0].id),
  );

  const handleSelect = (ballId: string) => {
    setSelections((prev) => {
      const updated = [...prev];
      updated[currentPlayer] = ballId;
      return updated;
    });
  };

  const handleConfirm = () => {
    if (currentPlayer < playerNames.length - 1) {
      setCurrentPlayer((p) => p + 1);
    } else {
      onComplete(selections);
    }
  };

  const branded = BOWLING_BALLS.filter((b) => b.category === "branded");
  const marbled = BOWLING_BALLS.filter((b) => b.category === "marbled");
  const imaginative = BOWLING_BALLS.filter((b) => b.category === "imaginative");

  const selectedId = selections[currentPlayer];

  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-page)]">
      <div className="flex w-full max-w-lg flex-col items-center gap-5 rounded-2xl bg-black/60 p-6 backdrop-blur-sm">
        <span className="text-4xl">🎳</span>
        <h1 className="text-lg font-black uppercase tracking-wider text-[var(--color-brand-accent)]">
          Choose Your Ball
        </h1>

        {/* Player indicator */}
        {playerNames.length > 1 && (
          <div className="flex gap-2">
            {playerNames.map((name, i) => (
              <span
                key={i}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  i === currentPlayer
                    ? "bg-[var(--color-brand-accent)] text-white"
                    : i < currentPlayer
                      ? "bg-white/20 text-white/60"
                      : "bg-white/5 text-white/30"
                }`}
              >
                {name} {i < currentPlayer ? "✓" : ""}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-white/50">
          {playerNames[currentPlayer]}, pick your ball:
        </p>

        {/* Ball grid */}
        <div className="grid w-full grid-cols-5 gap-3">
          <CategoryLabel label="Branded" />
          {branded.map((ball) => (
            <button
              key={ball.id}
              type="button"
              onClick={() => handleSelect(ball.id)}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-colors ${
                selectedId === ball.id
                  ? "bg-white/15 ring-2 ring-[var(--color-brand-accent)]"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <BallOrb ball={ball} selected={selectedId === ball.id} />
              <span className="text-[10px] font-bold leading-tight text-white/80">
                {ball.name}
              </span>
            </button>
          ))}

          <CategoryLabel label="Marbled" />
          {marbled.map((ball) => (
            <button
              key={ball.id}
              type="button"
              onClick={() => handleSelect(ball.id)}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-colors ${
                selectedId === ball.id
                  ? "bg-white/15 ring-2 ring-[var(--color-brand-accent)]"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <BallOrb ball={ball} selected={selectedId === ball.id} />
              <span className="text-[10px] font-bold leading-tight text-white/80">
                {ball.name}
              </span>
            </button>
          ))}

          <CategoryLabel label="Imaginative" />
          {imaginative.map((ball) => (
            <button
              key={ball.id}
              type="button"
              onClick={() => handleSelect(ball.id)}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-colors ${
                selectedId === ball.id
                  ? "bg-white/15 ring-2 ring-[var(--color-brand-accent)]"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <BallOrb ball={ball} selected={selectedId === ball.id} />
              <span className="text-[10px] font-bold leading-tight text-white/80">
                {ball.name}
              </span>
            </button>
          ))}
        </div>

        {/* Selected ball description */}
        {(() => {
          const ball = BOWLING_BALLS.find((b) => b.id === selectedId);
          if (!ball) return null;
          return (
            <p className="text-center text-xs text-white/40">
              <strong className="text-white/60">{ball.name}</strong> — {ball.description}
            </p>
          );
        })()}

        <button
          type="button"
          onClick={handleConfirm}
          className="w-full rounded-full bg-[var(--color-brand-accent)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        >
          {currentPlayer < playerNames.length - 1
            ? `Next Player →`
            : "Start Game"}
        </button>
      </div>
    </div>
  );
}
