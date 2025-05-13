// src/features/semesters/hooks/useSemesters.ts
import { useEffect, useState } from "react";
import {
  Semester,
  fetchSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
} from "../api/semesterApi";

export function useSemesters() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSemesters = async () => {
    setLoading(true);
    try {
      const data = await fetchSemesters();
      setSemesters(data);
    } finally {
      setLoading(false);
    }
  };

  const addSemester = async (name: string) => {
    const newSemester = await createSemester(name);
    setSemesters((prev) => [newSemester, ...prev]);
    return newSemester;
  };

  const editSemester = async (id: string, name: string) => {
    const updated = await updateSemester(id, name);
    setSemesters((prev) =>
      prev.map((s) => (s._id === id ? updated : s))
    );
  };

  const removeSemester = async (id: string) => {
    await deleteSemester(id);
    setSemesters((prev) => prev.filter((s) => s._id !== id));
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  return {
    semesters,
    loading,
    addSemester,
    editSemester,
    removeSemester,
  };
}
