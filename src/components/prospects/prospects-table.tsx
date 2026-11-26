"use client";

import { Archive, ArchiveRestore, Eye, MoreHorizontal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { NotionTag } from "@/components/email-accounts/email-account-badges";
import { ProspectKindBadge, ProspectSourceBadge, prospectDisplayName } from "@/components/prospects/prospect-badges";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Prospect } from "@/types/prospects";

const headClass = "h-10 text-xs font-medium text-muted-foreground";

export function ProspectsTable({
  prospects,
  isLoading,
  error,
  hasActiveFilters,
  showTalent,
  onOpen,
  onToggleArchive,
  onRetry,
  onResetFilters,
  onImport,
}: {
  prospects: Prospect[];
  isLoading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  showTalent: boolean;
  onOpen: (p: Prospect) => void;
  onToggleArchive: (p: Prospect) => void;
  onRetry: () => void;
  onResetFilters: () => void;
  onImport: () => void;
}) {
  const t = useTranslations("Prospects");
  const locale = useLocale();
  const date = (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm" role="alert">
        <p className="font-medium text-destructive">{t("table.errorTitle")}</p>
        <p className="mt-1 text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          {t("table.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className={cn(headClass, "min-w-64 pl-4")}>{t("table.columns.contact")}</TableHead>
            <TableHead className={headClass}>{t("table.columns.company")}</TableHead>
            <TableHead className={cn(headClass, "hidden lg:table-cell")}>{t("table.columns.jobTitle")}</TableHead>
            {showTalent ? <TableHead className={cn(headClass, "hidden md:table-cell")}>{t("table.columns.talent")}</TableHead> : null}
            <TableHead className={cn(headClass, "hidden md:table-cell")}>{t("table.columns.source")}</TableHead>
            <TableHead className={cn(headClass, "hidden xl:table-cell")}>{t("table.columns.tags")}</TableHead>
            <TableHead className={cn(headClass, "hidden xl:table-cell")}>{t("table.columns.added")}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && prospects.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`s-${i}`}>
                  <TableCell className="pl-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="mt-1.5 h-3 w-28" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  {showTalent ? <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell> : null}
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="hidden xl:table-cell" />
                  <TableCell className="hidden xl:table-cell" />
                  <TableCell />
                </TableRow>
              ))
            : null}

          {!isLoading && prospects.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="py-14 text-center">
                <p className="text-sm font-medium">{hasActiveFilters ? t("table.noMatches") : t("table.emptyTitle")}</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                  {hasActiveFilters ? t("table.noMatchesHint") : t("table.emptyHint")}
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  {hasActiveFilters ? (
                    <Button variant="outline" size="sm" onClick={onResetFilters}>
                      {t("filters.clear")}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={onImport}>
                      {t("toolbar.import")}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : null}

          {prospects.map((p) => {
            const name = prospectDisplayName(p);
            return (
              <TableRow key={p.id} className={cn("cursor-pointer", p.status === "ARCHIVED" && "opacity-70")} onClick={() => onOpen(p)}>
                <TableCell className="py-2.5 pl-4">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{p.email}</span>
                    <ProspectKindBadge prospect={p} />
                  </div>
                  {name ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{name}</p> : null}
                </TableCell>
                <TableCell>
                  <p className="truncate text-sm">{p.company ?? "—"}</p>
                  {p.companyDomain ? <p className="truncate text-xs text-muted-foreground">{p.companyDomain}</p> : null}
                </TableCell>
                <TableCell className="hidden max-w-48 truncate text-sm text-muted-foreground lg:table-cell">
                  {p.jobTitle ?? "—"}
                </TableCell>
                {showTalent ? (
                  <TableCell className="hidden text-sm md:table-cell">{p.influencerName ?? "—"}</TableCell>
                ) : null}
                <TableCell className="hidden md:table-cell">
                  <ProspectSourceBadge source={p.source} />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {p.tags.length ? (
                    <span className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 2).map((tag) => (
                        <NotionTag key={tag}>{tag}</NotionTag>
                      ))}
                      {p.tags.length > 2 ? <span className="text-xs text-muted-foreground">+{p.tags.length - 2}</span> : null}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">{date(p.createdAt)}</TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" aria-label={t("actions.menu")}>
                        <MoreHorizontal className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onOpen(p)}>
                        <Eye className="size-4" aria-hidden />
                        {t("actions.view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleArchive(p)}>
                        {p.status === "ACTIVE" ? <Archive className="size-4" aria-hidden /> : <ArchiveRestore className="size-4" aria-hidden />}
                        {p.status === "ACTIVE" ? t("actions.archive") : t("actions.restore")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
