"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { CsvImportDialog } from "@/components/prospects/csv-import-dialog";
import { ProspectPeek } from "@/components/prospects/prospect-peek";
import { ProspectsTable } from "@/components/prospects/prospects-table";
import { ProspectsToolbar } from "@/components/prospects/prospects-toolbar";
import { Button } from "@/components/ui/button";
import { useProspectMutations, useProspectsList } from "@/hooks/use-prospects";
import { getApiErrorMessage } from "@/types/api-error";
import type { Prospect } from "@/types/prospects";

/** Prospects per talent: approved discovered contacts + CSV imports (Saleshandy-like). */
export function ProspectsView({ initialInfluencerId = "" }: { initialInfluencerId?: string }) {
  const t = useTranslations("Prospects");
  const list = useProspectsList(initialInfluencerId);
  const { update } = useProspectMutations();
  const [peek, setPeek] = useState<Prospect | null>(null);
  const [importing, setImporting] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const prospects = list.data?.data ?? [];
  const meta = list.data?.meta;
  const errorMessage = list.error ? getApiErrorMessage(list.error, t("table.loadError")) : null;

  async function toggleArchive(p: Prospect) {
    try {
      const updated = await update.mutateAsync({ id: p.id, payload: { status: p.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE" } });
      setPeek((current) => (current?.id === updated.id ? updated : current));
      setNotice({ kind: "ok", text: t(updated.status === "ARCHIVED" ? "notices.archived" : "notices.restored", { email: p.email }) });
    } catch (error) {
      setNotice({ kind: "error", text: getApiErrorMessage(error, t("notices.error")) });
    }
  }

  async function save(id: string, payload: Parameters<typeof update.mutateAsync>[0]["payload"]) {
    const updated = await update.mutateAsync({ id, payload });
    setPeek(updated);
    setNotice({ kind: "ok", text: t("notices.saved", { email: updated.email }) });
    return updated;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{t("title")}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{t("description")}</p>
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

      <ProspectsToolbar
        filters={list.filters}
        counts={list.data?.counts}
        sortBy={list.sortBy}
        sortOrder={list.sortOrder}
        onFiltersChange={list.setFilters}
        onResetFilters={list.resetFilters}
        onSortChange={list.setSort}
        onImport={() => setImporting(true)}
      />

      <ProspectsTable
        prospects={prospects}
        isLoading={list.isLoading}
        error={errorMessage}
        hasActiveFilters={list.hasActiveFilters}
        showTalent={!list.filters.influencerId}
        onOpen={setPeek}
        onToggleArchive={(p) => void toggleArchive(p)}
        onRetry={() => void list.refetch()}
        onResetFilters={list.resetFilters}
        onImport={() => setImporting(true)}
      />

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("pagination.summary", { page: meta.page, totalPages: meta.totalPages, total: meta.total })}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={list.page <= 1} onClick={() => list.setPage(list.page - 1)}>
              {t("pagination.previous")}
            </Button>
            <Button variant="outline" size="sm" disabled={list.page >= meta.totalPages} onClick={() => list.setPage(list.page + 1)}>
              {t("pagination.next")}
            </Button>
          </div>
        </div>
      ) : null}

      <ProspectPeek prospect={peek} onClose={() => setPeek(null)} onSave={save} onToggleArchive={(p) => void toggleArchive(p)} />

      {importing ? (
        <CsvImportDialog
          initialInfluencerId={list.filters.influencerId}
          onClose={() => setImporting(false)}
        />
      ) : null}
    </div>
  );
}
