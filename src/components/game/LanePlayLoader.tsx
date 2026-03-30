/**
 * LanePlayLoader — client wrapper with player name entry before game starts.
 *
 * Shows a name entry screen (1–3 players), then dynamically imports and
 * renders the 3D game. Separated from server page for Next.js compatibility.
 */

"use client";

import "@/lib/patchThreeDeprecations";
import dynamic from "next/dynamic";
import { useState } from "react";
import { BallPicker } from "@/components/game/BallPicker";

const LanePlayGame = dynamic(
  () => import("@/components/game/LaneScene").then((m) => m.LanePlayGame),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-page)]">
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl">🎳</span>
          <p className="animate-pulse text-sm uppercase tracking-wider text-[var(--color-text-muted)]">
            Loading Lane Play...
          </p>
        </div>
      </div>
    ),
  },
);

function NameEntryScreen({ onStart }: { onStart: (names: string[]) => void }) {
  const [playerCount, setPlayerCount] = useState(1);
  const [names, setNames] = useState(["", "", ""]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNames = names
      .slice(0, playerCount)
      .map((n, i) => n.trim() || `Player ${i + 1}`);
    onStart(finalNames);
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-page)]">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl bg-black/60 p-8 backdrop-blur-sm"
      >
        <span className="text-5xl">🎳</span>
        <h1 className="text-xl font-black uppercase tracking-wider text-[var(--color-brand-accent)]">
          Lane Play
        </h1>

        {/* Player count selector */}
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPlayerCount(n)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                playerCount === n
                  ? "bg-[var(--color-brand-accent)] text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {n} Player{n > 1 ? "s" : ""}
            </button>
          ))}
        </div>

        {/* Name inputs */}
        <div className="flex w-full flex-col gap-3">
          {Array.from({ length: playerCount }, (_, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Player ${i + 1}`}
              maxLength={12}
              value={names[i]}
              onChange={(e) => {
                const updated = [...names];
                updated[i] = e.target.value;
                setNames(updated);
              }}
              className="w-full rounded-lg bg-white/10 px-4 py-3 text-center text-sm font-bold text-white placeholder-white/30 outline-none ring-1 ring-white/10 transition-colors focus:ring-[var(--color-brand-accent)]"
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-[var(--color-brand-accent)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        >
          Start Game
        </button>
      </form>
    </div>
  );
}

export function LanePlayLoader() {
  const [playerNames, setPlayerNames] = useState<string[] | null>(null);
  const [ballSelections, setBallSelections] = useState<string[] | null>(null);

  if (!playerNames) {
    return (
      <div className="h-[calc(var(--full-viewport-height,100vh)-4rem)]">
        <NameEntryScreen onStart={setPlayerNames} />
      </div>
    );
  }

  if (!ballSelections) {
    return (
      <div className="h-[calc(var(--full-viewport-height,100vh)-4rem)]">
        <BallPicker playerNames={playerNames} onComplete={setBallSelections} />
      </div>
    );
  }

  return (
    <div className="h-[calc(var(--full-viewport-height,100vh)-4rem)]">
      <LanePlayGame playerNames={playerNames} ballSelections={ballSelections} />
    </div>
  );
}
