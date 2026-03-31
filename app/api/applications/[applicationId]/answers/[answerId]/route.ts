import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { patchAnswerSchema } from "@/lib/validators/application";
import { applicationGenerationService } from "@/src/server/services/application-generation-service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ applicationId: string; answerId: string }> }
) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { applicationId, answerId } = await context.params;
    const payload = await request.json();
    const parsed = patchAnswerSchema.safeParse(payload);

    if (!parsed.success) {
      return fail(requestId, "VALIDATION_ERROR", "Invalid answer patch payload", 400, parsed.error.flatten());
    }

    const updated = await applicationGenerationService.updateAnswer(
      userId,
      applicationId,
      answerId,
      parsed.data.content
    );

    return ok(requestId, {
      answerId: updated.id,
      isUserEdited: updated.isUserEdited,
      content: updated.content
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    if (error instanceof Error && error.message === "Application not found") {
      return fail(requestId, "NOT_FOUND", "Application not found", 404);
    }

    if (error instanceof Error && error.message === "Answer not found") {
      return fail(requestId, "NOT_FOUND", "Answer not found", 404);
    }

    logError(requestId, "Failed to patch answer", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to patch answer", 500);
  }
}
