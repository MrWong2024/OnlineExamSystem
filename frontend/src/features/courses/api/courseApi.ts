// src/features/courses/api/courseApi.ts

import { request } from "@/lib/request";
import {
  CreateCoursePayload,
  UpdateCoursePayload,
  CourseResponse,
} from "@/types/payloads";

// ✅ 获取某学期下的所有课程
export async function fetchCourses(semesterId: string): Promise<CourseResponse[]> {
  const res = await request(`/courses?semesterId=${semesterId}`);
  return res.json();
}

// ✅ 创建课程（POST /courses?semesterId=xxx）
export async function createCourse(
  semesterId: string,
  payload: CreateCoursePayload
): Promise<CourseResponse> {
  const res = await request(`/courses?semesterId=${semesterId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ✅ 更新课程名称（PUT /courses/:id）
export async function updateCourse(
  courseId: string,
  payload: UpdateCoursePayload
): Promise<CourseResponse> {
  const res = await request(`/courses/${courseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ✅ 删除课程（DELETE /courses/:id）
export async function deleteCourse(courseId: string): Promise<void> {
  await request(`/courses/${courseId}`, {
    method: "DELETE",
  });
}
