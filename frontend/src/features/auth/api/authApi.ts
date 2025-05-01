// src/features/auth/api/authApi.ts

import { request } from "@/lib/request";
import { AuthPayload, LoginResponse, RegisterPayload } from "@/types/payloads";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api";

export async function login(payload: AuthPayload): Promise<LoginResponse> {
  const res = await request(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function register(payload: RegisterPayload) {
  const res = await request(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function refreshToken(): Promise<{ access_token?: string }> {
  const res = await request(`${API_BASE}/auth/refresh-token`, {
    method: "GET",
  });

  const data = await res.json();
  return {
    access_token: data.access_token ?? undefined,
  };
}

// 修改当前登录用户密码
export async function changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await request(`/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return res.json();
}
