"use client";

import { EditableSectionCard } from "@/components/review/editable-section-card";

type Section = {
  id: string;
  sectionType: string;
  content: string;
  confidence: string;
  missingInfo: string[] | null;
  factSources: string[] | null;
  isUserEdited: boolean;
};

export function EditableSectionList({
  sections,
  onSave,
  onRegenerate,
  regeneratingSection
}: {
  sections: Section[];
  onSave: (answerId: string, content: string) => Promise<void>;
  onRegenerate: (sectionType: string) => Promise<void>;
  regeneratingSection: string | null;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Generated Sections</h2>
      {sections.map((section) => (
        <EditableSectionCard
          key={section.id}
          section={section}
          onSave={onSave}
          onRegenerate={onRegenerate}
          regenerating={regeneratingSection === section.sectionType}
        />
      ))}
    </section>
  );
}
