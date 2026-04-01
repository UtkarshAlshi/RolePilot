import { generateJson } from "@/lib/ai/openai-client";
import { jobParsePrompt } from "@/src/server/prompts";

export type ParsedJobResult = {
  title?: string;
  companyName?: string;
  location?: string;
  requirements: string[];
  responsibilities: string[];
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  keywords: string[];
  screeningQs: string[];
};

const skillKeywords = [
  "typescript",
  "javascript",
  "react",
  "node",
  "python",
  "java",
  "aws",
  "docker",
  "kubernetes",
  "postgresql",
  "mysql",
  "graphql",
  "redis"
];

function asArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((v) => String(v).trim()).filter(Boolean)));
}

function normalizeParsed(value: unknown): ParsedJobResult | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;

  return {
    ...(typeof v.title === "string" && v.title.trim() ? { title: v.title.trim() } : {}),
    ...(typeof v.companyName === "string" && v.companyName.trim() ? { companyName: v.companyName.trim() } : {}),
    ...(typeof v.location === "string" && v.location.trim() ? { location: v.location.trim() } : {}),
    requirements: asArray(v.requirements),
    responsibilities: asArray(v.responsibilities),
    mustHaveSkills: asArray(v.mustHaveSkills),
    niceToHaveSkills: asArray(v.niceToHaveSkills),
    keywords: asArray(v.keywords),
    screeningQs: asArray(v.screeningQs)
  };
}

function extractLineValue(rawText: string, label: string): string | undefined {
  const regex = new RegExp(`^${label}\\s*:\\s*(.+)$`, "im");
  return rawText.match(regex)?.[1]?.trim();
}

function extractBullets(rawText: string, sectionLabel: string): string[] {
  const sectionRegex = new RegExp(`${sectionLabel}\\s*:\\s*([\\s\\S]*?)(?:\\n\\n|$)`, "i");
  const block = rawText.match(sectionRegex)?.[1];

  if (!block) return [];

  return block
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

function detectKeywords(rawText: string): string[] {
  const lower = rawText.toLowerCase();
  return skillKeywords.filter((keyword) => lower.includes(keyword));
}

function deterministicParse(rawText: string): ParsedJobResult {
  const title = extractLineValue(rawText, "Title") ?? extractLineValue(rawText, "Role");
  const companyName = extractLineValue(rawText, "Company");
  const location = extractLineValue(rawText, "Location");

  const responsibilities = extractBullets(rawText, "Responsibilities");
  const requirements = extractBullets(rawText, "Requirements");
  const mustHaveSkills = extractBullets(rawText, "Must-have Skills");
  const niceToHaveSkills = extractBullets(rawText, "Nice-to-have Skills");
  const screeningQs = extractBullets(rawText, "Screening Questions");
  const keywords = detectKeywords(rawText);

  return {
    ...(title ? { title } : {}),
    ...(companyName ? { companyName } : {}),
    ...(location ? { location } : {}),
    responsibilities,
    requirements,
    mustHaveSkills,
    niceToHaveSkills,
    keywords,
    screeningQs
  };
}

export async function parseJobFromText(rawText: string): Promise<ParsedJobResult> {
  const prompts = jobParsePrompt(rawText);
  const llmParsed = normalizeParsed(
    await generateJson<Record<string, unknown>>({
      system: prompts.system,
      prompt: prompts.user,
      temperature: 0.1
    })
  );

  if (llmParsed) return llmParsed;
  return deterministicParse(rawText);
}

export async function parseJobFromUrlStub(sourceUrl: string): Promise<ParsedJobResult> {
  const hostname = (() => {
    try {
      return new URL(sourceUrl).hostname;
    } catch {
      return undefined;
    }
  })();

  return {
    requirements: [],
    responsibilities: [],
    mustHaveSkills: [],
    niceToHaveSkills: [],
    keywords: [],
    screeningQs: [],
    ...(hostname ? { companyName: hostname } : {})
  };
}
