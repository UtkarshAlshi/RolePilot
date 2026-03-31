"use client";

import { useEffect, useMemo, useState } from "react";
import { ApplicationHeader } from "@/components/workflow/application-header";
import { AnswerSectionTabs } from "@/components/workflow/answer-section-tabs";
import { EditableSectionList } from "@/components/review/editable-section-list";
import { VersionTimeline } from "@/components/workflow/version-timeline";
import { ExportActions } from "@/components/workflow/export-actions";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";

type Answer = {
  id: string;
  sectionType: string;
  order: number;
  content: string;
  confidence: string;
  missingInfo: string[] | null;
  factSources: string[] | null;
  isUserEdited: boolean;
};

type DetailData = {
  applicationId: string;
  status: string;
  tone: string | null;
  jobId: string;
  createdAt: string;
  updatedAt: string;
  job: { title: string | null; companyName: string | null; location: string | null };
  answers: Answer[];
};

export default function ApplicationDetailPage({ params }: { params: { applicationId: string } }) {
  const [data, setData] = useState<DetailData | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { applicationId } = params;
      try {
        const response = await fetch(`/api/applications/${applicationId}`);
        const json = await response.json();
        if (!response.ok) throw new Error(json?.error?.message ?? "Failed to load application");
        setData(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [params.applicationId]);

  const sectionOptions = useMemo(() => {
    if (!data) return ["ALL"];
    return ["ALL", ...Array.from(new Set(data.answers.map((a) => a.sectionType)))];
  }, [data]);

  async function handleSave(answerId: string, content: string) {
    if (!data) return;

    await fetch(`/api/applications/${data.applicationId}/answers/${answerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    setData((prev) =>
      prev
        ? {
            ...prev,
            answers: prev.answers.map((a) => (a.id === answerId ? { ...a, content, isUserEdited: true } : a)),
            updatedAt: new Date().toISOString()
          }
        : prev
    );
  }

  async function handleRegenerate(sectionType: string) {
    if (!data) return;

    setRegeneratingSection(sectionType);
    try {
      const response = await fetch(`/api/applications/${data.applicationId}/regenerate-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionType, tone: data.tone ?? "professional_concise" })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message ?? "Failed to regenerate section");

      setData((prev) => {
        if (!prev) return prev;
        const untouched = prev.answers.filter((a) => a.sectionType !== sectionType);
        return {
          ...prev,
          answers: [...untouched, ...json.answers].sort((a, b) => `${a.sectionType}-${a.order}`.localeCompare(`${b.sectionType}-${b.order}`)),
          updatedAt: new Date().toISOString()
        };
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRegeneratingSection(null);
    }
  }

  if (loading) return <LoadingState label="Loading application details..." />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <ErrorState message="Application not found" />;

  const filteredAnswers =
    selectedSection === "ALL" ? data.answers : data.answers.filter((answer) => answer.sectionType === selectedSection);

  return (
    <div className="space-y-4">
      <ApplicationHeader
        status={data.status}
        company={data.job.companyName}
        title={data.job.title}
        tone={data.tone}
        createdAt={data.createdAt}
      />

      <AnswerSectionTabs sections={sectionOptions} selected={selectedSection} onSelect={setSelectedSection} />

      <EditableSectionList
        sections={filteredAnswers}
        onSave={handleSave}
        onRegenerate={handleRegenerate}
        regeneratingSection={regeneratingSection}
      />

      <VersionTimeline
        createdAt={data.createdAt}
        updatedAt={data.updatedAt}
        editedCount={data.answers.filter((a) => a.isUserEdited).length}
      />

      <ExportActions />
    </div>
  );
}
