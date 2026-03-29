/**
 * Unit tests for the 10-pin bowling scoring engine.
 *
 * Covers: perfect game (300), gutter game (0), all spares, mixed frames,
 * 10th-frame edge cases (strike + spare combos), validation, and max-pin
 * helper. Uses Vitest.
 */

import { describe, expect, it } from "vitest";

import { calculateGame, getMaxPins, validateRoll } from "@/lib/scoring";

/* ── Helper to build a roll array from repeated values ──── */
function repeatRolls(pins: number, count: number): number[] {
  return Array.from({ length: count }, () => pins);
}

/* ── calculateGame ──────────────────────────────────────── */
describe("calculateGame", () => {
  it("scores a perfect game as 300", () => {
    // 12 strikes = 300
    const rolls = repeatRolls(10, 12);
    const game = calculateGame(rolls);
    expect(game.totalScore).toBe(300);
    expect(game.isComplete).toBe(true);
    expect(game.frames.every((f) => f.isStrike)).toBe(true);
  });

  it("scores a gutter game as 0", () => {
    // 20 gutter balls
    const rolls = repeatRolls(0, 20);
    const game = calculateGame(rolls);
    expect(game.totalScore).toBe(0);
    expect(game.isComplete).toBe(true);
  });

  it("scores all spares (5/) with 5 on bonus as 150", () => {
    // 5, 5 (spare) × 10 frames + 5 bonus = 21 rolls
    const rolls = Array.from({ length: 21 }, () => 5);
    const game = calculateGame(rolls);
    expect(game.totalScore).toBe(150);
    expect(game.isComplete).toBe(true);
    // All frames should be spares (frame 10 first roll is 5, second is spare)
    for (let i = 0; i < 10; i++) {
      expect(game.frames[i].isSpare).toBe(true);
    }
  });

  it("scores a simple open game correctly", () => {
    // Each frame: 3, 4 = 7 per frame × 10 = 70
    const rolls = Array.from({ length: 20 }, (_, i) => (i % 2 === 0 ? 3 : 4));
    const game = calculateGame(rolls);
    expect(game.totalScore).toBe(70);
    expect(game.isComplete).toBe(true);
    game.frames.forEach((f) => {
      expect(f.isStrike).toBe(false);
      expect(f.isSpare).toBe(false);
    });
  });

  it("handles a strike in frame 1 followed by open frames", () => {
    // Strike, then 3, 4 for remaining 9 frames = 10 + 3 + 4 + (9 × 7)
    const rolls = [10, ...Array.from({ length: 18 }, (_, i) => (i % 2 === 0 ? 3 : 4))];
    const game = calculateGame(rolls);
    // Frame 1: 10 + 3 + 4 = 17. Frames 2–10: 7 each = 63. Total = 80
    expect(game.totalScore).toBe(80);
    expect(game.isComplete).toBe(true);
    expect(game.frames[0].isStrike).toBe(true);
  });

  it("handles a spare in frame 1 followed by open frames", () => {
    // 7, 3 (spare), then 4, 3 for remaining 9 frames
    const rolls = [7, 3, ...Array.from({ length: 18 }, (_, i) => (i % 2 === 0 ? 4 : 3))];
    const game = calculateGame(rolls);
    // Frame 1: 10 + 4 = 14. Frames 2–10: 7 each = 63. Total = 77
    expect(game.totalScore).toBe(77);
    expect(game.isComplete).toBe(true);
    expect(game.frames[0].isSpare).toBe(true);
  });

  it("handles consecutive strikes (turkey)", () => {
    // 3 strikes, then 3, 4 for remaining 7 frames
    const rolls = [10, 10, 10, ...Array.from({ length: 14 }, (_, i) => (i % 2 === 0 ? 3 : 4))];
    const game = calculateGame(rolls);
    // Frame 1: 10 + 10 + 10 = 30
    // Frame 2: 10 + 10 + 3 = 23
    // Frame 3: 10 + 3 + 4 = 17
    // Frames 4–10: 7 × 7 = 49
    // Total: 30 + 23 + 17 + 49 = 119
    expect(game.totalScore).toBe(119);
    expect(game.isComplete).toBe(true);
  });

  it("handles strike in 10th frame with two bonus rolls", () => {
    // 9 open frames of 3, 4 then a 10th frame strike + 7 + 2
    const rolls = [...Array.from({ length: 18 }, (_, i) => (i % 2 === 0 ? 3 : 4)), 10, 7, 2];
    const game = calculateGame(rolls);
    // Frames 1–9: 63. Frame 10: 10 + 7 + 2 = 19. Total: 82
    expect(game.totalScore).toBe(82);
    expect(game.isComplete).toBe(true);
    expect(game.frames[9].isStrike).toBe(true);
  });

  it("handles spare in 10th frame with one bonus roll", () => {
    const rolls = [...Array.from({ length: 18 }, (_, i) => (i % 2 === 0 ? 3 : 4)), 7, 3, 8];
    const game = calculateGame(rolls);
    // Frames 1–9: 63. Frame 10: 7 + 3 + 8 = 18. Total: 81
    expect(game.totalScore).toBe(81);
    expect(game.isComplete).toBe(true);
    expect(game.frames[9].isSpare).toBe(true);
  });

  it("handles three strikes in 10th frame", () => {
    const rolls = [...Array.from({ length: 18 }, (_, i) => (i % 2 === 0 ? 3 : 4)), 10, 10, 10];
    const game = calculateGame(rolls);
    // Frames 1–9: 63. Frame 10: 30. Total: 93
    expect(game.totalScore).toBe(93);
    expect(game.isComplete).toBe(true);
  });

  it("reports incomplete game correctly (mid-game)", () => {
    // Only 3 rolls bowled
    const rolls = [10, 3, 4];
    const game = calculateGame(rolls);
    expect(game.isComplete).toBe(false);
    expect(game.frames[0].isScored).toBe(true);
    expect(game.frames[0].cumulativeScore).toBe(17); // strike + 3 + 4
    expect(game.frames[1].isScored).toBe(true);
    expect(game.frames[1].cumulativeScore).toBe(24); // 17 + 7
  });

  it("returns empty game state for no rolls", () => {
    const game = calculateGame([]);
    expect(game.isComplete).toBe(false);
    expect(game.totalScore).toBe(0);
    expect(game.currentFrame).toBe(0);
    expect(game.currentRoll).toBe(0);
    expect(game.frames).toHaveLength(10);
  });

  it("displays correct marks for strikes and spares", () => {
    const rolls = [10, 7, 3, 4, 0];
    const game = calculateGame(rolls);
    // Frame 1: strike
    expect(game.frames[0].marks).toEqual(["X"]);
    // Frame 2: 7 then spare
    expect(game.frames[1].marks).toEqual([7, "/"]);
    // Frame 3: 4 then gutter
    expect(game.frames[2].marks).toEqual([4, "-"]);
  });
});

/* ── validateRoll ───────────────────────────────────────── */
describe("validateRoll", () => {
  it("allows any value 0–10 on first roll", () => {
    expect(validateRoll([], 0)).toBe(true);
    expect(validateRoll([], 10)).toBe(true);
    expect(validateRoll([], 5)).toBe(true);
  });

  it("rejects negative or >10 values", () => {
    expect(validateRoll([], -1)).toBe(false);
    expect(validateRoll([], 11)).toBe(false);
  });

  it("rejects non-integer values", () => {
    expect(validateRoll([], 3.5)).toBe(false);
  });

  it("limits second roll to remaining pins", () => {
    expect(validateRoll([7], 3)).toBe(true);
    expect(validateRoll([7], 4)).toBe(false);
  });

  it("allows full range after a strike in frame 10", () => {
    // 9 open frames (3,4) then strike in frame 10
    const rolls = [...Array.from({ length: 18 }, (_, i) => (i % 2 === 0 ? 3 : 4)), 10];
    expect(validateRoll(rolls, 10)).toBe(true);
    expect(validateRoll(rolls, 0)).toBe(true);
  });

  it("limits frame 10 roll 2 after non-strike", () => {
    const rolls = [...Array.from({ length: 18 }, (_, i) => (i % 2 === 0 ? 3 : 4)), 6];
    expect(validateRoll(rolls, 4)).toBe(true);
    expect(validateRoll(rolls, 5)).toBe(false);
  });

  it("rejects rolls after game is complete", () => {
    const rolls = repeatRolls(0, 20); // complete gutter game
    expect(validateRoll(rolls, 0)).toBe(false);
  });
});

/* ── getMaxPins ──────────────────────────────────────────── */
describe("getMaxPins", () => {
  it("returns 10 on first roll of any frame", () => {
    expect(getMaxPins([])).toBe(10);
  });

  it("returns remaining pins on second roll", () => {
    expect(getMaxPins([7])).toBe(3);
    expect(getMaxPins([0])).toBe(10);
  });

  it("returns 10 after a strike in frame 10", () => {
    const rolls = [...Array.from({ length: 18 }, (_, i) => (i % 2 === 0 ? 3 : 4)), 10];
    expect(getMaxPins(rolls)).toBe(10);
  });

  it("returns 0 when game is complete", () => {
    expect(getMaxPins(repeatRolls(0, 20))).toBe(0);
  });
});
