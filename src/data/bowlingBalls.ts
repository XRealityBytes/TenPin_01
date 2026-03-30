/**
 * Bowling ball definitions — 10 selectable balls for players to choose from.
 *
 * Categories:
 *   - 3 branded balls (Rowans, Punk Cupcakes, Cake Box)
 *   - 5 bright colour / marbled balls
 *   - 2 imaginative / creative balls
 *
 * Each ball has fallback procedural style (colour, metalness, etc.)
 * and a DALL-E prompt for generating concept images that feed into Meshy 6.
 */

export interface BallStyle {
  /** Main body colour. */
  color: string;
  /** Material roughness 0–1. */
  roughness: number;
  /** Material metalness 0–1. */
  metalness: number;
  /** Environment map intensity multiplier. */
  envMapIntensity: number;
  /** Swirl accent band colour. */
  swirlColor: string;
  /** Swirl emissive colour. */
  swirlEmissive: string;
  /** Swirl emissive intensity. */
  swirlEmissiveIntensity: number;
  /** Finger hole colour. */
  holeColor: string;
  /** Optional path to a generated texture map (relative to public/). */
  texturePath?: string;
}

export interface BowlingBallDef {
  id: string;
  name: string;
  description: string;
  category: "branded" | "marbled" | "imaginative";
  style: BallStyle;
  /** DALL-E prompt for generating a concept image of this bowling ball. */
  dallePrompt: string;
  /** Preview colour for the picker UI when no thumbnail is available. */
  previewGradient: string;
}

export const BOWLING_BALLS: BowlingBallDef[] = [
  /* ── Branded ──────────────────────────────────────────── */
  {
    id: "golden-rowans",
    name: "Golden Rowans",
    description: "Art deco luxury in polished gold chrome",
    category: "branded",
    style: {
      color: "#c5a033",
      roughness: 0.05,
      metalness: 0.95,
      envMapIntensity: 2.0,
      swirlColor: "#ffe066",
      swirlEmissive: "#aa8800",
      swirlEmissiveIntensity: 0.5,
      holeColor: "#1a1200",
      texturePath: "/assets/generated/textures/balls/golden-rowans.webp",
    },
    dallePrompt:
      "A luxurious bowling ball in polished gold chrome finish, art deco style with elegant wing motifs " +
      "and geometric patterns etched into the surface. Rich warm gold tones with mirror-like reflections. " +
      "Three finger holes visible. Studio photography on black background, photorealistic, no text.",
    previewGradient: "linear-gradient(135deg, #c5a033, #ffe066, #c5a033)",
  },
  {
    id: "punk-cupcakes",
    name: "Punk Cupcakes",
    description: "Rebellious pink & black punk attitude",
    category: "branded",
    style: {
      color: "#1a0a14",
      roughness: 0.1,
      metalness: 0.3,
      envMapIntensity: 1.0,
      swirlColor: "#ff1493",
      swirlEmissive: "#ff0080",
      swirlEmissiveIntensity: 0.8,
      holeColor: "#0a0008",
      texturePath: "/assets/generated/textures/balls/punk-cupcakes.webp",
    },
    dallePrompt:
      "A bowling ball with hot pink and black punk rock aesthetic, skull cupcake design painted on the surface, " +
      "matte black base with neon pink splatter paint accents and safety pin motifs. Edgy rebellious style. " +
      "Three finger holes visible. Studio photography on black background, photorealistic, no text.",
    previewGradient: "linear-gradient(135deg, #1a0a14, #ff1493, #1a0a14)",
  },
  {
    id: "cake-box",
    name: "Cake Box",
    description: "Sweet lilac elegance with bakery charm",
    category: "branded",
    style: {
      color: "#7b5ea7",
      roughness: 0.12,
      metalness: 0.2,
      envMapIntensity: 1.1,
      swirlColor: "#d8b4fe",
      swirlEmissive: "#9966cc",
      swirlEmissiveIntensity: 0.4,
      holeColor: "#2a1a3a",
      texturePath: "/assets/generated/textures/balls/cake-box.webp",
    },
    dallePrompt:
      "A bowling ball in rich purple and lilac tones, smooth glossy surface with elegant swirling patterns " +
      "in lighter lavender. Warm inviting bakery-inspired aesthetic. Pearlescent purple finish. " +
      "Three finger holes visible. Studio photography on black background, photorealistic, no text.",
    previewGradient: "linear-gradient(135deg, #7b5ea7, #d8b4fe, #7b5ea7)",
  },

  /* ── Bright & Marbled ─────────────────────────────────── */
  {
    id: "ocean-tide",
    name: "Ocean Tide",
    description: "Swirling deep blues and pearlescent teal",
    category: "marbled",
    style: {
      color: "#0a2e4a",
      roughness: 0.08,
      metalness: 0.4,
      envMapIntensity: 1.3,
      swirlColor: "#00bcd4",
      swirlEmissive: "#006680",
      swirlEmissiveIntensity: 0.4,
      holeColor: "#020e18",
      texturePath: "/assets/generated/textures/balls/ocean-tide.webp",
    },
    dallePrompt:
      "A bowling ball with deep ocean blue marbled resin finish, swirling teal and cerulean veining " +
      "throughout like waves frozen in glass. Pearlescent sheen catching the light. " +
      "Three finger holes visible. Studio photography on black background, photorealistic, no text.",
    previewGradient: "linear-gradient(135deg, #0a2e4a, #00bcd4, #0a2e4a)",
  },
  {
    id: "inferno",
    name: "Inferno",
    description: "Blazing reds and molten orange marble",
    category: "marbled",
    style: {
      color: "#4a0a0a",
      roughness: 0.06,
      metalness: 0.35,
      envMapIntensity: 1.2,
      swirlColor: "#ff4400",
      swirlEmissive: "#cc2200",
      swirlEmissiveIntensity: 0.6,
      holeColor: "#180404",
      texturePath: "/assets/generated/textures/balls/inferno.webp",
    },
    dallePrompt:
      "A bowling ball with fiery marbled resin finish, deep crimson red base with molten orange and " +
      "bright amber veining swirling throughout like lava. Glossy reflective surface. " +
      "Three finger holes visible. Studio photography on black background, photorealistic, no text.",
    previewGradient: "linear-gradient(135deg, #4a0a0a, #ff4400, #4a0a0a)",
  },
  {
    id: "emerald-surge",
    name: "Emerald Surge",
    description: "Rich greens with luminous gold veins",
    category: "marbled",
    style: {
      color: "#0a3a1a",
      roughness: 0.07,
      metalness: 0.45,
      envMapIntensity: 1.4,
      swirlColor: "#50c878",
      swirlEmissive: "#228b22",
      swirlEmissiveIntensity: 0.4,
      holeColor: "#041208",
      texturePath: "/assets/generated/textures/balls/emerald-surge.webp",
    },
    dallePrompt:
      "A bowling ball with rich emerald green marbled resin, deep forest green base with luminous " +
      "jade and gold veining patterns. Luxurious gemstone-like appearance with high gloss finish. " +
      "Three finger holes visible. Studio photography on black background, photorealistic, no text.",
    previewGradient: "linear-gradient(135deg, #0a3a1a, #50c878, #0a3a1a)",
  },
  {
    id: "sunset-blaze",
    name: "Sunset Blaze",
    description: "Warm pinks, corals, and sunset orange",
    category: "marbled",
    style: {
      color: "#4a1a2a",
      roughness: 0.08,
      metalness: 0.3,
      envMapIntensity: 1.2,
      swirlColor: "#ff6b6b",
      swirlEmissive: "#cc4444",
      swirlEmissiveIntensity: 0.5,
      holeColor: "#1a080e",
      texturePath: "/assets/generated/textures/balls/sunset-blaze.webp",
    },
    dallePrompt:
      "A bowling ball with sunset gradient marbled resin, warm coral pink base with swirling orange " +
      "and peach veining. Tropical sunset colour palette, smooth glossy finish. " +
      "Three finger holes visible. Studio photography on black background, photorealistic, no text.",
    previewGradient: "linear-gradient(135deg, #4a1a2a, #ff6b6b, #ff9a56)",
  },
  {
    id: "electric-violet",
    name: "Electric Violet",
    description: "Deep purple with crackling blue energy",
    category: "marbled",
    style: {
      color: "#1a0a3a",
      roughness: 0.06,
      metalness: 0.5,
      envMapIntensity: 1.5,
      swirlColor: "#8a2be2",
      swirlEmissive: "#6600cc",
      swirlEmissiveIntensity: 0.7,
      holeColor: "#0a0418",
      texturePath: "/assets/generated/textures/balls/electric-violet.webp",
    },
    dallePrompt:
      "A bowling ball with deep purple marbled resin, dark violet base with electric blue and bright " +
      "amethyst lightning-like veins crackling through. Neon energy aesthetic with high gloss. " +
      "Three finger holes visible. Studio photography on black background, photorealistic, no text.",
    previewGradient: "linear-gradient(135deg, #1a0a3a, #8a2be2, #1a0a3a)",
  },

  /* ── Imaginative ──────────────────────────────────────── */
  {
    id: "galaxy-nebula",
    name: "Galaxy Nebula",
    description: "Deep space with swirling cosmic dust",
    category: "imaginative",
    style: {
      color: "#050520",
      roughness: 0.04,
      metalness: 0.6,
      envMapIntensity: 1.8,
      swirlColor: "#ff44aa",
      swirlEmissive: "#aa0066",
      swirlEmissiveIntensity: 1.0,
      holeColor: "#000008",
      texturePath: "/assets/generated/textures/balls/galaxy-nebula.webp",
    },
    dallePrompt:
      "A bowling ball that looks like a window into deep space, dark cosmic background with vibrant " +
      "pink and purple nebula clouds swirling across the surface, tiny pinprick stars scattered throughout, " +
      "ethereal cosmic dust trails. Magical and otherworldly. Three finger holes visible. " +
      "Studio photography on black background, photorealistic, no text.",
    previewGradient: "linear-gradient(135deg, #050520, #ff44aa, #4400aa, #050520)",
  },
  {
    id: "crystal-frost",
    name: "Crystal Frost",
    description: "Frozen ice with crystalline facets",
    category: "imaginative",
    style: {
      color: "#c8e8f8",
      roughness: 0.02,
      metalness: 0.7,
      envMapIntensity: 2.5,
      swirlColor: "#ffffff",
      swirlEmissive: "#88ccff",
      swirlEmissiveIntensity: 0.8,
      holeColor: "#4488aa",
      texturePath: "/assets/generated/textures/balls/crystal-frost.webp",
    },
    dallePrompt:
      "A bowling ball that appears to be made of crystalline ice, translucent pale blue surface with " +
      "frost patterns and tiny ice crystal formations visible within. Prismatic light refractions, " +
      "frozen and magical appearance. Three finger holes visible. " +
      "Studio photography on black background, photorealistic, no text.",
    previewGradient: "linear-gradient(135deg, #88ccff, #ffffff, #c8e8f8, #88ccff)",
  },
];

/** Look up a ball definition by ID. Returns the first ball if not found. */
export function getBallById(id: string): BowlingBallDef {
  return BOWLING_BALLS.find((b) => b.id === id) ?? BOWLING_BALLS[0];
}
