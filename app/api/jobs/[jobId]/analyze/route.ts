import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { analysisService } from "@/src/server/services/analysis-service";

export async function POST(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { jobId } = await context.params;

    const analysis = await analysisService.analyzeJob(userId, jobId);

    return ok(requestId, {
      analysisId: analysis.id,
      matchScore: analysis.matchScore,
      recommendation: analysis.recommendation,
      strengths: (analysis.strengths as string[] | null) ?? [],
      gaps: (analysis.gaps as string[] | null) ?? [],
      mustHaveMatch: analysis.mustHaveMatch,
      niceToHaveFit: analysis.niceToHaveFit,
      reasoning: analysis.reasoning,
      confidence: analysis.confidence
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    if (error instanceof Error && error.message === "Job not found") {
      return fail(requestId, "NOT_FOUND", "Job not found", 404);
    }

    if (error instanceof Error && error.message === "PROFILE_BASELINE_MISSING") {
      return fail(
        requestId,
        "PROFILE_BASELINE_MISSING",
        "Profile baseline is incomplete. Add full name, email, and at least one skill before analysis.",
        422
      );
    }

    logError(requestId, "Failed to analyze job", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to analyze job", 500);
  }
}
