import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedInUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  summary: z.string().optional(),
  noticePeriod: z.string().optional(),
  workAuthorization: z.string().optional(),
  salaryExpectation: z.string().optional(),
  relocationPreference: z.boolean().optional(),
  startAvailability: z.string().optional()
});

export const experienceSchema = z.object({
  id: z.string().cuid().optional(),
  company: z.string().min(1),
  title: z.string().min(1),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isCurrent: z.boolean().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional()
});

export const experiencesUpdateSchema = z.object({
  items: z.array(experienceSchema)
});

export const projectSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1),
  role: z.string().optional(),
  description: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  link: z.string().url().optional()
});

export const projectsUpdateSchema = z.object({
  items: z.array(projectSchema)
});

export const skillSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1),
  category: z.string().optional(),
  level: z.string().optional(),
  years: z.number().min(0).max(50).optional()
});

export const skillsUpdateSchema = z.object({
  items: z.array(skillSchema)
});

export const educationSchema = z.object({
  id: z.string().cuid().optional(),
  institution: z.string().min(1),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable()
});

export const educationUpdateSchema = z.object({
  items: z.array(educationSchema)
});

export const preferenceUpdateSchema = z.object({
  preferredRoles: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  employmentTypes: z.array(z.enum(["FULL_TIME", "CONTRACT", "INTERNSHIP"])).optional(),
  remotePreference: z.enum(["ONSITE", "HYBRID", "REMOTE", "FLEXIBLE"]).optional()
});
