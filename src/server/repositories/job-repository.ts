import { JobSourceType } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export const jobRepository = {
  create: (userId: string, input: { sourceType: JobSourceType; sourceUrl?: string | null; rawText?: string | null }) =>
    prisma.jobPosting.create({
      data: {
        userId,
        sourceType: input.sourceType,
        sourceUrl: input.sourceUrl,
        rawText: input.rawText
      }
    }),

  getById: (userId: string, jobId: string) =>
    prisma.jobPosting.findFirst({
      where: { id: jobId, userId }
    }),

  updateParsedFields: (userId: string, jobId: string, payload: Record<string, unknown>) =>
    prisma.$transaction(async (tx) => {
      const owned = await tx.jobPosting.findFirst({ where: { id: jobId, userId } });
      if (!owned) {
        throw new Error("Job not found");
      }

      return tx.jobPosting.update({
        where: { id: jobId },
        data: payload
      });
    })
};
