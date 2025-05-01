// src/hooks/useAutoRedirect.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/request";
import { authStorage } from "@/lib/authStorage";

export function useAutoRedirect() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      // ✅ 优先用 sessionStorage 中的用户信息
      const user = authStorage.getUserInfo();
      if (user) {
        if (user.role === "teacher") {
          router.replace("/teacher/dashboard");
        } else if (user.role === "student") {
          router.replace("/student/dashboard");
        } else {
          setChecking(false); // 其他角色不跳转
        }
        return;
      }

      // ✅ 如果没有 userInfo，检查 token 是否存在（token 模式自动登录）
      const accessToken = authStorage.getAccessToken();
      const authMode = authStorage.getAuthMode();

      if (!accessToken || authMode !== "token") {
        setChecking(false);
        return;
      }

      try {
        const res = await request("/auth/me", { authMode: "token" });
        const { user } = await res.json();

        authStorage.setUserInfo(user);

        // ✅ 只允许教师自动跳转
        if (user?.role === "teacher") {
          router.replace("/teacher/dashboard");
        } else {
          // ❌ 其他角色不跳转
          setChecking(false);
        }
      } catch (err) {
        console.warn("自动登录失败", err);
        setChecking(false);
      }
    };

    check();
  }, [router]);

  return { checking };
}
