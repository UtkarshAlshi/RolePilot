"use client";

export function SaveProfileButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50" onClick={onClick} disabled={loading}>
      {loading ? "Saving..." : "Save Profile"}
    </button>
  );
}
