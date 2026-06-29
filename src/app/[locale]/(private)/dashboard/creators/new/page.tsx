import { getTranslations, setRequestLocale } from "next-intl/server";

import { CreateInfluencerForm } from "@/components/influencers/create-influencer-form";
import { routing, type AppLocale } from "@/i18n/routing";

type CreateCreatorPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function CreateCreatorPage({ params }: CreateCreatorPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("CreateInfluencer");

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <CreateInfluencerForm />
    </div>
  );
}
