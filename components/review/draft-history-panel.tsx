export function DraftHistoryPanel({
  createdAt,
  updatedAt,
  editedCount
}: {
  createdAt: string;
  updatedAt: string;
  editedCount: number;
}) {
  return (
    <section className="rounded border bg-white p-4 text-sm">
      <h2 className="font-semibold">Draft History (Lightweight)</h2>
      <p className="mt-2">Created: {new Date(createdAt).toLocaleString()}</p>
      <p>Last updated: {new Date(updatedAt).toLocaleString()}</p>
      <p>User edited sections: {editedCount}</p>
      <p className="mt-2 text-slate-500">Detailed version timeline is deferred to a later milestone.</p>
    </section>
  );
}
