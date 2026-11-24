"use client";

import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  showIcon?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = "", showIcon = true, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative w-full">
        {showIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <Lock className="w-4 h-4" />
          </div>
        )}

        <input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          className={`w-full rounded-xl border border-zinc-700/80 bg-[#101116] text-sm text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 disabled:opacity-50 ${
            showIcon ? "pl-10" : "pl-4"
          } pr-11 py-2.5 ${className}`}
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-200 focus:outline-none transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-zinc-400 hover:text-white" />
          ) : (
            <Eye className="w-4 h-4 text-zinc-400 hover:text-white" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;

