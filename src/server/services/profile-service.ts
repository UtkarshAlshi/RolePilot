import type { EmploymentType, RemotePreference } from "@prisma/client";
import { profileRepository } from "@/src/server/repositories/profile-repository";
import { resumeRepository } from "@/src/server/repositories/resume-repository";

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  return new Date(value);
}

export const profileService = {
  getOrCreate: (userId: string) => profileRepository.getOrCreate(userId),

  async mergeFromResume(userId: string, resumeId: string) {
    const profile = await profileRepository.getOrCreate(userId);
    const resume = await resumeRepository.getById(resumeId, userId);

    if (!resume) {
      throw new Error("Resume not found");
    }

    const parsedFacts = (resume.extractedJson as { parsedFacts?: Record<string, unknown> } | null)?.parsedFacts ?? {};

    const updateData: Record<string, unknown> = {};
    const mergedFields: string[] = [];

    const mergableFields = [
      "fullName",
      "email",
      "phone",
      "location",
      "linkedInUrl",
      "githubUrl",
      "portfolioUrl",
      "summary"
    ] as const;

    for (const field of mergableFields) {
      const candidate = parsedFacts[field];
      const existing = profile[field];

      if ((existing === null || existing === undefined || existing === "") && typeof candidate === "string" && candidate) {
        updateData[field] = candidate;
        mergedFields.push(field);
      }
    }

    const updated = Object.keys(updateData).length
      ? await profileRepository.updateProfile(userId, updateData)
      : await profileRepository.getByUserId(userId);

    return {
      profile: updated,
      mergedFields
    };
  },

  async updateProfile(userId: string, payload: Record<string, unknown>) {
    // First-write safety: ensure profile row exists before attempting update.
    await profileRepository.getOrCreate(userId);
    return profileRepository.updateProfile(userId, payload);
  },

  async replaceExperiences(
    userId: string,
    items: Array<{
      company: string;
      title: string;
      startDate?: string | null;
      endDate?: string | null;
      isCurrent?: boolean;
      location?: string;
      description?: string;
      achievements?: string[];
    }>
  ) {
    const profile = await profileRepository.getOrCreate(userId);

    return profileRepository.replaceExperiences(
      profile.id,
      items.map((item) => ({
        company: item.company,
        title: item.title,
        startDate: toDate(item.startDate),
        endDate: toDate(item.endDate),
        isCurrent: item.isCurrent ?? false,
        location: item.location,
        description: item.description,
        achievements: item.achievements ?? []
      }))
    );
  },

  async replaceProjects(
    userId: string,
    items: Array<{ name: string; role?: string; description?: string; techStack?: string[]; link?: string }>
  ) {
    const profile = await profileRepository.getOrCreate(userId);

    return profileRepository.replaceProjects(
      profile.id,
      items.map((item) => ({
        name: item.name,
        role: item.role,
        description: item.description,
        techStack: item.techStack ?? [],
        link: item.link
      }))
    );
  },

  async replaceSkills(
    userId: string,
    items: Array<{ name: string; category?: string; level?: string; years?: number }>
  ) {
    const profile = await profileRepository.getOrCreate(userId);

    return profileRepository.replaceSkills(
      profile.id,
      items.map((item) => ({
        name: item.name,
        category: item.category,
        level: item.level,
        years: item.years
      }))
    );
  },

  async replaceEducation(
    userId: string,
    items: Array<{ institution: string; degree?: string; field?: string; startDate?: string | null; endDate?: string | null }>
  ) {
    const profile = await profileRepository.getOrCreate(userId);

    return profileRepository.replaceEducation(
      profile.id,
      items.map((item) => ({
        institution: item.institution,
        degree: item.degree,
        field: item.field,
        startDate: toDate(item.startDate),
        endDate: toDate(item.endDate)
      }))
    );
  },

  async upsertPreference(
    userId: string,
    input: {
      preferredRoles?: string[];
      preferredLocations?: string[];
      employmentTypes?: EmploymentType[];
      remotePreference?: RemotePreference;
    }
  ) {
    const profile = await profileRepository.getOrCreate(userId);
    await profileRepository.upsertPreference(profile.id, input);
    return profileRepository.getByUserId(userId);
  }
};
