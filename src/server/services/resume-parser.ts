import { ConfidenceLevel } from "@prisma/client";
import { generateJson } from "@/lib/ai/openai-client";

export type ResumeExtractionResult = {
  rawText: string | null;
  extractedJson: Record<string, unknown>;
  confidenceSummary: {
    overall: ConfidenceLevel;
    notes: string;
    missingFields: string[];
    fields: Record<string, ConfidenceLevel>;
  };
};

function confidenceFromMissing(missingFields: string[]): ConfidenceLevel {
  if (missingFields.length <= 1) return ConfidenceLevel.HIGH;
  if (missingFields.length <= 3) return ConfidenceLevel.MEDIUM;
  return ConfidenceLevel.LOW;
}

function fallbackFromText(text: string): ResumeExtractionResult {
  return {
    rawText: text,
    extractedJson: {
      source: "text_fallback",
      parsedFacts: {}
    },
    confidenceSummary: {
      overall: ConfidenceLevel.LOW,
      notes: "LLM extraction unavailable; captured raw text only.",
      missingFields: ["fullName", "email", "experience", "skills", "education"],
      fields: {}
    }
  };
}

export async function extractResumePlaceholder(storageKey: string, resumeText?: string): Promise<ResumeExtractionResult> {
  if (resumeText) {
    const extracted = await generateJson<{
      fullName?: string;
      email?: string;
      phone?: string;
      location?: string;
      summary?: string;
      skills?: string[];
      experiences?: Array<{ title?: string; company?: string; description?: string }>;
      projects?: Array<{ name?: string; role?: string; description?: string }>;
      education?: Array<{ school?: string; degree?: string; field?: string }>;
    }>({
      system:
        "Extract resume facts into JSON only from provided text. Do not fabricate values. Use empty arrays when uncertain.",
      prompt: `Extract profile facts from this resume text:\n${resumeText}`,
      temperature: 0.1
    });

    if (!extracted) return fallbackFromText(resumeText);

    const missingFields = ["fullName", "email", "skills", "experiences"].filter((field) => {
      const value = (extracted as Record<string, unknown>)[field];
      if (Array.isArray(value)) return value.length === 0;
      return !value;
    });

    const overall = confidenceFromMissing(missingFields);

    return {
      rawText: resumeText,
      extractedJson: {
        source: "llm_text_extract",
        storageKey,
        parsedFacts: extracted
      },
      confidenceSummary: {
        overall,
        notes: "Extracted from resume text using optional LLM pipeline with strict grounding.",
        missingFields,
        fields: {
          fullName: extracted.fullName ? ConfidenceLevel.HIGH : ConfidenceLevel.LOW,
          email: extracted.email ? ConfidenceLevel.HIGH : ConfidenceLevel.LOW,
          skills: extracted.skills?.length ? ConfidenceLevel.MEDIUM : ConfidenceLevel.LOW,
          experiences: extracted.experiences?.length ? ConfidenceLevel.MEDIUM : ConfidenceLevel.LOW
        }
      }
    };
  }

  return {
    rawText: null,
    extractedJson: {
      source: "stub",
      storageKey,
      parsedFacts: {}
    },
    confidenceSummary: {
      overall: ConfidenceLevel.LOW,
      notes: "Stub extraction path. No inferred facts were generated.",
      missingFields: ["fullName", "email", "phone", "experience", "skills", "education"],
      fields: {}
    }
  };
}
