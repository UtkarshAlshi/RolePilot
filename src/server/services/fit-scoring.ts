import type {
  ConfidenceLevel,
  Experience,
  JobAnalysisRecommendation,
  JobPosting,
  Project,
  Skill
} from "@prisma/client";
import type { FitComputationResult, MatchItem } from "@/src/server/types/analysis";

const WEIGHTS = {
  mustHave: 50,
  niceToHave: 20,
  keywordOverlap: 10,
  alignment: 20
} as const;

const RECOMMENDATION_THRESHOLDS = {
  STRONG_APPLY: 75,
  REASONABLE_APPLY: 55,
  STRETCH_APPLY: 35
} as const;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function createEvidenceCorpus(skills: Skill[], experiences: Experience[], projects: Project[]): string[] {
  const skillText = skills.map((s) => s.name);
  const expText = experiences.flatMap((e) => [e.title, e.company, e.description ?? ""]);
  const projectText = projects.flatMap((p) => [p.name, p.role ?? "", p.description ?? "", ...asStringArray(p.techStack)]);

  return [...skillText, ...expText, ...projectText].map(normalize).filter(Boolean);
}

function findEvidence(term: string, corpus: string[], skills: Skill[]): string | undefined {
  const normalized = normalize(term);

  const directSkill = skills.find((s) => normalize(s.name) === normalized);
  if (directSkill) return `skill:${directSkill.name}`;

  const contains = corpus.find((entry) => entry.includes(normalized));
  if (!contains) return undefined;

  if (contains.includes("engineer") || contains.includes("developer")) return "experience";
  return "project_or_experience";
}

function ratio(matches: number, total: number): number {
  if (total <= 0) return 0;
  return matches / total;
}

function roundScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function recommendationFromScore(score: number, missingMustCount: number, mustTotal: number): JobAnalysisRecommendation {
  const mustMatchRatio = mustTotal > 0 ? (mustTotal - missingMustCount) / mustTotal : 1;

  if (score >= RECOMMENDATION_THRESHOLDS.STRONG_APPLY && mustMatchRatio >= 0.75) {
    return "STRONG_APPLY";
  }

  if (score >= RECOMMENDATION_THRESHOLDS.REASONABLE_APPLY && mustMatchRatio >= 0.5) {
    return "REASONABLE_APPLY";
  }

  if (score >= RECOMMENDATION_THRESHOLDS.STRETCH_APPLY && mustMatchRatio >= 0.25) {
    return "STRETCH_APPLY";
  }

  return "SKIP";
}

function confidenceFromData(params: {
  hasProfileBaseline: boolean;
  mustTotal: number;
  niceTotal: number;
  keywordTotal: number;
  profileSignalCount: number;
}): ConfidenceLevel {
  if (!params.hasProfileBaseline || params.profileSignalCount < 2) return "LOW";

  const parsedSignal = params.mustTotal + params.niceTotal + params.keywordTotal;
  if (parsedSignal === 0) return "LOW";
  if (parsedSignal < 3) return "MEDIUM";

  return "HIGH";
}

export function computeFitAnalysis(input: {
  job: JobPosting;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  hasProfileBaseline: boolean;
}): FitComputationResult {
  const mustHaveSkills = asStringArray(input.job.mustHaveSkills);
  const niceToHaveSkills = asStringArray(input.job.niceToHaveSkills);
  const keywords = asStringArray(input.job.keywords);
  const requirements = asStringArray(input.job.requirements);

  const corpus = createEvidenceCorpus(input.skills, input.experiences, input.projects);

  const mustHaveMatch: MatchItem[] = mustHaveSkills.map((skill) => {
    const evidence = findEvidence(skill, corpus, input.skills);
    return {
      name: skill,
      matched: Boolean(evidence),
      evidenceSource: evidence,
      note: evidence ? "Matched from profile evidence." : "No direct evidence found in profile."
    };
  });

  const niceToHaveFit: MatchItem[] = niceToHaveSkills.map((skill) => {
    const evidence = findEvidence(skill, corpus, input.skills);
    return {
      name: skill,
      matched: Boolean(evidence),
      evidenceSource: evidence,
      note: evidence ? "Aligned with optional skill." : "Optional skill not present."
    };
  });

  const matchedMust = mustHaveMatch.filter((item) => item.matched).length;
  const matchedNice = niceToHaveFit.filter((item) => item.matched).length;
  const matchedKeywords = keywords.filter((keyword) => Boolean(findEvidence(keyword, corpus, input.skills))).length;

  const titleAlignment = input.job.title
    ? corpus.some((entry) => entry.includes(normalize(input.job.title ?? "")))
      ? 1
      : 0
    : 0;
  const requirementsAlignment = requirements.length
    ? requirements.filter((r) => Boolean(findEvidence(r, corpus, input.skills))).length / requirements.length
    : 0;

  const mustHaveComponent = ratio(matchedMust, mustHaveSkills.length) * WEIGHTS.mustHave;
  const niceToHaveComponent = ratio(matchedNice, niceToHaveSkills.length) * WEIGHTS.niceToHave;
  const keywordComponent = ratio(matchedKeywords, keywords.length) * WEIGHTS.keywordOverlap;
  const alignmentComponent = ((titleAlignment + requirementsAlignment) / 2) * WEIGHTS.alignment;

  const rawScore = mustHaveComponent + niceToHaveComponent + keywordComponent + alignmentComponent;
  const matchScore = roundScore(rawScore);

  const missingMust = mustHaveMatch.filter((item) => !item.matched).map((item) => item.name);
  const strengths = [
    ...(matchedMust > 0 ? [`Matched ${matchedMust}/${mustHaveSkills.length || 0} must-have skills.`] : []),
    ...(matchedNice > 0 ? [`Matched ${matchedNice}/${niceToHaveSkills.length || 0} nice-to-have skills.`] : []),
    ...(matchedKeywords > 0 ? [`Keyword overlap found for ${matchedKeywords} term(s).`] : []),
    ...(titleAlignment ? ["Profile evidence aligns with job title context."] : [])
  ];

  const gaps = [
    ...missingMust.map((skill) => `Missing must-have: ${skill}`),
    ...(!titleAlignment && input.job.title ? ["No explicit title alignment found in profile evidence."] : []),
    ...(!input.hasProfileBaseline ? ["Profile baseline is incomplete (name/email/skills)."] : [])
  ];

  const recommendation = recommendationFromScore(matchScore, missingMust.length, mustHaveSkills.length);
  const confidence = confidenceFromData({
    hasProfileBaseline: input.hasProfileBaseline,
    mustTotal: mustHaveSkills.length,
    niceTotal: niceToHaveSkills.length,
    keywordTotal: keywords.length,
    profileSignalCount: input.skills.length + input.experiences.length + input.projects.length
  });

  const reasoning = [
    `Score=${matchScore} using weighted components: must-have(${WEIGHTS.mustHave}), nice-to-have(${WEIGHTS.niceToHave}), keywords(${WEIGHTS.keywordOverlap}), alignment(${WEIGHTS.alignment}).`,
    `Must-have match ratio: ${matchedMust}/${mustHaveSkills.length || 0}.`,
    `Nice-to-have match ratio: ${matchedNice}/${niceToHaveSkills.length || 0}.`,
    `Keyword overlap: ${matchedKeywords}/${keywords.length || 0}.`,
    missingMust.length ? `Critical gaps detected in must-have skills: ${missingMust.join(", ")}.` : "No critical must-have skill gaps detected.",
    `Confidence=${confidence} based on profile completeness and parsed-job signal density.`
  ].join(" ");

  return {
    matchScore,
    recommendation,
    strengths: strengths.length ? strengths : ["No strong alignment signals detected."],
    gaps,
    mustHaveMatch,
    niceToHaveFit,
    reasoning,
    confidence,
    breakdown: {
      mustHaveComponent: roundScore(mustHaveComponent),
      niceToHaveComponent: roundScore(niceToHaveComponent),
      keywordComponent: roundScore(keywordComponent),
      alignmentComponent: roundScore(alignmentComponent)
    }
  };
}
