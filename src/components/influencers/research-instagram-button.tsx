"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { researchInfluencerInstagram } from "@/services/influencers.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import type { InstagramResearchResponse } from "@/types/influencer";

type ResearchInstagramButtonProps = {
  influencerId: string;
  disabled?: boolean;
  onSuccess?: (result: InstagramResearchResponse) => void;
};

export function ResearchInstagramButton({
  influencerId,
  disabled = false,
  onSuccess,
}: ResearchInstagramButtonProps) {
  const t = useTranslations("InfluencerDetail.instagramResearch");
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleResearch() {
    setIsResearching(true);
    setError(null);
    setInfo(null);

    try {
      const result = await researchInfluencerInstagram(influencerId);
      if (result.research.outcome === "PROFILE_PRIVATE") {
        setInfo(t("private"));
      } else if (result.research.outcome === "NO_CHANGES") {
        setInfo(result.research.message ?? t("noChanges"));
      } else if (result.research.outcome === "UPDATED") {
        setInfo(
          t("updated", {
            count: result.research.updatedFields.length,
          }),
        );
      }
      onSuccess?.(result);
    } catch (researchError) {
      if (isApiError(researchError)) {
        const code = researchError.code;
        if (code === "PROFILE_NOT_FOUND" || researchError.status === 404) {
          setError(t("notFound"));
        } else if (code === "INCOMPLETE_RESPONSE" || researchError.status === 422) {
          setError(t("incomplete"));
        } else if (code === "PROVIDER_TIMEOUT" || researchError.status === 504) {
          setError(t("timeout"));
        } else if (code === "NOT_CONFIGURED" || researchError.status === 503) {
          setError(t("notConfigured"));
        } else if (code === "INSTAGRAM_DUPLICATE" || researchError.status === 409) {
          setError(t("duplicate"));
        } else if (researchError.status === 400) {
          setError(t("invalidHandle"));
        } else {
          setError(getApiErrorMessage(researchError, t("error")));
        }
      } else {
        setError(getApiErrorMessage(researchError, t("error")));
      }
    } finally {
      setIsResearching(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || isResearching}
        onClick={() => void handleResearch()}
      >
        {isResearching ? t("researching") : t("action")}
      </Button>
      {info ? (
        <p className="text-sm text-muted-foreground" role="status">
          {info}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
