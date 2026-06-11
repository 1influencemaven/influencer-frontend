"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SelectOption = {
  value: string;
  label: string;
};

type SelectFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const selectClassName =
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";

export function SelectFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  disabled,
  className,
}: SelectFormFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-2", className)}>
          <Label htmlFor={name}>{label}</Label>
          <select
            id={name}
            className={selectClassName}
            disabled={disabled}
            aria-invalid={Boolean(fieldState.error)}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldState.error?.message ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldState.error.message}
            </p>
          ) : null}
        </div>
      )}
    />
  );
}
