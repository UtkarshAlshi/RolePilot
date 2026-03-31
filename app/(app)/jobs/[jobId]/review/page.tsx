"use client";

import { useEffect, useState } from "react";
import { FactsUsedPanel } from "@/components/review/facts-used-panel";
import { ParsedJobPanel } from "@/components/review/parsed-job-panel";
import { ConfidenceWarningsPanel } from "@/components/review/confidence-warnings-panel";
import { MissingDataWarningsPanel } from "@/components/review/missing-data-warnings-panel";
import { EditableSectionList } from "@/components/review/editable-section-list";
import { DraftHistoryPanel } from "@/components/review/draft-history-panel";
import { ApprovePacketButton } from "@/components/review/approve-packet-button";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";

type WorkspaceData = {
  applicationId: string;
  status: string;
  tone: string;
  createdAt: string;
  updatedAt: string;
  job: Record<string, unknown>;
  profile: {
    fullName?: string | null;
    email?: string | null;
    location?: string | null;
    skills: string[];
    experiences: Array<{ title: string; company: string }>;
    projects: Array<{ name: string; role?: string | null }>;
  };
  answers: Array<{
    id: string;
    sectionType: string;
    order: number;
    content: string;
    confidence: string;
    missingInfo: string[] | null;
    factSources: string[] | null;
    isUserEdited: boolean;
    updatedAt: string;
  }>;
};

export default function ReviewPage({ params }: { params: { jobId: string } }) {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { jobId } = params;
      try {
        const response = await fetch(`/api/jobs/${jobId}/applications/latest`);
        const json = await response.json();
        if (!response.ok) throw new Error(json?.error?.message ?? "Failed to load review workspace");
        setWorkspace(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [params.jobId]);

  async function handleSave(answerId: string, content: string) {
    if (!workspace) return;

    try {
      const response = await fetch(`/api/applications/${workspace.applicationId}/answers/${answerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message ?? "Failed to save section edit");

      setWorkspace((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: prev.answers.map((a) => (a.id === answerId ? { ...a, content, isUserEdited: true } : a)),
          updatedAt: new Date().toISOString()
        };
      });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleRegenerate(sectionType: string) {
    if (!workspace) return;

    setRegeneratingSection(sectionType);
    try {
      const response = await fetch(`/api/applications/${workspace.applicationId}/regenerate-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionType, tone: workspace.tone })
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message ?? "Failed to regenerate section");

      setWorkspace((prev) => {
        if (!prev) return prev;
        const untouched = prev.answers.filter((a) => a.sectionType !== sectionType);
        return {
          ...prev,
          answers: [...untouched, ...json.answers].sort((a, b) =>
            `${a.sectionType}-${a.order}`.localeCompare(`${b.sectionType}-${b.order}`)
          ),
          updatedAt: new Date().toISOString()
        };
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRegeneratingSection(null);
    }
  }

  async function handleApprove() {
    if (!workspace) return;

    setApproving(true);
    try {
      const response = await fetch(`/api/applications/${workspace.applicationId}/approve`, { method: "POST" });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message ?? "Failed to approve packet");

      setWorkspace((prev) => (prev ? { ...prev, status: json.status } : prev));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setApproving(false);
    }
  }

  if (loading) return <LoadingState label="Loading review workspace..." />;
  if (error) return <ErrorState message={error} />;
  if (!workspace) return <ErrorState message="No review workspace available" />;

  const editedCount = workspace.answers.filter((a) => a.isUserEdited).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Review Workspace</h1>
        <ApprovePacketButton onClick={handleApprove} loading={approving} status={workspace.status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ParsedJobPanel job={workspace.job} />
        <FactsUsedPanel profile={workspace.profile} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ConfidenceWarningsPanel sections={workspace.answers} />
        <MissingDataWarningsPanel sections={workspace.answers} />
      </div>

      <EditableSectionList
        sections={workspace.answers}
        onSave={handleSave}
        onRegenerate={handleRegenerate}
        regeneratingSection={regeneratingSection}
      />

      <DraftHistoryPanel createdAt={workspace.createdAt} updatedAt={workspace.updatedAt} editedCount={editedCount} />
    </div>
  );
}
