export function GapList({ items }: { items: string[] }) {
  return (
    <section className="rounded border bg-white p-4">
      <h3 className="font-semibold">Gaps</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>No major gaps identified.</li>}
      </ul>
    </section>
  );
}
