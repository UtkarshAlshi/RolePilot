"use client";

export function JobSourceSelector({
  value,
  onChange
}: {
  value: "TEXT" | "URL";
  onChange: (value: "TEXT" | "URL") => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Job Source</label>
      <select
        className="w-full rounded border p-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value as "TEXT" | "URL")}
      >
        <option value="TEXT">Paste JD Text</option>
        <option value="URL">Job URL</option>
      </select>
    </div>
  );
}
