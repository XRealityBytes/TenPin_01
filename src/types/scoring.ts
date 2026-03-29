/**
 * TypeScript types for 10-pin bowling scoring.
 *
 * These types model the full state of a bowling game including per-frame
 * roll data, marks (X, /, -), running totals, and multi-player support.
 * The types are kept serialisable (no class instances) so game state can
 * be persisted to localStorage or transmitted over a network.
 */

/** The mark displayed in a scorecard cell. */
export type FrameMark = "X" | "/" | "-" | number;

/** Result for a single frame (1–10). */
export interface FrameResult {
  /** 1-based frame number (1–10). */
  frameNumber: number;
  /** Raw pin counts for each roll in this frame (1–3 elements in frame 10). */
  rolls: number[];
  /** Display marks for each roll (e.g. "X", "/", 7, "-"). */
  marks: FrameMark[];
  /** Cumulative score up to and including this frame, or null if not yet calculable. */
  cumulativeScore: number | null;
  /** True when enough future rolls exist to calculate this frame's score. */
  isScored: boolean;
  /** True if this is a strike frame. */
  isStrike: boolean;
  /** True if this is a spare frame. */
  isSpare: boolean;
}

/** Full state of a single-player 10-frame game. */
export interface GameState {
  /** All rolls recorded so far (flat array of pin counts). */
  rolls: number[];
  /** Per-frame breakdown (always 10 entries, some may have empty rolls). */
  frames: FrameResult[];
  /** Index of the frame currently in play (0–9), or 10 if game is over. */
  currentFrame: number;
  /** Roll index within the current frame (0, 1, or 2 in frame 10). */
  currentRoll: number;
  /** Total score so far (sum of all scored frames). */
  totalScore: number;
  /** True when all 10 frames are complete. */
  isComplete: boolean;
}

/** State for one player in a multi-player game. */
export interface PlayerState {
  /** Unique player ID (UUID). */
  id: string;
  /** Display name. */
  name: string;
  /** This player's game state. */
  game: GameState;
}

/** Full multi-player match state, suitable for localStorage. */
export interface MatchState {
  /** Unique match ID (UUID). */
  id: string;
  /** ISO timestamp of when the match was created. */
  createdAt: string;
  /** ISO timestamp of the last update. */
  updatedAt: string;
  /** All players in order (1–6). */
  players: PlayerState[];
  /** Index of the player whose turn it currently is. */
  activePlayerIndex: number;
  /** True when every player has completed all 10 frames. */
  isComplete: boolean;
}
