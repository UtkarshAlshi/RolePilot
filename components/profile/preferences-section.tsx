"use client";

type Props = {
  preferredRoles: string;
  preferredLocations: string;
  onChange: (patch: { preferredRoles?: string; preferredLocations?: string }) => void;
};

export function PreferencesSection({ preferredRoles, preferredLocations, onChange }: Props) {
  return (
    <section className="space-y-3">
      <h3 className="font-medium">Preferences</h3>
      <input
        className="w-full rounded border p-2 text-sm"
        placeholder="Preferred roles (comma separated)"
        value={preferredRoles}
        onChange={(e) => onChange({ preferredRoles: e.target.value })}
      />
      <input
        className="w-full rounded border p-2 text-sm"
        placeholder="Preferred locations (comma separated)"
        value={preferredLocations}
        onChange={(e) => onChange({ preferredLocations: e.target.value })}
      />
    </section>
  );
}
