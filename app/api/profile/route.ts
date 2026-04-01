import { getRequiredUserId } from "@/lib/auth/session";
import { fail, ok } from "@/lib/api/response";
import { getRequestId, logError } from "@/lib/logging";
import { profileService } from "@/src/server/services/profile-service";
import { profileUpdateSchema } from "@/lib/validators/profile";

export async function GET(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const profile = await profileService.getOrCreate(userId);
    return ok(requestId, profile);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    logError(requestId, "Failed to fetch profile", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to fetch profile", 500);
  }
}

export async function PUT(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const payload = await request.json();
    const parsed = profileUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return fail(requestId, "VALIDATION_ERROR", "Invalid profile payload", 400, parsed.error.flatten());
    }

    const profile = await profileService.updateProfile(userId, parsed.data);
    return ok(requestId, profile);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    logError(requestId, "Failed to update profile", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to update profile", 500);
  }
}
