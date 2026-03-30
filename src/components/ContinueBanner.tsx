/**
 * ContinueBanner — client component that shows a "Continue Game" prompt
 * when a scorecard match is detected in localStorage.
 */

"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Container } from "@/components/Container";

const STORAGE_KEY = "tenpin-scorecard";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function getSnapshot(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return data?.players?.length > 0;
    }
  } catch {
    // Ignore malformed data
  }
  return false;
}

function getServerSnapshot(): boolean {
  return false;
}

export function ContinueBanner() {
  const hasMatch = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!hasMatch) return null;

  return (
    <section className="py-4">
      <Container>
        <Link
          href="/scorecard"
          className="flex items-center justify-between gap-3 rounded-xl border border-(--color-brand-accent)/30 bg-(--color-brand-accent)/8 px-5 py-3 transition-colors hover:bg-(--color-brand-accent)/16"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <span className="text-sm font-bold uppercase tracking-wider">
              Continue your match
            </span>
          </div>
          <span className="text-xs text-text-muted">→</span>
        </Link>
      </Container>
    </section>
  );
}
