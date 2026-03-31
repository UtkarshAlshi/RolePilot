import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { createApplicationSchema } from "@/lib/validators/application";
import { applicationGenerationService } from "@/src/server/services/application-generation-service";

export async function POST(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { jobId } = await context.params;
    const payload = await request.json();
    const parsed = createApplicationSchema.safeParse(payload);

    if (!parsed.success) {
      return fail(requestId, "VALIDATION_ERROR", "Invalid application generation payload", 400, parsed.error.flatten());
    }

    const application = await applicationGenerationService.generateForJob(userId, jobId, parsed.data);
    if (!application) {
      return fail(requestId, "INTERNAL_ERROR", "Failed to load generated application", 500);
    }

    return ok(requestId, {
      applicationId: application.id,
      status: application.status,
      tone: application.tone,
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

    if (error instanceof Error && error.message === "Job not found") {
      return fail(requestId, "NOT_FOUND", "Job not found", 404);
    }

    if (error instanceof Error && error.message === "Profile not found") {
      return fail(requestId, "PROFILE_MISSING", "Profile not found for generation", 422);
    }

    logError(requestId, "Failed to generate application packet", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to generate application packet", 500);
  }
}
