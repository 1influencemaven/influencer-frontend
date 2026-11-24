"use client";

import { ArrowDownUp, ChevronDown, FileUp, Mail, Plus, RefreshCw, Search, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { providerLabel } from "@/components/email-accounts/email-account-badges";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EmailAccountFilters } from "@/hooks/use-email-accounts";
import { cn } from "@/lib/utils";
import {
  EMAIL_ACCOUNT_SORT_KEYS,
  EMAIL_ACCOUNT_STATUSES,
  EMAIL_PROVIDERS,
  type EmailAccountOptions,
  type EmailAccountSortKey,
} from "@/types/email-accounts";

export type ConnectMode = "single" | "multiple" | "csv";

type ToolbarProps = {
  filters: EmailAccountFilters;
  hasActiveFilters: boolean;
  options?: EmailAccountOptions;
  sortBy: EmailAccountSortKey;
  sortOrder: "asc" | "desc";
  isFetching: boolean;
  onFiltersChange: (patch: Partial<EmailAccountFilters>) => void;
  onResetFilters: () => void;
  onSortChange: (key: EmailAccountSortKey, order: "asc" | "desc") => void;
  onRefresh: () => void;
  onConnect: (mode: ConnectMode) => void;
};

/** Notion database chip: subtle until active, then blue-tinted with a count. */
function FilterChip({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors",
            count > 0
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {label}
          {count > 0 ? <span className="tabular-nums">· {count}</span> : null}
          <ChevronDown className="size-3 opacity-60" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 w-60 overflow-y-auto">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export function EmailAccountsToolbar({
  filters,
  hasActiveFilters,
  options,
  sortBy,
  sortOrder,
  isFetching,
  onFiltersChange,
  onResetFilters,
  onSortChange,
  onRefresh,
  onConnect,
}: ToolbarProps) {
  const t = useTranslations("EmailAccounts");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex w-full items-center sm:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" aria-hidden />
          <span className="sr-only">{t("toolbar.search")}</span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFiltersChange({ search: event.target.value })}
            placeholder={t("toolbar.searchPlaceholder")}
            className="h-9 w-full rounded-md border border-transparent bg-transparent pr-3 pl-8 text-sm outline-none placeholder:text-muted-foreground hover:bg-accent/60 focus:border-input focus:bg-card"
          />
        </label>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <ArrowDownUp className="size-4" aria-hidden />
                <span className="hidden sm:inline">{t(`sort.${sortBy}`)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{t("sort.label")}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(value) => onSortChange(value as EmailAccountSortKey, sortOrder)}
              >
                {EMAIL_ACCOUNT_SORT_KEYS.map((key) => (
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
                <DropdownMenuRadioItem value="desc">{t("sort.desc")}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="asc">{t("sort.asc")}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={onRefresh}
            aria-label={t("toolbar.refresh")}
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} aria-hidden />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="size-4" aria-hidden />
                {t("toolbar.new")}
                <ChevronDown className="size-3.5 opacity-80" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => onConnect("single")} className="items-start gap-2 py-2">
                <Mail className="mt-0.5 size-4" aria-hidden />
                <span className="flex flex-col">
                  <span className="text-sm">{t("connect.single.title")}</span>
                  <span className="text-xs text-muted-foreground">{t("connect.single.hint")}</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onConnect("multiple")} className="items-start gap-2 py-2">
                <Users className="mt-0.5 size-4" aria-hidden />
                <span className="flex flex-col">
                  <span className="text-sm">{t("connect.multiple.title")}</span>
                  <span className="text-xs text-muted-foreground">{t("connect.multiple.hint")}</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onConnect("csv")} className="items-start gap-2 py-2">
                <FileUp className="mt-0.5 size-4" aria-hidden />
                <span className="flex flex-col">
                  <span className="text-sm">{t("connect.csv.title")}</span>
                  <span className="text-xs text-muted-foreground">{t("connect.csv.hint")}</span>
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip label={t("filters.status")} count={filters.status ? 1 : 0}>
          <DropdownMenuRadioGroup
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ status: value as EmailAccountFilters["status"] })}
          >
            <DropdownMenuRadioItem value="">{t("filters.any")}</DropdownMenuRadioItem>
            {EMAIL_ACCOUNT_STATUSES.map((status) => (
              <DropdownMenuRadioItem key={status} value={status}>
                {t(`status.${status}`)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </FilterChip>

        <FilterChip label={t("filters.provider")} count={filters.providers.length}>
          {EMAIL_PROVIDERS.map((provider) => (
            <DropdownMenuCheckboxItem
              key={provider}
              checked={filters.providers.includes(provider)}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={() => onFiltersChange({ providers: toggle(filters.providers, provider) })}
            >
              {providerLabel(provider)}
            </DropdownMenuCheckboxItem>
          ))}
        </FilterChip>

        <FilterChip label={t("filters.sequence")} count={filters.sequenceIds.length}>
          {(options?.sequences ?? []).length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">{t("filters.noOptions")}</p>
          ) : (
            options!.sequences.map((sequence) => (
              <DropdownMenuCheckboxItem
                key={sequence.id}
                checked={filters.sequenceIds.includes(sequence.id)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() =>
                  onFiltersChange({ sequenceIds: toggle(filters.sequenceIds, sequence.id) })
                }
              >
                <span className="truncate">{sequence.title}</span>
              </DropdownMenuCheckboxItem>
            ))
          )}
        </FilterChip>

        {(options?.clients ?? []).length > 0 ? (
          <FilterChip label={t("filters.client")} count={filters.clientIds.length}>
            {options!.clients.map((client) => (
              <DropdownMenuCheckboxItem
                key={client.id}
                checked={filters.clientIds.includes(client.id)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => onFiltersChange({ clientIds: toggle(filters.clientIds, client.id) })}
              >
                {client.name}
              </DropdownMenuCheckboxItem>
            ))}
          </FilterChip>
        ) : null}

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-3" aria-hidden />
            {t("filters.clear")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
