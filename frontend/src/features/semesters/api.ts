// src/features/semesters/api.ts
import { request } from "@/lib/request";

export interface Semester {
  _id: string;
  name: string;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api";

export async function fetchSemesters(): Promise<Semester[]> {
  const res = await request(`${API_BASE}/semesters`);
  return res.json();
}

export async function createSemester(name: string): Promise<Semester> {
  const res = await request(`${API_BASE}/semesters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function updateSemester(id: string, name: string): Promise<Semester> {
  const res = await request(`${API_BASE}/semesters/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteSemester(id: string): Promise<void> {
  await request(`${API_BASE}/semesters/${id}`, {
    method: "DELETE",
  });
}
