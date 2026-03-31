"use client";

export function JobUrlInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Job URL</label>
      <input
        className="w-full rounded border p-2 text-sm"
        placeholder="https://company.com/jobs/software-engineer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
