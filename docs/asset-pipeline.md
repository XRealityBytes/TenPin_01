# Asset Generation Pipeline

## Overview

TenPin uses AI APIs to generate game assets: textures (OpenAI DALL-E 3), 3D models (Meshy), and sound effects + voice lines (ElevenLabs). The pipeline is a single TypeScript script run via `tsx`.

## Prerequisites

API keys in `.env` at project root:

```
OPENAI_API_KEY=sk-...          # Required for textures
MESHY_API_KEY=...               # Required for 3D models
MESHY_BASE_URL=https://api.meshy.ai  # Optional (default shown)
ELEVENLABS_API_KEY=...          # Required for audio
```

## Running

```bash
# Generate all missing assets (skips existing)
npm run generate-assets

# Force regenerate everything
npm run generate-assets:force

# Generate only a specific category
npx tsx scripts/generate-assets.ts --textures
npx tsx scripts/generate-assets.ts --audio
npx tsx scripts/generate-assets.ts --models
```

## What Gets Generated

### Textures (OpenAI DALL-E 3)

| Asset | Description | Format | Size |
|-------|-------------|--------|------|
| `ball-surface` | Red/black marbled bowling ball | WebP | 1024×1024 |
| `lane-wood` | Polished maple lane wood | WebP | 1024×1024 |
| `pin-white` | Glossy white pin finish | WebP | 1024×1024 |
| `alley-background` | Dark bowling alley panorama | WebP | 1792×1024 |
| `splash-art` | Game splash screen artwork | WebP | 1024×1024 |

Generated as PNG from DALL-E 3, then converted to WebP (quality 85) via `sharp`.

### Audio (ElevenLabs)

| Asset | Type | Description |
|-------|------|-------------|
| `ball-roll` | SFX | Ball rolling on lane (~2s) |
| `pin-strike` | SFX | Strike impact (~1s) |
| `spare-hit` | SFX | Spare pickup (~1s) |
| `gutter-thud` | SFX | Gutter ball thud (~1s) |
| `pin-wobble` | SFX | Pin wobbling (~1s) |
| `ui-tap` | SFX | UI button tap (~0.3s) |
| `announce-strike` | TTS | "Strike!" |
| `announce-spare` | TTS | "Spare!" |
| `announce-gutter` | TTS | "Gutter ball..." |
| `announce-gameover` | TTS | "Game over!" |
| `announce-newframe` | TTS | "New frame" |

SFX uses the Sound Generation API; TTS uses the text-to-speech API with the "Rachel" voice.

### 3D Models (Meshy)

| Asset | Description | Format |
|-------|-------------|--------|
| `bowling-pin` | Standard 10-pin | GLB |
| `bowling-ball` | Red marbled ball | GLB |
| `lane-section` | Lane with gutters | GLB |

Models are generated via Meshy's text-to-3D API (refine mode, realistic style, ~30K polys).

## Output Structure

```
public/assets/generated/
├── manifest.json           # Maps asset names → file paths + metadata
├── textures/
│   ├── ball-surface.webp
│   ├── lane-wood.webp
│   ├── pin-white.webp
│   ├── alley-background.webp
│   └── splash-art.webp
├── models/
│   ├── bowling-pin.glb
│   ├── bowling-ball.glb
│   └── lane-section.glb
└── audio/
    ├── ball-roll.mp3
    ├── pin-strike.mp3
    ├── spare-hit.mp3
    ├── gutter-thud.mp3
    ├── pin-wobble.mp3
    ├── ui-tap.mp3
    ├── announce-strike.mp3
    ├── announce-spare.mp3
    ├── announce-gutter.mp3
    ├── announce-gameover.mp3
    └── announce-newframe.mp3
```

## Manifest Format

```json
{
  "ball-surface": {
    "name": "ball-surface",
    "category": "texture",
    "path": "/assets/generated/textures/ball-surface.webp",
    "format": "webp",
    "generatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

## Usage in Code

```typescript
import { getTexturePath, getAudioPath, getModelPath } from "@/lib/assets";

const ballTexture = await getTexturePath("ball-surface");
const strikeSound = await getAudioPath("pin-strike");
const pinModel = await getModelPath("bowling-pin");
```

For audio playback, use the `useGameAudio` hook:

```typescript
import { useGameAudio } from "@/hooks/useGameAudio";

const { play, isMuted, toggleMute } = useGameAudio();
play("pin-strike"); // plays the strike sound
```

## Idempotency

By default, the script skips any asset whose output file already exists. Use `--force` to regenerate all assets. The manifest is updated incrementally.

## Rate Limits

- **DALL-E 3**: ~5 images/min on most tiers. The script adds 2s delay between requests.
- **ElevenLabs**: Varies by plan. The script adds 1.5s delay between requests.
- **Meshy**: Tasks take 1–5 minutes. The script polls every 5 seconds.
