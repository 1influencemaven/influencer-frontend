"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { ProfileStatusBadge } from "@/components/influencers/profile-status-badge";
import { InfluencersTableFilters } from "@/components/influencers/influencers-table-filters";
import { InfluencersTablePagination } from "@/components/influencers/influencers-table-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInfluencersList } from "@/hooks/use-influencers-list";
import { Link } from "@/i18n/navigation";
import { deleteInfluencer } from "@/services/influencers.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import type { InfluencerSortBy } from "@/types/influencer";

function formatCreatedAt(value: string | undefined, locale: string): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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

export function InfluencersTable() {
  const t = useTranslations("Influencers");
  const locale = useLocale();
  const {
    state,
    data,
    isLoading,
    error,
    setPage,
    setLimit,
    setFilters,
    toggleSort,
    removeInfluencer,
    refetch,
  } = useInfluencersList({ loadErrorMessage: t("loadError") });

  const [searchInput, setSearchInput] = useState(state.filters.search);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput !== state.filters.search) {
        setFilters({ search: searchInput });
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput, state.filters.search, setFilters]);

  async function handleDelete(influencerId: string) {
    setDeletingId(influencerId);
    setActionError(null);

    try {
      await deleteInfluencer(influencerId);
      removeInfluencer(influencerId);
      setPendingDeleteId(null);

      if (data && data.data.length === 1 && state.page > 1) {
        setPage(state.page - 1);
      } else {
        await refetch();
      }
    } catch (deleteError) {
      if (isApiError(deleteError) && deleteError.status === 404) {
        setActionError(t("deleteNotFound"));
      } else {
        setActionError(getApiErrorMessage(deleteError, t("deleteError")));
      }
    } finally {
      setDeletingId(null);
    }
  }

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

  const influencers = data?.data ?? [];
  const showEmptyState = !isLoading && !error && influencers.length === 0;

  return (
    <div className="space-y-4">
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

      {actionError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      {error && influencers.length === 0 ? (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-destructive">{error}</p>
          <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
            {t("retry")}
          </Button>
        </section>
      ) : null}

      {showEmptyState ? (
        <section className="rounded-xl border border-dashed border-border bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
        </section>
      ) : null}

      {!showEmptyState && !(error && influencers.length === 0) ? (
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-muted/40">
                {renderSortableHead("name", t("columns.name"), "px-4")}
                <TableHead className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("columns.niche")}
                </TableHead>
                {renderSortableHead(
                  "followers",
                  t("columns.followers"),
                  "px-4",
                )}
                {renderSortableHead(
                  "engagement",
                  t("columns.engagement"),
                  "px-4",
                )}
                <TableHead className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("columns.profileStatus")}
                </TableHead>
                {renderSortableHead(
                  "createdAt",
                  t("columns.createdAt"),
                  "px-4",
                )}
                <TableHead className="px-4 text-right text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {Array.from({ length: 7 }).map((__, cellIndex) => (
                        <TableCell key={cellIndex} className="px-4">
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : influencers.map((influencer) => {
                    const isPendingDelete = pendingDeleteId === influencer.id;
                    const isDeleting = deletingId === influencer.id;

                    return (
                      <TableRow key={influencer.id}>
                        <TableCell className="px-4 text-sm font-medium">
                          <Link
                            href={`/dashboard/creators/${influencer.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {influencer.name}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 text-sm text-muted-foreground">
                          {influencer.niche ?? "—"}
                        </TableCell>
                        <TableCell className="px-4 text-sm text-muted-foreground">
                          {formatFollowers(influencer.followers)}
                        </TableCell>
                        <TableCell className="px-4 text-sm text-muted-foreground">
                          {formatEngagement(influencer.engagement)}
                        </TableCell>
                        <TableCell className="px-4">
                          <ProfileStatusBadge status={influencer.profileStatus} />
                        </TableCell>
                        <TableCell className="px-4 text-sm text-muted-foreground">
                          {formatCreatedAt(influencer.createdAt, locale)}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          {isPendingDelete ? (
                            <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                              <span className="text-xs text-muted-foreground">
                                {t("deleteConfirm")}
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={isDeleting}
                                  onClick={() => setPendingDeleteId(null)}
                                >
                                  {t("deleteCancel")}
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  disabled={isDeleting}
                                  onClick={() => void handleDelete(influencer.id)}
                                >
                                  {isDeleting
                                    ? t("deleting")
                                    : t("deleteConfirmAction")}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/dashboard/creators/${influencer.id}`}>
                                  {t("viewAction")}
                                </Link>
                              </Button>
                              <Button asChild variant="outline" size="sm">
                                <Link
                                  href={`/dashboard/creators/${influencer.id}/edit`}
                                >
                                  {t("editAction")}
                                </Link>
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => setPendingDeleteId(influencer.id)}
                              >
                                {t("deleteAction")}
                              </Button>
                            </div>
                          )}
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
                onLimitChange={setLimit}
                disabled={isLoading}
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
