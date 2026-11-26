"use client";

import { ArrowDownUp, FileUp, ListFilter, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { TalentSelect } from "@/components/prospects/talent-select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProspectFilters } from "@/hooks/use-prospects";
import { cn } from "@/lib/utils";
import { PROSPECT_SOURCES, type ProspectsPage, type ProspectsQuery } from "@/types/prospects";

const TABS: ProspectFilters["tab"][] = ["all", "PERSON", "MAILBOX", "archived"];
const SORT_KEYS: ProspectsQuery["sortBy"][] = ["createdAt", "email", "company"];

/** Saleshandy-like prospects header: talent, quick tabs, search, Filters, sort, Import CSV. */
export function ProspectsToolbar({
  filters,
  counts,
  sortBy,
  sortOrder,
  onFiltersChange,
  onResetFilters,
  onSortChange,
  onImport,
}: {
  filters: ProspectFilters;
  counts?: ProspectsPage["counts"];
  sortBy: ProspectsQuery["sortBy"];
  sortOrder: "asc" | "desc";
  onFiltersChange: (patch: Partial<ProspectFilters>) => void;
  onResetFilters: () => void;
  onSortChange: (key: ProspectsQuery["sortBy"], order: "asc" | "desc") => void;
  onImport: () => void;
}) {
  const t = useTranslations("Prospects");
  const countFor = (tab: ProspectFilters["tab"]) =>
    tab === "all" ? counts?.active : tab === "archived" ? counts?.archived : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1" role="tablist">
          {TABS.map((tab) => {
            const active = filters.tab === tab;
            const count = countFor(tab);
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFiltersChange({ tab })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`tabs.${tab}`)}
                {count !== undefined ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      active ? "bg-primary/10 text-primary" : "bg-background/60",
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button size="sm" className="gap-1.5" onClick={onImport}>
            <FileUp className="size-4" aria-hidden />
            {t("toolbar.import")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <TalentSelect
          value={filters.influencerId}
          onChange={(influencerId) => onFiltersChange({ influencerId })}
          className="w-full sm:w-56"
        />
        <label className="relative flex w-full items-center sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" aria-hidden />
          <span className="sr-only">{t("toolbar.search")}</span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFiltersChange({ search: event.target.value })}
            placeholder={t("toolbar.searchPlaceholder")}
            className="h-9 w-full rounded-md border border-input bg-card pr-3 pl-8 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </label>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-1.5", filters.source && "border-primary/40 text-primary")}>
                <ListFilter className="size-4" aria-hidden />
                {t("toolbar.filters")}
                {filters.source ? (
                  <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums">1</span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>{t("filters.source")}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filters.source}
                onValueChange={(value) => onFiltersChange({ source: value as ProspectFilters["source"] })}
              >
                <DropdownMenuRadioItem value="">{t("filters.allSources")}</DropdownMenuRadioItem>
                {PROSPECT_SOURCES.map((source) => (
                  <DropdownMenuRadioItem key={source} value={source}>
                    {t(`source.${source}`)}
                    {counts?.bySource[source] ? (
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums">{counts.bySource[source]}</span>
                    ) : null}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              {filters.source ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onResetFilters}>{t("filters.clear")}</DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowDownUp className="size-4" aria-hidden />
                <span className="hidden sm:inline">{t(`sort.${sortBy}`)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>{t("sort.title")}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(value) => onSortChange(value as ProspectsQuery["sortBy"], sortOrder)}
              >
                {SORT_KEYS.map((key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {t(`sort.${key}`)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => onSortChange(sortBy, value as "asc" | "desc")}>
                <DropdownMenuRadioItem value="desc">{t("sort.desc")}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="asc">{t("sort.asc")}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filters.source ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 py-0.5 pr-1 pl-2.5 text-xs text-foreground">
            {t("filters.source")}: {t(`source.${filters.source}`)}
            <button
              type="button"
              onClick={() => onFiltersChange({ source: "" })}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              aria-label={t("filters.clear")}
            >
              <X className="size-3" aria-hidden />
            </button>
          </span>
        </div>
      ) : null}
    </div>
  );
}
