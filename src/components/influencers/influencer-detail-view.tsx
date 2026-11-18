"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { IdealBrandProfileSection } from "@/components/influencers/ideal-brand-profile-section";
import { InfluencerBrandCandidatesSection } from "@/components/influencers/influencer-brand-candidates-section";
import { IbpStatusBadge } from "@/components/influencers/ibp-status-badge";
import { ResearchInstagramButton } from "@/components/influencers/research-instagram-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useRouter } from "@/i18n/navigation";
import { getFieldOrigin } from "@/lib/influencer-provenance";
import {
  influencerKeys,
  invalidateInfluencerQueries,
} from "@/lib/influencer-query-keys";
import { deleteInfluencer, getInfluencer } from "@/services/influencers.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import { useState } from "react";

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
  originLabel,
}: {
  label: string;
  value: string;
  href?: string;
  originLabel?: string;
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
      {originLabel ? (
        <p className="text-xs text-muted-foreground">{originLabel}</p>
      ) : null}
    </div>
  );
}

export function InfluencerDetailView({ influencerId }: InfluencerDetailViewProps) {
  const t = useTranslations("InfluencerDetail");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: influencerKeys.detail(influencerId),
    queryFn: () => getInfluencer(influencerId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInfluencer(influencerId),
    onSuccess: async () => {
      await invalidateInfluencerQueries(queryClient);
      router.replace("/dashboard/creators");
    },
  });

  async function handleDelete() {
    setActionError(null);

    try {
      await deleteMutation.mutateAsync();
    } catch (deleteError) {
      if (isApiError(deleteError) && deleteError.status === 404) {
        setActionError(t("errors.notFound"));
      } else {
        setActionError(getApiErrorMessage(deleteError, t("errors.deleteFailed")));
      }
      setPendingDelete(false);
    }
  }

  if (detailQuery.isLoading) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </section>
    );
  }

  if (detailQuery.error || !detailQuery.data) {
    const error =
      isApiError(detailQuery.error) && detailQuery.error.status === 404
        ? t("errors.notFound")
        : getApiErrorMessage(detailQuery.error, t("errors.loadFailed"));

    return (
      <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-destructive">{error}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/creators">{t("backToList")}</Link>
        </Button>
      </section>
    );
  }

  const influencer = detailQuery.data;
  const provenances = influencer.fieldProvenances;
  const originLabel = (fieldKey: string) => {
    const origin = getFieldOrigin(provenances, fieldKey);
    return origin ? t(`origins.${origin}`) : undefined;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {influencer.name}
            </h1>
            <IbpStatusBadge status={influencer.idealBrandProfile?.status ?? null} />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("updatedAt", {
              value: formatDate(influencer.updatedAt, locale),
            })}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
          <ResearchInstagramButton
            influencerId={influencer.id}
            onSuccess={async () => {
              await invalidateInfluencerQueries(queryClient);
              await detailQuery.refetch();
            }}
          />
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
                disabled={deleteMutation.isPending}
                onClick={() => setPendingDelete(false)}
              >
                {t("deleteCancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => void handleDelete()}
              >
                {deleteMutation.isPending ? t("deleting") : t("deleteConfirmAction")}
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
              {t("sections.talent")}
            </CardTitle>
            <CardDescription>{t("sections.talentDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pb-5 sm:grid-cols-2">
            <DetailField
              label={t("fields.name")}
              value={influencer.name}
              originLabel={originLabel("name")}
            />
            <DetailField
              label={t("fields.manager")}
              value={
                influencer.manager
                  ? `${influencer.manager.name} (${influencer.manager.email})`
                  : "—"
              }
              originLabel={originLabel("managerId")}
            />
            <div className="space-y-2 sm:col-span-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("fields.niches")}
              </p>
              {influencer.niches?.length ? (
                <div className="flex flex-wrap gap-2">
                  {influencer.niches.map((niche) => (
                    <Badge key={niche} variant="secondary">
                      {niche}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm">—</p>
              )}
              {originLabel("niches") ? (
                <p className="text-xs text-muted-foreground">
                  {originLabel("niches")}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("fields.quarters")}
              </p>
              {influencer.quarterAssignments?.length ? (
                <div className="flex flex-wrap gap-2">
                  {influencer.quarterAssignments.map((item) => (
                    <Badge key={item.id} variant="outline">
                      {item.year} {item.quarter}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm">—</p>
              )}
            </div>
            <DetailField
              label={t("fields.outgoingEmail")}
              value={formatValue(influencer.outgoingEmail)}
              href={
                influencer.outgoingEmail
                  ? `mailto:${influencer.outgoingEmail}`
                  : undefined
              }
              originLabel={originLabel("outgoingEmail")}
            />
            <DetailField
              label={t("fields.email")}
              value={formatValue(influencer.email)}
              href={
                influencer.email ? `mailto:${influencer.email}` : undefined
              }
              originLabel={originLabel("email")}
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
              originLabel={originLabel("instagram")}
            />
            <DetailField
              label={t("fields.tiktok")}
              value={formatValue(influencer.tiktok)}
              originLabel={originLabel("tiktok")}
            />
            <DetailField
              label={t("fields.youtube")}
              value={formatValue(influencer.youtube)}
              originLabel={originLabel("youtube")}
            />
          </CardContent>
        </Card>

        <Card className="gap-0 border-border/80 py-0 shadow-sm">
          <CardHeader className="gap-1 py-5">
            <CardTitle className="text-base font-semibold">
              {t("sections.general")}
            </CardTitle>
            <CardDescription>{t("sections.generalDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pb-5 sm:grid-cols-2">
            <DetailField
              label={t("fields.country")}
              value={formatValue(influencer.country)}
              originLabel={originLabel("country")}
            />
            <DetailField
              label={t("fields.language")}
              value={formatValue(influencer.language)}
              originLabel={originLabel("language")}
            />
            <DetailField
              label={t("fields.niche")}
              value={formatValue(influencer.niche)}
              originLabel={originLabel("niche")}
            />
            <DetailField
              label={t("fields.subNiche")}
              value={formatValue(influencer.subNiche)}
              originLabel={originLabel("subNiche")}
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
              {t("sections.metrics")}
            </CardTitle>
            <CardDescription>{t("sections.metricsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pb-5 sm:grid-cols-2">
            <DetailField
              label={t("fields.followers")}
              value={formatFollowers(influencer.followers)}
              originLabel={originLabel("followers")}
            />
            <DetailField
              label={t("fields.engagement")}
              value={formatEngagement(influencer.engagement)}
              originLabel={originLabel("engagement")}
            />
          </CardContent>
        </Card>

        {influencer.instagramResearchEvidence?.normalized ? (
          <Card className="gap-0 border-border/80 py-0 shadow-sm lg:col-span-2">
            <CardHeader className="gap-1 py-5">
              <CardTitle className="text-base font-semibold">
                {t("sections.instagramEvidence")}
              </CardTitle>
              <CardDescription>
                {t("sections.instagramEvidenceDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pb-5 sm:grid-cols-2">
              <DetailField
                label={t("fields.following")}
                value={formatFollowers(
                  influencer.instagramResearchEvidence.normalized.following,
                )}
              />
              <DetailField
                label={t("fields.postsCount")}
                value={formatFollowers(
                  influencer.instagramResearchEvidence.normalized.postsCount,
                )}
              />
              <DetailField
                label={t("fields.isPrivate")}
                value={
                  influencer.instagramResearchEvidence.normalized.isPrivate ===
                  null
                    ? "—"
                    : String(
                        influencer.instagramResearchEvidence.normalized
                          .isPrivate,
                      )
                }
              />
              <DetailField
                label={t("fields.isVerified")}
                value={
                  influencer.instagramResearchEvidence.normalized.isVerified ===
                  null
                    ? "—"
                    : String(
                        influencer.instagramResearchEvidence.normalized
                          .isVerified,
                      )
                }
              />
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("fields.biography")}
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  {formatValue(
                    influencer.instagramResearchEvidence.normalized.biography,
                  )}
                </p>
              </div>
              <DetailField
                label={t("fields.bioHashtags")}
                value={
                  influencer.instagramResearchEvidence.normalized.bioHashtags
                    .length
                    ? influencer.instagramResearchEvidence.normalized.bioHashtags.join(
                        ", ",
                      )
                    : "—"
                }
              />
              <DetailField
                label={t("fields.postHashtags")}
                value={
                  influencer.instagramResearchEvidence.normalized.postHashtags
                    .length
                    ? influencer.instagramResearchEvidence.normalized.postHashtags.join(
                        ", ",
                      )
                    : "—"
                }
              />
              <div className="space-y-2 sm:col-span-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("fields.profileImageUrl")}
                </p>
                {influencer.instagramResearchEvidence.normalized
                  .profileImageUrl ? (
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Instagram CDN often requires no-referrer to render. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        influencer.instagramResearchEvidence.normalized
                          .profileImageUrl
                      }
                      alt={
                        influencer.instagramResearchEvidence.normalized
                          .displayName ??
                        influencer.name ??
                        "Instagram profile"
                      }
                      referrerPolicy="no-referrer"
                      className="h-20 w-20 rounded-full border border-border object-cover"
                    />
                    <a
                      href={
                        influencer.instagramResearchEvidence.normalized
                          .profileImageUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                    >
                      {t("fields.openProfileImage")}
                    </a>
                  </div>
                ) : (
                  <p className="text-sm">—</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <IdealBrandProfileSection
        influencerId={influencer.id}
        influencerUpdatedAt={influencer.updatedAt}
      />

      <InfluencerBrandCandidatesSection influencerId={influencer.id} />
    </div>
  );
}
