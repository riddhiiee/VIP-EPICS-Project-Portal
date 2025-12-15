// src/components/AssignmentList.jsx
import AssignmentCard from "./AssignmentCard";

export default function AssignmentList({ assignments, onSubmit }) {
  if (!assignments || !assignments.length) {
    return <p>No assignments assigned yet.</p>;
  }

  return (
    <div className="grid">
      {assignments.map((a) => (
        <AssignmentCard key={a.id} assignment={a} onSubmit={onSubmit} />
      ))}
    </div>
  );
}
