// src/components/modals/NameEditorModal.tsx
"use client";

import { useEffect, useState } from "react";

interface Props {
  title?: string;
  initialValue?: string;
  type?: string; // 类型名称，用于按钮提示，例如 “课程”
  onSave: (newValue: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function NameEditorModal({
  title = "编辑",
  initialValue = "",
  type = "项",
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <input
          type="text"
          placeholder={`请输入${type}名称`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />
        <div className="flex justify-between items-center">
          <div>
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`确定删除该${type}吗？`)) {
                    onDelete();
                    onClose();
                  }
                }}
                className="text-red-500 text-sm mr-4"
              >
                删除{type}
              </button>
            )}
          </div>
          <div className="space-x-2">
            <button onClick={onClose} className="text-gray-500 text-sm">
              取消
            </button>
            <button
              onClick={() => {
                if (value.trim()) {
                  onSave(value.trim());
                  onClose();
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
