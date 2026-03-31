import type { ConfidenceLevel, JobAnalysisRecommendation } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export const analysisRepository = {
  create: (input: {
    jobPostingId: string;
    matchScore: number;
    recommendation: JobAnalysisRecommendation;
    strengths: unknown;
    gaps: unknown;
    mustHaveMatch: unknown;
    niceToHaveFit: unknown;
    reasoning: string;
    confidence: ConfidenceLevel;
  }) =>
    prisma.jobAnalysis.create({
      data: input
    }),

  getLatestByJobId: (jobPostingId: string) =>
    prisma.jobAnalysis.findFirst({
      where: { jobPostingId },
      orderBy: { createdAt: "desc" }
    })
};
