import { createHmac, randomUUID } from "crypto";
import { env } from "@/lib/env";

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function signUploadToken(payload: { userId: string; storageKey: string; expiresAt: string }) {
  return createHmac("sha256", env.RESUME_STORAGE_SIGNING_SECRET)
    .update(`${payload.userId}.${payload.storageKey}.${payload.expiresAt}`)
    .digest("hex");
}

export type UploadTarget = {
  provider: "local" | "s3";
  storageKey: string;
  uploadUrl: string;
  expiresIn: number;
  requiredHeaders: Record<string, string>;
};

export const resumeStorage = {
  createUploadTarget(input: { userId: string; fileName: string; mimeType: string }): UploadTarget {
    const normalizedFileName = sanitizeFileName(input.fileName);
    const storageKey = `resumes/${input.userId}/${Date.now()}-${randomUUID()}-${normalizedFileName}`;
    const expiresIn = env.RESUME_UPLOAD_URL_TTL_SECONDS;

    if (env.RESUME_STORAGE_PROVIDER === "s3") {
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
      const token = signUploadToken({ userId: input.userId, storageKey, expiresAt });

      return {
        provider: "s3",
        storageKey,
        uploadUrl: `${env.RESUME_STORAGE_BASE_URL}/${encodeURIComponent(storageKey)}?expiresAt=${encodeURIComponent(expiresAt)}&signature=${token}`,
        expiresIn,
        requiredHeaders: {
          "content-type": input.mimeType,
          "x-storage-bucket": env.RESUME_STORAGE_BUCKET
        }
      };
    }

    return {
      provider: "local",
      storageKey,
      uploadUrl: `${env.RESUME_STORAGE_BASE_URL}/${encodeURIComponent(storageKey)}`,
      expiresIn,
      requiredHeaders: {
        "content-type": input.mimeType
      }
    };
  },

  assertOwnedStorageKey(userId: string, storageKey: string): void {
    const expectedPrefix = `resumes/${userId}/`;
    if (!storageKey.startsWith(expectedPrefix)) {
      throw new Error("INVALID_STORAGE_KEY");
    }
  }
};
