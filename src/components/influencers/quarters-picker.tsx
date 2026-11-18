"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  INFLUENCER_QUARTERS,
  type InfluencerQuarter,
  type QuarterAssignmentInput,
} from "@/types/influencer";

type QuartersPickerProps = {
  label: string;
  value: QuarterAssignmentInput[];
  onChange: (value: QuarterAssignmentInput[]) => void;
  yearLabel: string;
  addLabel: string;
  emptyHint?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
};

function quarterKey(item: QuarterAssignmentInput): string {
  return `${item.year}:${item.quarter}`;
}

export function QuartersPicker({
  label,
  value,
  onChange,
  yearLabel,
  addLabel,
  emptyHint,
  disabled = false,
  error,
  className,
}: QuartersPickerProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [selectedQuarters, setSelectedQuarters] = useState<InfluencerQuarter[]>(
    [],
  );

  function toggleQuarter(quarter: InfluencerQuarter) {
    setSelectedQuarters((current) =>
      current.includes(quarter)
        ? current.filter((item) => item !== quarter)
        : [...current, quarter],
    );
  }

  function handleAdd() {
    const parsedYear = Number(year);
    if (
      disabled ||
      !Number.isInteger(parsedYear) ||
      parsedYear < 2000 ||
      parsedYear > 2100 ||
      selectedQuarters.length === 0
    ) {
      return;
    }

    const existing = new Set(value.map(quarterKey));
    const next = [...value];

    for (const quarter of selectedQuarters) {
      const item = { year: parsedYear, quarter };
      if (!existing.has(quarterKey(item))) {
        next.push(item);
      }
    }

    next.sort((a, b) =>
      a.year === b.year
        ? a.quarter.localeCompare(b.quarter)
        : b.year - a.year,
    );

    onChange(next);
    setSelectedQuarters([]);
  }

  function removeItem(item: QuarterAssignmentInput) {
    if (disabled) {
      return;
    }
    onChange(value.filter((row) => quarterKey(row) !== quarterKey(item)));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Label>{label}</Label>

      <div className="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="quarter-year" className="text-xs text-muted-foreground">
            {yearLabel}
          </Label>
          <Input
            id="quarter-year"
            type="number"
            min={2000}
            max={2100}
            value={year}
            disabled={disabled}
            onChange={(event) => setYear(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {INFLUENCER_QUARTERS.map((quarter) => {
            const active = selectedQuarters.includes(quarter);
            return (
              <Button
                key={quarter}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                disabled={disabled}
                onClick={() => toggleQuarter(quarter)}
              >
                {quarter}
              </Button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={disabled || selectedQuarters.length === 0}
          onClick={handleAdd}
        >
          {addLabel}
        </Button>
      </div>

      {value.length === 0 ? (
        emptyHint ? (
          <p className="text-xs text-muted-foreground">{emptyHint}</p>
        ) : null
      ) : (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge
              key={quarterKey(item)}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {item.year} {item.quarter}
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label={`Remove ${item.year} ${item.quarter}`}
                disabled={disabled}
                onClick={() => removeItem(item)}
              >
                <X className="size-3" aria-hidden />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
