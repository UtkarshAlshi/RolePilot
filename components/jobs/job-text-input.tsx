"use client";

export function JobTextInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Job Description</label>
      <textarea
        className="min-h-48 w-full rounded border p-3 text-sm"
        placeholder="Paste the full job description text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
