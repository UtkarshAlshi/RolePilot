"use client";

import { useMemo } from "react";
import { MissingInfoAlert } from "@/components/onboarding/missing-info-alert";
import { ProfileFieldRow } from "@/components/onboarding/profile-field-row";
import { AcceptExtractedFactsButton } from "@/components/onboarding/accept-extracted-facts-button";

export type ParsedProfileData = {
  resumeId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  confidence?: Record<string, string>;
};

export function ParsedProfileReviewPanel({
  data,
  onChange,
  onAccept,
  isLoading
}: {
  data: ParsedProfileData;
  onChange: (patch: Partial<ParsedProfileData>) => void;
  onAccept: () => void;
  isLoading?: boolean;
}) {
  const missingFields = useMemo(() => {
    const required = ["fullName", "email", "phone", "location"] as const;
    return required.filter((field) => !data[field]);
  }, [data]);

  return (
    <section className="space-y-4 rounded border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Parsed Profile Review</h2>
        <AcceptExtractedFactsButton onClick={onAccept} disabled={!data.resumeId || isLoading} />
      </div>

      <MissingInfoAlert fields={missingFields} />

      <div className="space-y-3">
        <ProfileFieldRow
          label="Full name"
          value={data.fullName}
          confidence={data.confidence?.fullName}
          onChange={(value) => onChange({ fullName: value })}
        />
        <ProfileFieldRow
          label="Email"
          value={data.email}
          confidence={data.confidence?.email}
          onChange={(value) => onChange({ email: value })}
        />
        <ProfileFieldRow
          label="Phone"
          value={data.phone}
          confidence={data.confidence?.phone}
          onChange={(value) => onChange({ phone: value })}
        />
        <ProfileFieldRow
          label="Location"
          value={data.location}
          confidence={data.confidence?.location}
          onChange={(value) => onChange({ location: value })}
        />
      </div>
    </section>
  );
}
