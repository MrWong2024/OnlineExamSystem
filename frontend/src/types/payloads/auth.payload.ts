// src/types/payloads/auth.payload.ts
import { CurrentUserPayload } from "@/types/entities";

export interface AuthPayload {
  email: string;
  password: string;
  role: "teacher" | "student";
  autoLogin?: boolean;
}

export type LoginResponse =
  | {
      message: string;
      access_token: string;
      user: CurrentUserPayload;
    }
  | {
      message: string;
      user: CurrentUserPayload;
    };

export type RegisterPayload = Omit<AuthPayload, "autoLogin">;

export function isTokenLoginResponse(
    res: LoginResponse
  ): res is { message: string; access_token: string; user: CurrentUserPayload } {
    return "access_token" in res;
  }
