/**
 * Branded loading splash — used by Next.js App Router loading.tsx files.
 *
 * Shows the Rowans logo with a pulsing glow animation and a subtle
 * progress bar. Matches the dark-theme design system.
 */

import Image from "next/image";

export function LoadingSplash({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <Image
        src="/assets/brand/home-main-logo.png"
        alt=""
        width={56}
        height={56}
        className="animate-pulse drop-shadow-lg"
      />
      {label && (
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
          {label}
        </p>
      )}
      {/* Animated loading bar */}
      <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
        <div className="loading-bar h-full w-1/3 rounded-full bg-[var(--color-brand-accent)]" />
      </div>
    </div>
  );
}
