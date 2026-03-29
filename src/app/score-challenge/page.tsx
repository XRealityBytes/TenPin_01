/**
 * Score Challenge route — DOM-based bowling scoring quiz.
 *
 * Renders the ScoreChallenge client component which presents
 * bowling scorecard scenarios with multiple-choice answers
 * and a countdown timer.
 */
import { ScoreChallenge } from "@/components/game/ScoreChallenge";

export const metadata = { title: "Score Challenge" };

export default function ScoreChallengePage() {
  return <ScoreChallenge />;
}
