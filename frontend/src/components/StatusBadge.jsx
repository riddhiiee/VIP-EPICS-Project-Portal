// src/components/StatusBadge.jsx
const colors = {
  pending: "#f97316",
  submitted: "#22c55e",
  late: "#ef4444",
  blocked: "#6b7280",
};

const labels = {
  pending: "Pending",
  submitted: "Submitted",
  late: "Late",
  blocked: "Blocked",
};

export default function StatusBadge({ status }) {
  const safeStatus = status || "pending";
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: "999px",
        fontSize: "12px",
        color: "white",
        backgroundColor: colors[safeStatus] || "#6b7280",
      }}
    >
      {labels[safeStatus] || safeStatus}
    </span>
  );
}
