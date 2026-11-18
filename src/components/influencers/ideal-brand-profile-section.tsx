"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { GenerateIbpButton } from "@/components/influencers/generate-ibp-button";
import { IdealBrandProfileForm } from "@/components/influencers/ideal-brand-profile-form";
import { IbpStaleDataBanner } from "@/components/influencers/ibp-stale-data-banner";
import { IbpStatusBadge } from "@/components/influencers/ibp-status-badge";
import { RegenerateIbpButton } from "@/components/influencers/regenerate-ibp-button";
import { TalentInterpretationPanel } from "@/components/influencers/talent-interpretation-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIbpPolling } from "@/hooks/use-ibp-polling";
import {
  influencerKeys,
  invalidateInfluencerQueries,
} from "@/lib/influencer-query-keys";
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

async function fetchIdealBrandProfileOrNull(
  influencerId: string,
): Promise<IdealBrandProfile | null> {
  try {
    return await getIdealBrandProfile(influencerId);
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export function IdealBrandProfileSection({
  influencerId,
  influencerUpdatedAt,
}: IdealBrandProfileSectionProps) {
  const t = useTranslations("IdealBrandProfile");
  const queryClient = useQueryClient();
  const queryKey = influencerKeys.ibp(influencerId);

  const {
    data: profile = null,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchIdealBrandProfileOrNull(influencerId),
    // Dedupes React Strict Mode double-mount; 404 → null is a valid empty state.
    staleTime: 30_000,
    retry: false,
  });

  useIbpPolling({
    influencerId,
    enabled: profile?.status === "PROCESSING",
    onUpdate: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      if (updated.status !== "PROCESSING") {
        void invalidateInfluencerQueries(queryClient, influencerId);
      }
    },
  });

  function handleGenerationStarted() {
    queryClient.setQueryData(queryKey, (current: IdealBrandProfile | null | undefined) =>
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
    void invalidateInfluencerQueries(queryClient, influencerId);
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

  if (isError) {
    return (
      <Card className="gap-0 border-border/80 py-0 shadow-sm">
        <CardHeader className="gap-1 py-5">
          <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
          <CardDescription className="text-destructive">
            {t("errors.loadFailed")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
          >
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
              void refetch();
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
                void refetch();
              }}
            />
          </div>
        ) : null}

        {profile.status === "DRAFT" || profile.status === "ACTIVE" ? (
          <>
            <TalentInterpretationPanel
              interpretation={profile.metadata?.talentInterpretation}
            />
            <IdealBrandProfileForm
              influencerId={influencerId}
              profile={profile}
              onSaved={(saved) => {
                queryClient.setQueryData(queryKey, saved);
              }}
            />
            <RegenerateIbpButton
              influencerId={influencerId}
              status={profile.status}
              onSuccess={() => {
                handleGenerationStarted();
                void refetch();
              }}
            />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
