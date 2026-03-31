"use client";

export function AnswerSectionTabs({
  sections,
  selected,
  onSelect
}: {
  sections: string[];
  selected: string;
  onSelect: (section: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sections.map((section) => (
        <button
          key={section}
          className={`rounded px-3 py-1 text-sm ${selected === section ? "bg-slate-900 text-white" : "border"}`}
          onClick={() => onSelect(section)}
        >
          {section}
        </button>
      ))}
    </div>
  );
}
