import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { analysisService } from "@/src/server/services/analysis-service";

export async function GET(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { jobId } = await context.params;

    const analysis = await analysisService.getLatest(userId, jobId);

    if (!analysis) {
      return fail(requestId, "NOT_FOUND", "No analysis found for job", 404);
    }

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

    logError(requestId, "Failed to fetch latest analysis", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to fetch latest analysis", 500);
  }
}
