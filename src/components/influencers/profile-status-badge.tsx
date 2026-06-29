"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProfileStatus } from "@/types/influencer";

const statusStyles: Record<ProfileStatus, string> = {
  PENDING:
    "border-border bg-muted/40 text-muted-foreground",
  PROCESSING:
    "border-primary/30 bg-primary/5 text-primary",
  COMPLETED:
    "border-notion-green/30 bg-notion-green/10 text-notion-green",
  FAILED:
    "border-destructive/30 bg-destructive/5 text-destructive",
};

type ProfileStatusBadgeProps = {
  status: ProfileStatus;
  className?: string;
};

export function ProfileStatusBadge({ status, className }: ProfileStatusBadgeProps) {
  const t = useTranslations("Influencers.profileStatus");

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
        statusStyles[status],
        className,
      )}
    >
      {t(status)}
    </Badge>
  );
}
