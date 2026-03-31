type Props = {
  label: string;
  value?: string | null;
  confidence?: string;
  onChange: (value: string) => void;
};

export function ProfileFieldRow({ label, value, confidence, onChange }: Props) {
  return (
    <div className="grid grid-cols-[180px_1fr_auto] items-center gap-3">
      <label className="text-sm font-medium">{label}</label>
      <input
        className="rounded border p-2 text-sm"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      <span className="text-xs text-slate-500">{confidence ?? "manual"}</span>
    </div>
  );
}
