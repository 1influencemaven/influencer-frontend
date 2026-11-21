"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { IbpStatus } from "@/types/ideal-brand-profile";

const statusStyles: Record<IbpStatus, string> = {
  DRAFT: "border-amber-200 bg-amber-50 text-amber-800",
  PROCESSING: "border-blue-200 bg-blue-50 text-blue-800",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  FAILED: "border-red-200 bg-red-50 text-red-800",
};

type IbpStatusBadgeProps = {
  status: IbpStatus | null;
  className?: string;
};

export function IbpStatusBadge({ status, className }: IbpStatusBadgeProps) {
  const t = useTranslations("IdealBrandProfile.status");

  if (!status) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
          className,
        )}
      >
        {t("none")}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {t(status)}
    </span>
  );
}
