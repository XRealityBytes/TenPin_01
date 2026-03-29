# Responsive Strategy — TenPin_01

How the app adapts to different screen sizes, orientations, and device features.

---

## Approach

**Mobile-first** — all layouts start at the smallest viewport and scale up. Breakpoints use Tailwind's default `sm` (640px) split for nav and grid changes.

---

## Fluid Spacing

All gutters, section padding, and element sizing use CSS `clamp()` so values scale smoothly without hard breakpoints:

```css
--space-gutter: clamp(1.25rem, 3vw, 3rem);
--space-section-sm: clamp(4rem, 7vw, 5.5rem);
--space-section-md: clamp(5rem, 9vw, 7rem);
--space-section-lg: clamp(6rem, 12vw, 9rem);
```

Typography follows the same pattern via `clamp()` on `font-size`:

```css
text-[clamp(2rem,6vw,4.5rem)]  /* Hero heading */
text-[clamp(0.9rem,2.5vw,1.25rem)]  /* Hero subtext */
```

---

## Navigation Layout

| Viewport | Layout |
|----------|--------|
| < 640px (mobile) | Compact header + fixed bottom tab bar with icons |
| ≥ 640px (desktop) | Horizontal nav links in header, no bottom bar |

The bottom tab bar accounts for safe-area insets via `env(safe-area-inset-bottom)`.

---

## Safe-Area Insets

For notched devices (iPhone Dynamic Island, Android display cutouts):

```css
--safe-area-top: env(safe-area-inset-top, 0px);
--safe-area-bottom: env(safe-area-inset-bottom, 0px);
--safe-area-left: env(safe-area-inset-left, 0px);
--safe-area-right: env(safe-area-inset-right, 0px);
```

Applied to the header (`paddingTop`), bottom tab bar (`paddingBottom`), and game containers.

The root `<meta name="viewport">` includes `viewport-fit=cover` to enable safe-area values.

---

## Game Canvas Handling

### Lane Play (Three.js)

The R3F `<Canvas>` fills the parent container. The camera uses a fixed aspect ratio and adjusts FOV for narrow screens. The HUD overlay uses absolute positioning with responsive padding and font sizes via CSS custom properties:

```css
--hud-font-size: clamp(0.75rem, 2vw, 1rem);
--hud-padding: clamp(0.5rem, 1.5vw, 1rem);
```

### Pin Picker (Canvas 2D)

The `<canvas>` element resizes to fill its container using a ResizeObserver. The internal resolution scales with `devicePixelRatio` for crisp rendering on HiDPI displays:

```typescript
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);
```

All game coordinates are normalised so the playing field adapts to any aspect ratio.

---

## Grid Layouts

| Component | Mobile | Desktop |
|-----------|--------|---------|
| Landing page game cards | Single column | 2×2 grid |
| Scorecard view | Full-width stacked | Full-width stacked |
| Score Challenge answers | 2×2 grid | 2×2 grid |

---

## Touch Targets

All interactive buttons meet the 48×48px minimum touch target guideline:

- Pin input buttons: 44×44px with 8px gap (exceeds target with spacing)
- Game card links: full card is clickable
- Score Challenge answer buttons: 64px height, full width in 2-column grid
- Quick action buttons (Strike, Spare): rounded pills with generous padding

---

## Reduced Motion

The app respects `prefers-reduced-motion`:

- Loading bar animation is disabled
- Accent glow text-shadow is removed
- Canvas games disable particle effects
- Audio hook respects the setting

```css
@media (prefers-reduced-motion: reduce) {
  .loading-bar { animation: none; }
  .accent-glow { text-shadow: none; }
}
```

---

## Orientation Support

Games work in both portrait and landscape orientations:

- **Lane Play:** Portrait preferred — 3D camera is oriented behind the foul line looking down the lane.
- **Pin Picker:** Works in both — canvas rescales and normalised coordinates adapt.
- **Score Challenge:** Portrait optimised — single-column quiz layout.
- **Scorecard:** Landscape is usable for the 10-frame grid but works fine in portrait with horizontal scroll.

---

## Content Max Widths

```css
--page-max-width: 120rem;      /* Absolute max for the page container */
--content-max-width: 88rem;    /* Default content container */
--content-narrow-width: 64rem; /* Narrow prose/form containers */
```

The `<Container>` component centres content with `max-w-[var(--content-max-width)]` and responsive horizontal padding via `--space-gutter`.
