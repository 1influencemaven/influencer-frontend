"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

type RoleBadgeProps = {
  role: UserRole;
  className?: string;
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const t = useTranslations("CreateUser.roles");

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border-primary/20 bg-card px-2.5 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase",
        className,
      )}
    >
      {t(role)}
    </Badge>
  );
}
