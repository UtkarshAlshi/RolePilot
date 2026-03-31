import { z } from "zod";

const sectionEnum = z.enum([
  "COVER_LETTER",
  "WHY_ROLE",
  "WHY_COMPANY",
  "RECRUITER_MESSAGE",
  "SHORT_ANSWER"
]);

export const createApplicationSchema = z.object({
  tone: z.string().min(1).default("professional_concise"),
  sections: z.array(sectionEnum).min(1)
});

export const patchAnswerSchema = z.object({
  content: z.string().min(1)
});

export const regenerateSectionSchema = z.object({
  sectionType: sectionEnum,
  tone: z.string().min(1).optional()
});

export const listApplicationsQuerySchema = z.object({
  status: z.enum(["DRAFT", "REVIEWED", "APPROVED"]).optional(),
  company: z.string().min(1).optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20)
});
