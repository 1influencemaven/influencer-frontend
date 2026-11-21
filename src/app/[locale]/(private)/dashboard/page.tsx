import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminInsights } from "@/components/dashboard/admin-insights";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardMetricsSection } from "@/components/dashboard/dashboard-metrics-section";
import { UserSummaryCard } from "@/components/dashboard/user-summary-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <DashboardHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <UserSummaryCard />

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

      <Card className="gap-0 border-dashed border-border/80 bg-muted/30 py-0 shadow-none">
        <CardHeader className="gap-1 py-5">
          <CardTitle className="text-base font-semibold">
            {t("workspaceTitle")}
          </CardTitle>
          <CardDescription>{t("welcome")}</CardDescription>
        </CardHeader>
        <CardContent className="pb-5">
          <p className="text-sm text-muted-foreground">
            {t("workspaceDescription")}
          </p>
        </CardContent>
      </Card>

      <AdminInsights />
    </>
  );
}
