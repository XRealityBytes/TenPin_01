/**
 * Scorecard route — digital bowling scorecard.
 *
 * Placeholder for Phase 2. Will be replaced with a full scorecard UI
 * supporting 1–6 players, standard 10-frame scoring, localStorage
 * persistence, and share-as-image export.
 */
import { Container } from "@/components/Container";

export const metadata = { title: "Scorecard" };

export default function ScorecardPage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="text-6xl">📋</span>
      <h1 className="text-2xl font-bold uppercase tracking-wider">Scorecard</h1>
      <p className="max-w-md text-muted-foreground">
        Digital scorecard coming soon — track real-world matches for up to 6
        players with automatic scoring.
      </p>
    </Container>
  );
}
