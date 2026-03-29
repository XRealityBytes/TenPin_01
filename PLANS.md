# TenPin_01 — Implementation Plan

Tracks progress across all implementation phases.

---

## Phase 1 — Bootstrap & Branding Shell
**Status: ✅ Complete**

- [x] Scaffold Next.js 16 project (App Router, TypeScript, Tailwind v4)
- [x] Copy & extend Rowans design tokens (`tokens.css`)
- [x] Create `globals.css` with Tailwind v4 `@theme inline` config
- [x] Build shared layout with JetBrains Mono font, viewport-fit meta
- [x] Build `GameShell` (header nav + mobile bottom tab bar + footer)
- [x] Copy SmartLink, Container, PillLink components + cn/href utilities
- [x] Create landing page with nightscape hero and game picker grid
- [x] Create placeholder pages for all 4 routes
- [x] Copy brand assets (hero frame, logo)
- [x] Configure `.gitignore`, Prettier, ESLint
- [x] Create README.md and PLANS.md
- [x] Init git, create remote, initial commit + push

## Phase 2 — Scoring Engine + Scorecard UI
**Status: ✅ Complete**

- [x] Implement `lib/scoring.ts` — full 10-pin scoring logic
- [x] Create TypeScript types in `types/scoring.ts`
- [x] Unit test with Vitest (24 tests — perfect game, gutter, spares, 10th-frame edge cases)
- [x] Build Scorecard page UI (1–6 players, CSS Grid, pin input)
- [x] localStorage persistence

## Phase 3 — Asset Generation Pipeline
**Status: ✅ Complete**

- [x] Build `scripts/generate-assets.ts`
- [x] OpenAI Images API — textures (ball, lane, pin, background, splash)
- [x] Meshy image-to-3D — glTF models (pin, ball, lane)
- [x] ElevenLabs — SFX (ball roll, pin strike, gutter) + voice lines (Strike!, Spare!)
- [x] WebP conversion via sharp
- [x] Asset manifest (`manifest.json`)
- [x] `useGameAudio` hook (Web Audio API, mute toggle)
- [x] Document in `docs/asset-pipeline.md`

## Phase 4 — Game 1: Lane Play (3D Bowling)
**Status: ✅ Complete**

- [x] Three.js scene with R3F + drei
- [x] Lane, pin, ball meshes (procedural geometry with fallback)
- [x] Physics via cannon-es
- [x] Aiming/power/spin controls (touch + mouse)
- [x] Game loop state machine (10 frames)
- [x] HUD overlay (score, power meter, frame indicator, flash messages)
- [x] Responsive canvas
- [x] SSR-safe dynamic import

## Phase 5 — Game 2: Pin Picker (2D Canvas)
**Status: ✅ Complete**

- [x] Canvas 2D top-down pin puzzle
- [x] 15 progressive levels with real bowling formations
- [x] Touch + mouse controls
- [x] Star rating system (1–3 stars)
- [x] High-DPI canvas scaling

## Phase 6 — Game 3: Score Challenge (DOM Quiz)
**Status: ✅ Complete**

- [x] DOM-based quiz with 10-second countdown timer
- [x] Question generator using scoring engine (3 difficulty tiers)
- [x] Multiple-choice answers with correct/wrong feedback
- [x] Scoring with time bonus + streak multiplier

## Phase 7 — Polish & Integration
**Status: ✅ Complete**

- [x] Landing page polish (gradient hover effects, "Continue Game" banner)
- [x] Loading states per route (`loading.tsx`)
- [x] Accessibility pass (skip-nav, aria-labels, aria-live, reduced-motion)
- [x] Final documentation (README, game-design, responsive-strategy)
- [x] Tag v0.1.0

## Phase 7.1 — Dev Console Cleanup
**Status: ✅ Complete**

- [x] Fix WebSocket HMR cross-origin block (`allowedDevOrigins` in next.config.ts)
- [x] Fix nested `<a>` hydration error (PillLink → styled span in game cards)
- [x] Fix Image aspect-ratio warning (`h-auto w-auto` on logo images)
- [x] Fix `scroll-behavior` warning (`data-scroll-behavior` attribute on html)
- [x] Fix Three.js `PCFSoftShadowMap` deprecation (`shadows="basic"` on Canvas)
- [x] Add VS Code dev server task (`.vscode/tasks.json`)

## Phase 8 — Lane Play Visual Overhaul
**Status: 🔄 In Progress**

- [ ] Suppress THREE.Clock deprecation warning (R3F internal, monkey-patch)
- [ ] Neon bowling alley environment (walls, ceiling, neon strip lights)
- [ ] Post-processing bloom for neon glow effects
- [ ] Upgraded lane: glossy wood, neon lane arrows, glowing foul line
- [ ] Upgraded pins: lathe geometry, glossy material, better proportions
- [ ] Upgraded ball: glossy reflective material, marble swirl effect
- [ ] Dramatic neon lighting (red/cyan/blue matching Rowans brand aesthetic)
- [ ] Camera follow during ball roll
- [ ] Strike/spare visual effects (screen flash, particle burst)
- [ ] Atmospheric fog and vignette
