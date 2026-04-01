import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(24),
  AUTH_DEMO_EMAIL: z.string().email(),
  AUTH_DEMO_PASSWORD: z.string().min(8),
  AUTH_ALLOW_DEMO_LOGIN: z.coerce.boolean().optional(),
  RESUME_STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  RESUME_STORAGE_BUCKET: z.string().min(1),
  RESUME_STORAGE_BASE_URL: z.string().url(),
  RESUME_UPLOAD_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).default(900),
  RESUME_STORAGE_SIGNING_SECRET: z.string().min(16),
  ERROR_MONITOR_DSN: z.string().url().optional(),
  // Treat empty string as unset so fresh `.env` with OPENAI_API_KEY="" does not crash startup.
  OPENAI_API_KEY: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().min(20).optional()
  ),
  OPENAI_MODEL: z.string().min(1).default("gpt-4.1-mini")
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  AUTH_DEMO_EMAIL: process.env.AUTH_DEMO_EMAIL,
  AUTH_DEMO_PASSWORD: process.env.AUTH_DEMO_PASSWORD,
  AUTH_ALLOW_DEMO_LOGIN: process.env.AUTH_ALLOW_DEMO_LOGIN,
  RESUME_STORAGE_PROVIDER: process.env.RESUME_STORAGE_PROVIDER,
  RESUME_STORAGE_BUCKET: process.env.RESUME_STORAGE_BUCKET,
  RESUME_STORAGE_BASE_URL: process.env.RESUME_STORAGE_BASE_URL,
  RESUME_UPLOAD_URL_TTL_SECONDS: process.env.RESUME_UPLOAD_URL_TTL_SECONDS,
  RESUME_STORAGE_SIGNING_SECRET: process.env.RESUME_STORAGE_SIGNING_SECRET,
  ERROR_MONITOR_DSN: process.env.ERROR_MONITOR_DSN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL
});

if (!parsed.success) {
  console.error("Environment validation failed", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = {
  ...parsed.data,
  AUTH_ALLOW_DEMO_LOGIN: parsed.data.AUTH_ALLOW_DEMO_LOGIN ?? parsed.data.NODE_ENV !== "production"
};
