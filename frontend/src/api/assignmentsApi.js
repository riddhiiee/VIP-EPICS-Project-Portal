// src/api/assignmentsApi.js

// In-memory mock data (no backend yet)
let ASSIGNMENTS = [
  {
    id: 1,
    title: "Problem Statement & Literature Survey",
    description: "Submit PDF (max 10 pages).",
    dueDate: "2025-02-10T23:59:00Z",
    status: "pending", // "pending" | "submitted" | "blocked" | "late"
    submittedAt: null,
  },
  {
    id: 2,
    title: "Mid-term Progress Report",
    description: "DOCX / PDF.",
    dueDate: "2025-03-05T23:59:00Z",
    status: "blocked", // faculty has not opened it yet
    submittedAt: null,
  },
];

export async function fetchAssignments() {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 300));
  return ASSIGNMENTS;
}

export async function submitAssignment(id, file) {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 500));

  const idx = ASSIGNMENTS.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error("Assignment not found");

  const now = new Date();
  const due = new Date(ASSIGNMENTS[idx].dueDate);
  const isLate = now > due;

  ASSIGNMENTS[idx] = {
    ...ASSIGNMENTS[idx],
    status: isLate ? "late" : "submitted",
    submittedAt: now.toISOString(),
    // later you can send file to Django and store URL/name here
  };

  return ASSIGNMENTS[idx];
}
