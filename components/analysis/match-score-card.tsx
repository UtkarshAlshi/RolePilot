import { RecommendationBadge } from "@/components/analysis/recommendation-badge";
import type { ConfidenceLevel, JobAnalysisRecommendation } from "@prisma/client";

export function MatchScoreCard({
  score,
  recommendation,
  confidence
}: {
  score: number;
  recommendation: JobAnalysisRecommendation;
  confidence: ConfidenceLevel;
}) {
  return (
    <section className="rounded border bg-white p-4">
      <h2 className="font-semibold">Match Score</h2>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-4xl font-bold">{score}</p>
        <RecommendationBadge recommendation={recommendation} />
      </div>
      <p className="mt-2 text-sm text-slate-600">Confidence: {confidence}</p>
    </section>
  );
}
