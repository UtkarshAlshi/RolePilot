"use client";

export function ToneSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const tones = [
    { value: "professional_concise", label: "Professional concise" },
    { value: "direct", label: "Direct" },
    { value: "warm_professional", label: "Warm professional" }
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tone</label>
      <select className="w-full rounded border p-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {tones.map((tone) => (
          <option key={tone.value} value={tone.value}>
            {tone.label}
          </option>
        ))}
      </select>
    </div>
  );
}
