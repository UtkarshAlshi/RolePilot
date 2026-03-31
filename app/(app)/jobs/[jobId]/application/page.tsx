"use client";

import { useState } from "react";
import { GenerationControlsCard } from "@/components/generation/generation-controls-card";
import { GenerationPreviewList } from "@/components/generation/generation-preview-list";
import { ErrorState } from "@/components/states/error-state";

type GeneratedAnswer = {
  id: string;
  sectionType: string;
  order: number;
  content: string;
  confidence: string;
  missingInfo: string[] | null;
  factSources: string[] | null;
  isUserEdited: boolean;
};

export default function JobApplicationPage({ params }: { params: { jobId: string } }) {
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [tone, setTone] = useState("professional_concise");
  const [sections, setSections] = useState<string[]>(["COVER_LETTER", "WHY_ROLE", "WHY_COMPANY", "RECRUITER_MESSAGE"]);
  const [answers, setAnswers] = useState<GeneratedAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const { jobId } = params;
      const response = await fetch(`/api/jobs/${jobId}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone, sections })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message ?? "Failed to generate application packet");

      setApplicationId(json.applicationId);
      setAnswers(json.answers);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(answerId: string, content: string) {
    if (!applicationId) return;

    try {
      const response = await fetch(`/api/applications/${applicationId}/answers/${answerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message ?? "Failed to save section edit");

      setAnswers((prev) => prev.map((a) => (a.id === answerId ? { ...a, content, isUserEdited: true } : a)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleRegenerate(sectionType: string) {
    if (!applicationId) return;

    setRegeneratingSection(sectionType);
    setError(null);
    try {
      const response = await fetch(`/api/applications/${applicationId}/regenerate-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionType, tone })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message ?? "Failed to regenerate section");

      setAnswers((prev) => {
        const untouched = prev.filter((a) => a.sectionType !== sectionType);
        return [...untouched, ...json.answers].sort((a, b) => `${a.sectionType}-${a.order}`.localeCompare(`${b.sectionType}-${b.order}`));
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRegeneratingSection(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Application Packet Generation</h1>
      {error ? <ErrorState message={error} /> : null}
      <GenerationControlsCard
        tone={tone}
        sections={sections}
        onToneChange={setTone}
        onSectionsChange={setSections}
        onGenerate={handleGenerate}
        loading={loading}
      />
      <GenerationPreviewList
        answers={answers}
        onEdit={handleEdit}
        onRegenerate={handleRegenerate}
        regeneratingSection={regeneratingSection}
      />
    </div>
  );
}
