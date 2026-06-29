import { getTranslations, setRequestLocale } from "next-intl/server";

import { EditInfluencerForm } from "@/components/influencers/edit-influencer-form";
import { routing, type AppLocale } from "@/i18n/routing";

type EditCreatorPageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function EditCreatorPage({ params }: EditCreatorPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("EditInfluencer");

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <EditInfluencerForm influencerId={id} />
    </div>
  );
}
