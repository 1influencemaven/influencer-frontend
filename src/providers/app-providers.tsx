"use client";

import type { AbstractIntlMessages } from "next-intl";

import { HtmlLangSync } from "@/components/html-lang-sync";
import { IntlProvider } from "@/providers/intl-provider";

type AppProvidersProps = {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
};

export function AppProviders({
  children,
  locale,
  messages,
}: AppProvidersProps) {
  return (
    <IntlProvider locale={locale} messages={messages}>
      <HtmlLangSync />
      {children}
    </IntlProvider>
  );
}
