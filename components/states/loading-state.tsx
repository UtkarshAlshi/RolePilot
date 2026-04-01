export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return <div className="rounded border bg-white p-4 text-sm text-slate-600">{label}</div>;
}
