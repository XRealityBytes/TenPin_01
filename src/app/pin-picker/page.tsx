/**
 * Pin Picker route — 2D canvas mini-game.
 *
 * Placeholder for Phase 5. The actual game will use a plain <canvas> element
 * with 2D context for a top-down pin-clearing puzzle.
 */
import { Container } from "@/components/Container";

export const metadata = { title: "Pin Picker" };

export default function PinPickerPage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="text-6xl">🎯</span>
      <h1 className="text-2xl font-bold uppercase tracking-wider">Pin Picker</h1>
      <p className="max-w-md text-muted-foreground">
        Top-down puzzle coming soon — clear pin formations in the fewest shots
        to earn stars.
      </p>
    </Container>
  );
}
