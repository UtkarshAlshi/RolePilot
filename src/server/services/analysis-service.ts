import { generateText } from "@/lib/ai/openai-client";
import { analysisRepository } from "@/src/server/repositories/analysis-repository";
import { jobRepository } from "@/src/server/repositories/job-repository";
import { fitReasoningPrompt } from "@/src/server/prompts";
import { profileRepository } from "@/src/server/repositories/profile-repository";
import { computeFitAnalysis } from "@/src/server/services/fit-scoring";

function hasProfileBaseline(profile: Awaited<ReturnType<typeof profileRepository.getByUserId>>): boolean {
  if (!profile) return false;
  const hasName = Boolean(profile.fullName?.trim());
  const hasEmail = Boolean(profile.email?.trim());
  const hasSkills = profile.skills.length > 0;
  return hasName && hasEmail && hasSkills;
}

export const analysisService = {
  async analyzeJob(userId: string, jobId: string) {
    const [job, profile] = await Promise.all([jobRepository.getById(userId, jobId), profileRepository.getByUserId(userId)]);

    if (!job) {
      throw new Error("Job not found");
    }

    if (!profile || !hasProfileBaseline(profile)) {
      throw new Error("PROFILE_BASELINE_MISSING");
    }

    const fit = computeFitAnalysis({
      job,
      skills: profile.skills,
      experiences: profile.experiences,
      projects: profile.projects,
      hasProfileBaseline: true
    });

    const prompt = fitReasoningPrompt({
      profileSummary: `${profile.fullName ?? "Candidate"}; skills=${profile.skills.map((s) => s.name).join(", ")}; experiences=${profile.experiences
        .map((e) => `${e.title} at ${e.company}`)
        .join(" | ")}`,
      jobSummary: `${job.title ?? "Untitled role"} at ${job.companyName ?? "Unknown company"}; mustHave=${JSON.stringify(job.mustHaveSkills)}; requirements=${JSON.stringify(job.requirements)}`,
      score: fit.matchScore,
      strengths: fit.strengths,
      gaps: fit.gaps
    });

    const aiReasoning = await generateText({
      system: prompt.system,
      prompt: prompt.user,
      temperature: 0.2
    });

    return analysisRepository.create({
      jobPostingId: job.id,
      matchScore: fit.matchScore,
      recommendation: fit.recommendation,
      strengths: fit.strengths,
      gaps: fit.gaps,
      mustHaveMatch: fit.mustHaveMatch,
      niceToHaveFit: fit.niceToHaveFit,
      reasoning: aiReasoning?.trim() || fit.reasoning,
      confidence: fit.confidence
    });
  },

  async getLatest(userId: string, jobId: string) {
    const job = await jobRepository.getById(userId, jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    return analysisRepository.getLatestByJobId(job.id);
  }
};
