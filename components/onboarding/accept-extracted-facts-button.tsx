"use client";

export function AcceptExtractedFactsButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50" onClick={onClick} disabled={disabled}>
      Accept Extracted Facts
    </button>
  );
}
