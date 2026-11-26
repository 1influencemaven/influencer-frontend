import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminInsights } from "@/components/dashboard/admin-insights";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardMetricsSection } from "@/components/dashboard/dashboard-metrics-section";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { UserSummaryCard } from "@/components/dashboard/user-summary-card";
import { routing, type AppLocale } from "@/i18n/routing";

type DashboardPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Dashboard");

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <DashboardHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />
        <DashboardQuickActions />
      </div>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("metricsSectionTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("metricsSectionDescription")}
          </p>
        </div>
        <DashboardMetricsSection />
      </section>

      <UserSummaryCard />

      <AdminInsights />
    </>
  );
}
