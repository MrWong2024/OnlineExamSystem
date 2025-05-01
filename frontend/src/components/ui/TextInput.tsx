// src/components/ui/TextInput.tsx
"use client";

import { Input } from "./input";
import { Label } from "./label";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: TextInputProps) {
  return (
    <div>
      <Label className="text-sm text-gray-600">{label}</Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
        placeholder={placeholder || `请输入${label}`}
      />
    </div>
  );
}
