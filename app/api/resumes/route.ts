import { createResumeSchema } from "@/lib/validators/resume";
import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { resumeService } from "@/src/server/services/resume-service";

export async function POST(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const payload = await request.json();
    const parsed = createResumeSchema.safeParse(payload);

    if (!parsed.success) {
      return fail(requestId, "VALIDATION_ERROR", "Invalid resume payload", 400, parsed.error.flatten());
    }

    const resume = await resumeService.createAndParse(userId, parsed.data);

    return ok(
      requestId,
      {
        resumeId: resume.id,
        parseStatus: resume.parseStatus
      },
      201
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }
    if (error instanceof Error && error.message === "INVALID_STORAGE_KEY") {
      return fail(requestId, "FORBIDDEN", "Storage key does not belong to authenticated user", 403);
    }

    logError(requestId, "Failed to create resume", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to create resume", 500);
  }
}
