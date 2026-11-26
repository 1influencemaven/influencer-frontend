"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Download, FileUp, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

import { TalentSelect } from "@/components/prospects/talent-select";
import { Button } from "@/components/ui/button";
import { useProspectMutations } from "@/hooks/use-prospects";
import { autoMapHeaders, buildMappedRows, errorsToCsv, looksLikeEmail, parseCsv } from "@/lib/prospects-csv";
import { cn } from "@/lib/utils";
import { listFields } from "@/services/fields.service";
import { getApiErrorMessage } from "@/types/api-error";
import { CONFLICT_ACTIONS, CSV_MAX_ROWS, type ConflictAction, type CsvImportResult } from "@/types/prospects";

type Step = "upload" | "map" | "review" | "result";
const STEPS: Step[] = ["upload", "map", "review", "result"];

const selectClass =
  "h-8 w-full rounded-md border border-input bg-card px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Saleshandy-like CSV import: upload → map columns to Fields → review duplicates policy → result. */
export function CsvImportDialog({ initialInfluencerId, onClose }: { initialInfluencerId?: string; onClose: () => void }) {
  const t = useTranslations("Prospects.csv");
  const { importCsv } = useProspectMutations();
  const fileId = useId();
  const talentId = useId();
  const [step, setStep] = useState<Step>("upload");
  const [influencerId, setInfluencerId] = useState(initialInfluencerId ?? "");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<string[]>([]);
  const [conflictAction, setConflictAction] = useState<ConflictAction>("addMissingFields");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);

  const fields = useQuery({
    queryKey: ["fields", "all-active"],
    queryFn: () => listFields({ origin: "all", status: "active", sortBy: "label", sortOrder: "asc" }),
    staleTime: 60_000,
    select: (r) => r.data,
  });
  const fieldOptions = useMemo(() => fields.data ?? [], [fields.data]);

  async function onFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.length < 2) {
      setError(t("errors.empty"));
      return;
    }
    const [head, ...body] = parsed;
    if (body.length > CSV_MAX_ROWS) {
      setError(t("errors.tooMany", { max: CSV_MAX_ROWS }));
      return;
    }
    setFileName(file.name);
    setHeaders(head.map((h) => h.trim()));
    setRows(body);
    setMapping(autoMapHeaders(head, fieldOptions));
  }

  const emailIndex = mapping.indexOf("email");
  const mappedRows = useMemo(() => buildMappedRows(rows, mapping), [rows, mapping]);
  const invalidEmails = emailIndex >= 0 ? rows.filter((r) => !looksLikeEmail(r[emailIndex] ?? "")).length : rows.length;
  const duplicateMapping = mapping.filter(Boolean).length !== new Set(mapping.filter(Boolean)).size;

  function next() {
    setError(null);
    if (step === "upload") {
      if (!influencerId) return setError(t("errors.talent"));
      if (!rows.length) return setError(t("errors.file"));
      setStep("map");
    } else if (step === "map") {
      if (emailIndex < 0) return setError(t("errors.email"));
      if (duplicateMapping) return setError(t("errors.duplicate"));
      setStep("review");
    }
  }

  async function submit() {
    setError(null);
    try {
      const res = await importCsv.mutateAsync({
        influencerId,
        conflictAction,
        rows: mappedRows,
        ...(tags.trim() ? { tags: tags.split(",").map((s) => s.trim()).filter(Boolean) } : {}),
      });
      setResult(res);
      setStep("result");
    } catch (err) {
      setError(getApiErrorMessage(err, t("errors.generic")));
    }
  }

  function downloadErrors() {
    if (!result) return;
    const blob = new Blob([errorsToCsv(result.errors)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prospect-import-errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const previewKeys = mapping.filter(Boolean);
  const labelOf = (key: string) => fieldOptions.find((f) => f.key === key)?.label ?? key;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby={`${fileId}-title`}>
      <div className="flex max-h-full w-full max-w-3xl flex-col rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 id={`${fileId}-title`} className="text-lg font-semibold">
              {t("title")}
            </h2>
            <ol className="mt-2 flex flex-wrap gap-3 text-xs">
              {STEPS.map((s, i) => (
                <li key={s} className={cn("flex items-center gap-1.5", s === step ? "font-medium text-foreground" : "text-muted-foreground")}>
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full text-[11px]",
                      STEPS.indexOf(step) >= i ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {i + 1}
                  </span>
                  {t(`steps.${s}`)}
                </li>
              ))}
            </ol>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t("close")}>
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {step === "upload" ? (
            <>
              <div className="space-y-1.5">
                <label htmlFor={talentId} className="text-sm font-medium">
                  {t("talent")} <span className="text-destructive">*</span>
                </label>
                <TalentSelect id={talentId} value={influencerId} onChange={setInfluencerId} allowAll={false} className="w-full" />
                <p className="text-xs text-muted-foreground">{t("talentHint")}</p>
              </div>
              <label
                htmlFor={fileId}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center hover:border-primary/40"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  void onFile(e.dataTransfer.files[0]);
                }}
              >
                <FileUp className="size-6 text-muted-foreground" aria-hidden />
                <span className="text-sm font-medium">{fileName || t("drop")}</span>
                <span className="text-xs text-muted-foreground">
                  {rows.length ? t("rowsFound", { count: rows.length, columns: headers.length }) : t("dropHint", { max: CSV_MAX_ROWS })}
                </span>
                <input id={fileId} type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} />
              </label>
            </>
          ) : null}

          {step === "map" ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("mapHint")}</p>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">{t("csvColumn")}</th>
                      <th className="px-3 py-2 text-left font-medium">{t("sample")}</th>
                      <th className="w-56 px-3 py-2 text-left font-medium">{t("field")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map((header, i) => (
                      <tr key={`${header}-${i}`} className="border-t border-border">
                        <td className="px-3 py-2 font-medium">{header || t("noHeader", { n: i + 1 })}</td>
                        <td className="max-w-48 truncate px-3 py-2 text-xs text-muted-foreground">
                          {rows.slice(0, 3).map((r) => r[i]).filter(Boolean).join(" · ") || "—"}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            aria-label={t("fieldFor", { column: header })}
                            className={selectClass}
                            value={mapping[i] ?? ""}
                            onChange={(e) => setMapping((m) => m.map((v, j) => (j === i ? e.target.value : v)))}
                          >
                            <option value="">{t("skipColumn")}</option>
                            <optgroup label={t("systemFields")}>
                              {fieldOptions.filter((f) => f.origin === "SYSTEM").map((f) => (
                                <option key={f.key} value={f.key}>
                                  {f.label}
                                </option>
                              ))}
                            </optgroup>
                            {fieldOptions.some((f) => f.origin === "CUSTOM") ? (
                              <optgroup label={t("customFields")}>
                                {fieldOptions.filter((f) => f.origin === "CUSTOM").map((f) => (
                                  <option key={f.key} value={f.key}>
                                    {f.label}
                                  </option>
                                ))}
                              </optgroup>
                            ) : null}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {step === "review" ? (
            <>
              <div className="grid gap-2 sm:grid-cols-3">
                {CONFLICT_ACTIONS.map((action) => (
                  <label
                    key={action}
                    className={cn(
                      "cursor-pointer rounded-lg border p-3 text-sm",
                      conflictAction === action ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40",
                    )}
                  >
                    <input type="radio" name="conflict" className="sr-only" checked={conflictAction === action} onChange={() => setConflictAction(action)} />
                    <span className="font-medium">{t(`conflict.${action}.title`)}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{t(`conflict.${action}.hint`)}</span>
                  </label>
                ))}
              </div>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">{t("tags")}</span>
                <input
                  className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder={t("tagsPlaceholder")}
                />
              </label>
              <p className="text-sm">
                {t("summary", { count: rows.length })}
                {invalidEmails ? <span className="ml-2 text-destructive">{t("invalidEmails", { count: invalidEmails })}</span> : null}
              </p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      {previewKeys.map((k) => (
                        <th key={k} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                          {labelOf(k)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mappedRows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        {previewKeys.map((k) => (
                          <td
                            key={k}
                            className={cn("max-w-40 truncate px-3 py-2", k === "email" && !looksLikeEmail(r[k] ?? "") && "text-destructive")}
                          >
                            {r[k] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          {step === "result" && result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-notion-green">
                <CheckCircle2 className="size-5" aria-hidden />
                {t("done")}
              </div>
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["created", "updated", "skipped", "failed"] as const).map((k) => (
                  <div key={k} className="rounded-lg border border-border p-3">
                    <dt className="text-xs text-muted-foreground">{t(`result.${k}`)}</dt>
                    <dd className={cn("text-2xl font-semibold tabular-nums", k === "failed" && result[k] > 0 && "text-destructive")}>{result[k]}</dd>
                  </div>
                ))}
              </dl>
              {result.errors.length ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{t("errorsTitle")}</p>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={downloadErrors}>
                      <Download className="size-4" aria-hidden />
                      {t("downloadErrors")}
                    </Button>
                  </div>
                  <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                    {result.errors.slice(0, 20).map((e) => (
                      <li key={`${e.row}-${e.reason}`}>
                        {t("errorRow", { row: e.row })} · {e.email ?? "—"} · {t.has(`reasons.${e.reason}`) ? t(`reasons.${e.reason}`) : e.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-between gap-2 border-t border-border px-6 py-4">
          {step === "map" || step === "review" ? (
            <Button variant="outline" disabled={importCsv.isPending} onClick={() => setStep(step === "review" ? "map" : "upload")}>
              {t("back")}
            </Button>
          ) : (
            <span />
          )}
          {step === "result" ? (
            <Button onClick={onClose}>{t("finish")}</Button>
          ) : step === "review" ? (
            <Button disabled={importCsv.isPending} className="gap-1.5" onClick={() => void submit()}>
              {importCsv.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {t("import", { count: rows.length })}
            </Button>
          ) : (
            <Button onClick={next}>{t("next")}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
