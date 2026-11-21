"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { researchInstagramUsername } from "@/services/influencers.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import type { InstagramUsernameResearchResponse } from "@/types/influencer";

type InstagramUsernameResearchPanelProps = {
  disabled?: boolean;
  /** Controlled Instagram handle from the create form (avoids a second Instagram field). */
  username?: string;
  onUsernameChange?: (value: string) => void;
  onFound?: (result: InstagramUsernameResearchResponse) => void;
};

function formatCount(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return new Intl.NumberFormat().format(value);
}

function formatHashtags(values: string[]): string {
  if (!values.length) {
    return "—";
  }
  return values.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ");
}

export function InstagramUsernameResearchPanel({
  disabled = false,
  username: controlledUsername,
  onUsernameChange,
  onFound,
}: InstagramUsernameResearchPanelProps) {
  const t = useTranslations("CreateInfluencer.instagramLookup");
  const [uncontrolledUsername, setUncontrolledUsername] = useState("");
  const username = controlledUsername ?? uncontrolledUsername;
  const setUsername = onUsernameChange ?? setUncontrolledUsername;
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [result, setResult] = useState<InstagramUsernameResearchResponse | null>(
    null,
  );

  async function handleResearch() {
    setIsResearching(true);
    setError(null);
    setInfo(null);
    setResult(null);

    try {
      const response = await researchInstagramUsername(username.trim());
      setResult(response);
      if (response.research.outcome === "PROFILE_PRIVATE") {
        setInfo(t("private"));
      } else if (response.research.outcome === "FOUND") {
        setInfo(t("found"));
        onFound?.(response);
      }
    } catch (researchError) {
      if (isApiError(researchError)) {
        const code = researchError.code;
        if (code === "PROFILE_NOT_FOUND" || researchError.status === 404) {
          setError(t("notFound"));
        } else if (
          code === "INCOMPLETE_RESPONSE" ||
          researchError.status === 422
        ) {
          setError(t("incomplete"));
        } else if (code === "PROVIDER_TIMEOUT" || researchError.status === 504) {
          setError(t("timeout"));
        } else if (code === "NOT_CONFIGURED" || researchError.status === 503) {
          setError(t("notConfigured"));
        } else if (researchError.status === 400) {
          setError(t("invalidUsername"));
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

  const normalized = result?.normalized;

  return (
    <section className="space-y-3 rounded-xl border border-dashed border-border p-4">
      <div>
        <h2 className="text-sm font-medium">{t("title")}</h2>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex-1 space-y-1 text-sm">
          <span className="text-muted-foreground">{t("usernameLabel")}</span>
          <input
            type="text"
            value={username}
            disabled={disabled || isResearching}
            placeholder={t("usernamePlaceholder")}
            onChange={(event) => setUsername(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || isResearching || !username.trim()}
          onClick={() => void handleResearch()}
        >
          {isResearching ? t("researching") : t("action")}
        </Button>
      </div>

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

      {normalized && result?.research.outcome === "FOUND" ? (
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">{t("previewAccount")}</dt>
            <dd>{normalized.account ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("previewName")}</dt>
            <dd>{normalized.displayName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("previewFollowers")}
            </dt>
            <dd>{formatCount(normalized.followers)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("previewFollowing")}
            </dt>
            <dd>{formatCount(normalized.following)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("previewPosts")}
            </dt>
            <dd>{formatCount(normalized.postsCount)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("previewFlags")}
            </dt>
            <dd>
              {normalized.isPrivate === true
                ? t("flagPrivate")
                : normalized.isPrivate === false
                  ? t("flagPublic")
                  : "—"}
              {" · "}
              {normalized.isVerified === true
                ? t("flagVerified")
                : normalized.isVerified === false
                  ? t("flagUnverified")
                  : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">{t("previewBio")}</dt>
            <dd className="whitespace-pre-wrap">{normalized.biography ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">
              {t("previewBioHashtags")}
            </dt>
            <dd>{formatHashtags(normalized.bioHashtags)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">
              {t("previewPostHashtags")}
            </dt>
            <dd>{formatHashtags(normalized.postHashtags)}</dd>
          </div>
          <p className="sm:col-span-2 text-xs text-muted-foreground">
            {t("notPersistedHint")}
          </p>
          <p className="sm:col-span-2 text-xs text-muted-foreground">
            {t("hashtagsNotNichesHint")}
          </p>
        </dl>
      ) : null}
    </section>
  );
}
