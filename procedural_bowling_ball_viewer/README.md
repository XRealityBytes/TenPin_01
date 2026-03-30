# Procedural Bowling Ball Viewer

This viewer uses Three.js plus a custom fragment shader to render a **procedural bowling ball** with:

- seamless procedural shell pattern
- polished resin-like specular response
- three drilled finger holes
- orbit controls for inspection

## Run locally

Because the page imports ES modules from a CDN, serve the folder over a local web server.

### Option 1: Python
```bash
cd procedural_bowling_ball_viewer
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Option 2: VS Code Live Server
Open the folder in VS Code and run Live Server on `index.html`.

## Files

- `index.html`
- `style.css`
- `script.js`

## Notes

This is the strongest visual upgrade versus a simple texture-mapped sphere because the holes are not painted on — they are carved by an SDF in shader space.

If you want the next step, the best production upgrade is:
1. add lane/studio HDR reflections
2. expose shell colours and hole layout as UI controls
3. convert the look into a true mesh + PBR workflow for export
