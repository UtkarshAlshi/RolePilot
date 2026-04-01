"use client";

import { useState } from "react";
import { ResumeParseStatus } from "@prisma/client";
import { ParseStatusBadge } from "@/components/onboarding/parse-status-badge";
import { ResumeDropzone } from "@/components/onboarding/resume-dropzone";

type Props = {
  onUploaded: (resume: {
    resumeId: string;
    parseStatus: ResumeParseStatus;
    extractedJson?: Record<string, unknown> | null;
    confidenceSummary?: Record<string, unknown> | null;
  }) => void;
};

type UploadTarget = {
  uploadUrl: string;
  method?: "PUT" | "POST";
  storageKey: string;
  requiredHeaders?: Record<string, string>;
};

export function ResumeUploadCard({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ResumeParseStatus>(ResumeParseStatus.PENDING);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadResume() {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const uploadRes = await fetch("/api/resumes/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type })
      });
      const uploadData = (await uploadRes.json()) as UploadTarget & { error?: { message?: string } };

      if (!uploadRes.ok) throw new Error(uploadData?.error?.message ?? "Upload URL failed");

      // Upload file bytes first; only create parse record after successful object upload.
      const fileUploadRes = await fetch(uploadData.uploadUrl, {
        method: uploadData.method ?? "PUT",
        headers: uploadData.requiredHeaders ?? {},
        body: file
      });

      if (!fileUploadRes.ok) {
        throw new Error("File upload failed. Please retry and verify storage configuration.");
      }

      const createRes = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageKey: uploadData.storageKey,
          fileName: file.name,
          mimeType: file.type
        })
      });
      const createData = await createRes.json();

      if (!createRes.ok) throw new Error(createData?.error?.message ?? "Resume create failed");

      setStatus(createData.parseStatus);

      const detailRes = await fetch(`/api/resumes/${createData.resumeId}`);
      const detailData = await detailRes.json();
      if (!detailRes.ok) throw new Error(detailData?.error?.message ?? "Failed to read parsed resume");

      onUploaded({
        resumeId: createData.resumeId,
        parseStatus: createData.parseStatus,
        extractedJson: detailData?.extractedJson as Record<string, unknown> | null,
        confidenceSummary: detailData?.confidenceSummary as Record<string, unknown> | null
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Resume Upload</h2>
        <ParseStatusBadge status={status} />
      </div>
      <ResumeDropzone onFileSelect={setFile} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
        onClick={uploadResume}
        disabled={!file || loading}
      >
        {loading ? "Uploading..." : "Upload & Parse"}
      </button>
    </section>
  );
}
