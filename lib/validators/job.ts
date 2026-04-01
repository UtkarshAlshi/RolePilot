import { z } from "zod";

export const jobSourceTypeSchema = z.enum(["TEXT", "URL"]);

export const createJobSchema = z
  .object({
    sourceType: jobSourceTypeSchema,
    sourceUrl: z.string().url().optional().nullable(),
    rawText: z.string().optional().nullable()
  })
  .superRefine((value, ctx) => {
    if (value.sourceType === "TEXT" && !value.rawText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rawText"],
        message: "rawText is required when sourceType=TEXT"
      });
    }

    if (value.sourceType === "URL" && !value.sourceUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceUrl"],
        message: "sourceUrl is required when sourceType=URL"
      });
    }
  });

export const updateJobSchema = z.object({
  title: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  mustHaveSkills: z.array(z.string()).optional(),
  niceToHaveSkills: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  screeningQs: z.array(z.string()).optional(),
  experienceMin: z.number().int().min(0).optional().nullable(),
  experienceMax: z.number().int().min(0).optional().nullable()
});
