// src/features/semesters/api/semesterApi.ts
import { request } from "@/lib/request";
import { SemesterEntity } from "@/types/entities";

export type Semester = SemesterEntity;

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api";

// 获取所有学期
export async function fetchSemesters(): Promise<Semester[]> {
  const res = await request(`${API_BASE}/semesters`, {
    method: "GET",
  });
  return res.json();
}

// 添加学期
export async function createSemester(name: string): Promise<Semester> {
  const res = await request(`${API_BASE}/semesters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

// 更新学期
export async function updateSemester(id: string, name: string): Promise<Semester> {
  const res = await request(`${API_BASE}/semesters/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

// 删除学期
export async function deleteSemester(id: string): Promise<void> {
  await request(`${API_BASE}/semesters/${id}`, {
    method: "DELETE",
  });
}
