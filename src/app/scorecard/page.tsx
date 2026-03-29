/**
 * Scorecard route — digital bowling scorecard.
 *
 * Server component that renders metadata and wraps the client-side
 * ScorecardView. All interactive logic lives in the client component
 * and the useScorecard hook.
 */
import { ScorecardView } from "@/components/scorecard/ScorecardView";

export const metadata = { title: "Scorecard" };

export default function ScorecardPage() {
  return <ScorecardView />;
}
