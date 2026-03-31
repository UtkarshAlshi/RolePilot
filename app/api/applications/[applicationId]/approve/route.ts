import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { applicationGenerationService } from "@/src/server/services/application-generation-service";

export async function POST(request: Request, context: { params: Promise<{ applicationId: string }> }) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { applicationId } = await context.params;

    const approved = await applicationGenerationService.approve(userId, applicationId);

    return ok(requestId, {
      applicationId: approved.id,
      status: approved.status
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    if (error instanceof Error && error.message === "Application not found") {
      return fail(requestId, "NOT_FOUND", "Application not found", 404);
    }

    logError(requestId, "Failed to approve application", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to approve application", 500);
  }
}
