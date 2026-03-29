/**
 * Landing page — game picker with Rowans-branded nightscape hero.
 *
 * Shows the three bowling games and the scorecard as card-style links over
 * the hero background image. Responsive: single column on mobile, 2×2 grid
 * on desktop. Uses the same gradient-hero overlay as the Rowans site.
 */
import Image from "next/image";

import { Container } from "@/components/Container";
import { PillLink } from "@/components/PillLink";

const games = [
  {
    href: "/lane-play",
    title: "Lane Play",
    description: "3D bowling — aim, power, spin, and strike your way through 10 frames.",
    icon: "🎳",
    tone: "accent" as const,
  },
  {
    href: "/pin-picker",
    title: "Pin Picker",
    description: "Top-down puzzle — clear pin formations in the fewest shots.",
    icon: "🎯",
    tone: "ghost" as const,
  },
  {
    href: "/score-challenge",
    title: "Score Challenge",
    description: "Quick-fire quiz — calculate bowling scores before time runs out.",
    icon: "⚡",
    tone: "ghost" as const,
  },
  {
    href: "/scorecard",
    title: "Scorecard",
    description: "Digital scorecard for real-world matches — track up to 6 players.",
    icon: "📋",
    tone: "light" as const,
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero section ───────────────────────────────── */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        {/* Nightscape background image */}
        <Image
          src="/assets/brand/home-hero-frame.png"
          alt=""
          fill
          priority
          className="object-cover object-top opacity-60"
          sizes="100vw"
        />

        {/* Gradient overlay matching Rowans hero */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        />

        {/* Hero content */}
        <Container className="relative z-10 flex flex-col items-center gap-6 py-16 text-center">
          <Image
            src="/assets/brand/home-main-logo.png"
            alt="Rowans Tenpin Bowl"
            width={80}
            height={80}
            priority
            className="drop-shadow-lg"
          />
          <h1 className="text-[clamp(2rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-tight">
            <span className="accent-glow">TenPin</span>
          </h1>
          <p className="max-w-lg text-[clamp(0.9rem,2.5vw,1.25rem)] leading-relaxed text-muted-foreground">
            Bowl, challenge, and keep score — online games and a digital
            scorecard from Rowans Tenpin Bowl.
          </p>
        </Container>
      </section>

      {/* ── Game picker grid ───────────────────────────── */}
      <section className="py-[var(--space-section-md)]">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2">
            {games.map((game) => (
              <div
                key={game.href}
                className="group relative overflow-hidden rounded-[var(--radius-panel)] border border-border bg-[var(--color-surface-elevated)] p-6 transition-[transform,border-color] duration-(--duration-base) ease-(--ease-standard) hover:-translate-y-1 hover:border-white/30"
              >
                <span className="mb-3 block text-3xl">{game.icon}</span>
                <h2 className="mb-2 text-lg font-bold uppercase tracking-wider">
                  {game.title}
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {game.description}
                </p>
                <PillLink href={game.href} tone={game.tone}>
                  Play
                </PillLink>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
