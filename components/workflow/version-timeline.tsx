export function VersionTimeline({
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
      <h2 className="font-semibold">Version Timeline (Lightweight)</h2>
      <ul className="mt-2 list-disc pl-5">
        <li>Draft created: {new Date(createdAt).toLocaleString()}</li>
        <li>Latest update: {new Date(updatedAt).toLocaleString()}</li>
        <li>User-edited sections: {editedCount}</li>
      </ul>
      <p className="mt-2 text-slate-500">Detailed diff history remains deferred.</p>
    </section>
  );
}
