// src/lib/request.ts

import { authStorage } from "./authStorage";
import { parseResponseError } from "./errors";

type AuthMode = "cookie" | "token";

interface RequestOptions extends RequestInit {
  authMode?: AuthMode; // 可选传入认证模式
}

// ✅ 后端地址基准值
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api";

// ✅ 判断 input 是否是完整 URL
function isAbsoluteURL(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export async function request(
  input: RequestInfo,
  options: RequestOptions = {}
): Promise<Response> {
  const isBrowser = typeof window !== "undefined";

  const access_token = authStorage.getAccessToken();
  const authMode =
    options.authMode ||
    (isBrowser ? localStorage.getItem("authMode") : "token");

  // 合并 headers（用户传的 + token）
  const finalHeaders: HeadersInit = {
    ...(options.headers || {}),
    ...(authMode === "token" && access_token
      ? { Authorization: `Bearer ${access_token}` }
      : {}),
  };

  const finalOptions: RequestInit = {
    credentials: "include", // 支持 cookie（跨域也带）
    ...options,
    headers: finalHeaders,
  };

  // ✅ 自动补全 API_BASE（仅 input 为 string 且不是绝对路径时）
  let finalInput: RequestInfo;
  if (typeof input === "string" && !isAbsoluteURL(input)) {
    finalInput = `${API_BASE.replace(/\/$/, "")}/${input.replace(/^\//, "")}`;
  } else {
    finalInput = input;
  }

  try {
    const response = await fetch(finalInput, finalOptions);

    // 可以根据实际情况拓展统一错误处理
    if (!response.ok) {
      const errorMsg = await parseResponseError(response); // ✅ 使用封装方法
      throw new Error(errorMsg);
    }

    return response;
  } catch (err) {
    // 统一异常处理
    console.error("[request error]", err);
    throw err;
  }
}
