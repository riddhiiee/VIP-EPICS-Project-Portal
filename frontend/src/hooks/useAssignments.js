// src/hooks/useAssignments.js
import { useEffect, useState } from "react";
import { fetchAssignments, submitAssignment } from "../api/assignmentsApi";

export function useAssignments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAssignments();
        setItems(data);
      } catch (e) {
        console.error(e);
        setError("Could not load assignments.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(id, file) {
    try {
      setError("");
      const updated = await submitAssignment(id, file);
      setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      console.error(e);
      setError("Submission failed. Please try again.");
    }
  }

  return { items, loading, error, handleSubmit };
}
