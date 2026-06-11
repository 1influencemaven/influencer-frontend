import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

type HomePageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="space-y-4">
          <p className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {t("badge")}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard">{t("primaryAction")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">{t("secondaryAction")}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
