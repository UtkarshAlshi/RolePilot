import { ResumeParseStatus } from "@prisma/client";
import { logInfo } from "@/lib/logging";
import { resumeStorage } from "@/lib/storage/resume-storage";
import { resumeRepository } from "@/src/server/repositories/resume-repository";
import { extractResumePlaceholder } from "@/src/server/services/resume-parser";

export const resumeService = {
  async createAndParse(userId: string, input: { storageKey: string; fileName: string; mimeType: string; resumeText?: string }) {
    resumeStorage.assertOwnedStorageKey(userId, input.storageKey);

    const resume = await resumeRepository.create(userId, input);

    await resumeRepository.updateParseState(resume.id, userId, {
      parseStatus: ResumeParseStatus.PROCESSING
    });

    try {
      const parsed = await extractResumePlaceholder(input.storageKey, input.resumeText);

      return await resumeRepository.updateParseState(resume.id, userId, {
        parseStatus: ResumeParseStatus.COMPLETED,
        rawText: parsed.rawText,
        extractedJson: parsed.extractedJson,
        confidenceSummary: parsed.confidenceSummary,
        parseError: null
      });
    } catch (error) {
      logInfo("resume-parse", "Resume parse failed", {
        userId,
        resumeId: resume.id,
        error: error instanceof Error ? error.message : String(error)
      });

      await resumeRepository.updateParseState(resume.id, userId, {
        parseStatus: ResumeParseStatus.FAILED,
        parseError: error instanceof Error ? error.message : "Unknown parser error"
      });
      throw error;
    }
  },

  getById(userId: string, resumeId: string) {
    return resumeRepository.getById(resumeId, userId);
  }
};
