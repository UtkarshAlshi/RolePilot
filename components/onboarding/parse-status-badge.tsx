import { ResumeParseStatus } from "@prisma/client";

const statusStyles: Record<ResumeParseStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700"
};

export function ParseStatusBadge({ status }: { status: ResumeParseStatus }) {
  return <span className={`rounded px-2 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span>;
}
