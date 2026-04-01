type Section = {
  id: string;
  sectionType: string;
  missingInfo: string[] | null;
};

export function MissingDataWarningsPanel({ sections }: { sections: Section[] }) {
  const withMissing = sections.filter((s) => (s.missingInfo ?? []).length > 0);

  return (
    <section className="rounded border bg-white p-4">
      <h2 className="font-semibold">Missing Data Warnings</h2>
      {withMissing.length === 0 ? (
        <p className="mt-2 text-sm">No missing data warnings.</p>
      ) : (
        <ul className="mt-2 list-disc pl-5 text-sm text-amber-700">
          {withMissing.map((section) => (
            <li key={section.id}>
              {section.sectionType}: {(section.missingInfo ?? []).join(", ")}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
