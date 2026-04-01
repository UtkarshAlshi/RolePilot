"use client";

export function TargetRolesSection({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <section className="space-y-2">
      <h3 className="font-medium">Target Roles</h3>
      <input
        className="w-full rounded border p-2 text-sm"
        placeholder="Ex: Frontend Engineer, Fullstack Engineer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </section>
  );
}
