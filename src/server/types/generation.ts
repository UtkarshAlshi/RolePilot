import type { ApplicationSectionType, ConfidenceLevel } from "@prisma/client";

export type GeneratedSection = {
  sectionType: ApplicationSectionType;
  order: number;
  content: string;
  confidence: ConfidenceLevel;
  missingInfo: string[];
  factSources: string[];
};

export type GenerationContext = {
  tone: string;
  profileFacts: {
    fullName?: string | null;
    location?: string | null;
    summary?: string | null;
    skills: string[];
    experiences: string[];
    projects: string[];
  };
  jobFacts: {
    title?: string | null;
    companyName?: string | null;
    requirements: string[];
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    screeningQs: string[];
  };
};
