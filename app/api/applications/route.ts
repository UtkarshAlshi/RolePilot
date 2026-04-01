import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { listApplicationsQuerySchema } from "@/lib/validators/application";
import { applicationGenerationService } from "@/src/server/services/application-generation-service";

export async function GET(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { searchParams } = new URL(request.url);

    const parsed = listApplicationsQuerySchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      company: searchParams.get("company") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      limit: searchParams.get("limit") ?? undefined
    });

    if (!parsed.success) {
      return fail(requestId, "VALIDATION_ERROR", "Invalid applications filter query", 400, parsed.error.flatten());
    }

    const applications = await applicationGenerationService.listApplications({
      userId,
      ...parsed.data
    });

    return ok(
      requestId,
      applications.map((app) => ({
        applicationId: app.id,
        status: app.status,
        tone: app.tone,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        jobId: app.jobPostingId,
        companyName: app.jobPosting.companyName,
        jobTitle: app.jobPosting.title,
        answerCount: app.answers.length
      }))
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    logError(requestId, "Failed to list applications", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to list applications", 500);
  }
}
