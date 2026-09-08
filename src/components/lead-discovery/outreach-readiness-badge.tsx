"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { OutreachReadiness } from "@/types/lead-discovery";

const readinessStyles: Record<OutreachReadiness, string> = {
  LIMITED: "border-border bg-muted/50 text-muted-foreground",
  PARTIAL: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200",
  READY:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
};

type OutreachReadinessBadgeProps = {
  readiness: OutreachReadiness;
  className?: string;
};

export function OutreachReadinessBadge({
  readiness,
  className,
}: OutreachReadinessBadgeProps) {
  const t = useTranslations("LeadDiscovery.outreachReadiness");

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        readinessStyles[readiness],
        className,
      )}
    >
      {t(readiness)}
    </span>
  );
}
