import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { regenerateSectionSchema } from "@/lib/validators/application";
import { applicationGenerationService } from "@/src/server/services/application-generation-service";

export async function POST(request: Request, context: { params: Promise<{ applicationId: string }> }) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { applicationId } = await context.params;
    const payload = await request.json();
    const parsed = regenerateSectionSchema.safeParse(payload);

    if (!parsed.success) {
      return fail(requestId, "VALIDATION_ERROR", "Invalid regeneration payload", 400, parsed.error.flatten());
    }

    const application = await applicationGenerationService.regenerateSection(userId, applicationId, parsed.data);
    if (!application) {
      return fail(requestId, "INTERNAL_ERROR", "Failed to regenerate section", 500);
    }

    const sectionAnswers = application.answers.filter((a) => a.sectionType === parsed.data.sectionType);

    return ok(requestId, {
      applicationId: application.id,
      sectionType: parsed.data.sectionType,
      answers: sectionAnswers.map((answer) => ({
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

    if (error instanceof Error && error.message === "Application not found") {
      return fail(requestId, "NOT_FOUND", "Application not found", 404);
    }

    if (error instanceof Error && error.message === "Profile not found") {
      return fail(requestId, "PROFILE_MISSING", "Profile not found for regeneration", 422);
    }

    logError(requestId, "Failed to regenerate section", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to regenerate section", 500);
  }
}
