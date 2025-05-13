// src/components/modals/NameEditorModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/ui/TextInput";

interface Props {
  title?: string;
  initialValue?: string;
  type?: string; // 类型名称，用于按钮提示，例如 “课程”
  onSave: (newValue: string) => void;
  onDelete?: () => void;
  onClose: () => void;
  confirmDeleteText?: string;
}

export default function NameEditorModal({
  title = "编辑",
  initialValue = "",
  type = "项",
  onSave,
  onDelete,
  onClose,
  confirmDeleteText,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setValue(initialValue);
    setErrorMsg("");
  }, [initialValue]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setErrorMsg(`请输入${type}名称`);
      return;
    }
    onSave(trimmed);
    onClose();
  };

  const handleDelete = () => {
    const confirmText = confirmDeleteText || `确定要删除该${type}吗？`;
    if (confirm(confirmText)) {
      onDelete?.();
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto bg-gray-50 border shadow-xl rounded-2xl p-6 space-y-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <TextInput
            label={`${type}名称`}
            value={value}
            onChange={setValue}
            placeholder={`请输入${type}名称`}
          />
          <div className="text-sm text-red-500 min-h-[1.25rem] transition-all duration-300">
            {errorMsg || "\u00A0"}
          </div>
        </div>

        <DialogFooter className="flex items-center space-x-4">
          {/* 左边删除按钮 */}
          <div className="flex-1">
            {onDelete && (
              <Button
                variant="link"
                className="text-red-600"
                onClick={handleDelete}
              >
                删除{type}
              </Button>
            )}
          </div>

          {/* 右边取消和保存按钮 */}
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
              保存
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
