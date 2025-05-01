// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAutoRedirect } from "@/hooks/useAutoRedirect";
import { useRouter } from "next/navigation";
import { login, register } from "@/features/auth/";
import { authStorage } from "@/lib/authStorage";
import { isTokenLoginResponse } from "@/types/payloads";

export default function HomePage() {
  const { checking } = useAutoRedirect();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedRole = authStorage.getSelectedRole();
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");

    const isTeacher = role === "teacher";
    const isStudent = role === "student";

    const payload = { email: email.trim().toLowerCase(), password, role };

    const noAutoLogin = authStorage.getNoAutoLogin();
    const hasAccessToken = !!authStorage.getAccessToken();
    const isFirstTimeTeacherLogin =
      isTeacher && !noAutoLogin && !hasAccessToken;

    try {
      // 注册流程
      if (!isLogin) {
        await register(payload);
        alert("注册成功，请登录！");
        setIsLogin(true);
        return;
      }

      // 登录流程，默认使用 cookie 模式，适用于学生 & 教师首次登录或拒绝自动登录
      const loginResult = await login({
        ...payload,
        autoLogin: false,
      });

      authStorage.setUserInfo(loginResult.user);
      authStorage.setAuthMode("cookie");

      if (isStudent) {
        router.push("/student/dashboard");
        return;
      }

      if (isFirstTimeTeacherLogin) {
        const confirm = window.confirm("是否保留登录信息，以便下次自动登录？");
        if (confirm) {
          const tokenRes = await login({ ...payload, autoLogin: true });
          if (isTokenLoginResponse(tokenRes)) {
            authStorage.setAccessToken(tokenRes.access_token);
            authStorage.setAuthMode("token");
          } else {
            console.warn("后端未返回 token，无法开启自动登录");
          }
        } else {
          authStorage.setNoAutoLogin(true);
        }
      }

      router.push("/teacher/dashboard");
    } catch (err) {
      console.error("登录/注册失败", err);
      setErrorMsg(err instanceof Error ? err.message : "发生异常");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        正在自动登录，请稍候...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4 font-sans">
      {/* 标题 */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          智能化软件工程实践教学平台
        </h1>
        <p className="mt-2 text-gray-500">教师与学生入口</p>
      </header>

      {/* 登录卡片 */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl ring-1 ring-gray-200 transition-all duration-300">
        {/* 登录/注册标题 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? "登录" : "注册"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isLogin ? "请输入账号信息以登录" : "请填写信息以注册"}
          </p>
        </div>

        {/* 角色选择 */}
        <div className="mt-6 flex justify-center space-x-4">
          {["teacher", "student"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r as "teacher" | "student");
                authStorage.setSelectedRole(r as "teacher" | "student"); // 保存用户选择
              }}
              className={`px-4 py-2 rounded-full transition-all duration-150 ${
                role === r
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r === "teacher" ? "教师" : "学生"}
            </button>
          ))}
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="mt-8">
          <input type="hidden" name="role" value={role} />
          <div className="rounded-md shadow-sm space-y-3 relative">
            <div>
              <label htmlFor="email" className="sr-only">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-t-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                />

                {/* 👁️ 图标按钮 */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="切换密码可见性"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 错误提示：绝对定位 */}
            {errorMsg && (
              <div className="absolute inset-x-0 top-full mt-2 text-center text-red-600 animate-fade-in text-sm">
                {errorMsg}
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className={"mt-[40px]"}>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isLogin
                  ? "登录中..."
                  : "注册中..."
                : isLogin
                ? "登录"
                : "注册"}
            </button>
          </div>
        </form>

        {/* 登录注册切换 */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin ? "没有账号？立即注册" : "已有账号？请登录"}
          </button>
        </div>
      </div>

      {/* 管理员入口 */}
      <footer className="mt-8">
        <a
          href="/admin-login"
          className="text-sm text-gray-400 hover:text-gray-600 transition"
        >
          管理员登录
        </a>
      </footer>

      {/* 错误信息动效 */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
