import { getTranslations, setRequestLocale } from "next-intl/server";

import { InfluencersTable } from "@/components/influencers/influencers-table";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

type CreatorsPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function CreatorsPage({ params }: CreatorsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Influencers");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/creators/new">{t("createAction")}</Link>
        </Button>
      </div>
      <InfluencersTable />
    </div>
  );
}
