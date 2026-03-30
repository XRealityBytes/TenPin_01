/**
 * 10-pin bowling scoring engine — pure functions, no side effects.
 *
 * Standard scoring rules:
 * - Frames 1–9: two rolls per frame. Knock down all 10 on the first roll
 *   = strike (bonus: next 2 rolls). Knock down remainder on second roll
 *   = spare (bonus: next 1 roll). Otherwise: open frame (no bonus).
 * - Frame 10: always gets at least 2 rolls. A strike or spare earns bonus
 *   rolls (up to 3 total) that count only for that frame's score.
 * - Maximum score: 300 (12 consecutive strikes).
 *
 * The engine operates on a flat array of rolls (pin counts) and returns
 * a structured GameState with per-frame breakdowns.
 */

import type { FrameMark, FrameResult, GameState } from "@/types/scoring";

/* ── Constants ──────────────────────────────────────────── */
const TOTAL_PINS = 10;
const TOTAL_FRAMES = 10;

/* ── Helpers ────────────────────────────────────────────── */

/** Convert a roll's pin count into a display mark. */
function rollToMark(pins: number, rollIndex: number, prevPins?: number): FrameMark {
  if (pins === 0) return "-";
  if (pins === TOTAL_PINS && rollIndex === 0) return "X";
  /* In frame 10, a strike on roll 2 or 3 is still "X" if it knocks all 10 */
  if (pins === TOTAL_PINS) return "X";
  if (prevPins !== undefined && prevPins + pins === TOTAL_PINS) return "/";
  return pins;
}

/** Build marks array for a frame's rolls, handling frame-10 special cases. */
function buildMarks(rolls: number[], isTenthFrame: boolean): FrameMark[] {
  if (!isTenthFrame) {
    return rolls.map((pins, i) => rollToMark(pins, i, i > 0 ? rolls[i - 1] : undefined));
  }

  // Frame 10: up to 3 rolls, each can be a fresh set of 10 pins
  const marks: FrameMark[] = [];
  for (let i = 0; i < rolls.length; i++) {
    const pins = rolls[i];
    if (i === 0) {
      marks.push(pins === TOTAL_PINS ? "X" : pins === 0 ? "-" : pins);
    } else if (i === 1) {
      if (rolls[0] === TOTAL_PINS) {
        // After a strike on roll 1, pins reset — roll 2 is against a fresh rack
        marks.push(pins === TOTAL_PINS ? "X" : pins === 0 ? "-" : pins);
      } else {
        marks.push(
          rolls[0] + pins === TOTAL_PINS ? "/" : pins === 0 ? "-" : pins,
        );
      }
    } else {
      // Roll 3 — pins always reset after a strike or spare in rolls 1–2
      const prevWasStrike =
        (rolls[0] === TOTAL_PINS && rolls[1] === TOTAL_PINS) ||
        (rolls[0] !== TOTAL_PINS && rolls[0] + rolls[1] === TOTAL_PINS);
      if (prevWasStrike || rolls[1] === TOTAL_PINS) {
        marks.push(pins === TOTAL_PINS ? "X" : pins === 0 ? "-" : pins);
      } else {
        marks.push(
          rolls[1] + pins === TOTAL_PINS ? "/" : pins === 0 ? "-" : pins,
        );
      }
    }
  }
  return marks;
}

/* ── Core scoring ───────────────────────────────────────── */

/**
 * Calculate the full game state from a flat array of roll pin-counts.
 *
 * This is the single source of truth for scoring. The function walks the
 * roll array once, building per-frame results with look-ahead for strike
 * and spare bonuses. Frames whose bonuses haven't been rolled yet get
 * `cumulativeScore: null` and `isScored: false`.
 */
export function calculateGame(rolls: number[], totalFrames: number = TOTAL_FRAMES): GameState {
  const frames: FrameResult[] = [];
  let rollIdx = 0; // cursor into the flat rolls array
  let cumulativeScore = 0;
  let allScored = true;

  for (let f = 0; f < totalFrames; f++) {
    const isLastFrame = f === totalFrames - 1;
    const frameRolls: number[] = [];

    if (isLastFrame) {
      // Last frame: consume remaining rolls (2 or 3)
      while (rollIdx < rolls.length && frameRolls.length < 3) {
        frameRolls.push(rolls[rollIdx++]);
      }

      // Determine if last frame is complete
      const lastFrameComplete =
        frameRolls.length >= 2 &&
        (frameRolls[0] !== TOTAL_PINS &&
          frameRolls[0] + (frameRolls[1] ?? 0) !== TOTAL_PINS
          ? frameRolls.length >= 2
          : frameRolls.length >= 3);

      const frameScore = frameRolls.reduce((a, b) => a + b, 0);
      const scored = lastFrameComplete;
      if (scored) {
        cumulativeScore += frameScore;
      } else {
        allScored = false;
      }

      frames.push({
        frameNumber: f + 1,
        rolls: frameRolls,
        marks: buildMarks(frameRolls, true),
        cumulativeScore: scored ? cumulativeScore : null,
        isScored: scored,
        isStrike: frameRolls[0] === TOTAL_PINS,
        isSpare:
          frameRolls[0] !== TOTAL_PINS &&
          frameRolls.length >= 2 &&
          frameRolls[0] + frameRolls[1] === TOTAL_PINS,
      });
    } else {
      // Frames 1–9
      const isStrike = rolls[rollIdx] === TOTAL_PINS;

      if (isStrike) {
        frameRolls.push(rolls[rollIdx++]);
      } else {
        if (rollIdx < rolls.length) frameRolls.push(rolls[rollIdx++]);
        if (rollIdx < rolls.length) frameRolls.push(rolls[rollIdx++]);
      }

      // Calculate score with look-ahead for bonuses
      let frameScore: number | null = null;
      let scored = false;

      if (isStrike) {
        const bonus1 = rolls[rollIdx] ?? undefined;
        const bonus2 = rolls[rollIdx + 1] ?? undefined;
        if (bonus1 !== undefined && bonus2 !== undefined) {
          frameScore = TOTAL_PINS + bonus1 + bonus2;
          scored = true;
        }
      } else if (
        frameRolls.length === 2 &&
        frameRolls[0] + frameRolls[1] === TOTAL_PINS
      ) {
        // Spare
        const bonus1 = rolls[rollIdx] ?? undefined;
        if (bonus1 !== undefined) {
          frameScore = TOTAL_PINS + bonus1;
          scored = true;
        }
      } else if (frameRolls.length === 2) {
        // Open frame
        frameScore = frameRolls[0] + frameRolls[1];
        scored = true;
      }

      if (scored && frameScore !== null) {
        cumulativeScore += frameScore;
      } else {
        allScored = false;
      }

      const isSpare =
        !isStrike &&
        frameRolls.length === 2 &&
        frameRolls[0] + frameRolls[1] === TOTAL_PINS;

      frames.push({
        frameNumber: f + 1,
        rolls: frameRolls,
        marks: buildMarks(frameRolls, false),
        cumulativeScore: scored ? cumulativeScore : null,
        isScored: scored,
        isStrike,
        isSpare,
      });
    }
  }

  // Pad with empty frames if not all frames have rolls
  while (frames.length < totalFrames) {
    frames.push({
      frameNumber: frames.length + 1,
      rolls: [],
      marks: [],
      cumulativeScore: null,
      isScored: false,
      isStrike: false,
      isSpare: false,
    });
  }

  // Determine current frame and roll
  let currentFrame = 0;
  let currentRoll = 0;
  for (let f = 0; f < totalFrames; f++) {
    const frame = frames[f];
    const isLast = f === totalFrames - 1;
    if (isLast) {
      if (!frame.isScored) {
        currentFrame = f;
        currentRoll = frame.rolls.length;
        break;
      } else {
        currentFrame = totalFrames; // game over
      }
    } else {
      if (frame.rolls.length === 0 || (!frame.isStrike && frame.rolls.length < 2)) {
        currentFrame = f;
        currentRoll = frame.rolls.length;
        break;
      }
    }
  }

  const isComplete =
    frames.length === totalFrames && frames.every((f) => f.isScored);

  return {
    rolls,
    frames,
    currentFrame: isComplete ? totalFrames : currentFrame,
    currentRoll: isComplete ? 0 : currentRoll,
    totalScore: cumulativeScore,
    isComplete,
  };
}

/**
 * Validate whether a new roll is legal given the current roll history.
 *
 * Rules:
 * - Pin count must be 0–10.
 * - In frames 1–9, second roll can't exceed pins remaining.
 * - In frame 10, pins reset after a strike or spare.
 */
export function validateRoll(rolls: number[], newPins: number, totalFrames: number = TOTAL_FRAMES): boolean {
  if (newPins < 0 || newPins > TOTAL_PINS || !Number.isInteger(newPins)) {
    return false;
  }

  const game = calculateGame(rolls, totalFrames);

  if (game.isComplete) return false;

  const frame = game.frames[game.currentFrame];
  const rollInFrame = frame ? frame.rolls.length : 0;
  const isLastFrame = game.currentFrame === totalFrames - 1;

  if (!isLastFrame) {
    // Non-last frames: second roll can't exceed remaining pins
    if (rollInFrame === 1) {
      return newPins <= TOTAL_PINS - frame.rolls[0];
    }
    return newPins <= TOTAL_PINS;
  }

  // Last frame logic
  if (rollInFrame === 0) {
    return newPins <= TOTAL_PINS;
  }
  if (rollInFrame === 1) {
    if (frame.rolls[0] === TOTAL_PINS) {
      // After a strike, pins reset — any 0–10 is valid
      return newPins <= TOTAL_PINS;
    }
    // Otherwise, can't exceed remaining
    return newPins <= TOTAL_PINS - frame.rolls[0];
  }
  if (rollInFrame === 2) {
    // Roll 3 only happens if roll 1 was a strike or rolls 1+2 made a spare
    if (frame.rolls[0] === TOTAL_PINS) {
      // First was strike
      if (frame.rolls[1] === TOTAL_PINS) {
        // Second was also strike — fresh rack
        return newPins <= TOTAL_PINS;
      }
      // Second wasn't strike — pins remaining from that roll
      return newPins <= TOTAL_PINS - frame.rolls[1];
    }
    // First wasn't strike but rolls 1+2 = spare — fresh rack
    if (frame.rolls[0] + frame.rolls[1] === TOTAL_PINS) {
      return newPins <= TOTAL_PINS;
    }
  }

  return false;
}

/**
 * Get the maximum legal pin count for the next roll.
 *
 * Useful for enabling/disabling pin-count buttons in the UI.
 */
export function getMaxPins(rolls: number[], totalFrames: number = TOTAL_FRAMES): number {
  const game = calculateGame(rolls, totalFrames);
  if (game.isComplete) return 0;

  const frame = game.frames[game.currentFrame];
  const rollInFrame = frame ? frame.rolls.length : 0;
  const isLastFrame = game.currentFrame === totalFrames - 1;

  if (!isLastFrame) {
    if (rollInFrame === 1) return TOTAL_PINS - frame.rolls[0];
    return TOTAL_PINS;
  }

  // Last frame
  if (rollInFrame === 0) return TOTAL_PINS;
  if (rollInFrame === 1) {
    return frame.rolls[0] === TOTAL_PINS
      ? TOTAL_PINS
      : TOTAL_PINS - frame.rolls[0];
  }
  if (rollInFrame === 2) {
    if (frame.rolls[0] === TOTAL_PINS) {
      return frame.rolls[1] === TOTAL_PINS
        ? TOTAL_PINS
        : TOTAL_PINS - frame.rolls[1];
    }
    if (frame.rolls[0] + frame.rolls[1] === TOTAL_PINS) {
      return TOTAL_PINS;
    }
  }

  return 0;
}
