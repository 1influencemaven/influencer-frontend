"use client";

import { Eye, MoreHorizontal, RefreshCw, Settings2, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  EmailAccountStatusPill,
  HealthScoreCircle,
  SenderAvatar,
  providerLabel,
} from "@/components/email-accounts/email-account-badges";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  selectedCount: number;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onClearSelection: () => void;
  onOpen: (account: EmailAccount) => void;
  onReconnect: (accounts: EmailAccount[]) => void;
  onEdit: (accounts: EmailAccount[]) => void;
  onBulkReconnect: () => void;
  onBulkEdit: () => void;
  onRetry: () => void;
  onResetFilters: () => void;
};

const checkboxClass = "size-4 cursor-pointer rounded border-input accent-[var(--primary)] align-middle";
const headClass = "h-10 text-xs font-medium text-muted-foreground";

export function EmailAccountsTable({
  accounts,
  isLoading,
  error,
  hasActiveFilters,
  selectedIds,
  selectedCount,
  onToggle,
  onToggleAll,
  onClearSelection,
  onOpen,
  onReconnect,
  onEdit,
  onBulkReconnect,
  onBulkEdit,
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
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      {selectedCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2">
          <span className="text-sm font-medium">{t("selection.count", { count: selectedCount })}</span>
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          <Button size="sm" variant="ghost" className="h-8 gap-1.5" onClick={onBulkReconnect}>
            <RefreshCw className="size-4" aria-hidden />
            {t("actions.reconnect")}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5" onClick={onBulkEdit}>
            <Settings2 className="size-4" aria-hidden />
            {t("actions.editSettings")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-8 gap-1 text-muted-foreground"
            onClick={onClearSelection}
          >
            <X className="size-4" aria-hidden />
            {t("selection.clear")}
          </Button>
        </div>
      ) : null}

      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 pl-4">
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
            <TableHead className={cn(headClass, "min-w-64")}>{t("table.columns.sender")}</TableHead>
            <TableHead className={headClass}>{t("table.columns.health")}</TableHead>
            <TableHead className={cn(headClass, "hidden md:table-cell")}>{t("table.columns.quota")}</TableHead>
            <TableHead className={cn(headClass, "hidden lg:table-cell")}>{t("table.columns.sequences")}</TableHead>
            <TableHead className={cn(headClass, "hidden xl:table-cell")}>{t("table.columns.client")}</TableHead>
            <TableHead className={headClass}>{t("table.columns.status")}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && accounts.length === 0
            ? Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={8} className="px-4">
                    <Skeleton className="h-8 w-full" />
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
            const used =
              availableQuota !== null && dailySendingLimit !== null
                ? Math.max(0, dailySendingLimit - availableQuota)
                : null;
            return (
              <TableRow
                key={account.id}
                data-state={selected ? "selected" : undefined}
                className="cursor-pointer"
                onClick={() => onOpen(account)}
              >
                <TableCell className="pl-4" onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    aria-label={t("table.select", { email: account.fromEmail })}
                    checked={selected}
                    onChange={() => onToggle(account.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <SenderAvatar name={account.fromName} email={account.fromEmail} />
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
                      <p className="truncate text-xs text-muted-foreground">
                        {account.fromEmail}
                        <span className="hidden sm:inline"> · {providerLabel(account.provider)}</span>
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <HealthScoreCircle score={account.healthScore} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {dailySendingLimit !== null ? (
                    <div className="w-28 space-y-1">
                      <p className="text-xs tabular-nums">
                        <span className="font-medium">{used ?? 0}</span>
                        <span className="text-muted-foreground"> / {dailySendingLimit}</span>
                      </p>
                      <div className="h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${dailySendingLimit > 0 ? Math.min(100, ((used ?? 0) / dailySendingLimit) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {account.sequences.length === 0 ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    <span
                      className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
                      title={account.sequences.map((s) => s.title).join(", ")}
                    >
                      {t("table.sequencesCount", { count: account.sequences.length })}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden text-sm xl:table-cell">
                  {account.client?.name ?? <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <div className="flex flex-col items-start gap-1">
                    <EmailAccountStatusPill status={account.status} />
                    {account.status === "DISCONNECTED" ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => onReconnect([account])}
                      >
                        {t("actions.reconnect")}
                      </button>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="pr-4" onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="size-8 p-0" aria-label={t("table.rowActions")}>
                        <MoreHorizontal className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onOpen(account)}>
                        <Eye className="size-4" aria-hidden />
                        {t("actions.view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit([account])}>
                        <Settings2 className="size-4" aria-hidden />
                        {t("actions.editSettings")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReconnect([account])}>
                        <RefreshCw className="size-4" aria-hidden />
                        {t("actions.reconnect")}
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
