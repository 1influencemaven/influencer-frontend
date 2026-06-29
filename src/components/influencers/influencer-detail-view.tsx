"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { CommercialProfileSection } from "@/components/influencers/commercial-profile-section";
import { GenerateProfileButton } from "@/components/influencers/generate-profile-button";
import { ProfileStatusBadge } from "@/components/influencers/profile-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteInfluencer, getInfluencer } from "@/services/influencers.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import type { Influencer } from "@/types/influencer";

type InfluencerDetailViewProps = {
  influencerId: string;
};

function formatValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function formatFollowers(value: number | null): string {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat().format(value);
}

function formatEngagement(value: string | null): string {
  if (!value) {
    return "—";
  }

  return `${value}%`;
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DetailField({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      {href && value !== "—" ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm">{value}</p>
      )}
    </div>
  );
}

export function InfluencerDetailView({ influencerId }: InfluencerDetailViewProps) {
  const t = useTranslations("InfluencerDetail");
  const locale = useLocale();
  const router = useRouter();
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadInfluencer = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getInfluencer(influencerId);
      setInfluencer(data);
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 404) {
        setError(t("errors.notFound"));
      } else {
        setError(getApiErrorMessage(loadError, t("errors.loadFailed")));
      }
    } finally {
      setIsLoading(false);
    }
  }, [influencerId, t]);

  useEffect(() => {
    void loadInfluencer();
  }, [loadInfluencer]);

  async function handleDelete() {
    setIsDeleting(true);
    setActionError(null);

    try {
      await deleteInfluencer(influencerId);
      router.replace("/dashboard/creators");
    } catch (deleteError) {
      if (isApiError(deleteError) && deleteError.status === 404) {
        setActionError(t("errors.notFound"));
      } else {
        setActionError(getApiErrorMessage(deleteError, t("errors.deleteFailed")));
      }
      setIsDeleting(false);
      setPendingDelete(false);
    }
  }

  function handleGenerateSuccess() {
    setInfluencer((current) =>
      current
        ? {
            ...current,
            profileStatus: "PROCESSING",
          }
        : current,
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </section>
    );
  }

  if (error || !influencer) {
    return (
      <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-destructive">{error ?? t("errors.notFound")}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/creators">{t("backToList")}</Link>
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {influencer.name}
            </h1>
            <ProfileStatusBadge status={influencer.profileStatus} />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("updatedAt", {
              value: formatDate(influencer.updatedAt, locale),
            })}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {influencer.profileStatus !== "PROCESSING" ? (
            <GenerateProfileButton
              influencerId={influencer.id}
              profileStatus={influencer.profileStatus}
              onSuccess={handleGenerateSuccess}
            />
          ) : null}
          <Button asChild variant="outline">
            <Link href={`/dashboard/creators/${influencer.id}/edit`}>
              {t("editAction")}
            </Link>
          </Button>
          {pendingDelete ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("deleteConfirm")}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setPendingDelete(false)}
              >
                {t("deleteCancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
              >
                {isDeleting ? t("deleting") : t("deleteConfirmAction")}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setPendingDelete(true)}
            >
              {t("deleteAction")}
            </Button>
          )}
        </div>
      </div>

      {actionError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="gap-0 border-border/80 py-0 shadow-sm">
          <CardHeader className="gap-1 py-5">
            <CardTitle className="text-base font-semibold">
              {t("sections.general")}
            </CardTitle>
            <CardDescription>{t("sections.generalDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pb-5 sm:grid-cols-2">
            <DetailField label={t("fields.name")} value={influencer.name} />
            <DetailField
              label={t("fields.country")}
              value={formatValue(influencer.country)}
            />
            <DetailField
              label={t("fields.language")}
              value={formatValue(influencer.language)}
            />
            <DetailField
              label={t("fields.niche")}
              value={formatValue(influencer.niche)}
            />
            <DetailField
              label={t("fields.subNiche")}
              value={formatValue(influencer.subNiche)}
            />
            <DetailField
              label={t("fields.email")}
              value={formatValue(influencer.email)}
              href={
                influencer.email ? `mailto:${influencer.email}` : undefined
              }
            />
            <DetailField
              label={t("fields.mediaKitUrl")}
              value={formatValue(influencer.mediaKitUrl)}
              href={influencer.mediaKitUrl ?? undefined}
            />
          </CardContent>
        </Card>

        <Card className="gap-0 border-border/80 py-0 shadow-sm">
          <CardHeader className="gap-1 py-5">
            <CardTitle className="text-base font-semibold">
              {t("sections.social")}
            </CardTitle>
            <CardDescription>{t("sections.socialDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pb-5">
            <DetailField
              label={t("fields.instagram")}
              value={formatValue(influencer.instagram)}
            />
            <DetailField
              label={t("fields.tiktok")}
              value={formatValue(influencer.tiktok)}
            />
            <DetailField
              label={t("fields.youtube")}
              value={formatValue(influencer.youtube)}
            />
          </CardContent>
        </Card>

        <Card className="gap-0 border-border/80 py-0 shadow-sm">
          <CardHeader className="gap-1 py-5">
            <CardTitle className="text-base font-semibold">
              {t("sections.metrics")}
            </CardTitle>
            <CardDescription>{t("sections.metricsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pb-5 sm:grid-cols-2">
            <DetailField
              label={t("fields.followers")}
              value={formatFollowers(influencer.followers)}
            />
            <DetailField
              label={t("fields.engagement")}
              value={formatEngagement(influencer.engagement)}
            />
          </CardContent>
        </Card>

        <Card className="gap-0 border-border/80 py-0 shadow-sm">
          <CardHeader className="gap-1 py-5">
            <CardTitle className="text-base font-semibold">
              {t("sections.status")}
            </CardTitle>
            <CardDescription>{t("sections.statusDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-5">
            <ProfileStatusBadge status={influencer.profileStatus} />
            {influencer.profileStatus === "PROCESSING" ? (
              <p className="text-sm text-muted-foreground">
                {t("processingHint")}
              </p>
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={() => void loadInfluencer()}>
              {t("refresh")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <CommercialProfileSection
        profileStatus={influencer.profileStatus}
        commercialProfile={influencer.commercialProfile}
        influencerId={influencer.id}
        showGenerateButton={influencer.profileStatus !== "PROCESSING"}
        onGenerateSuccess={handleGenerateSuccess}
      />
    </div>
  );
}
