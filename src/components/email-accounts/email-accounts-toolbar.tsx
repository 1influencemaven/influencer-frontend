"use client";

import {
  ArrowDownUp,
  ChevronDown,
  FileUp,
  ListFilter,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EmailAccountFilters } from "@/hooks/use-email-accounts";
import { cn } from "@/lib/utils";
import {
  EMAIL_ACCOUNT_SORT_KEYS,
  EMAIL_PROVIDERS,
  type EmailAccountOptions,
  type EmailAccountSortKey,
  type EmailAccountStatus,
} from "@/types/email-accounts";

export type ConnectMode = "single" | "multiple" | "csv";

type ToolbarProps = {
  filters: EmailAccountFilters;
  counts?: { connected: number; disconnected: number; paused: number };
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

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const STATUS_TABS: Array<EmailAccountStatus | ""> = ["", "CONNECTED", "DISCONNECTED", "PAUSED"];

/** Saleshandy-like list header: status quick tabs, search, Filters button, applied filter tags. */
export function EmailAccountsToolbar({
  filters,
  counts,
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

  const countFor = (status: EmailAccountStatus | ""): number | undefined => {
    if (!counts) return undefined;
    if (status === "CONNECTED") return counts.connected;
    if (status === "DISCONNECTED") return counts.disconnected;
    if (status === "PAUSED") return counts.paused;
    return counts.connected + counts.disconnected + counts.paused;
  };

  const advancedCount =
    filters.providers.length + filters.sequenceIds.length + filters.clientIds.length;

  const sequenceTitle = (id: string) =>
    options?.sequences.find((s) => s.id === id)?.title ?? id;
  const clientName = (id: string) => options?.clients.find((c) => c.id === id)?.name ?? id;

  const appliedTags: Array<{ key: string; label: string; onRemove: () => void }> = [
    ...filters.providers.map((p) => ({
      key: `p-${p}`,
      label: `${t("filters.provider")}: ${providerLabel(p)}`,
      onRemove: () => onFiltersChange({ providers: toggle(filters.providers, p) }),
    })),
    ...filters.sequenceIds.map((id) => ({
      key: `s-${id}`,
      label: `${t("filters.sequence")}: ${sequenceTitle(id)}`,
      onRemove: () => onFiltersChange({ sequenceIds: toggle(filters.sequenceIds, id) }),
    })),
    ...filters.clientIds.map((id) => ({
      key: `c-${id}`,
      label: `${t("filters.client")}: ${clientName(id)}`,
      onRemove: () => onFiltersChange({ clientIds: toggle(filters.clientIds, id) }),
    })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1" role="tablist">
          {STATUS_TABS.map((status) => {
            const active = filters.status === status;
            const count = countFor(status);
            return (
              <button
                key={status || "all"}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFiltersChange({ status })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {status ? t(`status.${status}`) : t("filters.all")}
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
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            aria-label={t("toolbar.refresh")}
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} aria-hidden />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" aria-hidden />
                {t("toolbar.connect")}
                <ChevronDown className="size-3.5 opacity-80" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {(
                [
                  ["single", Mail],
                  ["multiple", Users],
                  ["csv", FileUp],
                ] as const
              ).map(([mode, Icon]) => (
                <DropdownMenuItem key={mode} onClick={() => onConnect(mode)} className="items-start gap-2 py-2">
                  <Icon className="mt-0.5 size-4" aria-hidden />
                  <span className="flex flex-col">
                    <span className="text-sm">{t(`connect.${mode}.title`)}</span>
                    <span className="text-xs text-muted-foreground">{t(`connect.${mode}.hint`)}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                <DropdownMenuSubTrigger>{t("filters.provider")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
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
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t("filters.sequence")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-80 w-64 overflow-y-auto">
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
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {(options?.clients ?? []).length > 0 ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>{t("filters.client")}</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
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
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ) : null}
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
          <button
            type="button"
            onClick={onResetFilters}
            className="px-1 text-xs font-medium text-primary hover:underline"
          >
            {t("filters.clear")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
