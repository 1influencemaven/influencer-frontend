"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  EmailAccountStatusPill,
  HealthScoreBar,
  NotionTag,
  providerLabel,
} from "@/components/email-accounts/email-account-badges";
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
import { cn } from "@/lib/utils";
import type { EmailAccount } from "@/types/email-accounts";

type EmailAccountsTableProps = {
  accounts: EmailAccount[];
  isLoading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onOpen: (account: EmailAccount) => void;
  onRetry: () => void;
  onResetFilters: () => void;
};

const checkboxClass =
  "size-4 cursor-pointer rounded border-input accent-[var(--primary)] align-middle";

export function EmailAccountsTable({
  accounts,
  isLoading,
  error,
  hasActiveFilters,
  selectedIds,
  onToggle,
  onToggleAll,
  onOpen,
  onRetry,
  onResetFilters,
}: EmailAccountsTableProps) {
  const t = useTranslations("EmailAccounts");
  const allSelected = accounts.length > 0 && accounts.every((a) => selectedIds.has(a.id));
  const someSelected = accounts.some((a) => selectedIds.has(a.id));

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
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <input
                type="checkbox"
                className={checkboxClass}
                aria-label={t("table.selectAll")}
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = !allSelected && someSelected;
                }}
                onChange={(event) => onToggleAll(event.target.checked)}
                disabled={accounts.length === 0}
              />
            </TableHead>
            {(
              [
                ["sender", "min-w-56"],
                ["status", ""],
                ["health", "min-w-32"],
                ["quota", "hidden md:table-cell"],
                ["sequences", "hidden lg:table-cell"],
                ["provider", "hidden xl:table-cell"],
                ["client", "hidden xl:table-cell"],
              ] as const
            ).map(([key, className]) => (
              <TableHead
                key={key}
                className={cn(
                  "text-xs font-medium tracking-wide text-muted-foreground uppercase",
                  className,
                )}
              >
                {t(`table.columns.${key}`)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && accounts.length === 0
            ? Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : null}

          {!isLoading && accounts.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="py-14 text-center">
                <p className="text-sm font-medium">
                  {hasActiveFilters ? t("table.emptyFiltered") : t("table.empty")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasActiveFilters ? t("table.emptyFilteredHint") : t("table.emptyHint")}
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" size="sm" className="mt-4" onClick={onResetFilters}>
                    {t("filters.clear")}
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ) : null}

          {accounts.map((account) => {
            const selected = selectedIds.has(account.id);
            const { availableQuota, dailySendingLimit } = account.settings;
            const extraSequences = account.sequences.length - 2;
            return (
              <TableRow
                key={account.id}
                data-state={selected ? "selected" : undefined}
                className="cursor-pointer"
                onClick={() => onOpen(account)}
              >
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    aria-label={t("table.select", { email: account.fromEmail })}
                    checked={selected}
                    onChange={() => onToggle(account.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                        {account.fromName || account.fromEmail}
                        {account.isDefault ? (
                          <Star
                            className="size-3.5 shrink-0 fill-amber-400 text-amber-400"
                            aria-label={t("table.default")}
                          />
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{account.fromEmail}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <EmailAccountStatusPill status={account.status} />
                </TableCell>
                <TableCell>
                  <HealthScoreBar score={account.healthScore} />
                </TableCell>
                <TableCell className="hidden text-sm tabular-nums md:table-cell">
                  {dailySendingLimit !== null ? (
                    <span>
                      {availableQuota ?? "—"}
                      <span className="text-muted-foreground"> / {dailySendingLimit}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {account.sequences.length === 0 ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {account.sequences.slice(0, 2).map((sequence) => (
                        <NotionTag key={sequence.id}>{sequence.title}</NotionTag>
                      ))}
                      {extraSequences > 0 ? <NotionTag>+{extraSequences}</NotionTag> : null}
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden text-sm xl:table-cell">
                  {providerLabel(account.provider)}
                </TableCell>
                <TableCell className="hidden text-sm xl:table-cell">
                  {account.client?.name ?? <span className="text-muted-foreground">—</span>}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
