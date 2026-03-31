import { z } from "zod";

export const createUploadUrlSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.literal("application/pdf")
});

export const createResumeSchema = z.object({
  storageKey: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.literal("application/pdf"),
  resumeText: z.string().min(100).max(30000).optional()
});

export const mergeProfileFromResumeSchema = z.object({
  resumeId: z.string().cuid()
});
