import { getTranslations, setRequestLocale } from "next-intl/server";

import { InfluencerDetailView } from "@/components/influencers/influencer-detail-view";
import { routing, type AppLocale } from "@/i18n/routing";

type CreatorDetailPageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function CreatorDetailPage({
  params,
}: CreatorDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("InfluencerDetail");

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <InfluencerDetailView influencerId={id} />
    </div>
  );
}
