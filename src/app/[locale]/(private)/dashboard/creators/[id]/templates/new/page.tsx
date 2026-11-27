import { setRequestLocale } from "next-intl/server";

import { TemplateEditor } from "@/components/templates/template-editor";
import { routing, type AppLocale } from "@/i18n/routing";

type NewTemplatePageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function NewTemplatePage({ params }: NewTemplatePageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <TemplateEditor influencerId={id} />;
}
