import { setRequestLocale } from "next-intl/server";

import { EmailAccountsView } from "@/components/email-accounts/email-accounts-view";
import { routing, type AppLocale } from "@/i18n/routing";

type EmailAccountsPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function EmailAccountsPage({ params }: EmailAccountsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <EmailAccountsView />;
}
