"use client";

import { useTranslations } from "next-intl";

import { RoleGate } from "@/components/auth/role-gate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminInsights() {
  const t = useTranslations("Dashboard");

  return (
    <RoleGate roles={["ADMIN"]}>
      <Card className="gap-0 border-border/80 py-0 shadow-xs">
        <CardHeader className="gap-1 border-b border-border/80 py-5">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            {t("adminEyebrow")}
          </p>
          <CardTitle className="text-base font-semibold">
            {t("adminTitle")}
          </CardTitle>
          <CardDescription>{t("adminDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="py-5">
          <p className="text-sm text-muted-foreground">
            {t("adminPlaceholder")}
          </p>
        </CardContent>
      </Card>
    </RoleGate>
  );
}
