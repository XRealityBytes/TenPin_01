/**
 * Score Challenge question generator.
 *
 * Programmatically generates bowling scoring quiz questions using the
 * scoring engine. Each question shows a partial scorecard scenario and
 * asks what the score is for a specific frame. Four multiple-choice
 * answers are generated, one correct.
 *
 * Difficulty tiers:
 * - Easy: simple open frames (no strikes/spares).
 * - Medium: spares with look-ahead bonus.
 * - Hard: strikes, consecutive strikes, 10th-frame combos.
 */

import { calculateGame } from "@/lib/scoring";

/* ── Types ──────────────────────────────────────────────── */

export interface QuizQuestion {
  /** Unique ID for the question. */
  id: number;
  /** Difficulty tier. */
  difficulty: "easy" | "medium" | "hard";
  /** Description of the scenario (what the player sees). */
  scenario: string;
  /** The question text. */
  question: string;
  /** Four answer choices. */
  choices: number[];
  /** Index (0–3) of the correct answer in the choices array. */
  correctIndex: number;
}

/* ── Helpers ────────────────────────────────────────────── */

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Shuffle an array in place (Fisher–Yates). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Generate 3 wrong answers near the correct one, ensuring uniqueness. */
function generateWrongAnswers(correct: number): number[] {
  const wrong = new Set<number>();
  const offsets = [-3, -2, -1, 1, 2, 3, -5, 5, -7, 7, 10, -10];
  const shuffled = shuffle([...offsets]);

  for (const offset of shuffled) {
    const val = correct + offset;
    if (val >= 0 && val !== correct && !wrong.has(val)) {
      wrong.add(val);
      if (wrong.size === 3) break;
    }
  }

  // Fallback if we don't have enough
  let fallback = 1;
  while (wrong.size < 3) {
    const val = correct + fallback;
    if (val >= 0 && val !== correct && !wrong.has(val)) wrong.add(val);
    fallback = fallback > 0 ? -fallback : -fallback + 1;
  }

  return [...wrong];
}

/** Format rolls into a readable frame description. */
function describeRolls(rolls: number[], startIdx: number, isStrike: boolean, isSpare: boolean, isTenth: boolean): string {
  if (isTenth) {
    const r = rolls.slice(startIdx);
    return r.map((p, i) => {
      if (p === 10) return "X";
      if (i > 0 && !isStrike && rolls[startIdx] + p === 10) return "/";
      return p === 0 ? "-" : String(p);
    }).join(", ");
  }
  if (isStrike) return "X";
  const first = rolls[startIdx];
  const second = rolls[startIdx + 1];
  if (first + second === 10) return `${first === 0 ? "-" : first}, /`;
  return `${first === 0 ? "-" : first}, ${second === 0 ? "-" : second}`;
}

/* ── Question Generators ────────────────────────────────── */

function generateEasyQuestion(id: number): QuizQuestion {
  // Two or three open frames: what's the total after frame N?
  const numFrames = rand(2, 4);
  const rolls: number[] = [];

  for (let f = 0; f < numFrames; f++) {
    const first = rand(0, 7);
    const second = rand(0, Math.min(9 - first, 3)); // ensure no spare
    rolls.push(first, second);
  }

  const game = calculateGame(rolls);
  const askFrame = rand(1, numFrames);
  const correct = game.frames[askFrame - 1].cumulativeScore!;

  const frameDescriptions = [];
  let ri = 0;
  for (let f = 0; f < numFrames; f++) {
    frameDescriptions.push(`Frame ${f + 1}: ${rolls[ri]}, ${rolls[ri + 1]}`);
    ri += 2;
  }

  const scenario = frameDescriptions.join(" | ");
  const question = `What is the cumulative score after Frame ${askFrame}?`;
  const wrongAnswers = generateWrongAnswers(correct);
  const choices = shuffle([correct, ...wrongAnswers]);

  return {
    id,
    difficulty: "easy",
    scenario,
    question,
    choices,
    correctIndex: choices.indexOf(correct),
  };
}

function generateMediumQuestion(id: number): QuizQuestion {
  // Include a spare with the next roll visible
  const rolls: number[] = [];

  // 1–2 open frames
  const openBefore = rand(0, 2);
  for (let f = 0; f < openBefore; f++) {
    const first = rand(1, 6);
    const second = rand(0, Math.min(9 - first, 3));
    rolls.push(first, second);
  }

  // Spare frame
  const spareFirst = rand(1, 8);
  rolls.push(spareFirst, 10 - spareFirst);

  // One more frame after spare
  const nextFirst = rand(2, 8);
  const nextSecond = rand(0, Math.min(9 - nextFirst, 4));
  rolls.push(nextFirst, nextSecond);

  const game = calculateGame(rolls);
  const spareFrameIdx = openBefore;
  const correct = game.frames[spareFrameIdx].cumulativeScore!;

  const frameDescriptions = [];
  let ri = 0;
  for (let f = 0; f < openBefore; f++) {
    frameDescriptions.push(`Frame ${f + 1}: ${rolls[ri]}, ${rolls[ri + 1]}`);
    ri += 2;
  }
  frameDescriptions.push(`Frame ${openBefore + 1}: ${spareFirst}, / (spare)`);
  ri += 2;
  frameDescriptions.push(`Frame ${openBefore + 2}: ${rolls[ri]}, ${rolls[ri + 1]}`);

  const scenario = frameDescriptions.join(" | ");
  const question = `What is the cumulative score after Frame ${spareFrameIdx + 1} (the spare)?`;
  const wrongAnswers = generateWrongAnswers(correct);
  const choices = shuffle([correct, ...wrongAnswers]);

  return {
    id,
    difficulty: "medium",
    scenario,
    question,
    choices,
    correctIndex: choices.indexOf(correct),
  };
}

function generateHardQuestion(id: number): QuizQuestion {
  const rolls: number[] = [];

  // 1–2 strikes
  const numStrikes = rand(1, 3);
  for (let i = 0; i < numStrikes; i++) {
    rolls.push(10);
  }

  // Followed by a regular frame (so the strikes can be scored)
  const nextFirst = rand(2, 7);
  const nextSecond = rand(0, Math.min(9 - nextFirst, 4));
  rolls.push(nextFirst, nextSecond);

  // Maybe one more frame
  if (rand(0, 1)) {
    const first = rand(1, 6);
    const second = rand(0, Math.min(9 - first, 3));
    rolls.push(first, second);
  }

  const game = calculateGame(rolls);

  // Ask about the first strike frame
  const askFrame = 0;
  const correct = game.frames[askFrame].cumulativeScore!;

  const frameDescriptions: string[] = [];
  let ri = 0;
  for (let f = 0; f < game.frames.length; f++) {
    const frame = game.frames[f];
    if (frame.rolls.length === 0) break;
    if (frame.isStrike) {
      frameDescriptions.push(`Frame ${f + 1}: X (strike)`);
      ri++;
    } else {
      frameDescriptions.push(`Frame ${f + 1}: ${frame.rolls.join(", ")}`);
      ri += 2;
    }
  }

  const scenario = frameDescriptions.join(" | ");
  const question = `What is the cumulative score after Frame 1 (the strike)?`;
  const wrongAnswers = generateWrongAnswers(correct);
  const choices = shuffle([correct, ...wrongAnswers]);

  return {
    id,
    difficulty: "hard",
    scenario,
    question,
    choices,
    correctIndex: choices.indexOf(correct),
  };
}

/* ── Public API ─────────────────────────────────────────── */

/**
 * Generate a set of quiz questions for a Score Challenge game.
 * @param count Number of questions (default: 10).
 * @returns Array of quiz questions with increasing difficulty.
 */
export function generateQuestions(count: number = 10): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const id = i + 1;

    if (i < 3) {
      questions.push(generateEasyQuestion(id));
    } else if (i < 7) {
      questions.push(generateMediumQuestion(id));
    } else {
      questions.push(generateHardQuestion(id));
    }
  }

  return questions;
}
