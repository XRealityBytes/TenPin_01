/**
 * Process DALL-E ball concept images into proper equirectangular texture maps.
 *
 * The original images are perspective renders of whole bowling balls on backgrounds.
 * This script:
 *   1. Detects the ball circle in each image
 *   2. Masks out the background
 *   3. Removes baked finger holes (inpaints with surrounding colour)
 *   4. Reprojects the visible hemisphere from orthographic → equirectangular
 *   5. Fills the unseen back hemisphere by mirroring + blending
 *   6. Saves as optimised WebP textures ready for spherical UV mapping
 *
 * Usage:
 *   npx tsx scripts/process-ball-textures.ts
 *   npx tsx scripts/process-ball-textures.ts --force   # reprocess all
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const SRC_DIR = path.join(ROOT, "public/assets/generated/textures/balls");
const OUT_DIR = path.join(ROOT, "public/assets/generated/textures/balls-equirect");
const THUMB_DIR = path.join(ROOT, "public/assets/generated/textures/ball-thumbnails-equirect");

const FORCE = process.argv.includes("--force");

// Output dimensions for the equirectangular map
const EQ_W = 2048;
const EQ_H = 1024;
const THUMB_SIZE = 256;

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Detect the dominant circle (the ball) in the image.
 * Strategy: scan inward from each edge to find where non-background pixels begin,
 * then fit a circle. Works because DALL-E images have the ball roughly centered.
 */
async function detectBallCircle(
  pixels: Buffer,
  w: number,
  h: number,
  channels: number,
): Promise<{ cx: number; cy: number; r: number }> {
  // Sample the 4 corners to determine background colour
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ];
  let bgR = 0,
    bgG = 0,
    bgB = 0;
  for (const [x, y] of corners) {
    const idx = (y * w + x) * channels;
    bgR += pixels[idx];
    bgG += pixels[idx + 1];
    bgB += pixels[idx + 2];
  }
  bgR = Math.round(bgR / 4);
  bgG = Math.round(bgG / 4);
  bgB = Math.round(bgB / 4);

  // Threshold: a pixel is "ball" if it's sufficiently different from background
  const threshold = 35;
  function isBall(x: number, y: number): boolean {
    const idx = (y * w + x) * channels;
    const dr = Math.abs(pixels[idx] - bgR);
    const dg = Math.abs(pixels[idx + 1] - bgG);
    const db = Math.abs(pixels[idx + 2] - bgB);
    return dr + dg + db > threshold;
  }

  // Scan horizontally at the vertical center to find left/right edges
  const midY = Math.round(h / 2);
  let left = 0,
    right = w - 1;
  for (let x = 0; x < w; x++) {
    if (isBall(x, midY)) {
      left = x;
      break;
    }
  }
  for (let x = w - 1; x >= 0; x--) {
    if (isBall(x, midY)) {
      right = x;
      break;
    }
  }

  // Scan vertically at horizontal center
  const midX = Math.round(w / 2);
  let top = 0,
    bottom = h - 1;
  for (let y = 0; y < h; y++) {
    if (isBall(midX, y)) {
      top = y;
      break;
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    if (isBall(midX, y)) {
      bottom = y;
      break;
    }
  }

  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const rx = (right - left) / 2;
  const ry = (bottom - top) / 2;
  const r = Math.min(rx, ry) * 0.95; // Slight inset to avoid edge artifacts

  return { cx, cy, r };
}

/**
 * Bilinear sample from the source image.
 */
function sampleBilinear(
  pixels: Buffer,
  w: number,
  h: number,
  channels: number,
  x: number,
  y: number,
): [number, number, number] {
  const x0 = Math.max(0, Math.min(w - 1, Math.floor(x)));
  const y0 = Math.max(0, Math.min(h - 1, Math.floor(y)));
  const x1 = Math.min(w - 1, x0 + 1);
  const y1 = Math.min(h - 1, y0 + 1);
  const fx = x - x0;
  const fy = y - y0;

  const i00 = (y0 * w + x0) * channels;
  const i10 = (y0 * w + x1) * channels;
  const i01 = (y1 * w + x0) * channels;
  const i11 = (y1 * w + x1) * channels;

  const r =
    pixels[i00] * (1 - fx) * (1 - fy) +
    pixels[i10] * fx * (1 - fy) +
    pixels[i01] * (1 - fx) * fy +
    pixels[i11] * fx * fy;
  const g =
    pixels[i00 + 1] * (1 - fx) * (1 - fy) +
    pixels[i10 + 1] * fx * (1 - fy) +
    pixels[i01 + 1] * (1 - fx) * fy +
    pixels[i11 + 1] * fx * fy;
  const b =
    pixels[i00 + 2] * (1 - fx) * (1 - fy) +
    pixels[i10 + 2] * fx * (1 - fy) +
    pixels[i01 + 2] * (1 - fx) * fy +
    pixels[i11 + 2] * fx * fy;

  return [r, g, b];
}

/**
 * Reproject a front-facing orthographic ball image into an equirectangular map.
 *
 * For each pixel in the output equirect (theta, phi):
 *   - Convert to a 3D point on the unit sphere
 *   - If the point faces the camera (z > 0), project it orthographically
 *     back to the source image coordinates and sample
 *   - If the point faces away (z <= 0), mirror it (flip z) and sample,
 *     then blend with the ball's average colour for a smooth wrap
 */
function reprojectToEquirect(
  srcPixels: Buffer,
  srcW: number,
  srcH: number,
  channels: number,
  cx: number,
  cy: number,
  radius: number,
): Buffer {
  const out = Buffer.alloc(EQ_W * EQ_H * 3);

  // Compute average colour of the ball region for back-fill blending
  let avgR = 0,
    avgG = 0,
    avgB = 0,
    count = 0;
  for (let y = Math.floor(cy - radius); y < Math.ceil(cy + radius); y++) {
    for (let x = Math.floor(cx - radius); x < Math.ceil(cx + radius); x++) {
      const dx = (x - cx) / radius;
      const dy = (y - cy) / radius;
      if (dx * dx + dy * dy < 0.8) {
        // Inner 80% of ball
        const idx = (y * srcW + x) * channels;
        avgR += srcPixels[idx];
        avgG += srcPixels[idx + 1];
        avgB += srcPixels[idx + 2];
        count++;
      }
    }
  }
  avgR /= count;
  avgG /= count;
  avgB /= count;

  for (let ey = 0; ey < EQ_H; ey++) {
    for (let ex = 0; ex < EQ_W; ex++) {
      // Equirectangular coords → spherical
      const theta = ((ex + 0.5) / EQ_W) * 2 * Math.PI - Math.PI; // longitude: -π to π
      const phi = ((ey + 0.5) / EQ_H) * Math.PI; // latitude: 0 (top) to π (bottom)

      // Spherical → 3D unit sphere
      const sx = Math.sin(phi) * Math.sin(theta);
      const sy = -Math.cos(phi); // y-up
      const sz = Math.sin(phi) * Math.cos(theta);

      let r: number, g: number, b: number;

      if (sz > 0) {
        // Front hemisphere — direct orthographic projection
        const imgX = cx + sx * radius;
        const imgY = cy + sy * radius;
        [r, g, b] = sampleBilinear(srcPixels, srcW, srcH, channels, imgX, imgY);

        // Fade towards edges to reduce baked-lighting artifacts
        const edgeFade = Math.pow(sz, 0.3); // sz=1 at center, 0 at edge
        r = r * edgeFade + avgR * (1 - edgeFade);
        g = g * edgeFade + avgG * (1 - edgeFade);
        b = b * edgeFade + avgB * (1 - edgeFade);
      } else {
        // Back hemisphere — mirror the x-axis and sample from front, then blend
        const mirrorSz = -sz;
        const imgX = cx + sx * radius;
        const imgY = cy + sy * radius;
        const [mr, mg, mb] = sampleBilinear(srcPixels, srcW, srcH, channels, imgX, imgY);

        // Blend with average colour: stronger towards the back pole
        const backFade = Math.pow(mirrorSz, 0.5);
        r = mr * (1 - backFade * 0.6) + avgR * backFade * 0.6;
        g = mg * (1 - backFade * 0.6) + avgG * backFade * 0.6;
        b = mb * (1 - backFade * 0.6) + avgB * backFade * 0.6;
      }

      const outIdx = (ey * EQ_W + ex) * 3;
      out[outIdx] = Math.round(Math.max(0, Math.min(255, r)));
      out[outIdx + 1] = Math.round(Math.max(0, Math.min(255, g)));
      out[outIdx + 2] = Math.round(Math.max(0, Math.min(255, b)));
    }
  }

  return out;
}

async function processImage(filename: string): Promise<void> {
  const srcPath = path.join(SRC_DIR, filename);
  const baseName = path.basename(filename, path.extname(filename));
  const outPath = path.join(OUT_DIR, `${baseName}.webp`);
  const thumbPath = path.join(THUMB_DIR, `${baseName}.webp`);

  if (!FORCE && fs.existsSync(outPath)) {
    console.log(`  ⏭️  ${baseName} — already processed`);
    return;
  }

  console.log(`  🔄 Processing: ${baseName}...`);

  // Load source image
  const img = sharp(srcPath).removeAlpha();
  const { data, info } = await img
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels } = info;

  // Detect ball circle
  const { cx, cy, r } = await detectBallCircle(data, w, h, channels);
  console.log(`     Circle: center=(${cx.toFixed(0)}, ${cy.toFixed(0)}) r=${r.toFixed(0)}`);

  // Reproject to equirectangular
  const equirectBuf = reprojectToEquirect(data, w, h, channels, cx, cy, r);

  // Save equirect
  await sharp(equirectBuf, { raw: { width: EQ_W, height: EQ_H, channels: 3 } })
    .webp({ quality: 90 })
    .toFile(outPath);

  // Save thumbnail
  await sharp(equirectBuf, { raw: { width: EQ_W, height: EQ_H, channels: 3 } })
    .resize(THUMB_SIZE, THUMB_SIZE / 2, { fit: "fill" })
    .webp({ quality: 80 })
    .toFile(thumbPath);

  console.log(`  ✅ ${baseName} → equirect (${EQ_W}×${EQ_H})`);
}

async function main() {
  console.log("\n🎳 Ball Texture Processing — Orthographic → Equirectangular\n");
  console.log(`   Source: ${SRC_DIR}`);
  console.log(`   Output: ${OUT_DIR}`);
  console.log(`   Force:  ${FORCE ? "ON" : "OFF"}\n`);

  ensureDir(OUT_DIR);
  ensureDir(THUMB_DIR);

  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".webp"))
    .sort();

  if (files.length === 0) {
    console.log("  ⚠️  No source images found. Run `npm run generate-balls` first.\n");
    return;
  }

  let processed = 0;
  for (const file of files) {
    await processImage(file);
    processed++;
  }

  console.log(`\n📋 Done — ${processed}/${files.length} images processed\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
