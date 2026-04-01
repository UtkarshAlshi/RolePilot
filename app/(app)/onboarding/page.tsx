"use client";

import { useState } from "react";
import { ResumeUploadCard } from "@/components/onboarding/resume-upload-card";
import { ParsedProfileReviewPanel, ParsedProfileData } from "@/components/onboarding/parsed-profile-review-panel";
import { ProfileCompletionForm } from "@/components/profile/profile-completion-form";

export default function OnboardingPage() {
  const [profileData, setProfileData] = useState<ParsedProfileData>({});
  const [isMerging, setIsMerging] = useState(false);

  async function handleAcceptExtractedFacts() {
    if (!profileData.resumeId) return;

    setIsMerging(true);
    try {
      await fetch("/api/profile/merge-from-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: profileData.resumeId })
      });
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Onboarding</h1>
      <ResumeUploadCard
        onUploaded={(resume) => {
          const parsedFacts = (resume.extractedJson?.parsedFacts as Record<string, string> | undefined) ?? {};
          const confidence = (resume.confidenceSummary?.fields as Record<string, string> | undefined) ?? {};

          setProfileData((prev) => ({
            ...prev,
            resumeId: resume.resumeId,
            fullName: parsedFacts.fullName ?? prev.fullName,
            email: parsedFacts.email ?? prev.email,
            phone: parsedFacts.phone ?? prev.phone,
            location: parsedFacts.location ?? prev.location,
            linkedInUrl: parsedFacts.linkedInUrl ?? prev.linkedInUrl,
            githubUrl: parsedFacts.githubUrl ?? prev.githubUrl,
            portfolioUrl: parsedFacts.portfolioUrl ?? prev.portfolioUrl,
            confidence
          }));
        }}
      />
      <ParsedProfileReviewPanel
        data={profileData}
        onChange={(patch) => setProfileData((prev) => ({ ...prev, ...patch }))}
        onAccept={handleAcceptExtractedFacts}
        isLoading={isMerging}
      />
      <ProfileCompletionForm initial={profileData} />
    </div>
  );
}
