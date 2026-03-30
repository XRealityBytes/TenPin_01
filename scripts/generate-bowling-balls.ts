/**
 * Bowling Ball Texture Generation — DALL-E 3 flat surface patterns.
 *
 * Generates flat, seamless, tileable material textures for each of the 10
 * bowling balls. These are NOT renders of 3D spheres — they are top-down
 * photographs of flat material slabs that the raymarching shader wraps
 * onto its SDF sphere via spherical UV projection.
 *
 * The shader handles all 3D form, lighting, reflections, and finger holes.
 *
 * Usage:
 *   npx tsx scripts/generate-bowling-balls.ts           # generate missing
 *   npx tsx scripts/generate-bowling-balls.ts --force   # regenerate all
 *
 * Reads OPENAI_API_KEY from .env at the project root.
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import sharp from "sharp";

/* ── Ball definitions ────────────────────────────────────── */

interface BallSpec {
  id: string;
  name: string;
  /** Prompt for a flat, seamless, tileable surface pattern (NOT a 3D ball render). */
  texturePrompt: string;
}

/**
 * DALL-E 3 Prompt Strategy
 * ────────────────────────
 * Previous prompts said "spherical texture map of a bowling ball" — DALL-E 3
 * interpreted that literally and rendered 3D perspective ball images with
 * backgrounds, baked lighting, and finger holes.
 *
 * These revised prompts request FLAT, TOP-DOWN surface material patterns:
 *   • "flat seamless tileable material texture, photographed from directly above"
 *   • Never mention "bowling ball", "sphere", or "3D"
 *   • Describe the surface as a slab, countertop, or sheet of material
 *   • Emphasise "fills the entire frame, edge to edge"
 *   • Request "no objects, no shadows, no vignette, no perspective"
 *
 * The shader handles all 3D form, lighting, reflections, and finger holes.
 */
const PROMPT_SUFFIX =
  "Flat seamless tileable material texture photographed from directly above, " +
  "fills the entire 1024x1024 frame edge to edge. No objects, no sphere, no 3D shape, " +
  "no shadows, no vignette, no perspective distortion, no border. " +
  "Perfectly flat surface slab, studio lit evenly for texture scanning.";

const BALLS: BallSpec[] = [
  {
    id: "golden-rowans",
    name: "Golden Rowans",
    texturePrompt:
      "Polished gold chrome surface with art deco geometric wing patterns etched into the metal. " +
      "Rich warm gold tones, mirror-like metallic reflections across a flat slab of ornate gilded metal. " +
      "Luxurious embossed geometric linework. " +
      PROMPT_SUFFIX,
  },
  {
    id: "punk-cupcakes",
    name: "Punk Cupcakes",
    texturePrompt:
      "Matte black painted surface with hot pink splatter paint accents, small skull-topped cupcake motifs " +
      "scattered across the surface, safety pin scratch marks etched into the finish. " +
      "Edgy punk rock style pattern on a flat sheet. " +
      PROMPT_SUFFIX,
  },
  {
    id: "cake-box",
    name: "Cake Box",
    texturePrompt:
      "Extreme close-up macro photograph looking straight down at a polished purple and lilac resin pour art surface. " +
      "Elegant swirling lavender and amethyst veining patterns flowing across the entire image. " +
      "Pearlescent finish, warm bakery-inspired palette. The pattern extends beyond all four edges with no border or margin. " +
      PROMPT_SUFFIX,
  },
  {
    id: "ocean-tide",
    name: "Ocean Tide",
    texturePrompt:
      "Deep ocean blue marbled resin slab, swirling teal and cerulean veining patterns " +
      "like waves frozen in polished glass. Pearlescent sheen throughout the surface. " +
      "Rich marine colour palette with depth and translucency. " +
      PROMPT_SUFFIX,
  },
  {
    id: "inferno",
    name: "Inferno",
    texturePrompt:
      "Extreme close-up macro photograph looking straight down at red and orange resin pour art surface. " +
      "Deep crimson base with molten orange and bright amber veining swirling throughout. Glossy wet finish. " +
      "The pattern extends beyond all four edges of the image with no border, margin, or visible edge. " +
      PROMPT_SUFFIX,
  },
  {
    id: "emerald-surge",
    name: "Emerald Surge",
    texturePrompt:
      "Extreme close-up macro photograph looking straight down at an emerald green resin pour art surface. " +
      "Deep forest green base with luminous jade and gold veining running organically throughout. " +
      "Gemstone-like translucency and polish. The pattern extends beyond all four edges with no border or margin. " +
      PROMPT_SUFFIX,
  },
  {
    id: "sunset-blaze",
    name: "Sunset Blaze",
    texturePrompt:
      "Extreme close-up macro photograph looking straight down at coral pink and orange resin pour art surface. " +
      "Warm flowing peach veining patterns throughout. Tropical sunset colour palette with smooth gradients. " +
      "The pattern extends beyond all four edges of the image with no border, margin, or visible edge. " +
      PROMPT_SUFFIX,
  },
  {
    id: "electric-violet",
    name: "Electric Violet",
    texturePrompt:
      "Extreme close-up macro photograph looking straight down at dark violet resin pour art surface. " +
      "Electric blue and bright amethyst lightning-like veins crackling across the entire image. " +
      "Neon energy patterns, high contrast purple and electric blue. The pattern extends beyond all four edges with no border. " +
      PROMPT_SUFFIX,
  },
  {
    id: "galaxy-nebula",
    name: "Galaxy Nebula",
    texturePrompt:
      "Dark cosmic surface pattern resembling deep space, dark navy and black base with vibrant pink " +
      "and purple nebula cloud wisps, tiny pinprick stars, ethereal cosmic dust trails scattered across " +
      "the flat surface. Space photography colour palette. " +
      PROMPT_SUFFIX,
  },
  {
    id: "crystal-frost",
    name: "Crystal Frost",
    texturePrompt:
      "Extreme close-up macro photograph looking straight down at a frozen glass surface covered in frost. " +
      "Translucent pale blue with intricate frost fern patterns and delicate ice crystal formations. " +
      "Prismatic light refractions, white and silver accents. The pattern extends beyond all four edges with no border or margin. " +
      PROMPT_SUFFIX,
  },
];

/* ── Config ─────────────────────────────────────────────── */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUT_BASE = path.join(ROOT, "public/assets/generated");
const TEXTURE_DIR = path.join(OUT_BASE, "textures/balls");
const THUMB_DIR = path.join(OUT_BASE, "textures/ball-thumbnails");
const MANIFEST_PATH = path.join(OUT_BASE, "ball-manifest.json");

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const FORCE = flags.has("--force");

/** --only inferno,cake-box,sunset-blaze  — regenerate only these IDs */
const onlyArg = args.find((_, i) => args[i - 1] === "--only");
const ONLY_IDS: Set<string> | null = onlyArg
  ? new Set(onlyArg.split(",").map((s) => s.trim()))
  : null;

/* ── API Client ─────────────────────────────────────────── */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ── Types ──────────────────────────────────────────────── */

interface BallManifestEntry {
  id: string;
  name: string;
  texturePath: string;
  thumbnailPath: string;
  generatedAt: string;
}

type BallManifest = Record<string, BallManifestEntry>;

/* ── Helpers ────────────────────────────────────────────── */

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function exists(filePath: string): boolean {
  return !FORCE && fs.existsSync(filePath);
}

function loadManifest(): BallManifest {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as BallManifest;
  } catch {
    return {} as BallManifest;
  }
}

function saveManifest(manifest: BallManifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function relPath(absPath: string): string {
  return "/" + path.relative(path.join(ROOT, "public"), absPath);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/* ── Texture Generation ─────────────────────────────────── */

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

async function generateBallTexture(ball: BallSpec, manifest: BallManifest): Promise<void> {
  // Skip if not in --only list
  if (ONLY_IDS && !ONLY_IDS.has(ball.id)) {
    console.log(`  ⏭  ${ball.name} — not in --only list, skipping`);
    return;
  }

  const ts = timestamp();

  // Timestamped versions (never overwritten)
  const stampedTexture = path.join(TEXTURE_DIR, `${ball.id}_${ts}.webp`);
  const stampedThumb = path.join(THUMB_DIR, `${ball.id}_${ts}.webp`);

  // Canonical paths (latest version, used by the game)
  const canonTexture = path.join(TEXTURE_DIR, `${ball.id}.webp`);
  const canonThumb = path.join(THUMB_DIR, `${ball.id}.webp`);

  if (exists(canonTexture)) {
    console.log(`  ⏭  ${ball.name} — already exists, skipping (use --force to regenerate)`);
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.log(`  ⏭  ${ball.name} — no OPENAI_API_KEY, skipping`);
    return;
  }

  console.log(`  🎨 Generating texture: ${ball.name}...`);

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: ball.texturePrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image data returned");

    const buffer = Buffer.from(b64, "base64");

    // Save timestamped version (archive — never overwritten)
    await sharp(buffer).webp({ quality: 90 }).toFile(stampedTexture);
    await sharp(buffer).resize(256, 256).webp({ quality: 80 }).toFile(stampedThumb);

    // Copy to canonical path (latest version for the game)
    fs.copyFileSync(stampedTexture, canonTexture);
    fs.copyFileSync(stampedThumb, canonThumb);

    manifest[ball.id] = {
      id: ball.id,
      name: ball.name,
      texturePath: relPath(canonTexture),
      thumbnailPath: relPath(canonThumb),
      generatedAt: new Date().toISOString(),
    };

    console.log(`  ✅ ${ball.name} → ${ball.id}_${ts}.webp (+ canonical)`);
  } catch (err) {
    console.error(`  ❌ ${ball.name} failed:`, err instanceof Error ? err.message : err);
  }
}

/* ── Main ───────────────────────────────────────────────── */

async function main() {
  console.log("🎳 Bowling Ball Texture Generation");
  console.log(`   Force mode: ${FORCE ? "ON" : "OFF"}`);
  console.log(`   Only IDs:  ${ONLY_IDS ? [...ONLY_IDS].join(", ") : "(all)"}`);
  console.log(`   Output: ${TEXTURE_DIR}\n`);

  ensureDir(TEXTURE_DIR);
  ensureDir(THUMB_DIR);

  const manifest = loadManifest();

  console.log("🖼️  Generating ball textures (OpenAI DALL-E 3)\n");
  for (const ball of BALLS) {
    await generateBallTexture(ball, manifest);
    // DALL-E 3 rate limit: ~5 images/min
    await sleep(15000);
  }

  saveManifest(manifest);

  const count = BALLS.filter((b) =>
    fs.existsSync(path.join(TEXTURE_DIR, `${b.id}.webp`)),
  ).length;

  console.log("\n📋 Summary");
  console.log(`   Textures: ${count}/${BALLS.length}`);
  console.log(`   Manifest: ${MANIFEST_PATH}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
