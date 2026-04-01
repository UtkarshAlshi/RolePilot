import type { ApplicationSectionType } from "@prisma/client";
import type { GenerationContext } from "@/src/server/types/generation";

export const PROMPT_VERSION = "v1";

export function jobParsePrompt(rawText: string): { system: string; user: string } {
  return {
    system:
      "You extract job data into strict JSON. Use only provided text. Do not invent facts. Keep arrays concise, deduplicated, and evidence-grounded.",
    user: `PromptVersion=${PROMPT_VERSION}\nExtract this job posting into JSON keys: title, companyName, location, requirements[], responsibilities[], mustHaveSkills[], niceToHaveSkills[], keywords[], screeningQs[].\nJob text:\n${rawText}`
  };
}

export function fitReasoningPrompt(input: {
  profileSummary: string;
  jobSummary: string;
  score: number;
  strengths: string[];
  gaps: string[];
}): { system: string; user: string } {
  return {
    system:
      "You are a cautious career copilot. Explain fit score using only supplied evidence. Never add unsupported claims. Keep concise and actionable.",
    user: `PromptVersion=${PROMPT_VERSION}\nScore=${input.score}\nProfile=${input.profileSummary}\nJob=${input.jobSummary}\nStrengths=${input.strengths.join(" | ")}\nGaps=${input.gaps.join(" | ")}\nReturn 4-6 sentences that justify the score and recommendation with explicit caveats.`
  };
}

export function sectionPrompt(sectionType: ApplicationSectionType, context: GenerationContext): { system: string; user: string } {
  return {
    system:
      "You write grounded job application content. Use only given facts. If evidence is weak, acknowledge briefly. Never fabricate achievements, years, or metrics.",
    user: `PromptVersion=${PROMPT_VERSION}\nSection=${sectionType}\nTone=${context.tone}\nProfileFacts=${JSON.stringify(context.profileFacts)}\nJobFacts=${JSON.stringify(context.jobFacts)}\nWrite only the section text, concise and human-sounding.`
  };
}
