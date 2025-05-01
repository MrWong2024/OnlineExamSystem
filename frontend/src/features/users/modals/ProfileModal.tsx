// src/features/users/modals/ProfileModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CurrentUserPayload, UserProfile } from "@/types/entities";
import { getMyProfile, updateMyProfile } from "@/features/users/api/profileApi";
import { authStorage } from "@/lib/authStorage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ChangePasswordModal from "./ChangePasswordModal";
import { getErrorMessage } from "@/lib/errors";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { changePassword, refreshToken } from "@/features/auth";
import TextInput from "@/components/ui/TextInput";
import { useToast } from "@/hooks/use-toast";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (updated: UserProfile) => void;
}


export default function ProfileModal({ open, onClose, onSave }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPwdModal, setShowPwdModal] = useState(false);
  const { toast } = useToast();

  // 获取用户资料
  useEffect(() => {
    if (!open) return;

    setErrorMsg("");

    const fetchMyProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch (err) {
        setErrorMsg(getErrorMessage(err, "加载用户信息失败"));
      }
    };
  
    fetchMyProfile();
  }, [open]);

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const updated = await updateMyProfile({
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        identifier: profile.identifier,
      });

      const { access_token } = await refreshToken();
      const authMode = authStorage.getAuthMode();
      if (authMode === "token" && access_token) {
        authStorage.setAccessToken(access_token);
      }

      const updatedUser: CurrentUserPayload = {
        userId: updated.userId,
        name: updated.name,
        identifier: updated.identifier,
        role: updated.role,
      };

      authStorage.setUserInfo(updatedUser);
      onSave?.(updated); // ✅ 返回完整 UserProfile
      toast({ title: "资料已更新" });
      onClose();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "更新失败，请稍后重试"));
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return null; // 或加个 loading spinner
  }

  const label = profile.role === "teacher" ? "工号" : profile.role === "student" ? "学号" : "标识符";

  // 更新 profile 子字段
  const updateField = (key: keyof UserProfile, value: string) => {
    setProfile((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg mx-auto bg-gray-50 border shadow-xl rounded-2xl p-6 space-y-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            我的资料
          </DialogTitle>
        </DialogHeader>

        {/* 顶部：头像区域 */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-14 h-14">
            <AvatarFallback>👤</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-semibold">{profile.name}</div>
            <div className="text-sm text-gray-500">{profile.email}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <TextInput label="姓名" value={profile.name} onChange={(v) => updateField("name", v)} />
          <TextInput label="手机号" value={profile.phone || ""} onChange={(v) => updateField("phone", v)} />
          <TextInput label="邮箱（登录账号）" value={profile.email} onChange={(v) => updateField("email", v)} />
          <TextInput label={label} value={profile.identifier} onChange={(v) => updateField("identifier", v)} />

          <div>
            <Button
              variant="link"
              className="text-blue-600 px-0"
              onClick={() => setShowPwdModal(true)}
            >
              🔐 修改密码
            </Button>
          </div>

          <div className="text-sm text-red-500 text-right min-h-[1.25rem] transition-all duration-300">
            {errorMsg || "\u00A0"}
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <PrimaryButton 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "保存中..." : "保存修改"}
          </PrimaryButton>
        </DialogFooter>

        <ChangePasswordModal
          open={showPwdModal}
          onClose={() => setShowPwdModal(false)}
          onSubmit={async (oldPwd, newPwd) => {
            await changePassword(oldPwd, newPwd);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
