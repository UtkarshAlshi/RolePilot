import type { MatchItem } from "@/src/server/types/analysis";

export function NiceToHaveComparisonTable({ items }: { items: MatchItem[] }) {
  return (
    <section className="rounded border bg-white p-4">
      <h3 className="font-semibold">Nice-to-have Comparison</h3>
      <div className="mt-3 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Skill</th>
              <th className="py-2">Matched</th>
              <th className="py-2">Evidence</th>
              <th className="py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name} className="border-t">
                <td className="py-2">{item.name}</td>
                <td className="py-2">{item.matched ? "Yes" : "No"}</td>
                <td className="py-2">{item.evidenceSource ?? "—"}</td>
                <td className="py-2">{item.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
