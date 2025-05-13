// src/features/classrooms/hooks/useClassrooms.ts

import { useEffect, useState, useCallback } from "react";
import * as classroomApi from "../api/classroomApi";
import {
  ClassroomResponse,
  CreateClassroomPayload,
  UpdateClassroomPayload,
} from "@/types/payloads";

export function useClassrooms(courseId: string | null) {
  const [classrooms, setClassrooms] = useState<ClassroomResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const data = await classroomApi.fetchClassrooms(courseId);
      setClassrooms(data);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addClassroom = async (name: string) => {
    if (!courseId) return;
    const payload: CreateClassroomPayload = { name };
    const newClassroom = await classroomApi.createClassroom(courseId, payload);
    setClassrooms((prev) => [newClassroom, ...prev]);
    return newClassroom;
  };

  const editClassroom = async (id: string, name: string) => {
    const payload: UpdateClassroomPayload = { name };
    const updated = await classroomApi.updateClassroom(id, payload);
    setClassrooms((prev) => prev.map((c) => (c._id === id ? updated : c)));
  };

  const removeClassroom = async (id: string) => {
    await classroomApi.deleteClassroom(id);
    setClassrooms((prev) => prev.filter((c) => c._id !== id));
  };

  return {
    classrooms,
    loading,
    addClassroom,
    editClassroom,
    removeClassroom,
    refresh: fetch,
  };
}
