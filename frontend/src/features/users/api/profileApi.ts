// src/features/users/api/profileApi.ts
import { request } from "@/lib/request";
import { UpdateUserPayload, UpdateUserResponse } from "@/types/payloads";
import { UserProfile } from "@/types/entities";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api";

// ✅ 当前用户更新自己的资料
export async function updateMyProfile(
  payload: UpdateUserPayload
): Promise<UpdateUserResponse> {
  const res = await request(`${API_BASE}/users/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ✅ 管理员更新指定用户资料
export async function updateUserProfile(
  userId: string,
  payload: UpdateUserPayload
): Promise<UpdateUserResponse> {
  const res = await request(`${API_BASE}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// 获取当前登录用户自己的资料
export async function getMyProfile(): Promise<UserProfile> {
  const res = await request(`${API_BASE}/users/me`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return await res.json();
}

// 管理员获取指定用户的资料
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const res = await request(`${API_BASE}/users/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return await res.json();
}