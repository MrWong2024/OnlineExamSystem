// src/components/ui/PasswordInput.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <Label className="text-sm text-gray-600">{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `请输入${label}`}
          className="mt-1 pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="切换密码可见性"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
