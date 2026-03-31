import { skillsUpdateSchema } from "@/lib/validators/profile";
import { getRequiredUserId } from "@/lib/auth/session";
import { fail, ok } from "@/lib/api/response";
import { getRequestId, logError } from "@/lib/logging";
import { profileService } from "@/src/server/services/profile-service";

export async function PUT(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const payload = await request.json();
    const parsed = skillsUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return fail(requestId, "VALIDATION_ERROR", "Invalid skills payload", 400, parsed.error.flatten());
    }

    const profile = await profileService.replaceSkills(userId, parsed.data.items);
    return ok(requestId, profile);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    logError(requestId, "Failed to update skills", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to update skills", 500);
  }
}
