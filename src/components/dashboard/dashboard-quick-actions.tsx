"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function DashboardQuickActions() {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild>
        <Link href="/dashboard/creators/new">{t("quickActions.newTalent")}</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/dashboard/brand-discovery">
          {t("quickActions.brandDiscovery")}
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/dashboard/campaigns">
          {t("quickActions.emailAccounts")}
        </Link>
      </Button>
    </div>
  );
}
