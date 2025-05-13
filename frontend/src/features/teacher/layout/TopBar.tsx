// src/features/teacher/layout/TopBar.tsx
// TopBar 应该是一个被信任的“已登录状态组件”，直接从 authStorage.getUserInfo() 获取并渲染。
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/lib/authStorage";
import { CurrentUserPayload } from "@/types/entities";
import { LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProfileModal from "@/features/users/modals/ProfileModal";
import NameEditorModal from "@/components/modals/NameEditorModal";
import { useSemesters } from "@/features/semesters/hooks/useSemesters";
import { useSelectedSemesterId } from "@/features/semesters/hooks/useSelectedSemesterId";

export default function TopBar() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUserPayload | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const { semesters, addSemester, editSemester, removeSemester } =
    useSemesters();
  const [selectedSemesterId, setSelectedSemesterId] = useSelectedSemesterId();

  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showSemesterEditModal, setShowSemesterEditModal] = useState(false);

   // ✅ 只初始化一次的标志（useRef 不会因渲染而重置）
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (hasMountedRef.current || semesters.length === 0) return;

    const savedId = localStorage.getItem("semester_selected");
    const exists = semesters.find((s) => s._id === savedId);

    if (exists) {
      setSelectedSemesterId(savedId!);
    } else {
      const fallback = semesters[0]?._id ?? null;
      if (fallback) setSelectedSemesterId(fallback);
    }

    hasMountedRef.current = true; // ✅ 只执行一次
  }, [semesters, setSelectedSemesterId]);

  useEffect(() => {
    setUser(authStorage.getUserInfo());
  }, []);

  // 处理退出登录逻辑：清除 token 和用户信息，并跳转首页
  const handleLogout = () => {
    authStorage.clearAuth();
    authStorage.clearUserInfo();
    router.replace("/");
  };

  const selectedSemester = semesters.find((s) => s._id === selectedSemesterId);

  // 在用户信息尚未加载时，不渲染任何内容
  // return null 不代表组件没挂载，也算是挂载成功，只是代表“这次我不渲染任何 UI”——生命周期照走，副作用照放！
  if (!user) return null;

  return (
    <nav className="w-full px-6 py-4 bg-white border-b flex justify-between items-center">
      {/* 左侧 Logo 区域 */}
      <div className="text-xl font-bold text-gray-800">智能化教学平台</div>

      {/* 右侧学期选择 + 用户信息 */}
      <div className="flex items-center space-x-4">
        {/* 学期选择器 */}
        <span className="text-sm text-gray-600 flex items-center space-x-2">
          学期：
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedSemesterId ?? ""}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
          >
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          {/* 编辑当前学期 */}
          <button
            onClick={() => setShowSemesterEditModal(true)}
            className="ml-2 text-gray-400 hover:text-gray-600"
            title="编辑学期"
          >
            🖉
          </button>
          {/* 添加学期 */}
          <button
            onClick={() => setShowSemesterModal(true)}
            className="ml-4 px-3 py-1 text-sm rounded-full bg-transparent text-blue-600 hover:text-blue-800 transition"
          >
            + 添加学期
          </button>
        </span>

        {/* 用户信息下拉菜单 */}
        <DropdownMenu>
          {/* 触发按钮：头像 + 姓名 */}
          <DropdownMenuTrigger className="flex items-center space-x-2 outline-none">
            <Avatar className="h-8 w-8">
              {/* 若无头像，显示姓名首字作为占位 */}
              <AvatarFallback>👤</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-700 max-w-[100px] truncate">
              {user.name}
            </span>
          </DropdownMenuTrigger>

          {/* 下拉菜单内容 */}
          <DropdownMenuContent align="end">
            {/* 我的资料（暂未实现） */}
            <DropdownMenuItem
              onClick={() => setShowProfile(true)}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              我的资料
            </DropdownMenuItem>

            {/* 设置项（暂未实现） */}
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              设置（敬请期待）
            </DropdownMenuItem>

            {/* 退出登录功能 */}
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4 text-red-500" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* 个人资料弹窗 */}
      {/* 谁负责更新 authStorage？ ➔ ProfileModal 内部保存逻辑负责，因为它知道用户修改了什么。
          TopBar 的 onSave 回调 ➔ 只需要拿到 ProfileModal 返回的结果，更新组件内的状态（setUser），不应该再动 storage。
          SessionStorage 和 UI状态是两个层次，不应该在 TopBar 这种展示组件里操作 storage，职责应该分清楚。*/}
      {user && (
        <ProfileModal
          open={showProfile}
          onClose={() => setShowProfile(false)}
          onSave={(updatedProfile) => {
            const updatedUser: CurrentUserPayload = {
              userId: updatedProfile.userId,
              name: updatedProfile.name,
              identifier: updatedProfile.identifier,
              role: updatedProfile.role,
            };
            setUser(updatedUser);
          }}
        />
      )}

      {/* 添加学期弹窗 */}
      {showSemesterModal && (
        <NameEditorModal
          title="添加学期"
          type="学期"
          onSave={async (val) => {
            const newSemester = await addSemester(val);
            setSelectedSemesterId(newSemester._id); // 选中新添加的
          }}
          onClose={() => setShowSemesterModal(false)}
        />
      )}

      {/* 编辑学期弹窗 */}
      {showSemesterEditModal && selectedSemester && (
        <NameEditorModal
          title="编辑学期"
          type="学期"
          initialValue={selectedSemester.name}
          onSave={async (val) => {
            await editSemester(selectedSemester._id, val);
            // 不需要特别更新 selectedSemesterId，因为 ID 不变
          }}
          onDelete={async () => {
            const index = semesters.findIndex(
              (s) => s._id === selectedSemester._id
            );

            // ✅ 删除操作
            await removeSemester(selectedSemester._id);

            // ✅ 手动计算删除后的剩余学期列表
            const remaining = semesters.filter(
              (s) => s._id !== selectedSemester._id
            );

            // ✅ 选中后一个 > 前一个 > 空
            const next =
              remaining[index] ?? // 后一个
              remaining[index - 1] ?? // 前一个
              null;

            if (next) {
              setSelectedSemesterId(next._id);
            } else {
              setSelectedSemesterId(""); // 清空
            }
          }}
          confirmDeleteText="确定要删除该学期吗？此操作将删除该学期下的所有课程与班级，且无法恢复"
          onClose={() => setShowSemesterEditModal(false)}
        />
      )}
    </nav>
  );
}
