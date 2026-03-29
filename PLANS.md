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
**Status: 🔲 Not Started**

- [ ] Implement `lib/scoring.ts` — full 10-pin scoring logic
- [ ] Create TypeScript types in `types/scoring.ts`
- [ ] Unit test with Vitest (perfect game, gutter, spares, 10th-frame edge cases)
- [ ] Build Scorecard page UI (1–6 players, CSS Grid, pin input)
- [ ] localStorage persistence
- [ ] Share-as-image export

## Phase 3 — Asset Generation Pipeline
**Status: 🔲 Not Started**

- [ ] Build `scripts/generate-assets.ts`
- [ ] OpenAI Images API — textures (ball, lane, pin, background, splash)
- [ ] Meshy image-to-3D — glTF models (pin, ball, lane, gutter)
- [ ] ElevenLabs — SFX (ball roll, pin strike, gutter) + voice lines (Strike!, Spare!)
- [ ] WebP conversion + Draco compression
- [ ] Asset manifest (`manifest.json`)
- [ ] `useGameAudio` hook (Web Audio API, mute toggle)
- [ ] Document in `docs/asset-pipeline.md`

## Phase 4 — Game 1: Lane Play (3D Bowling)
**Status: 🔲 Not Started**

- [ ] Three.js scene with R3F + drei
- [ ] Lane, pin, ball meshes (glTF with fallback geometry)
- [ ] Physics via cannon-es
- [ ] Aiming/power/spin controls (touch + mouse)
- [ ] Game loop state machine (10 frames)
- [ ] HUD overlay (score, power meter, frame indicator)
- [ ] Responsive canvas with orientation support
- [ ] Branded loading splash
- [ ] Audio integration

## Phase 5 — Game 2: Pin Picker (2D Canvas)
**Status: 🔲 Not Started**

- [ ] Canvas 2D top-down pin puzzle
- [ ] Progressive levels with pin formations
- [ ] Touch + mouse controls
- [ ] Star rating system
- [ ] High-DPI canvas scaling

## Phase 6 — Game 3: Score Challenge (DOM Quiz)
**Status: 🔲 Not Started**

- [ ] DOM-based quiz with countdown timer
- [ ] Question generator using scoring engine
- [ ] Multiple-choice answers with CSS animations
- [ ] Scoring with time bonus + streak multiplier

## Phase 7 — Polish & Integration
**Status: 🔲 Not Started**

- [ ] Landing page polish (animations, "Continue Game" prompt)
- [ ] Lane Play → Scorecard bridge
- [ ] Loading states per route (`loading.tsx`)
- [ ] Lighthouse performance audit (target ≥ 90)
- [ ] Accessibility pass (aria-labels, focus, reduced-motion)
- [ ] Final documentation
- [ ] Tag v0.1.0
