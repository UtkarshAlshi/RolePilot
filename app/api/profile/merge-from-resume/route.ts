import { mergeProfileFromResumeSchema } from "@/lib/validators/resume";
import { getRequiredUserId } from "@/lib/auth/session";
import { fail, ok } from "@/lib/api/response";
import { getRequestId, logError } from "@/lib/logging";
import { profileService } from "@/src/server/services/profile-service";

export async function POST(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const payload = await request.json();
    const parsed = mergeProfileFromResumeSchema.safeParse(payload);

    if (!parsed.success) {
      return fail(requestId, "VALIDATION_ERROR", "Invalid merge payload", 400, parsed.error.flatten());
    }

    const merged = await profileService.mergeFromResume(userId, parsed.data.resumeId);

    return ok(requestId, {
      profileId: merged.profile?.id,
      mergedFields: merged.mergedFields
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    if (error instanceof Error && error.message === "Resume not found") {
      return fail(requestId, "NOT_FOUND", "Resume not found", 404);
    }

    logError(requestId, "Failed to merge profile from resume", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to merge profile from resume", 500);
  }
}
