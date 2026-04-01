"use client";

export function ResponsibilitiesEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Responsibilities (one per line)</label>
      <textarea className="min-h-28 w-full rounded border p-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
