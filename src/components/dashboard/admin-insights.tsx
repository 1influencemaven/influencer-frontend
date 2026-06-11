"use client";

import { useTranslations } from "next-intl";

import { RoleGate } from "@/components/auth/role-gate";

export function AdminInsights() {
  const t = useTranslations("Dashboard");

  return (
    <RoleGate roles={["ADMIN"]}>
      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <p className="text-sm font-medium text-primary">{t("adminEyebrow")}</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight">
          {t("adminTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("adminDescription")}
        </p>
      </section>
    </RoleGate>
  );
}
