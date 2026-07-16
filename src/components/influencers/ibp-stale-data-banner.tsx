"use client";

import { useTranslations } from "next-intl";

type IbpStaleDataBannerProps = {
  visible: boolean;
};

export function IbpStaleDataBanner({ visible }: IbpStaleDataBannerProps) {
  const t = useTranslations("IdealBrandProfile");

  if (!visible) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {t("staleDataBanner")}
    </div>
  );
}
