// src/features/courses/hooks/useCourses.ts
import { useEffect, useState, useCallback } from "react";
import * as courseApi from "../api/courseApi";
import {
  CourseResponse,
  CreateCoursePayload,
  UpdateCoursePayload,
} from "@/types/payloads";

export function useCourses(semesterId: string | null) {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // 拉取课程列表
  const fetch = useCallback(async () => {
    if (!semesterId) return;
    setLoading(true);
    try {
      const data = await courseApi.fetchCourses(semesterId);
      setCourses(data);
    } finally {
      setLoading(false);
    }
  }, [semesterId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // 添加课程
  const addCourse = async (name: string) => {
    if (!semesterId) return;
    const payload: CreateCoursePayload = { name };
    const newCourse = await courseApi.createCourse(semesterId, payload);
    setCourses((prev) => [newCourse, ...prev]);
    return newCourse;
  };

  // 编辑课程
  const editCourse = async (courseId: string, name: string) => {
    const payload: UpdateCoursePayload = { name };
    const updated = await courseApi.updateCourse(courseId, payload);
    setCourses((prev) =>
      prev.map((c) => (c._id === courseId ? updated : c))
    );
  };

  // 删除课程
  const removeCourse = async (courseId: string) => {
    await courseApi.deleteCourse(courseId);
    setCourses((prev) => prev.filter((c) => c._id !== courseId));
  };

  return {
    courses,
    loading,
    addCourse,
    editCourse,
    removeCourse,
    refresh: fetch,
  };
}
