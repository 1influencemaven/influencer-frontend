import { getTranslations, setRequestLocale } from "next-intl/server";

import { LeadDetailView } from "@/components/lead-discovery/lead-detail-view";
import { routing, type AppLocale } from "@/i18n/routing";

type LeadDetailPageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("LeadDiscovery.detail");

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <LeadDetailView leadId={id} />
    </div>
  );
}
