// src/components/ui/PrimaryButton.tsx
"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 一个符合力扣风格的主按钮（蓝底白字），基于系统 Button 封装。
 */
export default function PrimaryButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={cn(
        "bg-blue-600 text-white hover:bg-blue-700",
        className
      )}
    />
  );
}
