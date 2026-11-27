"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { listProspects } from "@/services/prospects.service";
import { previewTemplate } from "@/services/templates.service";
import { getApiErrorMessage } from "@/types/api-error";
import type { TemplateContent, TemplatePreview } from "@/types/templates";

const IFRAME_STYLE = `<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1f1f1f;margin:16px}p{margin:0 0 12px}ul,ol{padding-left:22px}a{color:#0075de}mark{background:#fde68a;border-radius:3px;padding:0 3px}</style>`;

/** HU-TPL-011: preview the current draft with one of the talent's prospects (never saves). */
export function TemplatePreviewSheet({
  open,
  onClose,
  influencerId,
  templateId,
  content,
}: {
  open: boolean;
  onClose: () => void;
  influencerId: string;
  templateId?: string;
  content: TemplateContent;
}) {
  const t = useTranslations("Templates.preview");
  const [prospectId, setProspectId] = useState("");
  const [mode, setMode] = useState<"html" | "text">("html");
  const prospects = useQuery({
    queryKey: ["prospects", "preview-options", influencerId],
    queryFn: () => listProspects({ influencerId, status: "active", sortBy: "createdAt", sortOrder: "desc", page: 1, limit: 100 }),
    enabled: open,
    select: (page) => page.data,
  });

  const preview = useQuery({
    queryKey: ["templates", "preview", templateId ?? "", influencerId, prospectId, content.subject, content.preHeader ?? "", content.bodyHtml],
    queryFn: () => previewTemplate({ templateId, influencerId, ...(prospectId ? { prospectId } : {}), ...content }),
    enabled: open,
    placeholderData: keepPreviousData,
  });
  const result: TemplatePreview | undefined = preview.data;
  const loading = preview.isFetching;
  const error = preview.error ? getApiErrorMessage(preview.error, t("error")) : null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border px-6 pt-8 pb-4">
          <SheetTitle className="text-xl font-semibold">{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
          <label className="mt-3 block space-y-1.5 text-sm">
            <span className="font-medium">{t("prospect")}</span>
            <select
              value={prospectId}
              onChange={(e) => setProspectId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">{t("noProspect")}</option>
              {(prospects.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {[p.email, [p.firstName, p.lastName].filter(Boolean).join(" ") || p.mailboxLabel, p.company].filter(Boolean).join(" · ")}
                </option>
              ))}
            </select>
            {prospects.data && prospects.data.length === 0 ? <span className="block text-xs text-muted-foreground">{t("emptyProspects")}</span> : null}
          </label>
        </SheetHeader>

        <div className="space-y-4 px-6 py-5">
          {loading && !result ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {t("loading")}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          {result ? (
            <>
              {result.unresolved.length ? (
                <div className="flex gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-400" role="status">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span>
                    {t("unresolved")}{" "}
                    {[...new Set(result.unresolved.map((u) => u.label))].join(", ")}
                  </span>
                </div>
              ) : null}
              {result.usedFallbacks.length ? (
                <p className="text-xs text-muted-foreground">
                  {t("fallbacks")} {result.usedFallbacks.map((f) => `${f.label} → “${f.value}”`).join(", ")}
                </p>
              ) : null}

              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <dl className="space-y-1 border-b border-border px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted-foreground">{t("from")}</dt>
                    <dd className="truncate">{result.from ?? t("noSender")}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted-foreground">{t("to")}</dt>
                    <dd className="truncate">{result.to ?? "—"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted-foreground">{t("subject")}</dt>
                    <dd className="font-medium">{result.subject}</dd>
                  </div>
                  {result.preHeader ? (
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 text-muted-foreground">{t("preHeader")}</dt>
                      <dd className="text-muted-foreground">{result.preHeader}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className="flex gap-1 border-b border-border px-3 py-1.5" role="tablist">
                  {(["html", "text"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => setMode(m)}
                      className={cn("rounded-md px-2.5 py-1 text-xs font-medium", mode === m ? "bg-muted text-foreground" : "text-muted-foreground")}
                    >
                      {t(`mode.${m}`)}
                    </button>
                  ))}
                </div>
                {mode === "html" ? (
                  <iframe
                    title={t("title")}
                    sandbox=""
                    srcDoc={`<!doctype html><html><head><meta charset="utf-8">${IFRAME_STYLE}</head><body>${result.bodyHtml}</body></html>`}
                    className="h-96 w-full bg-white"
                  />
                ) : (
                  <pre className="max-h-96 overflow-auto px-4 py-3 font-sans text-sm whitespace-pre-wrap">{result.bodyText}</pre>
                )}
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
