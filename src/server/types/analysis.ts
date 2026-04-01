import type { ConfidenceLevel, JobAnalysisRecommendation } from "@prisma/client";

export type MatchItem = {
  name: string;
  matched: boolean;
  evidenceSource?: string;
  note?: string;
};

export type DeterministicScoreBreakdown = {
  mustHaveComponent: number;
  niceToHaveComponent: number;
  keywordComponent: number;
  alignmentComponent: number;
};

export type FitComputationResult = {
  matchScore: number;
  recommendation: JobAnalysisRecommendation;
  strengths: string[];
  gaps: string[];
  mustHaveMatch: MatchItem[];
  niceToHaveFit: MatchItem[];
  reasoning: string;
  confidence: ConfidenceLevel;
  breakdown: DeterministicScoreBreakdown;
};
