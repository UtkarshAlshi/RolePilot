import type { ApplicationSectionType } from "@prisma/client";
import { applicationRepository } from "@/src/server/repositories/application-repository";
import { jobRepository } from "@/src/server/repositories/job-repository";
import { profileRepository } from "@/src/server/repositories/profile-repository";
import { generateSections } from "@/src/server/services/generation-templates";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

export const applicationGenerationService = {
  async generateForJob(userId: string, jobId: string, input: { tone: string; sections: ApplicationSectionType[] }) {
    const [job, profile] = await Promise.all([
      jobRepository.getById(userId, jobId),
      profileRepository.getByUserId(userId)
    ]);

    if (!job) throw new Error("Job not found");
    if (!profile) throw new Error("Profile not found");

    const application = await applicationRepository.createApplication({
      userId,
      jobPostingId: job.id,
      tone: input.tone
    });

    const context = {
      tone: input.tone,
      profileFacts: {
        fullName: profile.fullName,
        location: profile.location,
        summary: profile.summary,
        skills: profile.skills.map((s) => s.name),
        experiences: profile.experiences.map((e) => `${e.title} at ${e.company}`),
        projects: profile.projects.map((p) => p.name)
      },
      jobFacts: {
        title: job.title,
        companyName: job.companyName,
        requirements: asStringArray(job.requirements),
        mustHaveSkills: asStringArray(job.mustHaveSkills),
        niceToHaveSkills: asStringArray(job.niceToHaveSkills),
        screeningQs: asStringArray(job.screeningQs)
      }
    };

    const generatedSections = await generateSections(context, input.sections);

    await applicationRepository.createAnswers(
      application.id,
      generatedSections.map((section) => ({
        sectionType: section.sectionType,
        order: section.order,
        content: section.content,
        confidence: section.confidence,
        missingInfo: section.missingInfo,
        factSources: section.factSources
      }))
    );

    return applicationRepository.getOwnedApplication(userId, application.id);
  },

  getApplication(userId: string, applicationId: string) {
    return applicationRepository.getOwnedApplication(userId, applicationId);
  },

  getLatestForJob(userId: string, jobId: string) {
    return applicationRepository.getLatestByJob(userId, jobId);
  },

  updateAnswer(userId: string, applicationId: string, answerId: string, content: string) {
    return applicationRepository.updateAnswerContent(userId, applicationId, answerId, content);
  },

  async regenerateSection(userId: string, applicationId: string, input: { sectionType: ApplicationSectionType; tone?: string }) {
    const application = await applicationRepository.getOwnedApplication(userId, applicationId);
    if (!application) throw new Error("Application not found");

    const profile = await profileRepository.getByUserId(userId);
    if (!profile) throw new Error("Profile not found");

    const job = application.jobPosting;

    const context = {
      tone: input.tone ?? application.tone ?? "professional_concise",
      profileFacts: {
        fullName: profile.fullName,
        location: profile.location,
        summary: profile.summary,
        skills: profile.skills.map((s) => s.name),
        experiences: profile.experiences.map((e) => `${e.title} at ${e.company}`),
        projects: profile.projects.map((p) => p.name)
      },
      jobFacts: {
        title: job.title,
        companyName: job.companyName,
        requirements: asStringArray(job.requirements),
        mustHaveSkills: asStringArray(job.mustHaveSkills),
        niceToHaveSkills: asStringArray(job.niceToHaveSkills),
        screeningQs: asStringArray(job.screeningQs)
      }
    };

    const regenerated = await generateSections(context, [input.sectionType]);

    return applicationRepository.replaceSectionAnswers(
      userId,
      applicationId,
      input.sectionType,
      regenerated.map((section) => ({
        sectionType: section.sectionType,
        order: section.order,
        content: section.content,
        confidence: section.confidence,
        missingInfo: section.missingInfo,
        factSources: section.factSources
      }))
    );
  },

  approve(userId: string, applicationId: string) {
    return applicationRepository.approveApplication(userId, applicationId);
  },

  listApplications(input: {
    userId: string;
    status?: "DRAFT" | "REVIEWED" | "APPROVED";
    company?: string;
    dateFrom?: string;
    dateTo?: string;
    limit: number;
  }) {
    return applicationRepository.listOwnedApplications({
      userId: input.userId,
      status: input.status,
      company: input.company,
      dateFrom: input.dateFrom ? new Date(input.dateFrom) : undefined,
      // Treat dateTo as inclusive end-of-day so UI date filters include the full selected date.
      dateTo: input.dateTo ? new Date(`${input.dateTo}T23:59:59.999Z`) : undefined,
      limit: input.limit
    });
  }
};