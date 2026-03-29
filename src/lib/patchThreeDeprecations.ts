/**
 * Suppress known Three.js deprecation warnings from @react-three/fiber internals.
 *
 * R3F 9.x still uses THREE.Clock which was deprecated in Three.js r167+.
 * This patch filters the specific console.warn so the dev console stays clean.
 * Remove this once R3F v10 ships with THREE.Timer support.
 */

if (typeof window !== "undefined") {
  const _origWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("THREE.Clock") &&
      args[0].includes("deprecated")
    ) {
      return; // suppress R3F internal Clock deprecation
    }
    _origWarn.apply(console, args);
  };
}
