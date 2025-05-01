// src/features/auth/hooks/useAuthGuard.ts

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/request";
import { authStorage } from "@/lib/authStorage";
import { CurrentUserPayload } from "@/types/entities";

export function useAuthGuard(requiredRole: "teacher" | "student" | "admin") {
  const router = useRouter();
  // Hook 的状态归调用它的组件所有，只要组件调用了 Hook，Hook 里的 useState/useReducer 状态就注册在调用它的组件身上，然后 setState() 触发时，会让这个组件函数重新执行一次。
  const [user, setUser] = useState<CurrentUserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const storedUser = authStorage.getUserInfo();

      if (storedUser) {
        if (storedUser.role === requiredRole) {
          setUser(storedUser);
        } else {
          router.replace("/"); // 跳回首页或403
        }
        setLoading(false);
        return;
      }

      const token = authStorage.getAccessToken();
      const mode = authStorage.getAuthMode();

      if (!token || mode !== "token") {
        router.replace("/"); // 未登录，跳回首页
        return;
      }

      try {
        const res = await request("/auth/me", { authMode: "token" });
        const { user } = await res.json();

        authStorage.setUserInfo(user);

        if (user.role === requiredRole) {
          setUser(user);
        } else {
          router.replace("/");
        }
      } catch (err) {
        console.warn("鉴权失败", err);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [requiredRole, router]);

  return { user, loading };
}
