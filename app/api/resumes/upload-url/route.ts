import { createUploadUrlSchema } from "@/lib/validators/resume";
import { fail, ok } from "@/lib/api/response";
import { getRequestId, logError, logInfo } from "@/lib/logging";
import { getRequiredUserId } from "@/lib/auth/session";
import { resumeStorage } from "@/lib/storage/resume-storage";

export async function POST(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const body = await request.json();
    const parsed = createUploadUrlSchema.safeParse(body);

    if (!parsed.success) {
      return fail(requestId, "VALIDATION_ERROR", "Invalid upload-url payload", 400, parsed.error.flatten());
    }

    const target = resumeStorage.createUploadTarget({
      userId,
      fileName: parsed.data.fileName,
      mimeType: parsed.data.mimeType
    });

    logInfo(requestId, "Resume upload target created", {
      userId,
      provider: target.provider,
      storageKey: target.storageKey
    });

    return ok(requestId, {
      uploadUrl: target.uploadUrl,
      method: target.method,
      storageKey: target.storageKey,
      expiresIn: target.expiresIn,
      requiredHeaders: target.requiredHeaders,
      provider: target.provider
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }
    logError(requestId, "Failed to generate upload URL", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to generate upload URL", 500);
  }
