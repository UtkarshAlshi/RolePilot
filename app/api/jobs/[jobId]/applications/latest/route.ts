import { fail, ok } from "@/lib/api/response";
import { getRequiredUserId } from "@/lib/auth/session";
import { getRequestId, logError } from "@/lib/logging";
import { applicationGenerationService } from "@/src/server/services/application-generation-service";
import { profileService } from "@/src/server/services/profile-service";

export async function GET(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const userId = await getRequiredUserId();
    const { jobId } = await context.params;

    const [application, profile] = await Promise.all([
      applicationGenerationService.getLatestForJob(userId, jobId),
      profileService.getOrCreate(userId)
    ]);

    if (!application) {
      return fail(requestId, "NOT_FOUND", "No generated application found for this job", 404);
    }

    return ok(requestId, {
      applicationId: application.id,
      status: application.status,
      tone: application.tone,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      job: {
        id: application.jobPosting.id,
        title: application.jobPosting.title,
        companyName: application.jobPosting.companyName,
        location: application.jobPosting.location,
        requirements: application.jobPosting.requirements,
        responsibilities: application.jobPosting.responsibilities,
        mustHaveSkills: application.jobPosting.mustHaveSkills,
        niceToHaveSkills: application.jobPosting.niceToHaveSkills,
        screeningQs: application.jobPosting.screeningQs
      },
      profile: {
        fullName: profile.fullName,
        email: profile.email,
        location: profile.location,
        skills: profile.skills.map((s) => s.name),
        experiences: profile.experiences.map((e) => ({ title: e.title, company: e.company })),
        projects: profile.projects.map((p) => ({ name: p.name, role: p.role }))
      },
      answers: application.answers.map((answer) => ({
        id: answer.id,
        sectionType: answer.sectionType,
        order: answer.order,
        content: answer.content,
        confidence: answer.confidence,
        missingInfo: answer.missingInfo,
        factSources: answer.factSources,
        isUserEdited: answer.isUserEdited,
        updatedAt: answer.updatedAt
      }))
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(requestId, "UNAUTHORIZED", "Unauthorized", 401);
    }

    logError(requestId, "Failed to fetch latest generated application for review", { error: String(error) });
    return fail(requestId, "INTERNAL_ERROR", "Failed to fetch review workspace data", 500);
  }
}
