"use client";

import { NumericFormat } from "react-number-format";
import { cn } from "cn";

type NumberInputProps = {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  align?: "left" | "right" | "center";
  thousandSeparator?: boolean | string;
  decimalSeparator?: string;
  prefix?: string;
  suffix?: string;
  allowNegative?: boolean;
};

export function ShadcnNumberInput({
  value,
  onChange,
  min,
  max,
  placeholder,
  className,
  disabled = false,
  align = "right",
  thousandSeparator = ".",
  decimalSeparator = ",",
  prefix,
  suffix,
  allowNegative = false,
}: NumberInputProps) {
  return (
    <NumericFormat
      value={value === 0 ? "" : value}
      onValueChange={(values) => {
        const val = values.floatValue ?? 0;
        if (min !== undefined && val < min) return;
        if (max !== undefined && val > max) return;
        onChange(val);
      }}
      thousandSeparator={thousandSeparator}
      decimalSeparator={decimalSeparator}
      prefix={prefix}
      suffix={suffix}
      allowNegative={allowNegative}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl border border-zinc-700/80 bg-[#121318] px-3 py-1.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-9",
        align === "right" && "text-right",
        align === "left" && "text-left",
        align === "center" && "text-center",
        className
      )}
    />
  );
}

export const NumberInput = ShadcnNumberInput;
