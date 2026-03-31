import { getRequiredUserId } from "@/lib/auth/session";
import { fail, ok } from "@/lib/api/response";
import { getRequestId, logError } from "@/lib/logging";
import { resumeService } from "@/src/server/services/resume-service";

export async function GET(request: Request, context: { params: Promise<{ resumeId: string }> }) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { resumeId } = await context.params;

    const resume = await resumeService.getById(userId, resumeId);

    if (!resume) {
      return fail(requestId, "NOT_FOUND", "Resume not found", 404);
    }

    return ok(requestId, {
      id: resume.id,
      parseStatus: resume.parseStatus,
      rawText: resume.rawText,
      extractedJson: resume.extractedJson,
      confidenceSummary: resume.confidenceSummary
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    logError(requestId, "Failed to fetch resume", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to fetch resume", 500);
  }
}
