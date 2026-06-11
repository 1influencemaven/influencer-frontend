import type { Metadata } from "next";
import { hasLocale } from "use-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing, type AppLocale } from "@/i18n/routing";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: "Influencer AI",
  description: "SaaS para conectar influencers con marcas mediante IA.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <AppProviders locale={locale satisfies AppLocale} messages={messages}>
      {children}
    </AppProviders>
  );
}
