"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { regenerateIdealBrandProfile } from "@/services/ideal-brand-profiles.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import type { IbpStatus } from "@/types/ideal-brand-profile";

type RegenerateIbpButtonProps = {
  influencerId: string;
  status: IbpStatus;
  disabled?: boolean;
  onSuccess?: () => void;
};

export function RegenerateIbpButton({
  influencerId,
  status,
  disabled = false,
  onSuccess,
}: RegenerateIbpButtonProps) {
  const t = useTranslations("IdealBrandProfile.regenerate");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegenerate() {
    setIsRegenerating(true);
    setError(null);

    try {
      await regenerateIdealBrandProfile(influencerId);
      setPendingConfirm(false);
      onSuccess?.();
    } catch (regenerateError) {
      if (isApiError(regenerateError) && regenerateError.status === 409) {
        setError(t("alreadyProcessing"));
      } else {
        setError(getApiErrorMessage(regenerateError, t("error")));
      }
    } finally {
      setIsRegenerating(false);
    }
  }

  if (pendingConfirm) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("confirm")}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isRegenerating}
          onClick={() => setPendingConfirm(false)}
        >
          {t("cancel")}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={isRegenerating}
          onClick={() => void handleRegenerate()}
        >
          {isRegenerating ? t("regenerating") : t("confirmAction")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        disabled={disabled || isRegenerating}
        onClick={() => {
          if (status === "ACTIVE") {
            setPendingConfirm(true);
            return;
          }
          void handleRegenerate();
        }}
      >
        {isRegenerating ? t("regenerating") : t("action")}
      </Button>
      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
