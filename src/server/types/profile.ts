import type { ConfidenceLevel } from "@prisma/client";

export type ParsedProfilePreview = {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  summary?: string;
  confidence: Partial<Record<keyof Omit<ParsedProfilePreview, "confidence">, ConfidenceLevel>>;
  missingFields: string[];
};
