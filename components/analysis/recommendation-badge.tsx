import type { JobAnalysisRecommendation } from "@prisma/client";

const styleMap: Record<JobAnalysisRecommendation, string> = {
  STRONG_APPLY: "bg-emerald-100 text-emerald-700",
  REASONABLE_APPLY: "bg-blue-100 text-blue-700",
  STRETCH_APPLY: "bg-amber-100 text-amber-700",
  SKIP: "bg-red-100 text-red-700"
};

export function RecommendationBadge({ recommendation }: { recommendation: JobAnalysisRecommendation }) {
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${styleMap[recommendation]}`}>{recommendation}</span>;
}
