"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { generateProfile } from "@/services/influencers.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import type { ProfileStatus } from "@/types/influencer";

type GenerateProfileButtonProps = {
  influencerId: string;
  profileStatus: ProfileStatus;
  onSuccess?: () => void;
  className?: string;
};

export function GenerateProfileButton({
  influencerId,
  profileStatus,
  onSuccess,
  className,
}: GenerateProfileButtonProps) {
  const t = useTranslations("InfluencerDetail.generateProfile");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDisabled = isGenerating || profileStatus === "PROCESSING";

  async function handleGenerate() {
    if (isDisabled) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await generateProfile(influencerId);
      setSuccessMessage(t("success"));
      onSuccess?.();
    } catch (generateError) {
      if (isApiError(generateError) && generateError.status === 409) {
        setError(t("alreadyProcessing"));
      } else if (isApiError(generateError) && generateError.status === 404) {
        setError(t("notFound"));
      } else {
        setError(getApiErrorMessage(generateError, t("error")));
      }
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        disabled={isDisabled}
        onClick={() => void handleGenerate()}
      >
        {isGenerating ? t("generating") : t("action")}
      </Button>

      {successMessage ? (
        <p className="mt-3 text-sm text-primary" role="status">
          {successMessage}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
