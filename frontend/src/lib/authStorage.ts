// src/lib/authStorage.ts
import { getLocal, getSession } from "./storage";
import { CurrentUserPayload } from "@/types/entities";

const KEY_ACCESS_TOKEN = "access_token";
const KEY_AUTH_MODE = "authMode";
const KEY_NO_AUTO_LOGIN = "noAutoLogin";
const KEY_SELECTED_ROLE = "selectedRole";
const KEY_USER_INFO = "user_info";

export const authStorage = {
  // 获取访问令牌
  getAccessToken(): string | null {
    return getLocal().get(KEY_ACCESS_TOKEN);
  },

  // 设置访问令牌
  setAccessToken(token: string) {
    getLocal().set(KEY_ACCESS_TOKEN, token);
  },

  // 清除认证相关数据
  clearAuth() {
    getLocal().remove(KEY_ACCESS_TOKEN);
    getLocal().remove(KEY_AUTH_MODE);
    getLocal().remove(KEY_NO_AUTO_LOGIN);
  },

  // 获取认证模式
  getAuthMode(): string | null {
    return getLocal().get(KEY_AUTH_MODE);
  },

  // 设置认证模式
  setAuthMode(mode: string) {
    getLocal().set(KEY_AUTH_MODE, mode);
  },

  // 获取是否启用自动登录
  getNoAutoLogin(): boolean {
    return getLocal().get(KEY_NO_AUTO_LOGIN) === "true";
  },

  // 设置是否启用自动登录
  setNoAutoLogin(value: boolean) {
    getLocal().set(KEY_NO_AUTO_LOGIN, String(value));
  },

  // 获取已选角色
  getSelectedRole(): "teacher" | "student" | null {
    const role = getLocal().get(KEY_SELECTED_ROLE);
    return role === "teacher" || role === "student" ? role : null;
  },

  // 设置已选角色
  setSelectedRole(role: "teacher" | "student") {
    getLocal().set(KEY_SELECTED_ROLE, role);
  },

  // 获取用户信息
  getUserInfo() {
    const raw = getSession().get(KEY_USER_INFO);
    return raw ? JSON.parse(raw) : null;
  },

  // 设置用户信息
  setUserInfo(userInfo: CurrentUserPayload) {
    getSession().set(KEY_USER_INFO, JSON.stringify(userInfo));
  },

  // 清除用户信息
  clearUserInfo() {
    getSession().remove(KEY_USER_INFO);
  },
};
