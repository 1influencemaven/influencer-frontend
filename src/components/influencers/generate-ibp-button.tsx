"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { generateIdealBrandProfile } from "@/services/ideal-brand-profiles.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";

type GenerateIbpButtonProps = {
  influencerId: string;
  disabled?: boolean;
  onSuccess?: () => void;
};

export function GenerateIbpButton({
  influencerId,
  disabled = false,
  onSuccess,
}: GenerateIbpButtonProps) {
  const t = useTranslations("IdealBrandProfile.generate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);

    try {
      await generateIdealBrandProfile(influencerId);
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
    <div>
      <Button
        type="button"
        disabled={disabled || isGenerating}
        onClick={() => void handleGenerate()}
      >
        {isGenerating ? t("generating") : t("action")}
      </Button>
      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
