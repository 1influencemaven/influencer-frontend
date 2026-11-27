"use client";

import { AlertTriangle, Plus, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { TalentSelect } from "@/components/prospects/talent-select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTemplatesList } from "@/hooks/use-templates";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/types/api-error";

const headClass = "h-10 text-xs font-medium text-muted-foreground";

/**
 * HU-TPL-004: templates list. With `influencerId` it is the talent's section;
 * without it (Campaigns tab) a talent selector filters the list.
 */
export function TemplatesView({ influencerId, compact = false }: { influencerId?: string; compact?: boolean }) {
  const t = useTranslations("Templates");
  const locale = useLocale();
  const router = useRouter();
  const list = useTemplatesList(influencerId);
  const rows = list.data?.data ?? [];
  const counts = list.data?.counts;
  const talentId = influencerId ?? list.influencerId;
  const date = (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));
  const newHref = talentId ? `/dashboard/creators/${talentId}/templates/new` : null;

  return (
    <div className="flex flex-col gap-4">
      {!compact ? (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">{t("title")}</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">{t("description")}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 rounded-lg bg-muted p-1" role="tablist">
          {(["active", "archived"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={list.tab === tab}
              onClick={() => list.setTab(tab)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                list.tab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`tabs.${tab}`)}
              {counts ? (
                <span className={cn("rounded-full px-1.5 text-xs tabular-nums", list.tab === tab ? "bg-primary/10 text-primary" : "bg-background/60")}>
                  {counts[tab]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          {newHref ? (
            <Button asChild size="sm" className="gap-1.5">
              <Link href={newHref}>
                <Plus className="size-4" aria-hidden />
                {t("new")}
              </Link>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">{t("chooseTalentToCreate")}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {!influencerId ? <TalentSelect value={list.influencerId} onChange={list.setInfluencerId} className="w-full sm:w-56" /> : null}
        <label className="relative flex w-full items-center sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" aria-hidden />
          <span className="sr-only">{t("search")}</span>
          <input
            type="search"
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-9 w-full rounded-md border border-input bg-card pr-3 pl-8 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </label>
      </div>

      {list.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm" role="alert">
          <p className="font-medium text-destructive">{t("table.errorTitle")}</p>
          <p className="mt-1 text-muted-foreground">{getApiErrorMessage(list.error, t("table.loadError"))}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => void list.refetch()}>
            {t("table.retry")}
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className={cn(headClass, "pl-4")}>{t("table.columns.name")}</TableHead>
                <TableHead className={headClass}>{t("table.columns.subject")}</TableHead>
                {!influencerId ? <TableHead className={cn(headClass, "hidden md:table-cell")}>{t("table.columns.talent")}</TableHead> : null}
                <TableHead className={cn(headClass, "hidden lg:table-cell")}>{t("table.columns.created")}</TableHead>
                <TableHead className={cn(headClass, "hidden sm:table-cell")}>{t("table.columns.updated")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading && rows.length === 0
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={`s-${i}`}>
                      <TableCell className="pl-4"><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-56" /></TableCell>
                      {!influencerId ? <TableCell className="hidden md:table-cell" /> : null}
                      <TableCell className="hidden lg:table-cell" />
                      <TableCell className="hidden sm:table-cell" />
                    </TableRow>
                  ))
                : null}
              {!list.isLoading && rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-12 text-center">
                    <p className="text-sm font-medium">{list.search ? t("table.noMatches") : t("table.emptyTitle")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{list.search ? t("table.noMatchesHint") : t("table.emptyHint")}</p>
                    {newHref && !list.search ? (
                      <Button asChild size="sm" className="mt-4">
                        <Link href={newHref}>{t("new")}</Link>
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ) : null}
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn("cursor-pointer", row.status === "ARCHIVED" && "opacity-70")}
                  onClick={() => router.push(`/dashboard/creators/${row.influencerId}/templates/${row.id}`)}
                >
                  <TableCell className="py-2.5 pl-4">
                    <span className="flex items-center gap-2 font-medium">
                      {row.name}
                      {row.validationIssues > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-400/10 dark:text-amber-400" title={t("table.issuesHint")}>
                          <AlertTriangle className="size-3" aria-hidden />
                          {row.validationIssues}
                        </span>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-80 truncate text-sm text-muted-foreground">{row.subject}</TableCell>
                  {!influencerId ? <TableCell className="hidden text-sm md:table-cell">{row.influencerName ?? "—"}</TableCell> : null}
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">{date(row.createdAt)}</TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">{date(row.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
