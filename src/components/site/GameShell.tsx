/**
 * GameShell — site-wide wrapper providing header navigation, mobile bottom
 * tab bar, and footer.
 *
 * The shell uses a responsive strategy:
 * - Desktop (≥640 px): horizontal nav links in the header.
 * - Mobile (<640 px): compact header + fixed bottom tab bar with icons for
 *   thumb-friendly navigation.
 *
 * Safe-area insets from `env(safe-area-inset-*)` are applied via CSS
 * variables so content never hides behind notches or OS chrome.
 */
"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SmartLink } from "@/components/SmartLink";
import { cn } from "@/lib/cn";

/* ── Route definitions for nav tabs ─────────────────────── */
const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/lane-play", label: "Lane Play", icon: "🎳" },
  { href: "/pin-picker", label: "Pin Picker", icon: "🎯" },
  { href: "/score-challenge", label: "Challenge", icon: "⚡" },
  { href: "/scorecard", label: "Scorecard", icon: "📋" },
] as const;

/* ── Header ─────────────────────────────────────────────── */
function SiteHeader() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-[var(--color-surface-panel)] px-[var(--space-gutter)] py-3"
      style={{
        /* Offset for iOS notch / dynamic island in landscape */
        paddingTop: "max(0.75rem, var(--safe-area-top))",
        paddingLeft: "max(var(--space-gutter), var(--safe-area-left))",
        paddingRight: "max(var(--space-gutter), var(--safe-area-right))",
      }}
    >
      {/* Brand mark */}
      <SmartLink href="/" className="flex items-center gap-2">
        <Image
          src="/assets/brand/home-main-logo.png"
          alt="Rowans Tenpin Bowl"
          width={36}
          height={36}
          className="object-contain"
          priority
        />
        <span className="hidden text-sm font-bold uppercase tracking-widest text-foreground sm:inline">
          TenPin
        </span>
      </SmartLink>

      {/* Desktop nav — hidden on mobile, shown ≥640 px */}
      <nav className="hidden gap-1 sm:flex" aria-label="Main navigation">
        {navItems.map((item) => (
          <SmartLink
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-colors duration-(--duration-fast)",
              pathname === item.href
                ? "bg-accent/20 text-accent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </SmartLink>
        ))}
      </nav>
    </header>
  );
}

/* ── Mobile bottom tab bar — visible < 640 px ───────────── */
function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-[var(--color-surface-panel)] sm:hidden"
      style={{
        paddingBottom: "max(0.5rem, var(--safe-area-bottom))",
        paddingLeft: "var(--safe-area-left)",
        paddingRight: "var(--safe-area-right)",
      }}
      aria-label="Game navigation"
    >
      {navItems.map((item) => (
        <SmartLink
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-0.5 px-2 pt-2 pb-1 text-[0.6rem] uppercase tracking-wider transition-colors duration-(--duration-fast)",
            pathname === item.href
              ? "text-accent"
              : "text-muted-foreground",
          )}
        >
          <span className="text-lg" role="img" aria-hidden>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </SmartLink>
      ))}
    </nav>
  );
}

/* ── Footer ──────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border px-[var(--space-gutter)] py-6 text-center text-[0.7rem] uppercase tracking-widest text-text-muted">
      <p>Rowans Tenpin Bowl — TenPin Game &copy; {new Date().getFullYear()}</p>
    </footer>
  );
}

/* ── Shell root ──────────────────────────────────────────── */
export function GameShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {/* Main content — bottom padding on mobile accounts for fixed tab bar */}
      <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      <SiteFooter />
      <MobileTabBar />
    </>
  );
}
