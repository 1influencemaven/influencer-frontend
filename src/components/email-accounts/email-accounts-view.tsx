"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, Settings2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { BulkUpdateSheet } from "@/components/email-accounts/bulk-update-sheet";
import { ConnectAccountsSheet } from "@/components/email-accounts/connect-accounts-sheet";
import { EmailAccountJobs } from "@/components/email-accounts/email-account-jobs";
import { EmailAccountPeek } from "@/components/email-accounts/email-account-peek";
import { EmailAccountsTable } from "@/components/email-accounts/email-accounts-table";
import { EmailAccountsToolbar, type ConnectMode } from "@/components/email-accounts/email-accounts-toolbar";
import { Button } from "@/components/ui/button";
import {
  emailAccountKeys,
  useEmailAccountJobs,
  useEmailAccountOptions,
  useEmailAccountsList,
} from "@/hooks/use-email-accounts";
import { reconnectEmailAccounts } from "@/services/email-accounts.service";
import { getApiErrorMessage } from "@/types/api-error";
import type { EmailAccount, EmailAccountJob } from "@/types/email-accounts";

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight ${tone ?? ""}`}>{value}</p>
    </div>
  );
}

export function EmailAccountsView() {
  const t = useTranslations("EmailAccounts");
  const queryClient = useQueryClient();
  const list = useEmailAccountsList();
  const options = useEmailAccountOptions();
  const jobs = useEmailAccountJobs();

  const [selected, setSelected] = useState<Map<string, EmailAccount>>(new Map());
  const [peek, setPeek] = useState<EmailAccount | null>(null);
  const [connectMode, setConnectMode] = useState<ConnectMode | null>(null);
  const [bulkTargets, setBulkTargets] = useState<EmailAccount[] | null>(null);
  const [confirmReconnect, setConfirmReconnect] = useState<EmailAccount[] | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const reconnect = useMutation({ mutationFn: reconnectEmailAccounts });

  const accounts = list.data?.data ?? [];
  const meta = list.data?.meta;
  const counts = list.data?.counts;
  const selectedIds = new Set(selected.keys());

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(id)) next.delete(id);
      else {
        const account = accounts.find((a) => a.id === id);
        if (account) next.set(id, account);
      }
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelected((current) => {
      const next = new Map(current);
      for (const account of accounts) {
        if (checked) next.set(account.id, account);
        else next.delete(account.id);
      }
      return next;
    });
  }

  function onJobCreated(job: EmailAccountJob) {
    void queryClient.invalidateQueries({ queryKey: emailAccountKeys.jobs });
    setNotice({ kind: "ok", text: t("notices.jobStarted", { count: job.accountCount }) });
  }

  async function runReconnect(targets: EmailAccount[]) {
    try {
      const job = await reconnect.mutateAsync(targets.map((a) => a.id));
      setConfirmReconnect(null);
      setSelected(new Map());
      setPeek(null);
      onJobCreated(job);
    } catch (error) {
      setConfirmReconnect(null);
      setNotice({ kind: "error", text: getApiErrorMessage(error, t("notices.reconnectError")) });
    }
  }

  const errorMessage = list.error ? getApiErrorMessage(list.error, t("table.loadError")) : null;
  const selection = [...selected.values()];

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={t("stats.total")} value={meta?.total ?? "—"} />
        <Stat label={t("stats.connected")} value={counts?.connected ?? "—"} tone="text-notion-green" />
        <Stat label={t("stats.disconnected")} value={counts?.disconnected ?? "—"} tone={counts?.disconnected ? "text-destructive" : ""} />
        <Stat label={t("stats.paused")} value={counts?.paused ?? "—"} />
      </div>

      {notice ? (
        <div
          className={`flex items-start justify-between gap-3 rounded-md px-4 py-3 text-sm ${
            notice.kind === "ok" ? "bg-primary/10 text-foreground" : "bg-destructive/10 text-destructive"
          }`}
          role="status"
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label={t("notices.dismiss")}>
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}

      <EmailAccountJobs jobs={jobs.jobs} />

      <EmailAccountsToolbar
        filters={list.filters}
        hasActiveFilters={list.hasActiveFilters}
        options={options.data}
        sortBy={list.sortBy}
        sortOrder={list.sortOrder}
        isFetching={list.isFetching}
        onFiltersChange={list.setFilters}
        onResetFilters={list.resetFilters}
        onSortChange={list.setSort}
        onRefresh={() => void list.refetch()}
        onConnect={setConnectMode}
      />

      <EmailAccountsTable
        accounts={accounts}
        isLoading={list.isLoading}
        error={errorMessage}
        hasActiveFilters={list.hasActiveFilters}
        selectedIds={selectedIds}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onOpen={setPeek}
        onRetry={() => void list.refetch()}
        onResetFilters={list.resetFilters}
      />

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("pagination.summary", { page: meta.page, totalPages: meta.totalPages, total: meta.total })}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={list.page <= 1} onClick={() => list.setPage(list.page - 1)}>
              {t("pagination.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={list.page >= meta.totalPages}
              onClick={() => list.setPage(list.page + 1)}
            >
              {t("pagination.next")}
            </Button>
          </div>
        </div>
      ) : null}

      {selection.length > 0 ? (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div className="flex w-full max-w-xl flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
            <span className="px-2 text-sm font-medium">{t("selection.count", { count: selection.length })}</span>
            <div className="ml-auto flex flex-wrap gap-1.5">
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setConfirmReconnect(selection)}>
                <RefreshCw className="size-4" aria-hidden />
                {t("actions.reconnect")}
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setBulkTargets(selection)}>
                <Settings2 className="size-4" aria-hidden />
                {t("actions.editSettings")}
              </Button>
              <Button size="sm" variant="ghost" aria-label={t("selection.clear")} onClick={() => setSelected(new Map())}>
                <X className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmReconnect ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold">{t("reconnect.title", { count: confirmReconnect.length })}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("reconnect.description")}</p>
            <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto text-sm">
              {confirmReconnect.slice(0, 10).map((account) => (
                <li key={account.id} className="truncate text-muted-foreground">
                  {account.fromEmail}
                </li>
              ))}
              {confirmReconnect.length > 10 ? (
                <li className="text-muted-foreground">{t("reconnect.more", { count: confirmReconnect.length - 10 })}</li>
              ) : null}
            </ul>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" disabled={reconnect.isPending} onClick={() => setConfirmReconnect(null)}>
                {t("connect.cancel")}
              </Button>
              <Button disabled={reconnect.isPending} className="gap-1.5" onClick={() => void runReconnect(confirmReconnect)}>
                {reconnect.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                {t("reconnect.confirm")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <EmailAccountPeek
        account={peek}
        onClose={() => setPeek(null)}
        onReconnect={(account) => setConfirmReconnect([account])}
        onEdit={(account) => setBulkTargets([account])}
      />

      <ConnectAccountsSheet
        mode={connectMode}
        onModeChange={setConnectMode}
        onClose={() => setConnectMode(null)}
        onJobCreated={onJobCreated}
      />

      {/* Mounted per selection so its form state starts fresh each time. */}
      {bulkTargets ? (
      <BulkUpdateSheet
        key={bulkTargets.map((a) => a.id).join(",")}
        accounts={bulkTargets}
        open
        options={options.data}
        onClose={() => setBulkTargets(null)}
        onDone={(updated) => {
          setBulkTargets(null);
          setSelected(new Map());
          setPeek(null);
          setNotice({ kind: "ok", text: t("notices.updated", { count: updated }) });
        }}
      />
      ) : null}
    </div>
  );
}
