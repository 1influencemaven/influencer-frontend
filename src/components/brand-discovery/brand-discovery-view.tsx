"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { BrandCandidateAccordion } from "@/components/brand-discovery/brand-candidate-accordion";
import { BrandCandidateStatusFilter } from "@/components/brand-discovery/brand-candidate-status-filter";
import { IbpStatusBadge } from "@/components/influencers/ibp-status-badge";
import { InfluencersTableFilters } from "@/components/influencers/influencers-table-filters";
import { InfluencersTablePagination } from "@/components/influencers/influencers-table-pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBrandDiscovery } from "@/hooks/use-brand-discovery";
import { Link } from "@/i18n/navigation";
import type { InfluencerSortBy } from "@/types/influencer";

const BRAND_LIMIT_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

function SortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: InfluencerSortBy;
  sortBy: InfluencerSortBy;
  sortOrder: "asc" | "desc";
}) {
  if (sortBy !== column) {
    return <ArrowUpDown className="size-3.5 opacity-50" aria-hidden />;
  }

  return sortOrder === "asc" ? (
    <ArrowUp className="size-3.5" aria-hidden />
  ) : (
    <ArrowDown className="size-3.5" aria-hidden />
  );
}

export function BrandDiscoveryView() {
  const t = useTranslations("BrandDiscovery");
  const tInfluencers = useTranslations("Influencers");
  const {
    influencersList,
    selectedIds,
    allSelectedHaveActiveIbp,
    canSearchBrands,
    brandCountByInfluencerId,
    candidatesBySelectedInfluencer,
    searching,
    limit,
    setLimit,
    updatingId,
    deletingId,
    error,
    hasProcessing,
    toggleInfluencer,
    selectAllOnPage,
    clearSelection,
    setInfluencerStatusFilter,
    startSearch,
    updateStatus,
    deleteCandidate,
  } = useBrandDiscovery();

  const {
    state,
    data,
    isLoading,
    setPage,
    setLimit: setPageSize,
    setFilters,
    toggleSort,
    refetch,
  } = influencersList;

  const [searchInput, setSearchInput] = useState(state.filters.search);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput !== state.filters.search) {
        setFilters({ search: searchInput });
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput, state.filters.search, setFilters]);

  const influencers = data?.data ?? [];
  const showEmptyState = !isLoading && !error && influencers.length === 0;
  const allOnPageSelected =
    influencers.length > 0 &&
    influencers.every((influencer) => selectedIds.has(influencer.id));

  function renderSortableHead(
    column: InfluencerSortBy,
    label: string,
    className?: string,
  ) {
    return (
      <TableHead className={className}>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
          onClick={() => toggleSort(column)}
        >
          {label}
          <SortIcon
            column={column}
            sortBy={state.sortBy}
            sortOrder={state.sortOrder}
          />
        </button>
      </TableHead>
    );
  }

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
                disabled={searching || hasProcessing}
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
              onClick={selectAllOnPage}
              disabled={isLoading || influencers.length === 0 || allOnPageSelected}
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
              disabled={!canSearchBrands}
              title={
                selectedIds.size > 0 && !allSelectedHaveActiveIbp
                  ? t("searchRequiresActiveIbp")
                  : undefined
              }
            >
              {searching || hasProcessing ? t("searching") : t("searchAction")}
            </Button>
          </div>
        </div>

        {selectedIds.size > 0 && !allSelectedHaveActiveIbp ? (
          <p className="text-sm text-muted-foreground">
            {t("searchRequiresActiveIbp")}
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <InfluencersTableFilters
          filters={{ ...state.filters, search: searchInput }}
          onFiltersChange={(filters) => {
            if (filters.search !== undefined) {
              setSearchInput(filters.search);
              return;
            }
            setFilters(filters);
          }}
          disabled={isLoading}
        />

        {showEmptyState ? (
          <section className="rounded-xl border border-dashed border-border bg-muted/40 p-6">
            <p className="text-sm text-muted-foreground">{t("emptyInfluencers")}</p>
          </section>
        ) : null}

        {!showEmptyState ? (
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-muted/40">
                  <TableHead className="w-12 px-4">
                    <span className="sr-only">{t("selectColumn")}</span>
                  </TableHead>
                  {renderSortableHead("name", tInfluencers("columns.name"), "px-4")}
                  <TableHead className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {tInfluencers("columns.instagram")}
                  </TableHead>
                  <TableHead className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {tInfluencers("columns.ibpStatus")}
                  </TableHead>
                  <TableHead className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {t("columns.brands")}
                  </TableHead>
                  <TableHead className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {tInfluencers("columns.niches")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        {Array.from({ length: 6 }).map((__, cellIndex) => (
                          <TableCell key={cellIndex} className="px-4">
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : influencers.map((influencer) => {
                      const brandCount =
                        brandCountByInfluencerId.get(influencer.id) ?? 0;
                      const checked = selectedIds.has(influencer.id);
                      const ibpStatus =
                        influencer.idealBrandProfile?.status ?? null;

                      return (
                        <TableRow key={influencer.id}>
                          <TableCell className="px-4">
                            <input
                              type="checkbox"
                              className="size-4 rounded border-input"
                              checked={checked}
                              onChange={() =>
                                toggleInfluencer(influencer.id, ibpStatus)
                              }
                              aria-label={t("selectInfluencer", {
                                name: influencer.name,
                              })}
                            />
                          </TableCell>
                          <TableCell className="px-4 text-sm font-medium">
                            <Link
                              href={`/dashboard/creators/${influencer.id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {influencer.name}
                            </Link>
                          </TableCell>
                          <TableCell className="px-4 text-sm text-muted-foreground">
                            {influencer.instagram ?? "—"}
                          </TableCell>
                          <TableCell className="px-4">
                            <IbpStatusBadge status={ibpStatus} />
                          </TableCell>
                          <TableCell className="px-4">
                            {brandCount > 0 ? (
                              <Badge variant="secondary">
                                {t("brandCount", { count: brandCount })}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {t("noBrands")}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 text-sm text-muted-foreground">
                            {influencer.niches?.length
                              ? influencer.niches.join(", ")
                              : (influencer.niche ?? "—")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>

            {data ? (
              <div className="border-t border-border px-4 py-4">
                <InfluencersTablePagination
                  meta={data.meta}
                  onPageChange={setPage}
                  onLimitChange={setPageSize}
                  disabled={isLoading}
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {error && influencers.length === 0 && !isLoading ? (
          <Button variant="outline" onClick={() => void refetch()}>
            {tInfluencers("retry")}
          </Button>
        ) : null}
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

        {selectedIds.size === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptyViewSelection")}</p>
        ) : candidatesBySelectedInfluencer.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("emptySelectedNoBrands")}
          </p>
        ) : (
          <Accordion
            type="multiple"
            className="w-full rounded-lg border border-border px-3"
          >
            {candidatesBySelectedInfluencer.map(([influencerId, group]) => (
              <AccordionItem key={influencerId} value={influencerId}>
                <AccordionTrigger className="hover:no-underline">
                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left">
                    <span className="font-medium">{group.influencerName}</span>
                    <Badge variant="secondary">
                      {t("brandCount", { count: group.totalCount })}
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
