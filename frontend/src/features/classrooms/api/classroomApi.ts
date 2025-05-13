// src/features/classrooms/api/classroomApi.ts

import { request } from "@/lib/request";
import {
  CreateClassroomPayload,
  UpdateClassroomPayload,
  ClassroomResponse,
} from "@/types/payloads";

// 获取某课程下的所有班级
export async function fetchClassrooms(courseId: string): Promise<ClassroomResponse[]> {
  const res = await request(`/classrooms?courseId=${courseId}`);
  return res.json();
}

// 创建班级（POST /classrooms?courseId=xxx）
export async function createClassroom(courseId: string, payload: CreateClassroomPayload): Promise<ClassroomResponse> {
  const res = await request(`/classrooms?courseId=${courseId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// 修改班级名称
export async function updateClassroom(classroomId: string, payload: UpdateClassroomPayload): Promise<ClassroomResponse> {
  const res = await request(`/classrooms/${classroomId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// 删除班级
export async function deleteClassroom(classroomId: string): Promise<void> {
  await request(`/classrooms/${classroomId}`, {
    method: "DELETE",
  });
}
