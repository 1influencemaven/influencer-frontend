"use client";

import { ArrowDownUp, ListFilter, Plus, RefreshCw, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { FIELD_TYPE_ICONS } from "@/components/fields/field-badges";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FieldFilters } from "@/hooks/use-fields";
import { cn } from "@/lib/utils";
import {
  FIELD_SORT_KEYS,
  FIELD_TYPES,
  type FieldSortKey,
  type FieldsListResponse,
} from "@/types/fields";

type ToolbarProps = {
  filters: FieldFilters;
  counts?: FieldsListResponse["counts"];
  availableTags: string[];
  lastSync: FieldsListResponse["lastSync"];
  sortBy: FieldSortKey;
  sortOrder: "asc" | "desc";
  isSyncing: boolean;
  canManage: boolean;
  onFiltersChange: (patch: Partial<FieldFilters>) => void;
  onResetFilters: () => void;
  onSortChange: (key: FieldSortKey, order: "asc" | "desc") => void;
  onSync: () => void;
  onCreate: () => void;
};

const toggle = <T extends string>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const TABS: FieldFilters["tab"][] = ["all", "custom", "system", "disabled"];

function useRelativeTime() {
  const locale = useLocale();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return (iso: string) => {
    const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
    if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 48) return rtf.format(hours, "hour");
    return rtf.format(Math.round(hours / 24), "day");
  };
}

/** Saleshandy "Prospect Fields" header: origin tabs, sync + Add Field, search, Filters, chips. */
export function FieldsToolbar({
  filters,
  counts,
  availableTags,
  lastSync,
  sortBy,
  sortOrder,
  isSyncing,
  canManage,
  onFiltersChange,
  onResetFilters,
  onSortChange,
  onSync,
  onCreate,
}: ToolbarProps) {
  const t = useTranslations("Fields");
  const relative = useRelativeTime();
  const advancedCount = filters.fieldTypes.length + filters.tags.length;

  const appliedTags = [
    ...filters.fieldTypes.map((type) => ({
      key: `t-${type}`,
      label: `${t("filters.type")}: ${t(`types.${type}`)}`,
      onRemove: () => onFiltersChange({ fieldTypes: toggle(filters.fieldTypes, type) }),
    })),
    ...filters.tags.map((tag) => ({
      key: `g-${tag}`,
      label: `${t("filters.tag")}: ${tag}`,
      onRemove: () => onFiltersChange({ tags: toggle(filters.tags, tag) }),
    })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1" role="tablist">
          {TABS.map((tab) => {
            const active = filters.tab === tab;
            const count = counts?.[tab];
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
          {lastSync ? (
            <span
              className={cn(
                "hidden text-xs lg:inline",
                lastSync.status === "FAILED" ? "text-destructive" : "text-muted-foreground",
              )}
              title={lastSync.errorMessage ?? undefined}
            >
              {lastSync.status === "FAILED"
                ? t("sync.failedAt", { when: relative(lastSync.at) })
                : t("sync.lastAt", { when: relative(lastSync.at) })}
            </span>
          ) : null}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onSync} disabled={isSyncing}>
            <RefreshCw className={cn("size-4", isSyncing && "animate-spin")} aria-hidden />
            <span className="hidden sm:inline">{t("toolbar.sync")}</span>
          </Button>
          {canManage ? (
            <Button size="sm" className="gap-1.5" onClick={onCreate}>
              <Plus className="size-4" aria-hidden />
              {t("toolbar.add")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
              <Button
                variant="outline"
                size="sm"
                className={cn("gap-1.5", advancedCount > 0 && "border-primary/40 text-primary")}
              >
                <ListFilter className="size-4" aria-hidden />
                {t("toolbar.filters")}
                {advancedCount > 0 ? (
                  <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums">
                    {advancedCount}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t("filters.type")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {FIELD_TYPES.map((type) => {
                    const Icon = FIELD_TYPE_ICONS[type];
                    return (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={filters.fieldTypes.includes(type)}
                        onSelect={(event) => event.preventDefault()}
                        onCheckedChange={() => onFiltersChange({ fieldTypes: toggle(filters.fieldTypes, type) })}
                      >
                        <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                        {t(`types.${type}`)}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t("filters.tag")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-80 w-56 overflow-y-auto">
                  {availableTags.length === 0 ? (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground">{t("filters.noTags")}</p>
                  ) : (
                    availableTags.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag}
                        checked={filters.tags.includes(tag)}
                        onSelect={(event) => event.preventDefault()}
                        onCheckedChange={() => onFiltersChange({ tags: toggle(filters.tags, tag) })}
                      >
                        <span className="truncate">{tag}</span>
                      </DropdownMenuCheckboxItem>
                    ))
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {advancedCount > 0 ? (
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
                onValueChange={(value) => onSortChange(value as FieldSortKey, sortOrder)}
              >
                {FIELD_SORT_KEYS.map((key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {t(`sort.${key}`)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortOrder}
                onValueChange={(value) => onSortChange(sortBy, value as "asc" | "desc")}
              >
                <DropdownMenuRadioItem value="asc">{t("sort.asc")}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">{t("sort.desc")}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {appliedTags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {appliedTags.map((tag) => (
            <span
              key={tag.key}
              className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 py-0.5 pr-1 pl-2.5 text-xs text-foreground"
            >
              {tag.label}
              <button
                type="button"
                onClick={tag.onRemove}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                aria-label={t("filters.remove", { filter: tag.label })}
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          ))}
          <button type="button" onClick={onResetFilters} className="px-1 text-xs font-medium text-primary hover:underline">
            {t("filters.clear")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
