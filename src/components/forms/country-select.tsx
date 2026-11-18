"use client";

import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import { getCountryOptions, type CountryOption } from "@/lib/countries";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base text-foreground shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

export type CountrySelectProps = {
  id?: string;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  value: string;
  onChange: (code: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  locale: string;
  name?: string;
};

export function CountrySelect({
  id = "country",
  label,
  placeholder,
  searchPlaceholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  locale,
  name = "country",
}: CountrySelectProps) {
  const [query, setQuery] = useState("");
  const options = useMemo(() => getCountryOptions(locale), [locale]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLocaleLowerCase(locale).includes(q) ||
        option.code.toLowerCase().includes(q),
    );
  }, [locale, options, query]);

  const selected: CountryOption | undefined = options.find(
    (option) => option.code === value,
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder}
        disabled={disabled}
        className={cn(selectClassName)}
        aria-label={searchPlaceholder}
        autoComplete="off"
      />
      <select
        id={id}
        name={name}
        className={cn(selectClassName)}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setQuery("");
        }}
        onBlur={onBlur}
      >
        <option value="">
          {selected ? `${selected.label} (${selected.code})` : placeholder}
        </option>
        {filtered.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label} ({option.code})
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
