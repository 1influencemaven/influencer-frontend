import { getTranslations, setRequestLocale } from "next-intl/server";

import { LoginForm } from "@/app/[locale]/login/login-form";
import { SiteHeader } from "@/components/site-header";
import { routing, type AppLocale } from "@/i18n/routing";

type LoginPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Login");

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <LoginForm />
      </main>
    </div>
  );
}
