export function ReasoningPanel({ reasoning }: { reasoning: string }) {
  return (
    <section className="rounded border bg-white p-4">
      <h3 className="font-semibold">Reasoning</h3>
      <p className="mt-2 text-sm text-slate-700">{reasoning}</p>
    </section>
  );
}
