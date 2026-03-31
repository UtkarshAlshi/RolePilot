import type { EmploymentType, RemotePreference } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

const profileIncludes = {
  experiences: true,
  projects: true,
  skills: true,
  educations: true,
  preference: true
} as const;

export const profileRepository = {
  getOrCreate: async (userId: string) => {
    const existing = await prisma.profile.findUnique({
      where: { userId },
      include: profileIncludes
    });

    if (existing) return existing;

    return prisma.profile.create({
      data: { userId },
      include: profileIncludes
    });
  },

  getByUserId: (userId: string) =>
    prisma.profile.findUnique({
      where: { userId },
      include: profileIncludes
    }),

  updateProfile: (userId: string, data: Record<string, unknown>) =>
    prisma.profile.update({
      where: { userId },
      data,
      include: profileIncludes
    }),

  replaceExperiences: async (profileId: string, items: Array<Record<string, unknown>>) => {
    await prisma.experience.deleteMany({ where: { profileId } });

    if (items.length > 0) {
      await prisma.experience.createMany({
        data: items.map((item) => ({ profileId, ...item })) as never
      });
    }

    return prisma.profile.findUnique({ where: { id: profileId }, include: profileIncludes });
  },

  replaceProjects: async (profileId: string, items: Array<Record<string, unknown>>) => {
    await prisma.project.deleteMany({ where: { profileId } });

    if (items.length > 0) {
      await prisma.project.createMany({
        data: items.map((item) => ({ profileId, ...item })) as never
      });
    }

    return prisma.profile.findUnique({ where: { id: profileId }, include: profileIncludes });
  },

  replaceSkills: async (profileId: string, items: Array<Record<string, unknown>>) => {
    await prisma.skill.deleteMany({ where: { profileId } });

    if (items.length > 0) {
      await prisma.skill.createMany({
        data: items.map((item) => ({ profileId, ...item })) as never
      });
    }

    return prisma.profile.findUnique({ where: { id: profileId }, include: profileIncludes });
  },

  replaceEducation: async (profileId: string, items: Array<Record<string, unknown>>) => {
    await prisma.education.deleteMany({ where: { profileId } });

    if (items.length > 0) {
      await prisma.education.createMany({
        data: items.map((item) => ({ profileId, ...item })) as never
      });
    }

    return prisma.profile.findUnique({ where: { id: profileId }, include: profileIncludes });
  },

  upsertPreference: (profileId: string, input: {
    preferredRoles?: string[];
    preferredLocations?: string[];
    employmentTypes?: EmploymentType[];
    remotePreference?: RemotePreference;
  }) =>
    prisma.preference.upsert({
      where: { profileId },
      create: {
        profileId,
        preferredRoles: input.preferredRoles ?? [],
        preferredLocations: input.preferredLocations ?? [],
        employmentTypes: input.employmentTypes ?? [],
        remotePreference: input.remotePreference ?? "FLEXIBLE"
      },
      update: {
        ...(input.preferredRoles ? { preferredRoles: input.preferredRoles } : {}),
        ...(input.preferredLocations ? { preferredLocations: input.preferredLocations } : {}),
        ...(input.employmentTypes ? { employmentTypes: input.employmentTypes } : {}),
        ...(input.remotePreference ? { remotePreference: input.remotePreference } : {})
      }
    })
};
