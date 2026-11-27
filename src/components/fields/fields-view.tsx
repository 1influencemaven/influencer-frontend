"use client";

import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { FieldFormDialog } from "@/components/fields/field-form-dialog";
import { FieldPeek } from "@/components/fields/field-peek";
import { FieldsTable } from "@/components/fields/fields-table";
import { FieldsToolbar } from "@/components/fields/fields-toolbar";
import { Button } from "@/components/ui/button";
import { useFieldMutations, useFieldsList } from "@/hooks/use-fields";
import { useRole } from "@/hooks/use-role";
import { getApiErrorMessage } from "@/types/api-error";
import type { CustomField } from "@/types/fields";

type Notice = { kind: "ok" | "error"; text: string };

/** Saleshandy prospect fields (HU-FLD-002..005) inside Campaigns. */
export function FieldsView() {
  const t = useTranslations("Fields");
  const { isAdmin } = useRole();
  const list = useFieldsList();
  const mutations = useFieldMutations();

  const [peek, setPeek] = useState<CustomField | null>(null);
  /** undefined = closed, null = create, field = edit. */
  const [form, setForm] = useState<CustomField | null | undefined>(undefined);
  const [confirmDisable, setConfirmDisable] = useState<CustomField | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const fields = list.data?.data ?? [];
  const errorMessage = list.error ? getApiErrorMessage(list.error, t("table.loadError")) : null;

  async function runSync() {
    try {
      const result = await mutations.sync.mutateAsync();
      setNotice({
        kind: "ok",
        text: t("sync.done", {
          created: result.created,
          updated: result.updated,
          deactivated: result.deactivated,
        }),
      });
    } catch (error) {
      setNotice({ kind: "error", text: getApiErrorMessage(error, t("sync.error")) });
    }
  }

  async function setStatus(field: CustomField, isActive: boolean) {
    try {
      const updated = await mutations.setStatus.mutateAsync({ id: field.id, isActive });
      setConfirmDisable(null);
      setPeek((current) => (current?.id === updated.id ? updated : current));
      setNotice({ kind: "ok", text: t(isActive ? "notices.enabled" : "notices.disabled", { label: field.label }) });
    } catch (error) {
      setConfirmDisable(null);
      setNotice({ kind: "error", text: getApiErrorMessage(error, t("notices.statusError")) });
    }
  }

  function toggleStatus(field: CustomField) {
    if (field.isActive) setConfirmDisable(field);
    else void setStatus(field, true);
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

      <FieldsToolbar
        filters={list.filters}
        counts={list.data?.counts}
        availableTags={list.data?.availableTags ?? []}
        lastSync={list.data?.lastSync ?? null}
        sortBy={list.sortBy}
        sortOrder={list.sortOrder}
        isSyncing={mutations.sync.isPending}
        canManage={isAdmin}
        onFiltersChange={list.setFilters}
        onResetFilters={list.resetFilters}
        onSortChange={list.setSort}
        onSync={() => void runSync()}
        onCreate={() => setForm(null)}
      />

      <FieldsTable
        fields={fields}
        isLoading={list.isLoading}
        error={errorMessage}
        hasActiveFilters={list.hasActiveFilters}
        canManage={isAdmin}
        onOpen={setPeek}
        onEdit={setForm}
        onToggleStatus={toggleStatus}
        onRetry={() => void list.refetch()}
        onResetFilters={list.resetFilters}
        onSync={() => void runSync()}
        onCreate={() => setForm(null)}
      />

      <FieldPeek
        field={peek}
        canManage={isAdmin}
        onClose={() => setPeek(null)}
        onEdit={(field) => {
          setPeek(null);
          setForm(field);
        }}
        onToggleStatus={toggleStatus}
      />

      {form !== undefined ? (
        <FieldFormDialog
          key={form?.id ?? "new"}
          field={form}
          availableTags={list.data?.availableTags ?? []}
          onClose={() => setForm(undefined)}
          onCreate={async (payload) => {
            const created = await mutations.create.mutateAsync(payload);
            setNotice({ kind: "ok", text: t("notices.created", { label: created.label }) });
          }}
          onUpdate={async (id, payload) => {
            const updated = await mutations.update.mutateAsync({ id, payload });
            setNotice({ kind: "ok", text: t("notices.updated", { label: updated.label }) });
          }}
        />
      ) : null}

      {confirmDisable ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold">{t("disable.title", { label: confirmDisable.label })}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("disable.description")}</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" disabled={mutations.setStatus.isPending} onClick={() => setConfirmDisable(null)}>
                {t("form.cancel")}
              </Button>
              <Button
                variant="destructive"
                disabled={mutations.setStatus.isPending}
                className="gap-1.5"
                onClick={() => void setStatus(confirmDisable, false)}
              >
                {mutations.setStatus.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                {t("disable.confirm")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
