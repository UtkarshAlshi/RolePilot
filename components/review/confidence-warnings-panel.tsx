type Section = {
  id: string;
  sectionType: string;
  confidence: string;
};

export function ConfidenceWarningsPanel({ sections }: { sections: Section[] }) {
  const low = sections.filter((s) => s.confidence === "LOW");
  const medium = sections.filter((s) => s.confidence === "MEDIUM");

  return (
    <section className="rounded border bg-white p-4">
      <h2 className="font-semibold">Confidence Warnings</h2>
      <p className="mt-2 text-sm">Low confidence sections: {low.length || 0}</p>
      <p className="text-sm">Medium confidence sections: {medium.length || 0}</p>
      {low.length > 0 ? (
        <ul className="mt-2 list-disc pl-5 text-sm text-red-700">
          {low.map((section) => (
            <li key={section.id}>{section.sectionType}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
