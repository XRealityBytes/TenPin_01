/**
 * Asset Generation Pipeline — generate textures, 3D models, and audio
 * using OpenAI (DALL-E 3), Meshy (image-to-3D), and ElevenLabs APIs.
 *
 * Usage:
 *   npx tsx scripts/generate-assets.ts           # generate missing assets
 *   npx tsx scripts/generate-assets.ts --force    # regenerate all assets
 *   npx tsx scripts/generate-assets.ts --textures # textures only
 *   npx tsx scripts/generate-assets.ts --audio    # audio only
 *   npx tsx scripts/generate-assets.ts --models   # 3D models only
 *
 * Reads API keys from .env at the project root.
 * Outputs to public/assets/generated/{textures,models,audio}/.
 * Writes a manifest.json mapping asset names to file paths + metadata.
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import sharp from "sharp";

/* ── Config ─────────────────────────────────────────────── */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUT_BASE = path.join(ROOT, "public/assets/generated");
const TEXTURE_DIR = path.join(OUT_BASE, "textures");
const MODEL_DIR = path.join(OUT_BASE, "models");
const AUDIO_DIR = path.join(OUT_BASE, "audio");
const MANIFEST_PATH = path.join(OUT_BASE, "manifest.json");

const flags = new Set(process.argv.slice(2));
const FORCE = flags.has("--force");
const TEXTURES_ONLY = flags.has("--textures");
const AUDIO_ONLY = flags.has("--audio");
const MODELS_ONLY = flags.has("--models");
const RUN_ALL = !TEXTURES_ONLY && !AUDIO_ONLY && !MODELS_ONLY;

/* ── API Clients ────────────────────────────────────────── */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MESHY_API_KEY = process.env.MESHY_API_KEY;
const MESHY_BASE_URL = process.env.MESHY_BASE_URL || "https://api.meshy.ai";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

/* ── Types ──────────────────────────────────────────────── */

interface TextureSpec {
  name: string;
  prompt: string;
  size: "1024x1024" | "1792x1024" | "1024x1792";
}

interface AudioSpec {
  name: string;
  text: string;
  /** "sfx" uses sound generation, "tts" uses text-to-speech */
  type: "sfx" | "tts";
}

interface ModelSpec {
  name: string;
  prompt: string;
}

interface ManifestEntry {
  name: string;
  category: "texture" | "model" | "audio";
  path: string;
  format: string;
  generatedAt: string;
}

type Manifest = Record<string, ManifestEntry>;

/* ── Asset Definitions ──────────────────────────────────── */

const TEXTURES: TextureSpec[] = [
  {
    name: "ball-surface",
    prompt:
      "Seamless tileable texture of a bowling ball surface, deep dark red and black marbled resin finish, " +
      "subtle swirl patterns, photorealistic, no text, no logos, 1024x1024 texture map",
    size: "1024x1024",
  },
  {
    name: "lane-wood",
    prompt:
      "Seamless tileable texture of polished bowling lane maple wood, warm golden honey colour, " +
      "fine grain detail, reflective lacquer finish, photorealistic, no text, 1024x1024 texture map",
    size: "1024x1024",
  },
  {
    name: "pin-white",
    prompt:
      "Seamless tileable texture of glossy white bowling pin surface, smooth plastic finish, " +
      "very subtle red stripe accent, photorealistic, no text, 1024x1024 texture map",
    size: "1024x1024",
  },
  {
    name: "alley-background",
    prompt:
      "Dark dramatic bowling alley interior panorama, neon red accent lighting, " +
      "polished lanes receding into distance, urban nightlife aesthetic, cinematic, " +
      "no people, no text, moody atmosphere, black and red colour palette",
    size: "1792x1024",
  },
  {
    name: "splash-art",
    prompt:
      "Stylized bowling scene artwork, dynamic composition with bowling ball striking pins, " +
      "explosive red and black colour palette, neon glow effects, dark background, " +
      "modern digital art style, no text, suitable for game splash screen",
    size: "1024x1024",
  },
];

const AUDIO_ASSETS: AudioSpec[] = [
  { name: "ball-roll", text: "Heavy bowling ball rolling along polished wooden lane, 2 seconds", type: "sfx" },
  { name: "pin-strike", text: "Loud satisfying bowling strike impact, all pins crashing down, 1 second", type: "sfx" },
  { name: "spare-hit", text: "Bowling ball hitting remaining pins, spare pickup sound, 1 second", type: "sfx" },
  { name: "gutter-thud", text: "Bowling ball falling into gutter with a dull thud, 1 second", type: "sfx" },
  { name: "pin-wobble", text: "Single bowling pin wobbling and settling back upright, 1 second", type: "sfx" },
  { name: "ui-tap", text: "Short clean UI button tap click sound, 0.3 seconds", type: "sfx" },
  { name: "announce-strike", text: "Strike!", type: "tts" },
  { name: "announce-spare", text: "Spare!", type: "tts" },
  { name: "announce-gutter", text: "Gutter ball...", type: "tts" },
  { name: "announce-gameover", text: "Game over!", type: "tts" },
  { name: "announce-newframe", text: "New frame", type: "tts" },
];

const MODELS: ModelSpec[] = [
  {
    name: "bowling-pin",
    prompt: "A standard 10-pin bowling pin, white with red stripes, photorealistic 3D model",
  },
  {
    name: "bowling-ball",
    prompt: "A dark red marbled bowling ball with three finger holes, photorealistic 3D model",
  },
  {
    name: "lane-section",
    prompt: "A section of polished bowling lane wooden floor with gutters on both sides, 3D model",
  },
];

/* ── Helpers ────────────────────────────────────────────── */

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function assetExists(filePath: string): boolean {
  return !FORCE && fs.existsSync(filePath);
}

function loadManifest(): Manifest {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as Manifest;
  } catch {
    return {};
  }
}

function saveManifest(manifest: Manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function relPath(absPath: string): string {
  return "/" + path.relative(path.join(ROOT, "public"), absPath);
}

/** Pause execution for the given milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/* ── Texture Generation ─────────────────────────────────── */

async function generateTexture(spec: TextureSpec, manifest: Manifest): Promise<void> {
  const outPath = path.join(TEXTURE_DIR, `${spec.name}.webp`);
  if (assetExists(outPath)) {
    console.log(`  ⏭  ${spec.name} — already exists, skipping`);
    return;
  }

  console.log(`  🎨 Generating texture: ${spec.name}...`);
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: spec.prompt,
      n: 1,
      size: spec.size,
      response_format: "b64_json",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image data returned");

    const buffer = Buffer.from(b64, "base64");

    // Convert to WebP for smaller file size
    await sharp(buffer).webp({ quality: 85 }).toFile(outPath);

    manifest[spec.name] = {
      name: spec.name,
      category: "texture",
      path: relPath(outPath),
      format: "webp",
      generatedAt: new Date().toISOString(),
    };

    console.log(`  ✅ ${spec.name} saved`);
  } catch (err) {
    console.error(`  ❌ ${spec.name} failed:`, err instanceof Error ? err.message : err);
  }
}

async function generateTextures(manifest: Manifest) {
  console.log("\n🖼️  Texture Generation (OpenAI DALL-E 3)\n");
  ensureDir(TEXTURE_DIR);

  for (const spec of TEXTURES) {
    await generateTexture(spec, manifest);
    // Rate limit: DALL-E 3 has a 5 images/min limit on most tiers
    await sleep(2000);
  }
}

/* ── Audio Generation (ElevenLabs) ──────────────────────── */

async function generateAudioAsset(spec: AudioSpec, manifest: Manifest): Promise<void> {
  const outPath = path.join(AUDIO_DIR, `${spec.name}.mp3`);
  if (assetExists(outPath)) {
    console.log(`  ⏭  ${spec.name} — already exists, skipping`);
    return;
  }

  if (!ELEVENLABS_API_KEY) {
    console.log(`  ⏭  ${spec.name} — no ELEVENLABS_API_KEY, skipping`);
    return;
  }

  console.log(`  🔊 Generating audio: ${spec.name} (${spec.type})...`);

  try {
    let audioBuffer: ArrayBuffer;

    if (spec.type === "sfx") {
      // Use ElevenLabs Sound Generation API
      const response = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: spec.text,
          duration_seconds: spec.text.includes("0.3") ? 0.5 : spec.text.includes("2 sec") ? 2 : 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs SFX API returned ${response.status}: ${await response.text()}`);
      }

      audioBuffer = await response.arrayBuffer();
    } else {
      // Use ElevenLabs TTS API
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: spec.text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.7,
              similarity_boost: 0.8,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs TTS API returned ${response.status}: ${await response.text()}`);
      }

      audioBuffer = await response.arrayBuffer();
    }

    fs.writeFileSync(outPath, Buffer.from(audioBuffer));

    manifest[spec.name] = {
      name: spec.name,
      category: "audio",
      path: relPath(outPath),
      format: "mp3",
      generatedAt: new Date().toISOString(),
    };

    console.log(`  ✅ ${spec.name} saved`);
  } catch (err) {
    console.error(`  ❌ ${spec.name} failed:`, err instanceof Error ? err.message : err);
  }
}

async function generateAudio(manifest: Manifest) {
  console.log("\n🔊 Audio Generation (ElevenLabs)\n");
  ensureDir(AUDIO_DIR);

  for (const spec of AUDIO_ASSETS) {
    await generateAudioAsset(spec, manifest);
    await sleep(1500);
  }
}

/* ── 3D Model Generation (Meshy) ────────────────────────── */

async function generateModel(spec: ModelSpec, manifest: Manifest): Promise<void> {
  const outPath = path.join(MODEL_DIR, `${spec.name}.glb`);
  if (assetExists(outPath)) {
    console.log(`  ⏭  ${spec.name} — already exists, skipping`);
    return;
  }

  if (!MESHY_API_KEY) {
    console.log(`  ⏭  ${spec.name} — no MESHY_API_KEY, skipping`);
    return;
  }

  console.log(`  🧊 Generating 3D model: ${spec.name}...`);

  try {
    // Step 1: Create text-to-3D task
    const createRes = await fetch(`${MESHY_BASE_URL}/openapi/v2/text-to-3d`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MESHY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "refine",
        prompt: spec.prompt,
        art_style: "realistic",
        negative_prompt: "ugly, distorted, low quality, blurry",
        topology: "triangle",
        target_polycount: 30000,
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Meshy create task returned ${createRes.status}: ${await createRes.text()}`);
    }

    const { result: taskId } = (await createRes.json()) as { result: string };
    console.log(`    Task created: ${taskId}, polling for completion...`);

    // Step 2: Poll for completion (Meshy tasks can take 1–5 minutes)
    const maxAttempts = 60;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await sleep(5000);

      const statusRes = await fetch(`${MESHY_BASE_URL}/openapi/v2/text-to-3d/${taskId}`, {
        headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
      });

      if (!statusRes.ok) continue;

      const task = (await statusRes.json()) as {
        status: string;
        model_urls?: { glb?: string };
        task_error?: { message?: string };
      };

      if (task.status === "SUCCEEDED" && task.model_urls?.glb) {
        // Download the GLB file
        const glbRes = await fetch(task.model_urls.glb);
        if (!glbRes.ok) throw new Error("Failed to download GLB file");

        const glbBuffer = await glbRes.arrayBuffer();
        fs.writeFileSync(outPath, Buffer.from(glbBuffer));

        manifest[spec.name] = {
          name: spec.name,
          category: "model",
          path: relPath(outPath),
          format: "glb",
          generatedAt: new Date().toISOString(),
        };

        console.log(`  ✅ ${spec.name} saved`);
        return;
      }

      if (task.status === "FAILED") {
        throw new Error(task.task_error?.message || "Task failed");
      }

      // Still processing, continue polling
      if (attempt % 6 === 5) {
        console.log(`    Still processing ${spec.name}... (${(attempt + 1) * 5}s)`);
      }
    }

    throw new Error("Task timed out after 5 minutes");
  } catch (err) {
    console.error(`  ❌ ${spec.name} failed:`, err instanceof Error ? err.message : err);
  }
}

async function generateModels(manifest: Manifest) {
  console.log("\n🧊 3D Model Generation (Meshy)\n");
  ensureDir(MODEL_DIR);

  for (const spec of MODELS) {
    await generateModel(spec, manifest);
  }
}

/* ── Main ───────────────────────────────────────────────── */

async function main() {
  console.log("🎳 TenPin Asset Generation Pipeline");
  console.log(`   Force mode: ${FORCE ? "ON" : "OFF"}`);
  console.log(`   Output: ${OUT_BASE}\n`);

  ensureDir(OUT_BASE);
  const manifest = loadManifest();

  if (RUN_ALL || TEXTURES_ONLY) await generateTextures(manifest);
  if (RUN_ALL || AUDIO_ONLY) await generateAudio(manifest);
  if (RUN_ALL || MODELS_ONLY) await generateModels(manifest);

  saveManifest(manifest);

  const counts = {
    textures: Object.values(manifest).filter((e) => e.category === "texture").length,
    models: Object.values(manifest).filter((e) => e.category === "model").length,
    audio: Object.values(manifest).filter((e) => e.category === "audio").length,
  };

  console.log("\n📋 Summary");
  console.log(`   Textures: ${counts.textures}/${TEXTURES.length}`);
  console.log(`   Audio:    ${counts.audio}/${AUDIO_ASSETS.length}`);
  console.log(`   Models:   ${counts.models}/${MODELS.length}`);
  console.log(`   Manifest: ${MANIFEST_PATH}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
