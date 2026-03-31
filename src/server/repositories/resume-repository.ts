import { ResumeParseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export const resumeRepository = {
  create: (userId: string, input: { storageKey: string; fileName: string; mimeType: string }) =>
    prisma.resume.create({
      data: {
        userId,
        storageKey: input.storageKey,
        fileName: input.fileName,
        mimeType: input.mimeType,
        parseStatus: ResumeParseStatus.PENDING
      }
    }),

  updateParseState: (
    resumeId: string,
    userId: string,
    payload: {
      parseStatus: ResumeParseStatus;
      rawText?: string | null;
      extractedJson?: unknown;
      confidenceSummary?: unknown;
      parseError?: string | null;
    }
  ) =>
    prisma.$transaction(async (tx) => {
      const owned = await tx.resume.findFirst({ where: { id: resumeId, userId } });
      if (!owned) {
        throw new Error("Resume not found");
      }

      return tx.resume.update({
        where: { id: resumeId },
        data: payload
      });
    }),

  getById: (resumeId: string, userId: string) =>
    prisma.resume.findFirst({
      where: { id: resumeId, userId }
    })
};
