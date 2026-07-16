"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { GenerateIbpButton } from "@/components/influencers/generate-ibp-button";
import { IdealBrandProfileForm } from "@/components/influencers/ideal-brand-profile-form";
import { IbpStaleDataBanner } from "@/components/influencers/ibp-stale-data-banner";
import { IbpStatusBadge } from "@/components/influencers/ibp-status-badge";
import { RegenerateIbpButton } from "@/components/influencers/regenerate-ibp-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIbpPolling } from "@/hooks/use-ibp-polling";
import { getIdealBrandProfile } from "@/services/ideal-brand-profiles.service";
import { isApiError } from "@/types/api-error";
import type { IdealBrandProfile } from "@/types/ideal-brand-profile";

type IdealBrandProfileSectionProps = {
  influencerId: string;
  influencerUpdatedAt: string;
};

function isStaleData(
  influencerUpdatedAt: string,
  profile: IdealBrandProfile | null,
): boolean {
  const lastGeneratedAt = profile?.metadata?.lastGeneratedAt;
  if (!lastGeneratedAt) {
    return false;
  }

  return new Date(influencerUpdatedAt) > new Date(lastGeneratedAt);
}

export function IdealBrandProfileSection({
  influencerId,
  influencerUpdatedAt,
}: IdealBrandProfileSectionProps) {
  const t = useTranslations("IdealBrandProfile");
  const [profile, setProfile] = useState<IdealBrandProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoadError(null);

    try {
      const data = await getIdealBrandProfile(influencerId);
      setProfile(data);
    } catch (error) {
      if (isApiError(error) && error.status === 404) {
        setProfile(null);
      } else {
        setLoadError(t("errors.loadFailed"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [influencerId, t]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useIbpPolling({
    influencerId,
    enabled: profile?.status === "PROCESSING",
    onUpdate: (updated) => {
      setProfile(updated);
      if (updated.status !== "PROCESSING") {
        setIsLoading(false);
      }
    },
  });

  function handleGenerationStarted() {
    setProfile((current) =>
      current
        ? { ...current, status: "PROCESSING" }
        : {
            id: "pending",
            influencerId,
            status: "PROCESSING",
            targetSectors: [],
            excludedSectors: [],
            brandSize: [],
            markets: [],
            collaborationTypes: [],
            summary: "",
            alertSignals: [],
            desirableCriteria: [],
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
    );
  }

  if (isLoading) {
    return (
      <Card className="gap-0 border-border/80 py-0 shadow-sm">
        <CardHeader className="gap-1 py-5">
          <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
          <CardDescription>{t("loading")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="gap-0 border-border/80 py-0 shadow-sm">
        <CardHeader className="gap-1 py-5">
          <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
          <CardDescription className="text-destructive">{loadError}</CardDescription>
        </CardHeader>
        <CardContent className="pb-5">
          <Button type="button" variant="outline" size="sm" onClick={() => void loadProfile()}>
            {t("retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="gap-0 border-dashed border-border/80 bg-muted/30 py-0 shadow-none">
        <CardHeader className="gap-1 py-5">
          <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
          <CardDescription>{t("empty")}</CardDescription>
        </CardHeader>
        <CardContent className="pb-5">
          <GenerateIbpButton
            influencerId={influencerId}
            onSuccess={() => {
              handleGenerationStarted();
              void loadProfile();
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 border-border/80 py-0 shadow-sm">
      <CardHeader className="gap-3 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
          <IbpStatusBadge status={profile.status} />
        </div>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pb-5">
        <IbpStaleDataBanner
          visible={isStaleData(influencerUpdatedAt, profile)}
        />

        {profile.status === "PROCESSING" ? (
          <p className="text-sm text-muted-foreground">{t("processingHint")}</p>
        ) : null}

        {profile.status === "FAILED" ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">{t("failedHint")}</p>
            <GenerateIbpButton
              influencerId={influencerId}
              onSuccess={() => {
                handleGenerationStarted();
                void loadProfile();
              }}
            />
          </div>
        ) : null}

        {profile.status === "DRAFT" || profile.status === "ACTIVE" ? (
          <>
            <IdealBrandProfileForm
              influencerId={influencerId}
              profile={profile}
              onSaved={setProfile}
            />
            <RegenerateIbpButton
              influencerId={influencerId}
              status={profile.status}
              onSuccess={() => {
                handleGenerationStarted();
                void loadProfile();
              }}
            />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
