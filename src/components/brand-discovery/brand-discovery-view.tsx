"use client";

import { useTranslations } from "next-intl";

import { BrandCandidateAccordion } from "@/components/brand-discovery/brand-candidate-accordion";
import { BrandCandidateStatusFilter } from "@/components/brand-discovery/brand-candidate-status-filter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBrandDiscovery } from "@/hooks/use-brand-discovery";
import { classifyDiscoveryError } from "@/lib/discovery-error";

const BRAND_LIMIT_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export function BrandDiscoveryView() {
  const t = useTranslations("BrandDiscovery");
  const {
    influencers,
    selectedIds,
    viewInfluencerIds,
    influencersWithBrands,
    candidatesByViewedInfluencer,
    runs,
    loadingInfluencers,
    searching,
    limit,
    setLimit,
    updatingId,
    deletingId,
    error,
    processingInfluencerIds,
    selectionHasProcessing,
    retryingInfluencerId,
    retrySearch,
    toggleInfluencer,
    selectAll,
    clearSelection,
    toggleViewInfluencer,
    selectAllView,
    clearViewSelection,
    setInfluencerStatusFilter,
    startSearch,
    updateStatus,
    deleteCandidate,
  } = useBrandDiscovery();

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              {t("selectTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("selectDescription")}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="brand-discovery-limit" className="text-xs">
                {t("limitLabel")}
              </Label>
              <select
                id="brand-discovery-limit"
                className="h-9 min-w-16 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                value={limit}
                disabled={searching}
                onChange={(event) => setLimit(Number(event.target.value))}
                title={t("limitHint")}
                aria-description={t("limitHint")}
              >
                {BRAND_LIMIT_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={loadingInfluencers || influencers.length === 0}
            >
              {t("selectAll")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={selectedIds.size === 0}
            >
              {t("clearSelection")}
            </Button>
            <Button
              type="button"
              onClick={() => void startSearch()}
              disabled={selectedIds.size === 0 || searching || selectionHasProcessing}
              title={selectionHasProcessing ? t("runErrors.inProgress") : undefined}
            >
              {searching || selectionHasProcessing ? t("searching") : t("searchAction")}
            </Button>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {loadingInfluencers ? (
          <p className="text-sm text-muted-foreground">{t("loadingInfluencers")}</p>
        ) : influencers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptyInfluencers")}</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {influencers.map((influencer) => {
              const checked = selectedIds.has(influencer.id);
              return (
                <li key={influencer.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-accent/40">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input"
                      checked={checked}
                      onChange={() => toggleInfluencer(influencer.id)}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {influencer.name}
                    </span>
                    {influencer.niche ? (
                      <span className="text-xs text-muted-foreground">
                        {influencer.niche}
                      </span>
                    ) : null}
                    <Badge variant="secondary">{t("ibpActive")}</Badge>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("runsTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("runsDescription")}</p>
        </div>
        {runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptyRuns")}</p>
        ) : (
          <ul className="space-y-2">
            {runs.slice(0, 10).map((run) => {
              const meta = run.searchMetadata;
              const queries = meta?.queries?.filter(Boolean) ?? [];
              return (
                <li
                  key={run.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 text-sm"
                >
                  <span className="font-medium">{run.influencer.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{run.source}</Badge>
                    <Badge
                      variant={
                        run.status === "FAILED"
                          ? "destructive"
                          : run.status === "COMPLETED"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {t(`runStatus.${run.status}`)}
                    </Badge>
                  </div>
                  {meta && run.status === "COMPLETED" ? (
                    <p className="w-full text-xs text-muted-foreground">
                      {t("runMetaSummary", {
                        hits: meta.searchHitsCount ?? 0,
                        persisted: meta.persistedCount ?? 0,
                        afterFilters: meta.afterHardFiltersCount ?? 0,
                      })}
                      {meta.skippedPersistReason === "NO_SERP_HITS"
                        ? ` · ${t("runMetaNoSerp")}`
                        : null}
                    </p>
                  ) : null}
                  {queries.length > 0 ? (
                    <p className="w-full text-xs text-muted-foreground">
                      {t("runMetaQueries")}: {queries.join(" · ")}
                    </p>
                  ) : null}
                  {run.status === "FAILED" ? (
                    <div className="flex w-full flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs text-destructive">
                          {t(`runErrors.${classifyDiscoveryError(run.errorMessage)}`)}
                        </p>
                        {run.errorMessage ? (
                          <details className="text-xs text-muted-foreground">
                            <summary className="cursor-pointer select-none">
                              {t("runErrors.technical")}
                            </summary>
                            <p className="mt-1 break-words font-mono">{run.errorMessage}</p>
                          </details>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        disabled={
                          retryingInfluencerId !== null ||
                          processingInfluencerIds.has(run.influencerId)
                        }
                        onClick={() => void retrySearch(run.influencerId)}
                      >
                        {retryingInfluencerId === run.influencerId
                          ? t("runErrors.retrying")
                          : processingInfluencerIds.has(run.influencerId)
                            ? t("runErrors.processingHint")
                            : t("runErrors.retry")}
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              {t("viewTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("viewDescription")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAllView}
              disabled={influencersWithBrands.length === 0}
            >
              {t("selectAllView")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearViewSelection}
              disabled={viewInfluencerIds.size === 0}
            >
              {t("clearViewSelection")}
            </Button>
          </div>
        </div>

        {influencersWithBrands.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptyResults")}</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {influencersWithBrands.map((influencer) => {
              const checked = viewInfluencerIds.has(influencer.id);
              return (
                <li key={influencer.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-accent/40">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input"
                      checked={checked}
                      onChange={() => toggleViewInfluencer(influencer.id)}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {influencer.name}
                    </span>
                    <Badge variant="secondary">
                      {t("brandCount", { count: influencer.count })}
                    </Badge>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("resultsTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("resultsDescription")}
          </p>
        </div>

        {viewInfluencerIds.size === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptyViewSelection")}</p>
        ) : candidatesByViewedInfluencer.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptyResults")}</p>
        ) : (
          <Accordion
            type="multiple"
            className="w-full rounded-lg border border-border px-3"
          >
            {candidatesByViewedInfluencer.map(([influencerId, group]) => (
              <AccordionItem key={influencerId} value={influencerId}>
                <AccordionTrigger className="hover:no-underline">
                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left">
                    <span className="font-medium">{group.influencerName}</span>
                    <Badge variant="secondary">
                      {t("brandCount", { count: group.items.length })}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <BrandCandidateStatusFilter
                      value={group.statusFilter}
                      onChange={(status) =>
                        setInfluencerStatusFilter(influencerId, status)
                      }
                    />
                    <BrandCandidateAccordion
                      candidates={group.items}
                      updatingId={updatingId}
                      deletingId={deletingId}
                      emptyMessage={t("emptyFilteredResults")}
                      onUpdateStatus={(id, payload) => {
                        void updateStatus(id, payload);
                      }}
                      onDelete={(id) => {
                        void deleteCandidate(id);
                      }}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </div>
  );
}
