"use client";

import { useTranslations } from "next-intl";

import { TemplatesView } from "@/components/templates/templates-view";

/** "Templates" section inside the talent profile (HU-TPL-004 CA-02). */
export function InfluencerTemplatesSection({ influencerId }: { influencerId: string }) {
  const t = useTranslations("Templates");
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("sectionDescription")}</p>
      </div>
      <TemplatesView influencerId={influencerId} compact />
    </section>
  );
}
