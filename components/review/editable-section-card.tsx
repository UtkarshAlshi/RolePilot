"use client";

import { useState } from "react";

type Section = {
  id: string;
  sectionType: string;
  content: string;
  confidence: string;
  missingInfo: string[] | null;
  factSources: string[] | null;
  isUserEdited: boolean;
};

export function EditableSectionCard({
  section,
  onSave,
  onRegenerate,
  regenerating
}: {
  section: Section;
  onSave: (answerId: string, content: string) => Promise<void>;
  onRegenerate: (sectionType: string) => Promise<void>;
  regenerating?: boolean;
}) {
  const [content, setContent] = useState(section.content);
  const [saving, setSaving] = useState(false);
  const [showFacts, setShowFacts] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(section.id, content);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="rounded border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="font-medium">{section.sectionType}</p>
          <p className="text-xs text-slate-500">Confidence: {section.confidence} · {section.isUserEdited ? "User edited" : "AI draft"}</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded border px-2 py-1 text-xs" onClick={() => setShowFacts((v) => !v)}>
            {showFacts ? "Hide facts" : "Show facts"}
          </button>
          <button className="rounded border px-2 py-1 text-xs" onClick={() => onRegenerate(section.sectionType)} disabled={regenerating}>
            {regenerating ? "Regenerating..." : "Regenerate"}
          </button>
        </div>
      </div>

      <textarea className="min-h-28 w-full rounded border p-2 text-sm" value={content} onChange={(e) => setContent(e.target.value)} />
      <div className="mt-2 flex justify-end">
        <button className="rounded bg-slate-900 px-3 py-1 text-xs text-white" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {showFacts ? (
        <div className="mt-2 rounded bg-slate-50 p-2 text-xs">
          <p>Fact sources: {(section.factSources ?? []).join(", ") || "None"}</p>
          <p>Missing info: {(section.missingInfo ?? []).join(", ") || "None"}</p>
        </div>
      ) : null}
    </article>
  );
}
