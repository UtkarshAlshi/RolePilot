import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { jobService } from "@/src/server/services/job-service";

export async function POST(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { jobId } = await context.params;
    const job = await jobService.parse(userId, jobId);

    return ok(requestId, {
      jobId: job.id,
      title: job.title,
      companyName: job.companyName,
      mustHaveSkills: (job.mustHaveSkills as string[] | null) ?? [],
      niceToHaveSkills: (job.niceToHaveSkills as string[] | null) ?? [],
      screeningQs: (job.screeningQs as string[] | null) ?? []
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    if (error instanceof Error && error.message === "Job not found") {
      return fail(requestId, "NOT_FOUND", "Job not found", 404);
    }

    logError(requestId, "Failed to parse job", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to parse job", 500);
  }
}
