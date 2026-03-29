/**
 * Pin Picker route — 2D canvas pin-clearing puzzle.
 *
 * Server component wrapping the client-side PinPickerCanvas.
 * The game uses a plain <canvas> with 2D context (no Three.js).
 */
import { PinPickerCanvas } from "@/components/game/PinPickerCanvas";

export const metadata = { title: "Pin Picker" };

export default function PinPickerPage() {
  return (
    <div className="h-[calc(var(--full-viewport-height,100vh)-4rem)]">
      <PinPickerCanvas />
    </div>
  );
}
