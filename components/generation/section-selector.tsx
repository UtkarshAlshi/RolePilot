"use client";

const sectionOptions = [
  { value: "COVER_LETTER", label: "Cover letter" },
  { value: "WHY_ROLE", label: "Why role" },
  { value: "WHY_COMPANY", label: "Why company" },
  { value: "RECRUITER_MESSAGE", label: "Recruiter message" },
  { value: "SHORT_ANSWER", label: "Short answers" }
] as const;

export function SectionSelector({
  value,
  onChange
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(section: string) {
    if (value.includes(section)) {
      onChange(value.filter((v) => v !== section));
    } else {
      onChange([...value, section]);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Sections</p>
      <div className="grid grid-cols-2 gap-2">
        {sectionOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-2 rounded border p-2 text-sm">
            <input type="checkbox" checked={value.includes(option.value)} onChange={() => toggle(option.value)} />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
