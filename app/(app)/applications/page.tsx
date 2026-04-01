"use client";

import { useEffect, useState } from "react";
import { ApplicationFilters, ApplicationFilterState } from "@/components/workflow/application-filters";
import { ApplicationTable } from "@/components/workflow/application-table";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";

type ApplicationRow = {
  applicationId: string;
  status: string;
  companyName: string | null;
  jobTitle: string | null;
  createdAt: string;
  answerCount: number;
};

const defaultFilters: ApplicationFilterState = {
  status: "",
  company: "",
  dateFrom: "",
  dateTo: ""
};

export default function ApplicationsPage() {
  const [filters, setFilters] = useState<ApplicationFilterState>(defaultFilters);
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.company) params.set("company", filters.company);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      const response = await fetch(`/api/applications?${params.toString()}`);
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message ?? "Failed to load applications");
      setRows(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingState label="Loading applications..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Saved Applications</h1>
      <ApplicationFilters value={filters} onChange={setFilters} onApply={() => void load()} />
      {rows.length === 0 ? (
        <EmptyState title="No saved applications found" description="Generate an application packet from a job to populate this list." />
      ) : (
        <ApplicationTable rows={rows} />
      )}
    </div>
  );
}
