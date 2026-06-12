"use client";

import { useTranslations } from "next-intl";

import { RoleBadge } from "@/components/dashboard/role-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRole } from "@/hooks/use-role";
import { getEmailInitials } from "@/lib/user-display";

export function UserSummaryCard() {
  const t = useTranslations("Dashboard");
  const { user, role } = useRole();

  if (!user || !role) {
    return null;
  }

  return (
    <Card className="gap-0 border-border/80 py-0 shadow-xs">
      <CardHeader className="gap-1 border-b border-border/80 py-5">
        <CardTitle className="text-base font-semibold">
          {t("userSectionTitle")}
        </CardTitle>
        <CardDescription>{t("userSectionDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar size="lg" className="border border-border/80 bg-muted">
              <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
                {getEmailInitials(user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">{t("authenticated")}</p>
            </div>
          </div>
          <Separator className="sm:hidden" />
          <div className="flex items-center gap-2 sm:shrink-0">
            <span className="text-xs font-medium text-muted-foreground">
              {t("roleLabel")}
            </span>
            <RoleBadge role={role} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
