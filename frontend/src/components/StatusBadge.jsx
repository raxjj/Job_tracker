import { STATUS_META } from "../statusConfig";

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: "var(--accent)" };
  return (
    <span className="status-badge" style={{ "--badge-color": meta.color }}>
      {meta.label}
    </span>
  );
}
