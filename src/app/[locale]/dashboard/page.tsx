import { getTranslations, setRequestLocale } from "next-intl/server";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
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

  const metrics = [
    { label: t("metricCampaigns"), value: "12" },
    { label: t("metricCreators"), value: "48" },
    { label: t("metricMatches"), value: "156" },
  ];

  return (
    <div className="flex min-h-full">
      <AppSidebar />
      <div className="flex min-h-full flex-1 flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col gap-8 p-6 lg:p-8">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
              </article>
            ))}
          </div>
          <section className="rounded-2xl border border-dashed border-border bg-muted/40 p-6">
            <p className="text-sm text-muted-foreground">{t("welcome")}</p>
          </section>
        </main>
      </div>
    </div>
  );
}
