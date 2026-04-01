"use client";

export function SkillsBreakdownEditor({
  mustHave,
  niceToHave,
  keywords,
  onChange
}: {
  mustHave: string;
  niceToHave: string;
  keywords: string;
  onChange: (patch: { mustHave?: string; niceToHave?: string; keywords?: string }) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">Must-have Skills</label>
        <textarea className="min-h-24 w-full rounded border p-2 text-sm" value={mustHave} onChange={(e) => onChange({ mustHave: e.target.value })} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Nice-to-have Skills</label>
        <textarea className="min-h-24 w-full rounded border p-2 text-sm" value={niceToHave} onChange={(e) => onChange({ niceToHave: e.target.value })} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Keywords</label>
        <textarea className="min-h-24 w-full rounded border p-2 text-sm" value={keywords} onChange={(e) => onChange({ keywords: e.target.value })} />
      </div>
    </div>
  );
}
