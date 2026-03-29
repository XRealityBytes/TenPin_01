/**
 * LanePlayLoader — client wrapper that dynamically imports the 3D game.
 *
 * Handles the dynamic import with SSR disabled and shows a loading state.
 * Separated from the server page component for Next.js compatibility.
 */

"use client";

import dynamic from "next/dynamic";

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

export function LanePlayLoader() {
  return (
    <div className="h-[calc(var(--full-viewport-height,100vh)-4rem)]">
      <LanePlayGame />
    </div>
  );
}
