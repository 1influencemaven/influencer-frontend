"use client";

import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";

import { timeZone } from "@/i18n/config";

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
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
    >
      {children}
    </NextIntlClientProvider>
  );
}
