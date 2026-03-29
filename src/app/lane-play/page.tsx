/**
 * Lane Play route — 3D tenpin bowling game.
 *
 * This is a placeholder that will be replaced in Phase 4 with the full
 * Three.js scene, physics, and controls. The actual game component will be
 * dynamically imported with SSR disabled.
 */
import { Container } from "@/components/Container";

export const metadata = { title: "Lane Play" };

export default function LanePlayPage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="text-6xl">🎳</span>
      <h1 className="text-2xl font-bold uppercase tracking-wider">Lane Play</h1>
      <p className="max-w-md text-muted-foreground">
        3D bowling coming soon — aim, power, spin, and strike your way through
        10 frames with physics-based pin collision.
      </p>
    </Container>
  );
}
