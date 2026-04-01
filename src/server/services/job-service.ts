import type { JobSourceType } from "@prisma/client";
import { jobRepository } from "@/src/server/repositories/job-repository";
import { parseJobFromText, parseJobFromUrlStub } from "@/src/server/services/job-parser";

export const jobService = {
  create(userId: string, input: { sourceType: JobSourceType; sourceUrl?: string | null; rawText?: string | null }) {
    return jobRepository.create(userId, input);
  },

  async parse(userId: string, jobId: string) {
    const job = await jobRepository.getById(userId, jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    const parsed =
      job.sourceType === "TEXT" && job.rawText
        ? await parseJobFromText(job.rawText)
        : await parseJobFromUrlStub(job.sourceUrl ?? "");

    return jobRepository.updateParsedFields(userId, jobId, {
      title: parsed.title,
      companyName: parsed.companyName,
      location: parsed.location,
      requirements: parsed.requirements,
      responsibilities: parsed.responsibilities,
      mustHaveSkills: parsed.mustHaveSkills,
      niceToHaveSkills: parsed.niceToHaveSkills,
      keywords: parsed.keywords,
      screeningQs: parsed.screeningQs
    });
  },

  getById(userId: string, jobId: string) {
    return jobRepository.getById(userId, jobId);
  },

  update(userId: string, jobId: string, payload: Record<string, unknown>) {
    return jobRepository.updateParsedFields(userId, jobId, payload);
  }
};
