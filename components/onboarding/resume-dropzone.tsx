"use client";

import { ChangeEvent } from "react";

export function ResumeDropzone({ onFileSelect }: { onFileSelect: (file: File | null) => void }) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    onFileSelect(file);
  }

  return (
    <label className="block rounded border border-dashed bg-slate-50 p-4">
      <span className="text-sm">Upload resume (PDF)</span>
      <input className="mt-2 block" type="file" accept="application/pdf" onChange={handleChange} />
    </label>
  );
}
