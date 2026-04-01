import type { ApplicationSectionType, ConfidenceLevel } from "@prisma/client";
import { generateText } from "@/lib/ai/openai-client";
import { sectionPrompt } from "@/src/server/prompts";
import type { GeneratedSection, GenerationContext } from "@/src/server/types/generation";

function computeConfidence(missingInfo: string[]): ConfidenceLevel {
  if (missingInfo.length === 0) return "HIGH";
  if (missingInfo.length <= 2) return "MEDIUM";
  return "LOW";
}

function baseMissing(profile: GenerationContext["profileFacts"], job: GenerationContext["jobFacts"]): string[] {
  const missing: string[] = [];
  if (!profile.fullName) missing.push("profile.fullName");
  if (profile.skills.length === 0) missing.push("profile.skills");
  if (!job.title) missing.push("job.title");
  if (!job.companyName) missing.push("job.companyName");
  return missing;
}

function createSection(
  sectionType: ApplicationSectionType,
  order: number,
  content: string,
  missingInfo: string[],
  factSources: string[]
): GeneratedSection {
  return {
    sectionType,
    order,
    content,
    confidence: computeConfidence(missingInfo),
    missingInfo,
    factSources
  };
}

function deterministicContent(section: ApplicationSectionType, context: GenerationContext, question?: string): string {
  if (section === "COVER_LETTER") {
    return `Dear Hiring Team,\n\nI am excited to apply for the ${context.jobFacts.title ?? "software engineering"} role at ${context.jobFacts.companyName ?? "your company"}. My background includes ${context.profileFacts.skills.slice(0, 3).join(", ") || "software development"} and hands-on project work aligned with this role's expectations.\n\nI would value the opportunity to contribute with a ${context.tone.replace("_", " ")} communication style and strong execution focus.\n\nSincerely,\n${context.profileFacts.fullName ?? "Candidate"}`;
  }

  if (section === "WHY_ROLE") {
    return `This role fits my trajectory because it emphasizes ${context.jobFacts.mustHaveSkills.slice(0, 2).join(" and ") || "core engineering fundamentals"}, where I already have supporting experience through ${context.profileFacts.projects[0] ?? "recent projects"}. I am particularly motivated by the chance to deepen impact in ${context.jobFacts.title ?? "this role"}.`;
  }

  if (section === "WHY_COMPANY") {
    return `I am interested in ${context.jobFacts.companyName ?? "your company"} because this opportunity appears focused on practical engineering outcomes and collaboration. Based on the role requirements, I can contribute with relevant skills while continuing to grow in areas important to your team.`;
  }

  if (section === "RECRUITER_MESSAGE") {
    return `Hi, I’m ${context.profileFacts.fullName ?? "a software engineer"}. I’m interested in the ${context.jobFacts.title ?? "open role"} at ${context.jobFacts.companyName ?? "your company"}. My background includes ${context.profileFacts.skills.slice(0, 3).join(", ") || "relevant engineering skills"}. I’d be glad to share my profile if helpful.`;
  }

  return `Q: ${question ?? "No question provided"}\nA: Based on my background in ${context.profileFacts.skills.slice(0, 2).join(" and ") || "software engineering"}, I have applied these strengths in ${context.profileFacts.projects[0] ?? "recent projects"} and can contribute effectively to this role.`;
}

async function generateSectionContent(section: ApplicationSectionType, context: GenerationContext, question?: string): Promise<string> {
  const prompts = sectionPrompt(section, {
    ...context,
    jobFacts: {
      ...context.jobFacts,
      screeningQs: question ? [question] : context.jobFacts.screeningQs
    }
  });

  const generated = await generateText({
    system: prompts.system,
    prompt: prompts.user,
    temperature: 0.4
  });

  return generated?.trim() || deterministicContent(section, context, question);
}

export async function generateSections(context: GenerationContext, sections: ApplicationSectionType[]): Promise<GeneratedSection[]> {
  const generated: GeneratedSection[] = [];
  const sharedMissing = baseMissing(context.profileFacts, context.jobFacts);

  for (const section of sections) {
    if (section === "SHORT_ANSWER") {
      const questions = context.jobFacts.screeningQs;
      if (!questions.length) {
        generated.push(
          createSection(
            "SHORT_ANSWER",
            0,
            "No screening question was provided in the job data. Please add your question to generate a tailored answer.",
            ["job.screeningQs"],
            ["job.screeningQs"]
          )
        );
      } else {
        for (const [index, question] of questions.entries()) {
          generated.push(
            createSection(
              "SHORT_ANSWER",
              index,
              await generateSectionContent("SHORT_ANSWER", context, question),
              sharedMissing,
              ["job.screeningQs", "profile.skills", "profile.projects"]
            )
          );
        }
      }

      continue;
    }

    generated.push(
      createSection(
        section,
        0,
        await generateSectionContent(section, context),
        sharedMissing,
        ["profile.skills", "profile.projects", "job.title", "job.companyName", "job.requirements", "job.mustHaveSkills"]
      )
    );
  }

  return generated;
}
