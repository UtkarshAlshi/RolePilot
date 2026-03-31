"use client";

import { ToneSelector } from "@/components/generation/tone-selector";
import { SectionSelector } from "@/components/generation/section-selector";
import { GeneratePacketButton } from "@/components/generation/generate-packet-button";

export function GenerationControlsCard({
  tone,
  sections,
  onToneChange,
  onSectionsChange,
  onGenerate,
  loading
}: {
  tone: string;
  sections: string[];
  onToneChange: (value: string) => void;
  onSectionsChange: (value: string[]) => void;
  onGenerate: () => void;
  loading?: boolean;
}) {
  return (
    <section className="space-y-4 rounded border bg-white p-4">
      <h2 className="font-semibold">Generation Controls</h2>
      <ToneSelector value={tone} onChange={onToneChange} />
      <SectionSelector value={sections} onChange={onSectionsChange} />
      <GeneratePacketButton onClick={onGenerate} loading={loading} />
    </section>
  );
}
