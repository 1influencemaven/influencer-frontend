import { setRequestLocale } from "next-intl/server";

import { TemplateEditor } from "@/components/templates/template-editor";
import { routing, type AppLocale } from "@/i18n/routing";

type EditTemplatePageProps = {
  params: Promise<{ locale: AppLocale; id: string; templateId: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { locale, id, templateId } = await params;
  setRequestLocale(locale);
  return <TemplateEditor influencerId={id} templateId={templateId} />;
}
