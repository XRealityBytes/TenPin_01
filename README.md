# TenPin_01 — Rowans Bowling Online Game + Scorecard

Three bowling-themed web games and a digital scorecard, built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. Uses the Rowans Bowling dark-theme design system for visual consistency.

## Games

| Game | Type | Description |
|------|------|-------------|
| **Lane Play** | 3D (Three.js) | First-person bowling — aim, power, spin, 10-frame match with physics |
| **Pin Picker** | 2D (Canvas) | Top-down puzzle — clear pin formations in the fewest shots |
| **Score Challenge** | DOM quiz | Quick-fire rounds — calculate bowling scores against the clock |
| **Scorecard** | DOM tool | Digital scorecard for real-world matches (1–6 players) |

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run format` | Check Prettier formatting |
| `npm run format:write` | Auto-fix formatting |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run generate-assets` | Generate AI assets (requires API keys) |
| `npm run generate-assets:force` | Regenerate all assets |

## Testing

Uses **Vitest** for unit tests. The scoring engine has 24 comprehensive tests covering perfect games, gutter games, spare/strike combinations, 10th frame edge cases, and input validation.

```bash
npm run test
```

## Project Structure

```
src/
  app/               Route-level files and shared layout
    lane-play/       Game 1 — 3D bowling
    pin-picker/      Game 2 — 2D puzzle
    score-challenge/ Game 3 — scoring quiz
    scorecard/       Digital scorecard
  components/
    game/            Three.js scenes, Canvas games, HUD
    scorecard/       Scorecard UI components
    site/            Shell, header, nav, footer
    ui/              Shared UI primitives
  hooks/             Game loop, controls, responsive canvas, audio
  lib/               Scoring engine, physics config, asset loader, utilities
  styles/            Design tokens (inherited from Rowans site)
  types/             TypeScript type definitions
  content/           Game content data (levels, etc.)
scripts/             Asset generation pipeline (OpenAI + Meshy + ElevenLabs)
public/assets/
  brand/             Rowans branding (hero, logo)
  generated/         AI-generated textures, 3D models, audio (git-ignored)
docs/                Architecture, game design, responsive strategy docs
```

## Tech Stack

- **Next.js 16** App Router with React 19
- **Tailwind CSS v4** with CSS-first configuration
- **Three.js** via `@react-three/fiber` + `@react-three/drei` (Game 1)
- **cannon-es** for physics (Game 1)
- **Canvas 2D** API (Game 2)
- **DOM + CSS** animations (Game 3 + Scorecard)

## Design System

Inherits the Rowans Bowling dark theme: black surfaces, red brand accent, white text, neon glow effects, fluid spacing via `clamp()`, and safe-area support for notched mobile devices.

## Asset Pipeline

Textures, 3D models, and audio are generated via API scripts (OpenAI, Meshy, ElevenLabs). See `docs/asset-pipeline.md` for details. Generated files are git-ignored — run `npm run generate-assets` to produce them locally.

## Responsive Strategy

Mobile-first with fluid scaling (`clamp()`, `min()`, `max()`), `env(safe-area-inset-*)` for notched devices, orientation-aware canvas resizing, and a fixed bottom tab bar on mobile. See `docs/responsive-strategy.md`.

## Git Workflow

- `main` — production releases
- `develop` — integration branch
- Feature branches: `feat/lane-play`, `feat/scorecard`, etc.
- Conventional commits: `feat(scope): description`

Remote: `github.com/xrealitybytes/TenPin_01`
