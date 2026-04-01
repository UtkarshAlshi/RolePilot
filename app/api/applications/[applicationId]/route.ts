import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { applicationGenerationService } from "@/src/server/services/application-generation-service";

export async function GET(request: Request, context: { params: Promise<{ applicationId: string }> }) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { applicationId } = await context.params;

    const application = await applicationGenerationService.getApplication(userId, applicationId);
    if (!application) {
      return fail(requestId, "NOT_FOUND", "Application not found", 404);
    }

    return ok(requestId, {
      applicationId: application.id,
      status: application.status,
      tone: application.tone,
      jobId: application.jobPostingId,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      job: {
        title: application.jobPosting.title,
        companyName: application.jobPosting.companyName,
        location: application.jobPosting.location
      },
      answers: application.answers.map((answer) => ({
        id: answer.id,
        sectionType: answer.sectionType,
        order: answer.order,
        content: answer.content,
        confidence: answer.confidence,
        missingInfo: answer.missingInfo,
        factSources: answer.factSources,
        isUserEdited: answer.isUserEdited
      }))
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    logError(requestId, "Failed to fetch application", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to fetch application", 500);
  }
}
