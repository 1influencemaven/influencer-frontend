"use client";

import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type TagsInputProps = {
  id: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
};

function normalizeTag(raw: string): string {
  return raw.trim();
}

export function TagsInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  disabled = false,
  error,
  className,
}: TagsInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = normalizeTag(raw);
    if (!tag || disabled) {
      return;
    }

    const exists = value.some(
      (item) => item.toLowerCase() === tag.toLowerCase(),
    );
    if (exists) {
      setDraft("");
      return;
    }

    onChange([...value, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    if (disabled) {
      return;
    }
    onChange(value.filter((item) => item !== tag));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
      return;
    }

    if (event.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value[value.length - 1]!);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5 shadow-xs",
          disabled && "opacity-50",
          error && "border-destructive",
        )}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              className="rounded-sm p-0.5 hover:bg-muted"
              aria-label={`Remove ${tag}`}
              disabled={disabled}
              onClick={() => removeTag(tag)}
            >
              <X className="size-3" aria-hidden />
            </button>
          </Badge>
        ))}
        <Input
          id={id}
          value={draft}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className="h-7 min-w-[8rem] flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft.trim()) {
              addTag(draft);
            }
          }}
        />
      </div>
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
