// src/lib/errors.ts

/**
 * 安全地提取错误信息（适用于任何 try/catch 错误）
 */
export function getErrorMessage(error: unknown, fallback = "发生未知错误") {
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    return fallback;
  }
  
  /**
   * 从 fetch Response 中解析错误信息
   * - 优先解析 JSON 中的 { message }
   * - 其次 fallback 到 text
   */
  export async function parseResponseError(response: Response): Promise<string> {
    try {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await response.json();
        return json.message || JSON.stringify(json);
      }
      const text = await response.text();
      return text || `请求失败（状态码：${response.status}）`;
    } catch {
      return `请求失败（状态码：${response.status}）`;
    }
  }
  