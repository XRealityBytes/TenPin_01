/**
 * Score Challenge route — DOM-based bowling scoring quiz.
 *
 * Placeholder for Phase 6. The actual game will present scorecard scenarios
 * with multiple-choice answers and a countdown timer.
 */
import { Container } from "@/components/Container";

export const metadata = { title: "Score Challenge" };

export default function ScoreChallengePage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="text-6xl">⚡</span>
      <h1 className="text-2xl font-bold uppercase tracking-wider">Score Challenge</h1>
      <p className="max-w-md text-muted-foreground">
        Quick-fire quiz coming soon — calculate bowling scores before the timer
        runs out.
      </p>
    </Container>
  );
}
