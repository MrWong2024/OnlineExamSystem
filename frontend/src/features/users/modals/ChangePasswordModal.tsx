"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { getErrorMessage } from "@/lib/errors";
import PasswordInput from "@/components/ui/PasswordInput";
import { useToast } from "@/hooks/use-toast";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (oldPassword: string, newPassword: string) => Promise<void>;
}

export default function ChangePasswordModal({
  open,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMsg("");
    }
  }, [open]);
  
  const handleChangePassword = async () => {
    setErrorMsg("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg("请填写完整信息");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("两次输入的新密码不一致");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(oldPassword, newPassword);

      toast({
        title: "密码修改成功",
        description: "下次登录请使用新密码",
      });

      onClose();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "密码修改失败"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto bg-gray-50 border shadow-xl rounded-2xl p-6 space-y-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            修改密码
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <PasswordInput
            label="当前密码"
            value={oldPassword}
            onChange={setOldPassword}
          />
          <PasswordInput
            label="新密码"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordInput
            label="确认新密码"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <div className="text-sm text-red-500 text-right min-h-[1.25rem]">
            {errorMsg || "\u00A0"}
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <PrimaryButton onClick={handleChangePassword} disabled={loading}>
            {loading ? "修改中..." : "确认修改"}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
