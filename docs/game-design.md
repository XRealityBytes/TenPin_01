# Game Design — TenPin_01

Architecture and mechanics reference for all three bowling games and the digital scorecard.

---

## 1. Lane Play (3D Bowling)

**Route:** `/lane-play`  
**Technology:** Three.js via `@react-three/fiber`, `@react-three/cannon`, `cannon-es`

### Controls

| Input | Action |
|-------|--------|
| Pointer move (horizontal) | Aim left/right |
| Pointer down + hold | Charge power (0–100%) |
| Pointer up (release) | Launch ball with aim direction, power, and spin |

### Game Loop State Machine

```
IDLE → AIMING → CHARGING → ROLLING → SETTLING → SCORING → RESETTING → GAME_OVER
```

- **AIMING:** Player moves pointer horizontally to set aim direction.
- **CHARGING:** Press and hold to fill the power meter. Power oscillates 0→1→0 for timing challenge.
- **ROLLING:** Ball is launched with velocity calculated from power × aim direction. Physics simulation runs.
- **SETTLING:** After the ball stops or exits bounds, wait for pins to settle (~2 seconds).
- **SCORING:** Count fallen pins (tilt angle > π/4). Show flash message (Strike!/Spare!/Gutter ball). Update frame scores.
- **RESETTING:** Reposition pins for second roll or advance to next frame.

### Physics

- **Lane:** 20 × 3.5 units, static box bodies for surface, gutters, back wall.
- **Ball:** Sphere body (radius 0.22, mass 6). Speed range 6–18 units/s.
- **Pins:** Cylinder bodies in standard triangle formation (4 rows, 10 pins). A pin is "fallen" when its tilt exceeds `π/4` radians.
- **Gravity:** `[0, -9.81, 0]`

### Scoring

Uses the standard bowling scoring engine (`src/lib/scoring.ts`). 10 frames per game with strike/spare/10th-frame bonus rules. Running totals displayed in the HUD mini-scorecard.

### Key Files

- `src/hooks/useBowlingGame.ts` — state machine hook
- `src/components/game/Ball.tsx` — ball mesh + physics body
- `src/components/game/Pin.tsx` — pin mesh + physics body + fallen detection
- `src/components/game/Lane.tsx` — lane surface + gutters + decorations
- `src/components/game/HUD.tsx` — overlay UI (scores, power meter, flash messages)
- `src/components/game/LaneScene.tsx` — R3F Canvas + physics + camera + lighting
- `src/lib/physics.ts` — physics constants and pin positions

---

## 2. Pin Picker (2D Puzzle)

**Route:** `/pin-picker`  
**Technology:** Canvas 2D API

### Concept

Top-down view of a pin deck. Player aims and launches a ball to knock down pins. Clear all pins in the fewest rolls to earn stars. 15 levels with real bowling formations.

### Controls

| Input | Action |
|-------|--------|
| Pointer move | Aim guide line from ball to pointer position |
| Pointer up/click | Launch ball along aim line |

### Level Progression

15 levels based on real bowling formations:

1. Full Rack (10 pins)
2. Front Seven
3. Back Row
4. Diamond
5. Left Side
6. 7-10 Split
7. Baby Split
8. Washout
9. Bucket
10. Big Four
11. Greek Church
12. Cincinnati
13. Sour Apple
14. Lily
15. Snake Eyes

### Star Rating

| Stars | Condition |
|-------|-----------|
| ⭐⭐⭐ | 1 roll (strike) |
| ⭐⭐ | 2 rolls |
| ⭐ | 3+ rolls |

### Collision Detection

Circle-to-circle collision between ball and pins. When a pin is hit, it enters a fall animation (shrink + fade over 300ms). Chain reactions when falling pins overlap.

### Key Files

- `src/components/game/PinPickerCanvas.tsx` — complete canvas game
- `src/content/pin-picker-levels.ts` — level definitions with pin positions

---

## 3. Score Challenge (Quiz)

**Route:** `/score-challenge`  
**Technology:** DOM + React state

### Concept

10-question quiz testing bowling scoring knowledge. Each question presents a partial scorecard scenario and asks the player to calculate the correct score.

### Difficulty Tiers

| Tier | Topics |
|------|--------|
| **Easy** | Open frames (no strikes/spares). Simple addition. |
| **Medium** | Spare + next roll lookahead. Requires understanding spare bonus. |
| **Hard** | Strikes + two-roll lookahead. Multiple consecutive strikes. |

Questions are generated programmatically using the scoring engine, ensuring all answers are mathematically correct.

### Scoring

- **Base:** 100 points per correct answer
- **Time bonus:** 10 points × seconds remaining (out of 10s timer)
- **Streak bonus:** 50% × streak count × base points for consecutive correct answers
- **Wrong answer:** 0 points, streak resets

### Timer

10-second countdown per question. Visual bar shrinks with colour transitions: green → yellow → red. If time runs out, the answer is marked wrong.

### Key Files

- `src/components/game/ScoreChallenge.tsx` — quiz UI with timer and scoring
- `src/lib/score-challenge-questions.ts` — question generator using scoring engine

---

## 4. Scorecard (Digital Tracker)

**Route:** `/scorecard`  
**Technology:** DOM + React state + localStorage

### Features

- 1–6 players per match
- Automatic scoring with strike/spare detection
- 10-frame display with running totals
- Pin count input (0–10 buttons + Strike/Spare quick actions)
- Undo last roll
- Player add/remove during setup
- localStorage persistence (key: `tenpin-scorecard`)
- Game-over screen with winner and medal rankings

### Key Files

- `src/hooks/useScorecard.ts` — match state management + localStorage sync
- `src/components/scorecard/ScorecardView.tsx` — setup, active game, game-over views
- `src/components/scorecard/ScorecardGrid.tsx` — CSS Grid 10-frame display
- `src/components/scorecard/PinInput.tsx` — pin count input buttons

---

## Scoring Engine

Shared by Lane Play, Score Challenge, and Scorecard. Implements standard USBC bowling scoring rules.

### API

```typescript
calculateGame(rolls: number[]): GameState
validateRoll(rolls: number[], pins: number): boolean
getMaxPins(rolls: number[]): number
```

### Rules

- **Strike (X):** 10 + next 2 rolls
- **Spare (/):** 10 + next 1 roll
- **Open frame:** Sum of 2 rolls
- **10th frame:** Up to 3 rolls (bonus rolls awarded for strike/spare)
- **Perfect game:** 12 strikes = 300 points
- **All spares:** 150 points (assuming 5 pins first roll each frame)

### Key Files

- `src/lib/scoring.ts` — core engine
- `src/types/scoring.ts` — TypeScript types
- `__tests__/scoring.test.ts` — 24 unit tests
