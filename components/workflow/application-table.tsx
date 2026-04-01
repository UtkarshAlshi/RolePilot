import Link from "next/link";

type Row = {
  applicationId: string;
  status: string;
  companyName: string | null;
  jobTitle: string | null;
  createdAt: string;
  answerCount: number;
};

export function ApplicationTable({ rows }: { rows: Row[] }) {
  return (
    <section className="rounded border bg-white p-4">
      <h2 className="font-semibold">Saved Applications</h2>
      <table className="mt-3 w-full text-left text-sm">
        <thead>
          <tr className="text-slate-500">
            <th className="py-2">Company</th>
            <th className="py-2">Role</th>
            <th className="py-2">Status</th>
            <th className="py-2">Sections</th>
            <th className="py-2">Created</th>
            <th className="py-2">Open</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.applicationId} className="border-t">
              <td className="py-2">{row.companyName ?? "—"}</td>
              <td className="py-2">{row.jobTitle ?? "—"}</td>
              <td className="py-2">{row.status}</td>
              <td className="py-2">{row.answerCount}</td>
              <td className="py-2">{new Date(row.createdAt).toLocaleDateString()}</td>
              <td className="py-2">
                <Link className="text-blue-600 underline" href={`/applications/${row.applicationId}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
