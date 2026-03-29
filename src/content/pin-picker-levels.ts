/**
 * Pin Picker level definitions.
 *
 * Each level defines which pins are standing in the standard 10-pin
 * triangle formation. Pin indices:
 *
 *        0       (headpin)
 *       1 2
 *      3 4 5
 *     6 7 8 9
 *
 * Levels progress from standard full rack to tricky split/spare leaves.
 */

export interface PinPickerLevel {
  /** Level number (1-based). */
  id: number;
  /** Short name for the level. */
  name: string;
  /** Which pin indices are standing at the start. */
  pins: number[];
  /** Star thresholds: [3-star max rolls, 2-star max rolls]. 1-star = completed. */
  stars: [number, number];
}

export const LEVELS: PinPickerLevel[] = [
  // Easy — full racks and big clusters
  { id: 1, name: "Full Rack", pins: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], stars: [1, 2] },
  { id: 2, name: "Front Seven", pins: [0, 1, 2, 3, 4, 5, 6], stars: [1, 2] },
  { id: 3, name: "Back Row", pins: [6, 7, 8, 9], stars: [1, 2] },
  { id: 4, name: "Diamond", pins: [0, 1, 2, 4], stars: [1, 2] },
  { id: 5, name: "Left Side", pins: [0, 1, 3, 6, 7], stars: [1, 2] },

  // Medium — common spare leaves
  { id: 6, name: "7-10 Split", pins: [6, 9], stars: [1, 2] },
  { id: 7, name: "Baby Split", pins: [2, 7], stars: [1, 2] },
  { id: 8, name: "Washout", pins: [0, 2, 5, 9], stars: [1, 2] },
  { id: 9, name: "Bucket", pins: [1, 2, 4, 5], stars: [1, 2] },
  { id: 10, name: "Big Four", pins: [3, 6, 9, 5], stars: [1, 2] },

  // Hard — nasty splits
  { id: 11, name: "Greek Church", pins: [3, 5, 6, 8, 9], stars: [1, 2] },
  { id: 12, name: "Cincinnati", pins: [6, 8, 9], stars: [1, 2] },
  { id: 13, name: "Sour Apple", pins: [3, 6, 9, 7], stars: [1, 2] },
  { id: 14, name: "Lily", pins: [2, 5, 8], stars: [1, 2] },
  { id: 15, name: "Snake Eyes", pins: [6, 7], stars: [1, 2] },
];

/** Standard pin positions in 2D space (x, y) normalised 0–1 within the pin area. */
export const PIN_LAYOUT: [number, number][] = [
  [0.5, 0.2],    // 0 — headpin
  [0.38, 0.35],  // 1
  [0.62, 0.35],  // 2
  [0.26, 0.5],   // 3
  [0.5, 0.5],    // 4
  [0.74, 0.5],   // 5
  [0.14, 0.65],  // 6
  [0.38, 0.65],  // 7
  [0.62, 0.65],  // 8
  [0.86, 0.65],  // 9
];
