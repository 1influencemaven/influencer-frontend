"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useInstagramResearchPolling } from "@/hooks/use-instagram-research-polling";
import {
  messageForInstagramResearchCode,
  messageForInstagramResearchError,
} from "@/lib/instagram-research-error";
import {
  getActiveInfluencerInstagramResearch,
  startInfluencerInstagramResearch,
} from "@/services/influencers.service";
import type {
  InstagramResearchResponse,
  InstagramResearchRun,
} from "@/types/influencer";

type ResearchInstagramButtonProps = {
  influencerId: string;
  disabled?: boolean;
  onSuccess?: (result: InstagramResearchResponse) => void;
};

function isInfluencerResult(
  result: InstagramResearchRun["result"],
): result is InstagramResearchResponse {
  return Boolean(result && "influencer" in result && "research" in result);
}

export function ResearchInstagramButton({
  influencerId,
  disabled = false,
  onSuccess,
}: ResearchInstagramButtonProps) {
  const t = useTranslations("InfluencerDetail.instagramResearch");
  const [runId, setRunId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isResuming, setIsResuming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isResearching = isStarting || isResuming || Boolean(runId);

  useEffect(() => {
    let cancelled = false;

    async function resumeActiveRun() {
      setIsResuming(true);
      try {
        const active = await getActiveInfluencerInstagramResearch(influencerId);
        if (cancelled) {
          return;
        }
        if (active?.status === "PROCESSING") {
          setRunId(active.id);
        }
      } catch {
        // Ignore resume failures; user can still start research.
      } finally {
        if (!cancelled) {
          setIsResuming(false);
        }
      }
    }

    void resumeActiveRun();
    return () => {
      cancelled = true;
    };
  }, [influencerId]);

  useInstagramResearchPolling({
    runId,
    enabled: Boolean(runId),
    onUpdate: (run) => {
      if (run.status === "PROCESSING") {
        return;
      }

      setRunId(null);
      setIsStarting(false);
      setIsResuming(false);

      if (run.status === "FAILED") {
        setError(
          messageForInstagramResearchCode(run.errorCode, t, {
            invalidKey: "invalidHandle",
          }),
        );
        return;
      }

      if (!isInfluencerResult(run.result)) {
        setError(t("error"));
        return;
      }

      const result = run.result;
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
    },
  });

  async function handleResearch() {
    setIsStarting(true);
    setError(null);
    setInfo(null);

    try {
      // Idempotent: if a PROCESSING run exists, Nest returns it and we keep polling.
      const run = await startInfluencerInstagramResearch(influencerId);
      setRunId(run.id);
    } catch (researchError) {
      setError(
        messageForInstagramResearchError(researchError, t, {
          invalidKey: "invalidHandle",
        }),
      );
      setIsStarting(false);
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
