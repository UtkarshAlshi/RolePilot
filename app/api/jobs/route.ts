import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { createJobSchema } from "@/lib/validators/job";
import { jobService } from "@/src/server/services/job-service";

export async function POST(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const payload = await request.json();
    const parsed = createJobSchema.safeParse(payload);

    if (!parsed.success) {
      return fail(requestId, "VALIDATION_ERROR", "Invalid job payload", 400, parsed.error.flatten());
    }

    const job = await jobService.create(userId, {
      sourceType: parsed.data.sourceType,
      sourceUrl: parsed.data.sourceUrl,
      rawText: parsed.data.rawText
    });

    return ok(requestId, { jobId: job.id }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    logError(requestId, "Failed to create job", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to create job", 500);
  }
}
