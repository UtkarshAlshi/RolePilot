import type { ApplicationSectionType, ConfidenceLevel, GeneratedApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export const applicationRepository = {
  createApplication: (input: {
    userId: string;
    jobPostingId: string;
    tone: string;
    status?: GeneratedApplicationStatus;
  }) =>
    prisma.generatedApplication.create({
      data: {
        userId: input.userId,
        jobPostingId: input.jobPostingId,
        tone: input.tone,
        status: input.status ?? "DRAFT"
      }
    }),

  createAnswers: (generatedApplicationId: string, answers: Array<{
    sectionType: ApplicationSectionType;
    order: number;
    content: string;
    confidence: ConfidenceLevel;
    missingInfo: string[];
    factSources: string[];
    isUserEdited?: boolean;
  }>) =>
    prisma.applicationAnswer.createMany({
      data: answers.map((a) => ({
        generatedApplicationId,
        sectionType: a.sectionType,
        order: a.order,
        content: a.content,
        confidence: a.confidence,
        missingInfo: a.missingInfo,
        factSources: a.factSources,
        isUserEdited: a.isUserEdited ?? false
      }))
    }),

  getOwnedApplication: (userId: string, applicationId: string) =>
    prisma.generatedApplication.findFirst({
      where: { id: applicationId, userId },
      include: {
        jobPosting: true,
        answers: {
          orderBy: [{ sectionType: "asc" }, { order: "asc" }]
        }
      }
    }),

  getLatestByJob: (userId: string, jobPostingId: string) =>
    prisma.generatedApplication.findFirst({
      where: { userId, jobPostingId },
      include: {
        jobPosting: true,
        answers: {
          orderBy: [{ sectionType: "asc" }, { order: "asc" }]
        }
      },
      orderBy: { createdAt: "desc" }
    }),

  listOwnedApplications: (input: {
    userId: string;
    status?: GeneratedApplicationStatus;
    company?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit: number;
  }) =>
    prisma.generatedApplication.findMany({
      where: {
        userId: input.userId,
        ...(input.status ? { status: input.status } : {}),
        ...(input.company
          ? {
              jobPosting: {
                companyName: { contains: input.company, mode: "insensitive" }
              }
            }
          : {}),
        ...(input.dateFrom || input.dateTo
          ? {
              createdAt: {
                ...(input.dateFrom ? { gte: input.dateFrom } : {}),
                ...(input.dateTo ? { lte: input.dateTo } : {})
              }
            }
          : {})
      },
      include: {
        jobPosting: true,
        answers: true
      },
      orderBy: { createdAt: "desc" },
      take: input.limit
    }),

  approveApplication: (userId: string, applicationId: string) =>
    prisma.$transaction(async (tx) => {
      const app = await tx.generatedApplication.findFirst({ where: { id: applicationId, userId } });
      if (!app) throw new Error("Application not found");

      return tx.generatedApplication.update({
        where: { id: applicationId },
        data: { status: "APPROVED" }
      });
    }),

  updateAnswerContent: (userId: string, applicationId: string, answerId: string, content: string) =>
    prisma.$transaction(async (tx) => {
      const app = await tx.generatedApplication.findFirst({ where: { id: applicationId, userId } });
      if (!app) throw new Error("Application not found");

      const answer = await tx.applicationAnswer.findFirst({
        where: { id: answerId, generatedApplicationId: applicationId }
      });
      if (!answer) throw new Error("Answer not found");

      return tx.applicationAnswer.update({
        where: { id: answerId },
        data: { content, isUserEdited: true }
      });
    }),

  replaceSectionAnswers: (
    userId: string,
    applicationId: string,
    sectionType: ApplicationSectionType,
    answers: Array<{
      sectionType: ApplicationSectionType;
      order: number;
      content: string;
      confidence: ConfidenceLevel;
      missingInfo: string[];
      factSources: string[];
    }>
  ) =>
    prisma.$transaction(async (tx) => {
      const app = await tx.generatedApplication.findFirst({ where: { id: applicationId, userId } });
      if (!app) throw new Error("Application not found");

      await tx.applicationAnswer.deleteMany({
        where: { generatedApplicationId: applicationId, sectionType }
      });

      if (answers.length) {
        await tx.applicationAnswer.createMany({
          data: answers.map((a) => ({
            generatedApplicationId: applicationId,
            sectionType: a.sectionType,
            order: a.order,
            content: a.content,
            confidence: a.confidence,
            missingInfo: a.missingInfo,
            factSources: a.factSources,
            isUserEdited: false
          }))
        });
      }

      return tx.generatedApplication.findFirst({
        where: { id: applicationId, userId },
        include: { answers: { orderBy: [{ sectionType: "asc" }, { order: "asc" }] }, jobPosting: true }
      });
    })
};
