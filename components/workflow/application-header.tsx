export function ApplicationHeader({
  status,
  company,
  title,
  tone,
  createdAt
}: {
  status: string;
  company?: string | null;
  title?: string | null;
  tone?: string | null;
  createdAt: string;
}) {
  return (
    <section className="rounded border bg-white p-4 text-sm">
      <h1 className="text-xl font-semibold">Application Packet</h1>
      <p className="mt-2">{company ?? "—"} · {title ?? "—"}</p>
      <p>Status: {status}</p>
      <p>Tone: {tone ?? "—"}</p>
      <p>Created: {new Date(createdAt).toLocaleString()}</p>
    </section>
  );
}
