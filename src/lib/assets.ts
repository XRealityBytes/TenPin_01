/**
 * Asset manifest loader — provides typed access to generated asset paths.
 *
 * Reads from /assets/generated/manifest.json at build time (server) or
 * runtime (client). Falls back to placeholder paths when assets haven't
 * been generated yet.
 */

export interface AssetManifestEntry {
  name: string;
  category: "texture" | "model" | "audio";
  path: string;
  format: string;
  generatedAt: string;
}

export type AssetManifest = Record<string, AssetManifestEntry>;

/** Known texture asset names. */
export type TextureName = "ball-surface" | "lane-wood" | "pin-white" | "alley-background" | "splash-art";

/** Known audio asset names. */
export type AudioName =
  | "ball-roll"
  | "pin-strike"
  | "spare-hit"
  | "gutter-thud"
  | "pin-wobble"
  | "ui-tap"
  | "announce-strike"
  | "announce-spare"
  | "announce-gutter"
  | "announce-gameover"
  | "announce-newframe";

/** Known 3D model asset names. */
export type ModelName = "bowling-pin" | "bowling-ball" | "lane-section";

let _cachedManifest: AssetManifest | null = null;

/** Load the manifest (cached after first call). Client-side only. */
async function loadManifest(): Promise<AssetManifest> {
  if (_cachedManifest) return _cachedManifest;

  try {
    const res = await fetch("/assets/generated/manifest.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _cachedManifest = (await res.json()) as AssetManifest;
    return _cachedManifest;
  } catch {
    _cachedManifest = {};
    return _cachedManifest;
  }
}

/** Get the path for a texture asset, with fallback. */
export async function getTexturePath(name: TextureName): Promise<string> {
  const manifest = await loadManifest();
  return manifest[name]?.path ?? `/assets/generated/textures/${name}.webp`;
}

/** Get the path for an audio asset, with fallback. */
export async function getAudioPath(name: AudioName): Promise<string> {
  const manifest = await loadManifest();
  return manifest[name]?.path ?? `/assets/generated/audio/${name}.mp3`;
}

/** Get the path for a 3D model asset, with fallback. */
export async function getModelPath(name: ModelName): Promise<string> {
  const manifest = await loadManifest();
  return manifest[name]?.path ?? `/assets/generated/models/${name}.glb`;
}

/** Check if a specific asset has been generated. */
export async function hasAsset(name: string): Promise<boolean> {
  const manifest = await loadManifest();
  return name in manifest;
}
