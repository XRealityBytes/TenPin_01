/**
 * Lane Play route — 3D tenpin bowling game.
 *
 * Server component that renders metadata and wraps the client-side
 * LanePlayLoader, which dynamically imports the Three.js game.
 */
import { LanePlayLoader } from "@/components/game/LanePlayLoader";

export const metadata = { title: "Lane Play" };

export default function LanePlayPage() {
  return <LanePlayLoader />;
}
