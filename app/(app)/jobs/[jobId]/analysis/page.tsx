"use client";

import { useEffect, useState } from "react";
import { MatchScoreCard } from "@/components/analysis/match-score-card";
import { MustHaveComparisonTable } from "@/components/analysis/must-have-comparison-table";
import { NiceToHaveComparisonTable } from "@/components/analysis/nice-to-have-comparison-table";
import { StrengthsList } from "@/components/analysis/strengths-list";
import { GapList } from "@/components/analysis/gap-list";
import { ReasoningPanel } from "@/components/analysis/reasoning-panel";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import type { MatchItem } from "@/src/server/types/analysis";

type AnalysisPayload = {
  analysisId: string;
  matchScore: number;
  recommendation: "STRONG_APPLY" | "REASONABLE_APPLY" | "STRETCH_APPLY" | "SKIP";
  strengths: string[];
  gaps: string[];
  mustHaveMatch: MatchItem[];
  niceToHaveFit: MatchItem[];
  reasoning: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export default function JobAnalysisPage({ params }: { params: { jobId: string } }) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const resolved = params;
      setJobId(resolved.jobId);
      try {
        const response = await fetch(`/api/jobs/${resolved.jobId}/analysis/latest`);
        const json = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setAnalysis(null);
            return;
          }
          throw new Error(json?.error?.message ?? "Failed to load latest analysis");
        }

        setAnalysis(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, [params.jobId]);

  async function handleAnalyze() {
    if (!jobId) return;

    setAnalyzing(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}/analyze`, { method: "POST" });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error?.message ?? "Failed to analyze job");
      }
      setAnalysis(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) return <LoadingState label="Loading analysis..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Fit Analysis</h1>
        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          onClick={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? "Analyzing..." : analysis ? "Re-run Analysis" : "Run Analysis"}
        </button>
      </div>

      {!analysis ? (
        <div className="rounded border border-dashed bg-white p-6 text-sm text-slate-600">
          No analysis yet. Run analysis to evaluate profile-job fit.
        </div>
      ) : (
        <>
          <MatchScoreCard score={analysis.matchScore} recommendation={analysis.recommendation} confidence={analysis.confidence} />
          <MustHaveComparisonTable items={analysis.mustHaveMatch} />
          <NiceToHaveComparisonTable items={analysis.niceToHaveFit} />
          <div className="grid grid-cols-2 gap-4">
            <StrengthsList items={analysis.strengths} />
            <GapList items={analysis.gaps} />
          </div>
          <ReasoningPanel reasoning={analysis.reasoning} />
        </>
      )}
    </div>
  );
}
