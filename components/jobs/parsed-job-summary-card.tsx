export function ParsedJobSummaryCard({
  job
}: {
  job: { title: string | null; companyName: string | null; location: string | null };
}) {
  return (
    <section className="rounded border bg-white p-4">
      <h2 className="font-semibold">Parsed Job Summary</h2>
      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-slate-500">Title</p>
          <p>{job.title ?? "—"}</p>
        </div>
        <div>
          <p className="text-slate-500">Company</p>
          <p>{job.companyName ?? "—"}</p>
        </div>
        <div>
          <p className="text-slate-500">Location</p>
          <p>{job.location ?? "—"}</p>
        </div>
      </div>
    </section>
  );
}
