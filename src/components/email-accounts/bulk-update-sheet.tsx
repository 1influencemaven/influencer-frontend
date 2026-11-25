"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { selectClassName } from "@/components/email-accounts/connection-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useInvalidateEmailAccounts } from "@/hooks/use-email-accounts";
import { cn } from "@/lib/utils";
import { bulkUpdateEmailAccounts } from "@/services/email-accounts.service";
import { getApiErrorMessage } from "@/types/api-error";
import type { BulkUpdatePayload, EmailAccount, EmailAccountOptions } from "@/types/email-accounts";

type FieldKey =
  | "senderFirstName"
  | "senderLastName"
  | "dailyQuota"
  | "bcc"
  | "signatureHtml"
  | "interval"
  | "rampUp"
  | "clientId";

type Values = {
  senderFirstName: string;
  senderLastName: string;
  dailyQuota: string;
  bcc: string;
  signatureHtml: string;
  sendingIntervalMin: string;
  sendingIntervalMax: string;
  rampUpInitialSendingLimit: string;
  rampUpPercent: string;
  clientId: string;
};

function initialValues(accounts: EmailAccount[]): Values {
  const first = accounts.length === 1 ? accounts[0] : null;
  const s = first?.settings;
  const nameParts = first?.fromName.split(/\s+/) ?? [];
  return {
    senderFirstName: nameParts[0] ?? "",
    senderLastName: nameParts.slice(1).join(" "),
    dailyQuota: s?.dailySendingLimit?.toString() ?? "",
    bcc: s?.bcc ?? "",
    signatureHtml: s?.signatureHtml ?? "",
    sendingIntervalMin: s?.minIntervalSeconds?.toString() ?? "",
    sendingIntervalMax: s?.maxIntervalSeconds?.toString() ?? "",
    rampUpInitialSendingLimit: s?.rampUpInitialSendingLimit ? String(s.rampUpInitialSendingLimit) : "",
    rampUpPercent: s?.rampUpPercent ? String(s.rampUpPercent) : "",
    clientId: first?.client?.id ?? "",
  };
}

type BulkUpdateSheetProps = {
  accounts: EmailAccount[];
  open: boolean;
  options?: EmailAccountOptions;
  onClose: () => void;
  onDone: (updated: number) => void;
};

export function BulkUpdateSheet({ accounts, open, options, onClose, onDone }: BulkUpdateSheetProps) {
  const t = useTranslations("EmailAccounts");
  const invalidate = useInvalidateEmailAccounts();
  const [enabled, setEnabled] = useState<Set<FieldKey>>(new Set());
  const [values, setValues] = useState<Values>(() => initialValues(accounts));
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: bulkUpdateEmailAccounts });

  const toggle = (key: FieldKey) =>
    setEnabled((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const set = (patch: Partial<Values>) => setValues((v) => ({ ...v, ...patch }));
  const int = (value: string) => (value.trim() === "" ? undefined : Number(value));

  async function submit() {
    setError(null);
    if (enabled.size === 0) {
      setError(t("bulk.nothingSelected"));
      return;
    }
    const payload: BulkUpdatePayload = { emailAccountIds: accounts.map((a) => a.id) };
    if (enabled.has("senderFirstName")) {
      if (!values.senderFirstName.trim()) return setError(t("validation.required"));
      payload.senderFirstName = values.senderFirstName.trim();
    }
    if (enabled.has("senderLastName")) payload.senderLastName = values.senderLastName.trim();
    if (enabled.has("dailyQuota")) payload.dailyQuota = int(values.dailyQuota);
    if (enabled.has("bcc")) payload.bcc = values.bcc.trim();
    if (enabled.has("signatureHtml")) payload.signatureHtml = values.signatureHtml;
    if (enabled.has("interval")) {
      payload.sendingIntervalMin = int(values.sendingIntervalMin);
      payload.sendingIntervalMax = int(values.sendingIntervalMax);
      if (
        payload.sendingIntervalMin !== undefined &&
        payload.sendingIntervalMax !== undefined &&
        payload.sendingIntervalMin > payload.sendingIntervalMax
      ) {
        return setError(t("bulk.intervalError"));
      }
    }
    if (enabled.has("rampUp")) {
      payload.rampUpInitialSendingLimit = int(values.rampUpInitialSendingLimit);
      payload.rampUpPercent = int(values.rampUpPercent);
    }
    if (enabled.has("clientId") && values.clientId) payload.clientId = values.clientId;

    try {
      const result = await mutation.mutateAsync(payload);
      void invalidate();
      onDone(result.updated);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, t("bulk.error")));
    }
  }

  const row = (key: FieldKey, label: string, control: React.ReactNode, hint?: string) => (
    <div
      className={cn(
        "rounded-md border px-3 py-2.5 transition-colors",
        enabled.has(key) ? "border-primary/30 bg-primary/5" : "border-border",
      )}
    >
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          className="size-4 accent-[var(--primary)]"
          checked={enabled.has(key)}
          onChange={() => toggle(key)}
        />
        {label}
      </label>
      {hint ? <p className="mt-1 pl-6 text-xs text-muted-foreground">{hint}</p> : null}
      {enabled.has(key) ? <div className="mt-2 pl-6">{control}</div> : null}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={(next) => !next && !mutation.isPending && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border px-6 pt-8 pb-4">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            {t("bulk.title", { count: accounts.length })}
          </SheetTitle>
          <SheetDescription>{t("bulk.description")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-2 px-6 py-5">
          {row(
            "senderFirstName",
            t("fields.firstName"),
            <Input value={values.senderFirstName} onChange={(e) => set({ senderFirstName: e.target.value })} />,
            accounts.length > 1 ? t("bulk.nameWarning") : t("bulk.nameKeep"),
          )}
          {row(
            "senderLastName",
            t("fields.lastName"),
            <Input value={values.senderLastName} onChange={(e) => set({ senderLastName: e.target.value })} />,
          )}
          {row(
            "dailyQuota",
            t("fields.dailyQuota"),
            <Input type="number" min={1} value={values.dailyQuota} onChange={(e) => set({ dailyQuota: e.target.value })} />,
          )}
          {row(
            "interval",
            t("fields.interval"),
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min={1}
                aria-label={t("bulk.min")}
                placeholder={t("bulk.min")}
                value={values.sendingIntervalMin}
                onChange={(e) => set({ sendingIntervalMin: e.target.value })}
              />
              <Input
                type="number"
                min={1}
                aria-label={t("bulk.max")}
                placeholder={t("bulk.max")}
                value={values.sendingIntervalMax}
                onChange={(e) => set({ sendingIntervalMax: e.target.value })}
              />
            </div>,
            t("bulk.secondsHint"),
          )}
          {row(
            "rampUp",
            t("peek.rampUp"),
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min={1}
                aria-label={t("bulk.rampUpInitial")}
                placeholder={t("bulk.rampUpInitial")}
                value={values.rampUpInitialSendingLimit}
                onChange={(e) => set({ rampUpInitialSendingLimit: e.target.value })}
              />
              <Input
                type="number"
                min={1}
                max={100}
                aria-label={t("bulk.rampUpPercent")}
                placeholder={t("bulk.rampUpPercent")}
                value={values.rampUpPercent}
                onChange={(e) => set({ rampUpPercent: e.target.value })}
              />
            </div>,
          )}
          {row(
            "bcc",
            t("fields.bcc"),
            <Input placeholder="bcc@brand.com, ops@brand.com" value={values.bcc} onChange={(e) => set({ bcc: e.target.value })} />,
            t("bulk.clearHint"),
          )}
          {row(
            "signatureHtml",
            t("fields.signature"),
            <Textarea
              rows={6}
              className="font-mono text-xs"
              value={values.signatureHtml}
              onChange={(e) => set({ signatureHtml: e.target.value })}
            />,
            t("bulk.clearHint"),
          )}
          {(options?.clients ?? []).length > 0
            ? row(
                "clientId",
                t("peek.client"),
                <select className={selectClassName} value={values.clientId} onChange={(e) => set({ clientId: e.target.value })}>
                  <option value="">{t("bulk.chooseClient")}</option>
                  {options!.clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>,
              )
            : null}

          {error ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            {t("connect.cancel")}
          </Button>
          <Button onClick={() => void submit()} disabled={mutation.isPending || enabled.size === 0} className="gap-1.5">
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {t("bulk.submit", { count: enabled.size })}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
