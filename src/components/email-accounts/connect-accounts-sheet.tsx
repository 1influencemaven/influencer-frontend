"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Copy, Download, FileUp, Loader2, Plus, Trash2, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ConnectionFields } from "@/components/email-accounts/connection-fields";
import type { ConnectMode } from "@/components/email-accounts/email-accounts-toolbar";
import { providerLabel } from "@/components/email-accounts/email-account-badges";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useInvalidateEmailAccounts } from "@/hooks/use-email-accounts";
import {
  emptyConnection,
  normalizeConnection,
  validateConnection,
  type ConnectionErrors,
} from "@/lib/email-account-providers";
import { csvTemplate, importAccountsCsv } from "@/lib/email-accounts-csv";
import { cn } from "@/lib/utils";
import { connectEmailAccount, connectEmailAccounts } from "@/services/email-accounts.service";
import { getApiErrorMessage } from "@/types/api-error";
import type { EmailAccountConnection, EmailAccountJob, SmtpImapConnectResult } from "@/types/email-accounts";

const MAX_BULK = 50;

type Draft = { key: number; value: EmailAccountConnection; same: boolean };

let draftKey = 0;
const newDraft = (value = emptyConnection()): Draft => ({ key: (draftKey += 1), value, same: true });

type ConnectAccountsSheetProps = {
  mode: ConnectMode | null;
  onModeChange: (mode: ConnectMode) => void;
  onClose: () => void;
  onJobCreated: (job: EmailAccountJob) => void;
};

export function ConnectAccountsSheet({ mode, onModeChange, onClose, onJobCreated }: ConnectAccountsSheetProps) {
  const t = useTranslations("EmailAccounts");
  const invalidate = useInvalidateEmailAccounts();

  // Single
  const [single, setSingle] = useState<Draft>(() => newDraft());
  const [singleErrors, setSingleErrors] = useState<ConnectionErrors>({});
  const [singleResult, setSingleResult] = useState<SmtpImapConnectResult | null>(null);
  // Multiple
  const [drafts, setDrafts] = useState<Draft[]>(() => [newDraft(), newDraft()]);
  const [draftErrors, setDraftErrors] = useState<Record<number, ConnectionErrors>>({});
  // CSV
  const [csvAccounts, setCsvAccounts] = useState<EmailAccountConnection[]>([]);
  const [csvIssues, setCsvIssues] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [startedJob, setStartedJob] = useState<EmailAccountJob | null>(null);

  const singleMutation = useMutation({ mutationFn: connectEmailAccount });
  const bulkMutation = useMutation({ mutationFn: connectEmailAccounts });
  const busy = singleMutation.isPending || bulkMutation.isPending;

  function resetAll() {
    setSingle(newDraft());
    setSingleErrors({});
    setSingleResult(null);
    setDrafts([newDraft(), newDraft()]);
    setDraftErrors({});
    setCsvAccounts([]);
    setCsvIssues([]);
    setCsvFileName(null);
    setError(null);
    setStartedJob(null);
  }

  function close() {
    if (busy) return;
    resetAll();
    onClose();
  }

  async function submitSingle() {
    setError(null);
    const errors = validateConnection(single.value, { requireSslOrTls: true });
    setSingleErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const result = await singleMutation.mutateAsync(normalizeConnection(single.value));
      setSingleResult(result);
      void invalidate();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, t("connect.error")));
    }
  }

  async function submitBulk(accounts: EmailAccountConnection[]) {
    setError(null);
    try {
      const job = await bulkMutation.mutateAsync(accounts.map(normalizeConnection));
      setStartedJob(job);
      onJobCreated(job);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, t("connect.error")));
    }
  }

  function submitMultiple() {
    const errors: Record<number, ConnectionErrors> = {};
    for (const draft of drafts) {
      const result = validateConnection(draft.value);
      if (Object.keys(result).length > 0) errors[draft.key] = result;
    }
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError(t("connect.multiple.fixErrors", { count: Object.keys(errors).length }));
      return;
    }
    void submitBulk(drafts.map((d) => d.value));
  }

  async function handleCsvFile(file: File | undefined) {
    setCsvIssues([]);
    setCsvAccounts([]);
    setError(null);
    if (!file) return;
    setCsvFileName(file.name);
    const { accounts, errors } = importAccountsCsv(await file.text());
    const issues = errors.map((e) => t("connect.csv.lineError", { line: e.line, message: e.message }));
    accounts.forEach((account, index) => {
      const invalid = Object.keys(validateConnection(account));
      if (invalid.length > 0) {
        issues.push(t("connect.csv.lineError", { line: index + 2, message: invalid.join(", ") }));
      }
    });
    if (accounts.length > MAX_BULK) issues.push(t("connect.csv.tooMany", { max: MAX_BULK }));
    setCsvAccounts(accounts);
    setCsvIssues(issues);
  }

  function downloadTemplate() {
    const blob = new Blob([csvTemplate()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "email-accounts-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const tabs: ConnectMode[] = ["single", "multiple", "csv"];

  return (
    <Sheet open={mode !== null} onOpenChange={(open) => !open && close()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border px-6 pt-8 pb-4">
          <SheetTitle className="text-xl font-semibold tracking-tight">{t("connect.title")}</SheetTitle>
          <SheetDescription>{t("connect.description")}</SheetDescription>
          <div className="mt-3 flex gap-1 rounded-md bg-muted p-1" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={mode === tab}
                disabled={busy}
                onClick={() => {
                  setError(null);
                  onModeChange(tab);
                }}
                className={cn(
                  "flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                  mode === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`connect.${tab}.tab`)}
              </button>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 px-6 py-5">
          {startedJob ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 text-sm" role="status">
              <p className="flex items-center gap-2 font-medium">
                <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
                {t("connect.processingTitle", { count: startedJob.accountCount })}
              </p>
              <p className="mt-2 text-muted-foreground">{t("connect.processingHint")}</p>
            </div>
          ) : null}

          {!startedJob && mode === "single" ? (
            singleResult ? (
              <SingleResult result={singleResult} />
            ) : (
              <ConnectionFields
                single
                value={single.value}
                errors={singleErrors}
                sameCredentials={single.same}
                disabled={busy}
                onChange={(value) => setSingle((d) => ({ ...d, value }))}
                onSameCredentialsChange={(same) => setSingle((d) => ({ ...d, same }))}
              />
            )
          ) : null}

          {!startedJob && mode === "multiple" ? (
            <div className="space-y-4">
              {drafts.map((draft, index) => (
                <div key={draft.key} className="rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2">
                    <p className="text-sm font-medium">
                      {t("connect.multiple.account", { number: index + 1 })}
                      {draft.value.smtp.emailAddress ? (
                        <span className="ml-2 font-normal text-muted-foreground">{draft.value.smtp.emailAddress}</span>
                      ) : null}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t("connect.multiple.duplicate")}
                        disabled={busy || drafts.length >= MAX_BULK}
                        onClick={() =>
                          setDrafts((list) => [
                            ...list.slice(0, index + 1),
                            newDraft({ ...draft.value, smtp: { ...draft.value.smtp, emailAddress: "", userName: "", password: "" }, imap: { ...draft.value.imap, emailAddress: "", userName: "", password: "" } }),
                            ...list.slice(index + 1),
                          ])
                        }
                      >
                        <Copy className="size-4" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t("connect.multiple.remove")}
                        disabled={busy || drafts.length <= 1}
                        onClick={() => setDrafts((list) => list.filter((d) => d.key !== draft.key))}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <ConnectionFields
                      value={draft.value}
                      errors={draftErrors[draft.key]}
                      sameCredentials={draft.same}
                      disabled={busy}
                      onChange={(value) =>
                        setDrafts((list) => list.map((d) => (d.key === draft.key ? { ...d, value } : d)))
                      }
                      onSameCredentialsChange={(same) =>
                        setDrafts((list) => list.map((d) => (d.key === draft.key ? { ...d, same } : d)))
                      }
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full gap-1.5 border-dashed"
                disabled={busy || drafts.length >= MAX_BULK}
                onClick={() => setDrafts((list) => [...list, newDraft(emptyConnection(list[list.length - 1]?.value.provider))])}
              >
                <Plus className="size-4" aria-hidden />
                {t("connect.multiple.add")}
              </Button>
            </div>
          ) : null}

          {!startedJob && mode === "csv" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("connect.csv.instructions")}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadTemplate}>
                  <Download className="size-4" aria-hidden />
                  {t("connect.csv.template")}
                </Button>
                <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
                  <FileUp className="size-4" aria-hidden />
                  {csvFileName ?? t("connect.csv.choose")}
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={(event) => void handleCsvFile(event.target.files?.[0])}
                  />
                </label>
              </div>
              {csvIssues.length > 0 ? (
                <ul className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                  {csvIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              ) : null}
              {csvAccounts.length > 0 ? (
                <div className="overflow-hidden rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-left text-xs text-muted-foreground uppercase">
                      <tr>
                        <th className="px-3 py-2 font-medium">{t("connect.csv.sender")}</th>
                        <th className="px-3 py-2 font-medium">{t("fields.provider")}</th>
                        <th className="px-3 py-2 font-medium">{t("fields.host")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvAccounts.map((account, index) => (
                        <tr key={`${account.smtp.emailAddress}-${index}`} className="border-t border-border">
                          <td className="px-3 py-2">
                            <p className="font-medium">{`${account.fromFirstName} ${account.fromLastName}`}</p>
                            <p className="text-xs text-muted-foreground">{account.smtp.emailAddress}</p>
                          </td>
                          <td className="px-3 py-2">{providerLabel(account.provider)}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {account.smtp.host}:{account.smtp.port} · {account.imap.host}:{account.imap.port}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border px-6 py-4">
          {startedJob || singleResult ? (
            <>
              <Button variant="outline" onClick={resetAll}>
                {t("connect.another")}
              </Button>
              <Button onClick={close}>{t("connect.done")}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={close} disabled={busy}>
                {t("connect.cancel")}
              </Button>
              {mode === "single" ? (
                <Button onClick={() => void submitSingle()} disabled={busy} className="gap-1.5">
                  {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  {busy ? t("connect.single.verifying") : t("connect.single.submit")}
                </Button>
              ) : null}
              {mode === "multiple" ? (
                <Button onClick={submitMultiple} disabled={busy} className="gap-1.5">
                  {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  {t("connect.multiple.submit", { count: drafts.length })}
                </Button>
              ) : null}
              {mode === "csv" ? (
                <Button
                  onClick={() => void submitBulk(csvAccounts)}
                  disabled={busy || csvAccounts.length === 0 || csvIssues.length > 0}
                  className="gap-1.5"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  {t("connect.multiple.submit", { count: csvAccounts.length })}
                </Button>
              ) : null}
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SingleResult({ result }: { result: SmtpImapConnectResult }) {
  const t = useTranslations("EmailAccounts.connect.single");
  const check = (label: string, ok: boolean, error: string | null) => (
    <li className="flex items-start gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-4 text-notion-green" aria-hidden />
      ) : (
        <TriangleAlert className="mt-0.5 size-4 text-destructive" aria-hidden />
      )}
      <span>
        <span className="font-medium">{label}</span>{" "}
        <span className="text-muted-foreground">{ok ? t("checkOk") : (error ?? t("checkFailed"))}</span>
      </span>
    </li>
  );
  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        result.verified ? "border-notion-green/30 bg-notion-green/5" : "border-destructive/30 bg-destructive/5",
      )}
      role="status"
    >
      <p className="font-medium">{result.verified ? t("verifiedTitle") : t("pendingTitle")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{result.verified ? t("verifiedHint") : t("pendingHint")}</p>
      <ul className="mt-4 space-y-2">
        {check("SMTP", result.smtp.ok, result.smtp.error)}
        {check("IMAP", result.imap.ok, result.imap.error)}
      </ul>
    </div>
  );
}
