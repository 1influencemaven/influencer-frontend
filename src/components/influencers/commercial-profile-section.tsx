"use client";

import { useTranslations } from "next-intl";

import { GenerateProfileButton } from "@/components/influencers/generate-profile-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CommercialProfile, ProfileStatus } from "@/types/influencer";

type CommercialProfileSectionProps = {
  profileStatus: ProfileStatus;
  commercialProfile: CommercialProfile | null;
  onGenerateSuccess?: () => void;
  showGenerateButton?: boolean;
  influencerId?: string;
};

export function CommercialProfileSection({
  profileStatus,
  commercialProfile,
  onGenerateSuccess,
  showGenerateButton = false,
  influencerId,
}: CommercialProfileSectionProps) {
  const t = useTranslations("InfluencerDetail.commercialProfile");

  if (
    profileStatus === "COMPLETED" &&
    commercialProfile &&
    commercialProfile.idealBrands.length > 0
  ) {
    return (
      <Card className="gap-0 border-border/80 py-0 shadow-sm">
        <CardHeader className="gap-1 py-5">
          <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-5">
          <ProfileList
            title={t("idealBrands")}
            items={commercialProfile.idealBrands}
          />
          <ProfileList
            title={t("brandSize")}
            items={commercialProfile.brandSize}
          />
          <ProfileList
            title={t("departments")}
            items={commercialProfile.departments}
          />

          <div className="space-y-3">
            <h3 className="text-sm font-medium">{t("buyerPersonas")}</h3>
            <div className="space-y-3">
              {commercialProfile.buyerPersonas.map((persona, index) => (
                <div
                  key={`${persona.title}-${index}`}
                  className="rounded-lg border border-border bg-muted/20 p-4"
                >
                  <p className="text-sm font-medium">{persona.title}</p>
                  {persona.seniority ? (
                    <p className="text-xs text-muted-foreground">
                      {t("seniority", { value: persona.seniority })}
                    </p>
                  ) : null}
                  {persona.responsibilities?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {persona.responsibilities.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 border-dashed border-border/80 bg-muted/30 py-0 shadow-none">
      <CardHeader className="gap-1 py-5">
        <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
        <CardDescription>{t(`empty.${profileStatus}`)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-5">
        {profileStatus === "PROCESSING" ? (
          <p className="text-sm text-muted-foreground">{t("processingHint")}</p>
        ) : null}

        {showGenerateButton && influencerId && profileStatus !== "PROCESSING" ? (
          <GenerateProfileButton
            influencerId={influencerId}
            profileStatus={profileStatus}
            onSuccess={onGenerateSuccess}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function ProfileList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
