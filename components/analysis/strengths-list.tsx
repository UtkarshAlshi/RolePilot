export function StrengthsList({ items }: { items: string[] }) {
  return (
    <section className="rounded border bg-white p-4">
      <h3 className="font-semibold">Strengths</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
