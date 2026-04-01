"use client";

export function GeneratePacketButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50" onClick={onClick} disabled={loading}>
      {loading ? "Generating..." : "Generate Packet"}
    </button>
  );
}
