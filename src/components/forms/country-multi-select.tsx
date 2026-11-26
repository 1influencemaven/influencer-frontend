"use client";

import { X } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { getCountryOptions } from "@/lib/countries";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base text-foreground shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

export type CountryMultiSelectProps = {
  id?: string;
  label: string;
  placeholder: string;
  value: string[];
  onChange: (codes: string[]) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  hint?: string;
  locale: string;
};

export function CountryMultiSelect({
  id = "countries",
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  hint,
  locale,
}: CountryMultiSelectProps) {
  const options = useMemo(() => getCountryOptions(locale), [locale]);
  const selectedSet = useMemo(
    () => new Set(value.map((code) => code.toUpperCase())),
    [value],
  );

  const available = useMemo(
    () => options.filter((option) => !selectedSet.has(option.code)),
    [options, selectedSet],
  );

  const selectedOptions = useMemo(
    () =>
      value.map((code) => {
        const upper = code.toUpperCase();
        return (
          options.find((option) => option.code === upper) ?? {
            code: upper,
            label: upper,
          }
        );
      }),
    [options, value],
  );

  function addCountry(code: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized || disabled || selectedSet.has(normalized)) {
      return;
    }
    onChange([...value, normalized]);
  }

  function removeCountry(code: string) {
    if (disabled) return;
    onChange(value.filter((item) => item.toUpperCase() !== code.toUpperCase()));
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      {selectedOptions.length > 0 ? (
        <div
          className={cn(
            "flex min-h-9 flex-wrap items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5 shadow-xs",
            disabled && "opacity-50",
            error && "border-destructive",
          )}
        >
          {selectedOptions.map((option) => (
            <Badge key={option.code} variant="secondary" className="gap-1 pr-1">
              {option.label} ({option.code})
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label={`Remove ${option.label}`}
                disabled={disabled}
                onClick={() => removeCountry(option.code)}
              >
                <X className="size-3" aria-hidden />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <select
        id={id}
        className={cn(selectClassName)}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        value=""
        onChange={(event) => {
          if (event.target.value) {
            addCountry(event.target.value);
          }
        }}
        onBlur={onBlur}
      >
        <option value="">{placeholder}</option>
        {available.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label} ({option.code})
          </option>
        ))}
      </select>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
