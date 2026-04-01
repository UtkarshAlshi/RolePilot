"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ParsedJobSummaryCard } from "@/components/jobs/parsed-job-summary-card";
import { RequirementsEditor } from "@/components/jobs/requirements-editor";
import { ResponsibilitiesEditor } from "@/components/jobs/responsibilities-editor";
import { SkillsBreakdownEditor } from "@/components/jobs/skills-breakdown-editor";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";

type JobPayload = {
  id: string;
  title: string | null;
  companyName: string | null;
  location: string | null;
  requirements: string[] | null;
  responsibilities: string[] | null;
  mustHaveSkills: string[] | null;
  niceToHaveSkills: string[] | null;
  keywords: string[] | null;
};

export default function JobDetailsPage({ params }: { params: { jobId: string } }) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    requirements: "",
    responsibilities: "",
    mustHaveSkills: "",
    niceToHaveSkills: "",
    keywords: ""
  });

  useEffect(() => {
    async function init() {
      const resolved = params;
      setJobId(resolved.jobId);
      try {
        const response = await fetch(`/api/jobs/${resolved.jobId}`);
        const json = await response.json();

        if (!response.ok) throw new Error(json?.error?.message ?? "Failed to load job");

        setJob(json);
        setForm({
          requirements: (json.requirements ?? []).join("\n"),
          responsibilities: (json.responsibilities ?? []).join("\n"),
          mustHaveSkills: (json.mustHaveSkills ?? []).join("\n"),
          niceToHaveSkills: (json.niceToHaveSkills ?? []).join("\n"),
          keywords: (json.keywords ?? []).join("\n")
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, [params.jobId]);

  async function handleSave() {
    if (!jobId) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements: form.requirements.split("\n").map((v) => v.trim()).filter(Boolean),
          responsibilities: form.responsibilities.split("\n").map((v) => v.trim()).filter(Boolean),
          mustHaveSkills: form.mustHaveSkills.split("\n").map((v) => v.trim()).filter(Boolean),
          niceToHaveSkills: form.niceToHaveSkills.split("\n").map((v) => v.trim()).filter(Boolean),
          keywords: form.keywords.split("\n").map((v) => v.trim()).filter(Boolean)
        })
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message ?? "Failed to save job");
      setJob(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading job..." />;
  if (error) return <ErrorState message={error} />;
  if (!job) return <ErrorState message="Job not found" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Job Details</h1>
        {jobId ? (
          <div className="flex gap-2">
            <Link href={`/jobs/${jobId}/analysis`} className="rounded border px-3 py-2 text-sm hover:bg-slate-100">
              View Fit Analysis
            </Link>
            <Link href={`/jobs/${jobId}/application`} className="rounded border px-3 py-2 text-sm hover:bg-slate-100">
              Generate Packet
            </Link>
            <Link href={`/jobs/${jobId}/review`} className="rounded border px-3 py-2 text-sm hover:bg-slate-100">
              Review Workspace
            </Link>
          </div>
        ) : null}
      </div>
      <ParsedJobSummaryCard job={job} />
      <section className="space-y-4 rounded border bg-white p-4">
        <RequirementsEditor value={form.requirements} onChange={(value) => setForm((prev) => ({ ...prev, requirements: value }))} />
        <ResponsibilitiesEditor
          value={form.responsibilities}
          onChange={(value) => setForm((prev) => ({ ...prev, responsibilities: value }))}
        />
        <SkillsBreakdownEditor
          mustHave={form.mustHaveSkills}
          niceToHave={form.niceToHaveSkills}
          keywords={form.keywords}
          onChange={(patch) =>
            setForm((prev) => ({
              ...prev,
              ...(patch.mustHave !== undefined ? { mustHaveSkills: patch.mustHave } : {}),
              ...(patch.niceToHave !== undefined ? { niceToHaveSkills: patch.niceToHave } : {}),
              ...(patch.keywords !== undefined ? { keywords: patch.keywords } : {})
            }))
          }
        />
        <SaveJobButton onClick={handleSave} loading={saving} />
      </section>
    </div>
  );
}
