/**
 * ContinueBanner — client component that shows a "Continue Game" prompt
 * when a scorecard match is detected in localStorage.
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/Container";

const STORAGE_KEY = "tenpin-scorecard";

export function ContinueBanner() {
  const [hasMatch, setHasMatch] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        // Check it has players and isn't fully finished
        if (data?.players?.length > 0) {
          setHasMatch(true);
        }
      }
    } catch {
      // Ignore malformed data
    }
  }, []);

  if (!hasMatch) return null;

  return (
    <section className="py-4">
      <Container>
        <Link
          href="/scorecard"
          className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-brand-accent)]/30 bg-[var(--color-brand-accent)]/8 px-5 py-3 transition-colors hover:bg-[var(--color-brand-accent)]/16"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <span className="text-sm font-bold uppercase tracking-wider">
              Continue your match
            </span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">→</span>
        </Link>
      </Container>
    </section>
  );
}
