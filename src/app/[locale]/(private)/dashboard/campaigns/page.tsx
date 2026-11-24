import { setRequestLocale } from "next-intl/server";

import { CampaignsView } from "@/components/campaigns/campaigns-view";
import { routing, type AppLocale } from "@/i18n/routing";

type CampaignsPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function CampaignsPage({ params }: CampaignsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CampaignsView />;
}
