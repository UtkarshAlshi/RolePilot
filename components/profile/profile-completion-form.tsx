"use client";

import { useState } from "react";
import { PreferencesSection } from "@/components/profile/preferences-section";
import { TargetRolesSection } from "@/components/profile/target-roles-section";
import { SaveProfileButton } from "@/components/profile/save-profile-button";

export function ProfileCompletionForm({ initial }: { initial?: { fullName?: string; email?: string; location?: string } }) {
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? "",
    email: initial?.email ?? "",
    phone: "",
    location: initial?.location ?? "",
    preferredRoles: "",
    preferredLocations: ""
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);

    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          location: form.location
        })
      });

      await fetch("/api/profile/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredRoles: form.preferredRoles
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
          preferredLocations: form.preferredLocations
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
        })
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded border bg-white p-4">
      <h2 className="font-semibold">Profile Completion</h2>
      <div className="grid grid-cols-2 gap-3">
        <input
          className="rounded border p-2 text-sm"
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
        />
        <input
          className="rounded border p-2 text-sm"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <input
          className="rounded border p-2 text-sm"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        />
        <input
          className="rounded border p-2 text-sm"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
        />
      </div>

      <PreferencesSection
        preferredRoles={form.preferredRoles}
        preferredLocations={form.preferredLocations}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
      />

      <TargetRolesSection
        value={form.preferredRoles}
        onChange={(value) => setForm((prev) => ({ ...prev, preferredRoles: value }))}
      />

      <SaveProfileButton onClick={handleSave} loading={saving} />
    </section>
  );
}
