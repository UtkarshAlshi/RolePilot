"use client";

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

export function GenerationPreviewList({
  answers,
  onEdit,
  onRegenerate,
  regeneratingSection
}: {
  answers: Answer[];
  onEdit: (answerId: string, content: string) => void;
  onRegenerate: (sectionType: string) => void;
  regeneratingSection?: string | null;
}) {
  return (
    <section className="space-y-3 rounded border bg-white p-4">
      <h2 className="font-semibold">Generated Packet Preview</h2>
      {answers.map((answer) => (
        <article key={answer.id} className="rounded border p-3">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{answer.sectionType}</p>
              <p className="text-xs text-slate-500">Confidence: {answer.confidence}</p>
            </div>
            <button
              className="rounded border px-2 py-1 text-xs hover:bg-slate-50"
              onClick={() => onRegenerate(answer.sectionType)}
              disabled={regeneratingSection === answer.sectionType}
            >
              {regeneratingSection === answer.sectionType ? "Regenerating..." : "Regenerate Section"}
            </button>
          </div>
          <textarea
            className="min-h-28 w-full rounded border p-2 text-sm"
            value={answer.content}
            onChange={(e) => onEdit(answer.id, e.target.value)}
          />
          <div className="mt-2 text-xs text-slate-600">
            <p>Missing info: {(answer.missingInfo ?? []).join(", ") || "None"}</p>
            <p>Fact sources: {(answer.factSources ?? []).join(", ") || "None"}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
