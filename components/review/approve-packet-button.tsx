"use client";

export function ApprovePacketButton({ onClick, loading, status }: { onClick: () => void; loading?: boolean; status: string }) {
  return (
    <button
      className="rounded bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
      onClick={onClick}
      disabled={loading || status === "APPROVED"}
    >
      {status === "APPROVED" ? "Approved" : loading ? "Approving..." : "Approve Packet"}
    </button>
  );
}
