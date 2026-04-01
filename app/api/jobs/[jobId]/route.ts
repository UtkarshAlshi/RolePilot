import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { updateJobSchema } from "@/lib/validators/job";
import { jobService } from "@/src/server/services/job-service";

export async function GET(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { jobId } = await context.params;
    const job = await jobService.getById(userId, jobId);

    if (!job) {
      return fail(requestId, "NOT_FOUND", "Job not found", 404);
    }

    return ok(requestId, job);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    logError(requestId, "Failed to fetch job", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to fetch job", 500);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { jobId } = await context.params;
    const payload = await request.json();
    const parsed = updateJobSchema.safeParse(payload);

    if (!parsed.success) {
      return fail(requestId, "VALIDATION_ERROR", "Invalid job update payload", 400, parsed.error.flatten());
    }

    const job = await jobService.update(userId, jobId, parsed.data);
    return ok(requestId, job);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    if (error instanceof Error && error.message === "Job not found") {
      return fail(requestId, "NOT_FOUND", "Job not found", 404);
    }

    logError(requestId, "Failed to update job", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to update job", 500);
  }
}
