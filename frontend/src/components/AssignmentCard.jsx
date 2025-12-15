// src/components/AssignmentCard.jsx
import { useState } from "react";
import StatusBadge from "./StatusBadge";

export default function AssignmentCard({ assignment, onSubmit }) {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uiError, setUiError] = useState("");

  const due = new Date(assignment.dueDate);
  const now = new Date();
  const isPastDue = now > due;
  const blocked = assignment.status === "blocked";

  async function handleSubmitClick() {
    setUiError("");

    if (blocked) {
      setUiError("This submission is currently blocked by faculty.");
      return;
    }

    if (!file) {
      setUiError("Please choose a file to upload.");
      return;
    }

    // UI-level due-date validation only
    if (isPastDue) {
      const ok = window.confirm(
        "Due date is over. Submit anyway and mark as late?"
      );
      if (!ok) return;
    }

    try {
      setSubmitting(true);
      await onSubmit(assignment.id, file);
      setFile(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>{assignment.title}</h3>
        <StatusBadge status={assignment.status} />
      </div>

      <p className="desc">{assignment.description}</p>
      <p className="meta">
        Due:&nbsp;
        {due.toLocaleString()}{" "}
        {isPastDue && assignment.status === "pending" && (
          <span className="meta-warning">(past due)</span>
        )}
      </p>

      {assignment.status === "submitted" || assignment.status === "late" ? (
        <p className="meta-small">
          Submitted at:{" "}
          {assignment.submittedAt
            ? new Date(assignment.submittedAt).toLocaleString()
            : "-"}
        </p>
      ) : (
        <>
          <div className="file-row">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0] || null)}
              disabled={blocked || submitting}
            />
            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={blocked || submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
          {uiError && <p className="error">{uiError}</p>}
        </>
      )}
    </div>
  );
}
