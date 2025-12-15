// src/pages/Dashboard.jsx
import AssignmentList from "../components/AssignmentList";
import { useAssignments } from "../hooks/useAssignments";

export default function Dashboard() {
  const { items, loading, error, handleSubmit } = useAssignments();

  return (
    <div className="container">
      <h1>VIP‑EPICS Submissions</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p>Loading assignments...</p>
      ) : (
        <AssignmentList assignments={items} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
