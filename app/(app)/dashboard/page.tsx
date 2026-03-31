"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";

type RecentApplication = {
  applicationId: string;
  status: string;
  companyName: string | null;
  jobTitle: string | null;
};

export default function DashboardPage() {
  const [applications, setApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const response = await fetch("/api/applications?limit=5");
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.error?.message ?? "Failed to load dashboard");
        }

        setApplications(json as RecentApplication[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {applications.length === 0 ? (
        <EmptyState
          title="No saved workflow yet"
          description="Start with job intake and generation, then manage packets from Saved Applications."
        />
      ) : (
        <section className="rounded border bg-white p-4">
          <h2 className="font-semibold">Recent Saved Applications</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {applications.map((app) => (
              <li key={app.applicationId} className="flex items-center justify-between border-b pb-2">
                <span>
                  {app.companyName ?? "—"} · {app.jobTitle ?? "—"} · {app.status}
                </span>
                <Link className="text-blue-600 underline" href={`/applications/${app.applicationId}`}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
          <Link className="mt-3 inline-block text-sm text-blue-600 underline" href="/applications">
            View all saved applications
          </Link>
        </section>
      )}
    </div>
  );
}
