function toList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

export function ParsedJobPanel({ job }: { job: Record<string, unknown> }) {
  const mustHave = toList(job.mustHaveSkills);
  const niceToHave = toList(job.niceToHaveSkills);
  const requirements = toList(job.requirements);
  const responsibilities = toList(job.responsibilities);
  const screeningQs = toList(job.screeningQs);

  return (
    <section className="rounded border bg-white p-4">
      <h2 className="font-semibold">Parsed Job Facts</h2>
      <p className="mt-2 text-sm">{String(job.title ?? "—")} · {String(job.companyName ?? "—")} · {String(job.location ?? "—")}</p>
      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium">Must-have Skills</p>
          <p>{mustHave.join(", ") || "None"}</p>
        </div>
        <div>
          <p className="font-medium">Nice-to-have Skills</p>
          <p>{niceToHave.join(", ") || "None"}</p>
        </div>
        <div>
          <p className="font-medium">Requirements</p>
          <p>{requirements.join("; ") || "None"}</p>
        </div>
        <div>
          <p className="font-medium">Responsibilities</p>
          <p>{responsibilities.join("; ") || "None"}</p>
        </div>
      </div>
      <div className="mt-3 text-sm">
        <p className="font-medium">Screening Questions</p>
        <p>{screeningQs.join("; ") || "None"}</p>
      </div>
    </section>
  );
}
