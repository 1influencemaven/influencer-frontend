"use client";

import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";

type IntlProviderProps = {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
};

export function IntlProvider({
  children,
  locale,
  messages,
}: IntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
