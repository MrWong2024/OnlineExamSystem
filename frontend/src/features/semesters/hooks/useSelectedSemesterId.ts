// src/features/semesters/hooks/useSelectedSemesterId.ts

import { useEffect, useState } from "react";

const SEMESTER_KEY = "semester_selected";
/**
 * 自定义事件名，用于同一标签页内广播学期 ID 更新
 */
const SEMESTER_EVENT = "semester_selected_updated";

/**
 * 提供全局可共享的学期 ID 状态（selectedSemesterId）
 *
 * ✅ 可读：返回当前选中学期 ID
 * ✅ 可写：通过 setSelectedSemesterId 更新，并自动写入 localStorage + 触发广播
 * ✅ 监听：支持跨标签页 storage 变化 + 当前标签页自定义事件
 *
 * ⚠️ 注意：此 Hook 只提供状态通道，初始化默认值（如 fallback 学期）应由调用者决定（如 TopBar）
 */
export function useSelectedSemesterId(): [string | null, (id: string) => void] {
  const [semesterId, setSemesterId] = useState<string | null>(null);

  /**
   * 监听：
   * - window.storage：跨标签页变更
   * - 自定义事件：同一标签页内广播
   */
  useEffect(() => {
    const handler = () => {
      const updated = localStorage.getItem(SEMESTER_KEY);
      setSemesterId(updated);
    };

    handler(); // ✅ 首次加载时立即同步一次
    
    window.addEventListener("storage", handler);
    window.addEventListener(SEMESTER_EVENT, handler);

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(SEMESTER_EVENT, handler);
    };
  }, []);

  /**
   * 设置选中学期 ID（写入 localStorage + 通知所有监听方）
   */
  const updateSemesterId = (id: string) => {
    if (semesterId === id) return; // ✅ 判断当前 React 状态是否变化

    localStorage.setItem(SEMESTER_KEY, id);
    setSemesterId(id);
    window.dispatchEvent(new Event(SEMESTER_EVENT)); // ✅ 通知当前标签页的监听者
  };

  return [semesterId, updateSemesterId];
}
