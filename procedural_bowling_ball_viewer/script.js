import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Ball definitions (mirrors src/data/bowlingBalls.ts) ────────────── */

function hex(h) {
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  return [Math.pow(r, 2.2), Math.pow(g, 2.2), Math.pow(b, 2.2)];
}

const BALLS = [
  {
    id: 'golden-rowans', name: 'Golden Rowans',
    desc: 'Art deco luxury in polished gold chrome',
    gradient: 'linear-gradient(135deg, #c5a033, #ffe066, #c5a033)',
    base: hex('#D4AF37'), swirl: hex('#FFD700'), accent: hex('#B8860B'), hole: hex('#1a1200'),
    roughness: 0.12, metalness: 1.0, emissiveStr: 0.08,
    bumpStr: 1.8,
    texture: './public/assets/generated/textures/balls/golden-rowans.webp'
  },
  {
    id: 'punk-cupcakes', name: 'Punk Cupcakes',
    desc: 'Rebellious pink & black punk attitude',
    gradient: 'linear-gradient(135deg, #1a0a14, #ff1493, #1a0a14)',
    base: hex('#1a0a14'), swirl: hex('#ff1493'), accent: hex('#ff0080'), hole: hex('#0a0008'),
    roughness: 0.10, metalness: 0.30, emissiveStr: 0.8,
    bumpStr: 0.5,
    texture: './public/assets/generated/textures/balls/punk-cupcakes.webp'
  },
  {
    id: 'cake-box', name: 'Cake Box',
    desc: 'Sweet lilac elegance with bakery charm',
    gradient: 'linear-gradient(135deg, #7b5ea7, #d8b4fe, #7b5ea7)',
    base: hex('#7b5ea7'), swirl: hex('#d8b4fe'), accent: hex('#9966cc'), hole: hex('#2a1a3a'),
    roughness: 0.12, metalness: 0.20, emissiveStr: 0.4,
    bumpStr: 0.5,
    texture: './public/assets/generated/textures/balls/cake-box.webp'
  },
  {
    id: 'ocean-tide', name: 'Ocean Tide',
    desc: 'Swirling deep blues and pearlescent teal',
    gradient: 'linear-gradient(135deg, #0a2e4a, #00bcd4, #0a2e4a)',
    base: hex('#0a2e4a'), swirl: hex('#00bcd4'), accent: hex('#006680'), hole: hex('#020e18'),
    roughness: 0.08, metalness: 0.40, emissiveStr: 0.4,
    bumpStr: 0.5,
    texture: './public/assets/generated/textures/balls/ocean-tide.webp'
  },
  {
    id: 'inferno', name: 'Inferno',
    desc: 'Blazing reds and molten orange marble',
    gradient: 'linear-gradient(135deg, #4a0a0a, #ff4400, #4a0a0a)',
    base: hex('#4a0a0a'), swirl: hex('#ff4400'), accent: hex('#cc2200'), hole: hex('#180404'),
    roughness: 0.06, metalness: 0.35, emissiveStr: 0.6,
    bumpStr: 0.5,
    texture: './public/assets/generated/textures/balls/inferno.webp'
  },
  {
    id: 'emerald-surge', name: 'Emerald Surge',
    desc: 'Rich greens with luminous gold veins',
    gradient: 'linear-gradient(135deg, #0a3a1a, #50c878, #0a3a1a)',
    base: hex('#0a3a1a'), swirl: hex('#50c878'), accent: hex('#228b22'), hole: hex('#041208'),
    roughness: 0.07, metalness: 0.45, emissiveStr: 0.4,
    bumpStr: 0.5,
    texture: './public/assets/generated/textures/balls/emerald-surge.webp'
  },
  {
    id: 'sunset-blaze', name: 'Sunset Blaze',
    desc: 'Warm pinks, corals, and sunset orange',
    gradient: 'linear-gradient(135deg, #4a1a2a, #ff6b6b, #ff9a56)',
    base: hex('#4a1a2a'), swirl: hex('#ff6b6b'), accent: hex('#cc4444'), hole: hex('#1a080e'),
    roughness: 0.08, metalness: 0.30, emissiveStr: 0.5,
    bumpStr: 0.5,
    texture: './public/assets/generated/textures/balls/sunset-blaze.webp'
  },
  {
    id: 'electric-violet', name: 'Electric Violet',
    desc: 'Deep purple with crackling blue energy',
    gradient: 'linear-gradient(135deg, #1a0a3a, #8a2be2, #1a0a3a)',
    base: hex('#1a0a3a'), swirl: hex('#8a2be2'), accent: hex('#6600cc'), hole: hex('#0a0418'),
    roughness: 0.06, metalness: 0.50, emissiveStr: 0.7,
    bumpStr: 0.5,
    texture: './public/assets/generated/textures/balls/electric-violet.webp'
  },
  {
    id: 'galaxy-nebula', name: 'Galaxy Nebula',
    desc: 'Deep space with swirling cosmic dust',
    gradient: 'linear-gradient(135deg, #050520, #ff44aa, #4400aa, #050520)',
    base: hex('#050520'), swirl: hex('#ff44aa'), accent: hex('#aa0066'), hole: hex('#000008'),
    roughness: 0.04, metalness: 0.60, emissiveStr: 1.0,
    bumpStr: 0.5,
    texture: './public/assets/generated/textures/balls/galaxy-nebula.webp'
  },
  {
    id: 'crystal-frost', name: 'Crystal Frost',
    desc: 'Frozen ice with crystalline facets',
    gradient: 'linear-gradient(135deg, #88ccff, #ffffff, #c8e8f8, #88ccff)',
    base: hex('#c8e8f8'), swirl: hex('#ffffff'), accent: hex('#88ccff'), hole: hex('#4488aa'),
    roughness: 0.02, metalness: 0.70, emissiveStr: 0.8,
    bumpStr: 0.5,
    texture: './public/assets/generated/textures/balls/crystal-frost.webp'
  }
];

/* ── Preload textures ───────────────────────────────────────────────── */

const loader = new THREE.TextureLoader();
const textures = {};
const fallbackTex = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1, THREE.RGBAFormat);
fallbackTex.needsUpdate = true;

let loadedCount = 0;
BALLS.forEach(b => {
  const tex = loader.load(b.texture, () => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    loadedCount++;
  }, undefined, () => {
    // On error, use fallback
    textures[b.id] = fallbackTex;
    loadedCount++;
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  textures[b.id] = tex;
});

/* ── Load Rowans logo texture ───────────────────────────────────────── */

const logoTex = loader.load('./public/assets/brand/home-main-logo.png', () => {
  logoTex.minFilter = THREE.LinearMipmapLinearFilter;
  logoTex.magFilter = THREE.LinearFilter;
  logoTex.generateMipmaps = true;
});

/* ── Renderer / Scene / Camera ──────────────────────────────────────── */

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x09090c);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100.0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

/* ── Auto-fit camera to keep ball inside ring ───────────────────────── */

function getViewportSize() {
  // Use visualViewport if available (handles toolbar show/hide)
  if (window.visualViewport) {
    return { w: window.visualViewport.width, h: window.visualViewport.height };
  }
  return { w: window.innerWidth, h: window.innerHeight };
}

function fitCameraToRing() {
  const { w, h } = getViewportSize();
  const vmin = Math.min(w, h);
  // Ring is 80vmin diameter; the usable inner area (excluding icons) is ~56vmin
  const innerRadiusPx = vmin * 0.28; // half of 56vmin
  const fovRad = camera.fov * Math.PI / 180;
  const aspect = w / Math.max(h, 1);

  // Distance needed so a sphere of radius 1.0 fits within innerRadiusPx
  // Project 1.0 world unit through perspective to get screen pixels
  const hFov = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
  const ballWorldR = 1.05; // slightly padded

  // Vertical and horizontal fit
  const screenFractionV = innerRadiusPx / (h / 2);
  const screenFractionH = innerRadiusPx / (w / 2);

  const distV = ballWorldR / (screenFractionV * Math.tan(fovRad / 2));
  const distH = ballWorldR / (screenFractionH * Math.tan(hFov / 2));

  const dist = Math.max(distV, distH);
  camera.position.set(0, 0.0, dist);
  controls.target.set(0, 0, 0);
  controls.update();
}

/* ── Uniforms ───────────────────────────────────────────────────────── */

const ball0 = BALLS[0];

const uniforms = {
  uTime:          { value: 0 },
  uResolution:    { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  uCameraPos:     { value: new THREE.Vector3() },
  uInvProjection: { value: new THREE.Matrix4() },
  uInvView:       { value: new THREE.Matrix4() },
  uLightDir:      { value: new THREE.Vector3(0.6, 0.8, 0.45).normalize() },
  // Per-ball colours (linear RGB)
  uBaseColor:     { value: new THREE.Vector3(...ball0.base) },
  uSwirlColor:    { value: new THREE.Vector3(...ball0.swirl) },
  uAccentColor:   { value: new THREE.Vector3(...ball0.accent) },
  uHoleColor:     { value: new THREE.Vector3(...ball0.hole) },
  uRoughness:     { value: ball0.roughness },
  uMetalness:     { value: ball0.metalness },
  uEmissiveStr:   { value: ball0.emissiveStr },
  uBumpStr:        { value: ball0.bumpStr },
  // Texture
  uBallTex:       { value: textures[ball0.id] },
  uHasTexture:    { value: 1.0 },
  // Logo
  uLogoTex:       { value: logoTex },
  // Rotation angles (set each frame)
  uRotY:          { value: 0.0 },
  uRotX:          { value: 0.0 }
};

/* ── Shader Material ────────────────────────────────────────────────── */

const material = new THREE.ShaderMaterial({
  uniforms,
  depthWrite: false,
  depthTest: false,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;

    varying vec2 vUv;

    uniform float uTime;
    uniform vec2  uResolution;
    uniform vec3  uCameraPos;
    uniform mat4  uInvProjection;
    uniform mat4  uInvView;
    uniform vec3  uLightDir;

    uniform vec3  uBaseColor;
    uniform vec3  uSwirlColor;
    uniform vec3  uAccentColor;
    uniform vec3  uHoleColor;
    uniform float uRoughness;
    uniform float uMetalness;
    uniform float uEmissiveStr;
    uniform float uBumpStr;

    uniform sampler2D uBallTex;
    uniform float uHasTexture;
    uniform sampler2D uLogoTex;
    uniform float uRotY;
    uniform float uRotX;

    #define MAX_STEPS 180
    #define MAX_DIST 30.0
    #define SURF_DIST 0.0006
    #define PI 3.14159265

    /* ── PBR helpers (GGX / Cook-Torrance) ───────────────── */

    float DistributionGGX(float NdotH, float roughness) {
      float a = roughness * roughness;
      float a2 = a * a;
      float d = NdotH * NdotH * (a2 - 1.0) + 1.0;
      return a2 / (PI * d * d);
    }

    float GeometrySchlickGGX(float NdotV, float roughness) {
      float r = roughness + 1.0;
      float k = (r * r) / 8.0;
      return NdotV / (NdotV * (1.0 - k) + k);
    }

    float GeometrySmith(float NdotV, float NdotL, float roughness) {
      return GeometrySchlickGGX(NdotV, roughness) * GeometrySchlickGGX(NdotL, roughness);
    }

    vec3 fresnelSchlick(float cosTheta, vec3 F0) {
      return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
    }

    vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
      return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
    }

    mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    float hash31(vec3 p) {
      return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
    }

    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float n000 = hash31(i + vec3(0,0,0));
      float n100 = hash31(i + vec3(1,0,0));
      float n010 = hash31(i + vec3(0,1,0));
      float n110 = hash31(i + vec3(1,1,0));
      float n001 = hash31(i + vec3(0,0,1));
      float n101 = hash31(i + vec3(1,0,1));
      float n011 = hash31(i + vec3(0,1,1));
      float n111 = hash31(i + vec3(1,1,1));

      float nx00 = mix(n000, n100, f.x);
      float nx10 = mix(n010, n110, f.x);
      float nx01 = mix(n001, n101, f.x);
      float nx11 = mix(n011, n111, f.x);

      float nxy0 = mix(nx00, nx10, f.y);
      float nxy1 = mix(nx01, nx11, f.y);

      return mix(nxy0, nxy1, f.z);
    }

    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.03;
        a *= 0.5;
      }
      return v;
    }

    float sdSphere(vec3 p, float r) {
      return length(p) - r;
    }

    float sdCappedCylinderY(vec3 p, float h, float r) {
      vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
      return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
    }

    // Smooth maximum — produces a filleted boolean subtraction
    float smax(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(a, b, h) + k * h * (1.0 - h);
    }

    // Capped cone (IQ) centered at origin, y from -h to +h
    // r1 = radius at y=-h (bottom), r2 = radius at y=+h (top)
    float sdCappedCone(vec3 p, float h, float r1, float r2) {
      vec2 q = vec2(length(p.xz), p.y);
      vec2 k1 = vec2(r2, h);
      vec2 k2 = vec2(r2 - r1, 2.0 * h);
      vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r1 : r2), abs(q.y) - h);
      vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0.0, 1.0);
      float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
      return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
    }

    // Rotate point for the ball's slow tumble
    vec3 rotateBall(vec3 p) {
      p.xz *= rot(uRotY);
      p.yz *= rot(uRotX);
      return p;
    }

    vec3 warpShell(vec3 p) {
      vec3 q = p;
      q.xy *= rot(0.55);
      q.yz *= rot(-0.8);
      float n1 = fbm(q * 4.5);
      float n2 = fbm(q * 9.0);
      q += 0.12 * vec3(n1 - 0.5, n2 - 0.5, n1 - n2);
      return q;
    }

    float mapBall(vec3 p) {
      vec3 rp = rotateBall(p);

      float sphere = sdSphere(rp, 1.0);

      // ── Thumb hole (h1): tapered cone + hemisphere bottom + fillet ──
      vec3 h1p = rp - vec3(0.00, 0.78, 0.00);
      // Cone: half-height 0.48, botR 0.09 (at y=-0.48), topR 0.155 (at y=+0.48)
      float h1Cone = sdCappedCone(h1p, 0.48, 0.09, 0.155);
      // Rounded bottom cap: sphere at the cone bottom
      float h1Cap = sdSphere(h1p + vec3(0.0, 0.48, 0.0), 0.105);
      float h1 = min(h1Cone, h1Cap);

      // ── Finger hole 2: tapered + rounded ──
      vec3 h2p = rp - vec3(-0.30, 0.60, 0.20);
      h2p.xz *= rot(0.12);
      float h2Cone = sdCappedCone(h2p, 0.42, 0.07, 0.12);
      float h2Cap = sdSphere(h2p + vec3(0.0, 0.42, 0.0), 0.085);
      float h2 = min(h2Cone, h2Cap);

      // ── Finger hole 3: tapered + rounded ──
      vec3 h3p = rp - vec3(0.28, 0.56, 0.18);
      h3p.xz *= rot(-0.16);
      float h3Cone = sdCappedCone(h3p, 0.42, 0.07, 0.12);
      float h3Cap = sdSphere(h3p + vec3(0.0, 0.42, 0.0), 0.085);
      float h3 = min(h3Cone, h3Cap);

      // Subtract holes with filleted (smooth) edges
      float d = sphere;
      d = smax(d, -h1, 0.028);
      d = smax(d, -h2, 0.022);
      d = smax(d, -h3, 0.022);
      return d;
    }

    vec3 getNormal(vec3 p) {
      vec2 e = vec2(0.001, 0.0);
      return normalize(vec3(
        mapBall(p + e.xyy) - mapBall(p - e.xyy),
        mapBall(p + e.yxy) - mapBall(p - e.yxy),
        mapBall(p + e.yyx) - mapBall(p - e.yyx)
      ));
    }

    float raymarch(vec3 ro, vec3 rd, out vec3 pHit) {
      float dO = 0.0;
      for (int i = 0; i < MAX_STEPS; i++) {
        pHit = ro + rd * dO;
        float dS = mapBall(pHit);
        if (dS < SURF_DIST) return dO;
        dO += dS * 0.85;
        if (dO > MAX_DIST) break;
      }
      return -1.0;
    }

    // Sample the DALL-E texture using spherical UV from the rotated normal
    vec3 sampleBallTexture(vec3 p) {
      vec3 rp = normalize(rotateBall(p));
      // Spherical mapping
      float u = atan(rp.z, rp.x) / (2.0 * PI) + 0.5;
      float v = asin(clamp(rp.y, -1.0, 1.0)) / PI + 0.5;
      vec3 texCol = texture2D(uBallTex, vec2(u, v)).rgb;
      // Seam blend: cross-fade with opposite-seam sample near u≈0 / u≈1
      float seamDist = min(u, 1.0 - u);
      float seamMix = smoothstep(0.0, 0.06, seamDist);
      vec3 texOther = texture2D(uBallTex, vec2(1.0 - u, v)).rgb;
      texCol = mix((texCol + texOther) * 0.5, texCol, seamMix);
      // Convert from sRGB to linear
      texCol = pow(texCol, vec3(2.2));
      return texCol;
    }

    // Sample texture height (luminance) at a spherical UV offset
    float sampleBallHeight(vec3 p) {
      vec3 rp = normalize(rotateBall(p));
      float u = atan(rp.z, rp.x) / (2.0 * PI) + 0.5;
      float v = asin(clamp(rp.y, -1.0, 1.0)) / PI + 0.5;
      vec3 texCol = texture2D(uBallTex, vec2(u, v)).rgb;
      // Seam blend (must match sampleBallTexture)
      float seamDist = min(u, 1.0 - u);
      float seamMix = smoothstep(0.0, 0.06, seamDist);
      vec3 texOther = texture2D(uBallTex, vec2(1.0 - u, v)).rgb;
      texCol = mix((texCol + texOther) * 0.5, texCol, seamMix);
      texCol = pow(texCol, vec3(2.2));
      return dot(texCol, vec3(0.2126, 0.7152, 0.0722));
    }

    // Perturb normal using texture as a bump/height map
    vec3 bumpNormal(vec3 p, vec3 n) {
      if (uHasTexture < 0.5 || uBumpStr < 0.01) return n;
      float eps = 0.003;
      float hC = sampleBallHeight(p);
      float hX = sampleBallHeight(p + vec3(eps, 0.0, 0.0));
      float hY = sampleBallHeight(p + vec3(0.0, eps, 0.0));
      float hZ = sampleBallHeight(p + vec3(0.0, 0.0, eps));
      vec3 grad = vec3(hX - hC, hY - hC, hZ - hC) / eps;
      // Remove component along normal (project gradient onto tangent plane)
      grad -= n * dot(grad, n);
      return normalize(n + grad * uBumpStr * 0.06);
    }

    // Sample the Rowans logo via tangent-plane projection
    // Returns vec4(rgb, alpha) in linear space
    vec4 sampleLogo(vec3 p) {
      vec3 rp = normalize(rotateBall(p));
      // Logo center: front-lower face, opposite the finger holes at top
      vec3 logoCenter = normalize(vec3(0.0, -0.35, 0.94));
      // Build tangent frame at logoCenter
      vec3 up = vec3(0.0, 1.0, 0.0);
      vec3 tangent = normalize(cross(up, logoCenter));
      vec3 bitangent = cross(logoCenter, tangent);
      // Project rp onto tangent plane
      float dp = dot(rp, logoCenter);
      // Only visible on the front hemisphere near logoCenter
      if (dp < 0.85) return vec4(0.0);
      vec3 proj = rp / dp - logoCenter;
      float lu = dot(proj, tangent);
      float lv = dot(proj, bitangent);
      // Scale: logo spans ~0.55 radians wide, aspect 2.33:1
      float logoScale = 2.8;
      float aspect = 2.33;
      float su = lu * logoScale * aspect * 0.5 + 0.5;
      float sv = lv * logoScale * 0.5 + 0.5;
      if (su < 0.0 || su > 1.0 || sv < 0.0 || sv > 1.0) return vec4(0.0);
      // Flip V (texture is top-down)
      sv = 1.0 - sv;
      vec4 logoSamp = texture2D(uLogoTex, vec2(su, sv));
      // Convert to linear
      logoSamp.rgb = pow(logoSamp.rgb, vec3(2.2));
      return logoSamp;
    }

    vec3 shellColor(vec3 p, vec3 n) {
      vec3 rp = rotateBall(p);
      vec3 q = warpShell(rp);
      float marbleA = fbm(q * 3.3);
      float marbleB = fbm(q * 7.1 + 4.0);
      float veins = sin((q.x * 5.2 + q.z * 4.1 + marbleA * 5.0 - marbleB * 3.0) * 2.7);
      veins = 0.5 + 0.5 * veins;
      veins = smoothstep(0.28, 0.88, veins);

      // Procedural marble base
      vec3 base1 = uBaseColor * 0.6;
      vec3 base2 = uBaseColor * 0.35 + uAccentColor * 0.15;
      vec3 base3 = uBaseColor * 0.4 + uSwirlColor * 0.08;
      vec3 swirl = mix(base1, base2, marbleA);
      swirl = mix(swirl, base3, marbleB * 0.65);

      vec3 proceduralCol = swirl;
      proceduralCol = mix(proceduralCol, uSwirlColor, veins * 0.35);
      proceduralCol = mix(proceduralCol, uAccentColor, smoothstep(0.55, 0.95, marbleB) * 0.22);
      proceduralCol += uAccentColor * uEmissiveStr * veins * 0.15;

      // Blend texture with procedural for embossed look
      if (uHasTexture > 0.5) {
        vec3 texCol = sampleBallTexture(p);
        float texLum = dot(texCol, vec3(0.2126, 0.7152, 0.0722));

        if (uMetalness > 0.8) {
          // ── PURE METAL MODE ──
          vec3 metalBase = uBaseColor;
          metalBase = mix(metalBase, uSwirlColor, veins * 0.15);
          metalBase = mix(metalBase, uAccentColor, smoothstep(0.5, 0.9, marbleB) * 0.1);
          float emboss = 0.55 + 0.55 * texLum;
          metalBase *= emboss;
          vec3 texTint = texCol / max(texLum, 0.01);
          metalBase *= mix(vec3(1.0), texTint, 0.08);
          // ── Logo stamp ──
          vec4 logo = sampleLogo(p);
          if (logo.a > 0.01) {
            // Embossed branding: logo luminance modulates the metal surface
            float logoLum = dot(logo.rgb, vec3(0.2126, 0.7152, 0.0722));
            // Raised stamp effect — brighten peaks, darken around edges
            metalBase = mix(metalBase, metalBase * (0.6 + 1.0 * logoLum), logo.a);
          }
          return metalBase;
        }

        // ── STANDARD TEXTURED MODE ──
        float detail = texLum * 1.4;
        vec3 blended = texCol * 0.65 + proceduralCol * 0.35;
        blended *= 0.7 + 0.5 * detail;
        blended += uAccentColor * uEmissiveStr * veins * 0.08;
        // ── Logo stamp ──
        vec4 logoStd = sampleLogo(p);
        if (logoStd.a > 0.01) {
          float logoLum = dot(logoStd.rgb, vec3(0.2126, 0.7152, 0.0722));
          // Subtle embossed branding using accent tint
          vec3 logoTint = mix(uAccentColor, uSwirlColor, 0.3);
          blended = mix(blended, logoTint * (0.5 + 0.8 * logoLum), logoStd.a * 0.6);
        }
        return blended;
      }

      float speckle = step(0.965, noise(q * 58.0));
      proceduralCol += speckle * 0.10;

      float fresTint = pow(1.0 - max(dot(n, normalize(-uCameraPos + p)), 0.0), 3.0);
      proceduralCol += fresTint * 0.04;

      return proceduralCol;
    }

    vec3 cavityColor(vec3 p) {
      float n = fbm(p * 8.0);
      return mix(uHoleColor * 0.6, uHoleColor * 1.6, n);
    }

    vec3 getRayDir(vec2 uv) {
      vec4 clip = vec4(uv * 2.0 - 1.0, -1.0, 1.0);
      vec4 view = uInvProjection * clip;
      view = vec4(view.xy, -1.0, 0.0);
      vec3 world = normalize((uInvView * view).xyz);
      return world;
    }

    void main() {
      vec3 ro = uCameraPos;
      vec3 rd = getRayDir(vUv);

      vec3 p;
      float t = raymarch(ro, rd, p);

      vec3 bg = mix(vec3(0.02, 0.02, 0.03), vec3(0.005, 0.005, 0.008), length(vUv - 0.5) * 1.35);
      if (t < 0.0) {
        gl_FragColor = vec4(bg, 1.0);
        return;
      }

      vec3 geoN = getNormal(p);
      vec3 n = bumpNormal(p, geoN);
      vec3 l = normalize(uLightDir);
      vec3 v = normalize(ro - p);
      vec3 h = normalize(l + v);

      float NdotL = max(dot(n, l), 0.0);
      float NdotV = max(dot(n, v), 0.001);
      float NdotH = max(dot(n, h), 0.0);
      float HdotV = max(dot(h, v), 0.0);

      // Determine if we're in a finger hole cavity
      vec3 rp = rotateBall(p);
      bool inCavity = rp.y > 0.32 && (
        length(rp.xz - vec2(0.0, 0.0)) < 0.18 ||
        length(rp.xz - vec2(-0.30, 0.20)) < 0.15 ||
        length(rp.xz - vec2(0.28, 0.18)) < 0.15
      );

      vec3 albedo;
      if (inCavity && dot(geoN, vec3(0.0, 1.0, 0.0)) < 0.25) {
        albedo = cavityColor(p);
      } else {
        albedo = shellColor(p, n);
      }

      // ── PBR Cook-Torrance BRDF ──
      float roughness = max(uRoughness, 0.04);
      float metalness = uMetalness;

      // F0: dielectric = 0.04, metal = albedo colour
      vec3 F0 = mix(vec3(0.04), albedo, metalness);

      // Light radiance (warm key light)
      vec3 lightColor = vec3(1.0, 0.96, 0.90) * 3.0;

      // Cook-Torrance specular
      float D = DistributionGGX(NdotH, roughness);
      float G = GeometrySmith(NdotV, NdotL, roughness);
      vec3  F = fresnelSchlick(HdotV, F0);

      vec3 numerator = D * G * F;
      float denominator = 4.0 * NdotV * NdotL + 0.0001;
      vec3 specular = numerator / denominator;

      // Energy conservation
      vec3 kS = F;
      vec3 kD = (1.0 - kS) * (1.0 - metalness); // Metals have no diffuse

      // Diffuse (Lambertian)
      vec3 diffuse = kD * albedo / PI;

      // Direct lighting
      vec3 Lo = (diffuse + specular) * lightColor * NdotL;

      // Fill light — diffuse only (no specular) so it lifts shadows
      // without creating a second visible highlight
      vec3 fillDir = normalize(vec3(-0.4, -0.3, 0.7));
      float fillNdotL = max(dot(n, fillDir), 0.0);
      vec3 fillKd = (1.0 - metalness) * albedo / PI;
      Lo += fillKd * vec3(0.5, 0.55, 0.65) * 0.35 * fillNdotL;

      // Ambient / IBL approximation
      vec3 Fa = fresnelSchlickRoughness(NdotV, F0, roughness);
      vec3 kDa = (1.0 - Fa) * (1.0 - metalness);
      vec3 ambientDiffuse = kDa * albedo * vec3(0.08, 0.08, 0.10);

      // Fake environment reflection for metals (reflect scene background)
      vec3 R = reflect(-v, n);
      float envMip = roughness * 4.0;
      // Approximate sky gradient reflection
      vec3 envColor = mix(vec3(0.15, 0.15, 0.2), vec3(0.05, 0.05, 0.07), clamp(R.y * 0.5 + 0.5, 0.0, 1.0));
      envColor += vec3(0.3, 0.27, 0.22) * pow(max(dot(R, l), 0.0), mix(256.0, 8.0, roughness)); // Sun reflection
      vec3 ambientSpecular = Fa * envColor;

      vec3 ambient = ambientDiffuse + ambientSpecular;

      // AO
      float ao = clamp(1.0 - smoothstep(0.0, 0.28, abs(mapBall(p + geoN * 0.08))), 0.65, 1.0);
      ambient *= ao;

      // ── Layer 1: Base (embossed/textured metal or pigment) ──
      vec3 baseLo = Lo + ambient;

      // Emissive glow (subtle)
      baseLo += albedo * uEmissiveStr * 0.15;

      // ── Layer 2: Clearcoat (smooth resin/urethane finish) ──
      // Uses geometric normal (not bump-perturbed) since resin is a smooth layer
      // sitting on top of the embossed/textured base
      float ccRough = 0.035;
      vec3  ccF0v = vec3(0.04); // Dielectric resin

      // Clearcoat fresnel (energy split between coat and base)
      float ccNdotV = max(dot(geoN, v), 0.001);
      float ccFresnel = 0.04 + 0.96 * pow(1.0 - ccNdotV, 5.0);

      // Key light clearcoat specular
      vec3 ccH = normalize(l + v);
      float ccNdotL = max(dot(geoN, l), 0.0);
      float ccNdotH = max(dot(geoN, ccH), 0.0);
      float ccHdotV = max(dot(ccH, v), 0.0);
      float ccD = DistributionGGX(ccNdotH, ccRough);
      float ccG = GeometrySmith(ccNdotV, ccNdotL, ccRough);
      vec3  ccFv = fresnelSchlick(ccHdotV, ccF0v);
      vec3 clearcoat = (ccD * ccG * ccFv) / (4.0 * ccNdotV * ccNdotL + 0.0001) * lightColor * ccNdotL;

      // Environment reflection on clearcoat (sharp, low roughness)
      // Keep very dark — this is a studio-lit ball, not outdoors
      vec3 ccR = reflect(-v, geoN);
      vec3 ccEnv = mix(vec3(0.03, 0.03, 0.04), vec3(0.01, 0.01, 0.015), clamp(ccR.y * 0.5 + 0.5, 0.0, 1.0));
      ccEnv += vec3(0.25, 0.22, 0.18) * pow(max(dot(ccR, l), 0.0), 512.0);
      vec3 ccEnvFresnel = fresnelSchlickRoughness(ccNdotV, ccF0v, ccRough);
      // Clamp env Fresnel contribution to avoid misty edges at grazing angles
      ccEnvFresnel *= smoothstep(0.0, 0.15, ccNdotV);
      clearcoat += ccEnvFresnel * ccEnv;

      // Skip clearcoat inside finger holes (raw drilled surface)
      float ccMask = inCavity ? 0.0 : 1.0;

      // Compose: base attenuated by clearcoat energy + clearcoat on top
      // Light attenuation factor — keep low so base colour shows through strongly
      vec3 col = baseLo * (1.0 - ccFresnel * 0.2 * ccMask) + clearcoat * ccMask;

      // Subtle rim light (clamped to avoid misty edge)
      float rim = pow(1.0 - NdotV, 5.0) * smoothstep(0.0, 0.12, NdotV);
      col += rim * vec3(0.04, 0.045, 0.06);

      // Tone mapping (ACES approximation) + gamma
      col = col / (col + vec3(1.0)); // Reinhard
      col = pow(col, vec3(0.4545));
      gl_FragColor = vec4(col, 1.0);
    }
  `
});

const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(quad);

/* ── Ball Wheel Picker UI ───────────────────────────────────────────── */

let currentIndex = 0;
const trackEl = document.getElementById('ring-track');

function getShortestCircularOffset(index, currentIdx, total) {
  const direct = index - currentIdx;
  const wrapped = direct > 0 ? direct - total : direct + total;
  return Math.abs(direct) <= Math.abs(wrapped) ? direct : wrapped;
}

function selectBall(index) {
  currentIndex = index;
  const b = BALLS[index];
  uniforms.uBaseColor.value.set(...b.base);
  uniforms.uSwirlColor.value.set(...b.swirl);
  uniforms.uAccentColor.value.set(...b.accent);
  uniforms.uHoleColor.value.set(...b.hole);
  uniforms.uRoughness.value = b.roughness;
  uniforms.uMetalness.value = b.metalness;
  uniforms.uEmissiveStr.value = b.emissiveStr;
  uniforms.uBumpStr.value = b.bumpStr;
  uniforms.uBallTex.value = textures[b.id];
  uniforms.uHasTexture.value = textures[b.id] !== fallbackTex ? 1.0 : 0.0;
  renderRing();
}

function jogPrev() {
  selectBall((currentIndex - 1 + BALLS.length) % BALLS.length);
}

function jogNext() {
  selectBall((currentIndex + 1) % BALLS.length);
}

function renderRing() {
  trackEl.innerHTML = '';
  const total = BALLS.length;
  const anglePerItem = (2 * Math.PI) / total;
  const radius = 40; // vmin

  // Inactive items on the ring arc
  BALLS.forEach((b, i) => {
    const offset = getShortestCircularOffset(i, currentIndex, total);
    const depth = Math.abs(offset);
    if (offset === 0) return; // active rendered separately

    const angle = offset * anglePerItem;
    const x = Math.sin(angle) * radius;
    const y = -Math.cos(angle) * radius + radius;
    const scale = Math.max(0.55, 1 - depth * 0.07);
    const opacity = Math.max(0.2, 1 - depth * 0.12);

    const btn = document.createElement('button');
    btn.className = 'gallery-ring__item';
    btn.style.left = `calc(50% + ${x}vmin)`;
    btn.style.bottom = `${y}vmin`;
    btn.style.transform = `translate(-50%, 50%) scale(${scale})`;
    btn.style.opacity = opacity;
    btn.style.zIndex = Math.max(1, 7 - depth);
    btn.addEventListener('click', () => selectBall(i));

    const img = document.createElement('img');
    img.className = 'gallery-ring__thumb';
    img.src = b.texture;
    img.alt = b.name;
    btn.appendChild(img);
    trackEl.appendChild(btn);
  });

  // Bottom group: arrows + active item + labels
  const current = BALLS[currentIndex];
  const bottom = document.createElement('div');
  bottom.className = 'gallery-ring__bottom';

  const row = document.createElement('div');
  row.className = 'gallery-ring__active-row';

  // Left arrow
  const arrowL = document.createElement('button');
  arrowL.className = 'gallery-ring__arrow gallery-ring__arrow--left';
  arrowL.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
  arrowL.addEventListener('click', jogPrev);

  // Active item
  const activeBtn = document.createElement('button');
  activeBtn.className = 'gallery-ring__item gallery-ring__item--active';
  const activeImg = document.createElement('img');
  activeImg.className = 'gallery-ring__thumb';
  activeImg.src = current.texture;
  activeImg.alt = current.name;
  activeBtn.appendChild(activeImg);

  // Right arrow
  const arrowR = document.createElement('button');
  arrowR.className = 'gallery-ring__arrow gallery-ring__arrow--right';
  arrowR.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';
  arrowR.addEventListener('click', jogNext);

  // Label (above)
  const label = document.createElement('span');
  label.className = 'gallery-ring__active-label';
  label.textContent = current.name;

  // Description (below)
  const desc = document.createElement('span');
  desc.className = 'gallery-ring__desc';
  desc.textContent = current.desc;

  // Counter
  const counter = document.createElement('span');
  counter.className = 'gallery-ring__counter';
  counter.textContent = `${currentIndex + 1} / ${BALLS.length}`;

  row.appendChild(arrowL);
  row.appendChild(activeBtn);
  row.appendChild(arrowR);
  row.appendChild(label);
  row.appendChild(desc);
  row.appendChild(counter);
  bottom.appendChild(row);
  trackEl.appendChild(bottom);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') jogPrev();
  else if (e.key === 'ArrowRight') jogNext();
});

// Initial render
renderRing();

/* ── Render loop ────────────────────────────────────────────────────── */

function updateCameraUniforms() {
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  uniforms.uCameraPos.value.copy(camera.position);
  uniforms.uInvProjection.value.copy(camera.projectionMatrixInverse);
  uniforms.uInvView.value.copy(camera.matrixWorld);
}

function onResize() {
  const { w, h } = getViewportSize();
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  uniforms.uResolution.value.set(w, h);
  fitCameraToRing();
}
window.addEventListener('resize', onResize);
// Also listen to visualViewport resize (toolbar show/hide on desktop browsers)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', onResize);
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  const t = clock.getElapsedTime();
  uniforms.uTime.value = t;
  // Slow dual-axis tumble — different speeds so the whole surface is revealed
  uniforms.uRotY.value = t * 0.12;   // ~30s full revolution around Y
  uniforms.uRotX.value = t * 0.073;  // ~86s full revolution around X
  updateCameraUniforms();
  renderer.render(scene, camera);
}
onResize();
fitCameraToRing();
animate();
