"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { JobSourceSelector } from "@/components/jobs/job-source-selector";
import { JobTextInput } from "@/components/jobs/job-text-input";
import { JobUrlInput } from "@/components/jobs/job-url-input";
import { ParseJobButton } from "@/components/jobs/parse-job-button";
import { ErrorState } from "@/components/states/error-state";

export default function NewJobPage() {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<"TEXT" | "URL">("TEXT");
  const [rawText, setRawText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateAndParse() {
    setLoading(true);
    setError(null);

    try {
      const createRes = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          rawText: sourceType === "TEXT" ? rawText : null,
          sourceUrl: sourceType === "URL" ? sourceUrl : null
        })
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData?.error?.message ?? "Failed to create job");

      const parseRes = await fetch(`/api/jobs/${createData.jobId}/parse`, { method: "POST" });
      const parseData = await parseRes.json();
      if (!parseRes.ok) throw new Error(parseData?.error?.message ?? "Failed to parse job");

      router.push(`/jobs/${createData.jobId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-semibold">New Job Intake</h1>
      {error ? <ErrorState message={error} /> : null}
      <section className="space-y-4 rounded border bg-white p-4">
        <JobSourceSelector value={sourceType} onChange={setSourceType} />
        {sourceType === "TEXT" ? (
          <JobTextInput value={rawText} onChange={setRawText} />
        ) : (
          <JobUrlInput value={sourceUrl} onChange={setSourceUrl} />
        )}
        <ParseJobButton onClick={handleCreateAndParse} loading={loading} />
      </section>
    </div>
  );
}
