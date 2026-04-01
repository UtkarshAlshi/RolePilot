"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { ProfileCompletionForm } from "@/components/profile/profile-completion-form";

export default function ProfilePage() {
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    profile: { fullName?: string; email?: string; location?: string } | null;
  }>({
    loading: true,
    error: null,
    profile: null
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.error?.message ?? "Failed to load profile");
        }

        setState({ loading: false, error: null, profile: json });
      } catch (error) {
        setState({ loading: false, error: (error as Error).message, profile: null });
      }
    }

    void loadProfile();
  }, []);

  if (state.loading) return <LoadingState label="Loading profile..." />;
  if (state.error) return <ErrorState message={state.error} />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile Vault</h1>
      <ProfileCompletionForm initial={state.profile} />
    </div>
  );
}
