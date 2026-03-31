"use client";

export type ApplicationFilterState = {
  status: string;
  company: string;
  dateFrom: string;
  dateTo: string;
};

export function ApplicationFilters({
  value,
  onChange,
  onApply
}: {
  value: ApplicationFilterState;
  onChange: (next: ApplicationFilterState) => void;
  onApply: () => void;
}) {
  return (
    <section className="rounded border bg-white p-4">
      <h2 className="font-semibold">Filters</h2>
      <div className="mt-3 grid grid-cols-4 gap-3">
        <select
          className="rounded border p-2 text-sm"
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value })}
        >
          <option value="">All status</option>
          <option value="DRAFT">DRAFT</option>
          <option value="REVIEWED">REVIEWED</option>
          <option value="APPROVED">APPROVED</option>
        </select>
        <input
          className="rounded border p-2 text-sm"
          placeholder="Company"
          value={value.company}
          onChange={(e) => onChange({ ...value, company: e.target.value })}
        />
        <input
          className="rounded border p-2 text-sm"
          type="date"
          value={value.dateFrom}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
        />
        <input
          className="rounded border p-2 text-sm"
          type="date"
          value={value.dateTo}
          onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
        />
      </div>
      <button className="mt-3 rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={onApply}>
        Apply Filters
      </button>
    </section>
  );
}
