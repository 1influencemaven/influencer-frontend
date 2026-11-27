"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Archive, ArchiveRestore, ArrowLeft, CheckCircle2, Copy, Eye, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

import { TemplateBodyEditor } from "@/components/templates/template-body-editor";
import { TemplatePreviewSheet } from "@/components/templates/template-preview-sheet";
import { VariableChipContext } from "@/components/templates/variable-node";
import { VariablePicker } from "@/components/templates/variable-picker";
import { Button } from "@/components/ui/button";
import { useTemplate, useTemplateMutations, useVariablesCatalog } from "@/hooks/use-templates";
import { Link, useRouter } from "@/i18n/navigation";
import { insertAtCursor, isEmptyEditorHtml, issueStatusByKey } from "@/lib/template-editor";
import { cn } from "@/lib/utils";
import { getInfluencer } from "@/services/influencers.service";
import { exportTemplateForSaleshandy, validateTemplate } from "@/services/templates.service";
import { getApiErrorMessage } from "@/types/api-error";
import type { TemplateDetail, VariableDefinition, VariableIssue } from "@/types/templates";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:opacity-60";

type Errors = Partial<Record<"name" | "subject" | "body", string>>;

/** Saleshandy-like template editor (HU-TPL-005/006/007/008/009/011): loads, then renders the form. */
export function TemplateEditor({ influencerId, templateId }: { influencerId: string; templateId?: string }) {
  const t = useTranslations("Templates.editor");
  const template = useTemplate(templateId);

  if (templateId && template.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden /> {t("loading")}
      </p>
    );
  }
  if (templateId && (template.error || !template.data)) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm" role="alert">
        {getApiErrorMessage(template.error, t("loadError"))}
      </div>
    );
  }
  // Keyed by template so the form state starts from the saved version (HU-TPL-006 CA-02).
  return <TemplateEditorForm key={templateId ?? "new"} influencerId={influencerId} template={template.data} />;
}

function TemplateEditorForm({ influencerId, template }: { influencerId: string; template?: TemplateDetail }) {
  const t = useTranslations("Templates.editor");
  const locale = useLocale();
  const router = useRouter();
  const templateId = template?.id;
  const catalog = useVariablesCatalog(locale);
  const talent = useQuery({ queryKey: ["influencer", influencerId], queryFn: () => getInfluencer(influencerId), staleTime: 60_000 });
  const { create, update, archive } = useTemplateMutations();

  const [name, setName] = useState(template?.name ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [preHeader, setPreHeader] = useState(template?.preHeader ?? "");
  const [bodyHtml, setBodyHtml] = useState(template?.bodyHtml ?? "");
  const [saved, setSaved] = useState(template);
  const [status, setStatus] = useState(template?.status ?? "ACTIVE");
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [issues, setIssues] = useState<VariableIssue[]>(template?.validation.issues ?? []);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const subjectRef = useRef<HTMLInputElement>(null);
  const preHeaderRef = useRef<HTMLInputElement>(null);

  // Live validation (HU-TPL-009 CA-05), debounced; setState happens in the async callback.
  useEffect(() => {
    if (!subject.trim() || isEmptyEditorHtml(bodyHtml)) return;
    const timeout = window.setTimeout(() => {
      validateTemplate({ subject, preHeader: preHeader || undefined, bodyHtml })
        .then((r) => setIssues(r.issues))
        .catch(() => undefined);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [subject, preHeader, bodyHtml]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const labels = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of Object.values(catalog.data?.groups ?? {})) for (const v of group) map.set(v.key, v.label);
    return map;
  }, [catalog.data]);
  const chipContext = useMemo(() => ({ labels, status: issueStatusByKey(issues) }), [labels, issues]);

  const archived = status === "ARCHIVED";
  const saving = create.isPending || update.isPending;

  function insertInto(field: "subject" | "preHeader", v: VariableDefinition) {
    const ref = field === "subject" ? subjectRef.current : preHeaderRef.current;
    const value = field === "subject" ? subject : preHeader;
    const next = insertAtCursor(value, ref?.selectionStart ?? null, ref?.selectionEnd ?? null, v.token);
    (field === "subject" ? setSubject : setPreHeader)(next.value);
    setDirty(true);
    requestAnimationFrame(() => {
      ref?.focus();
      ref?.setSelectionRange(next.caret, next.caret);
    });
  }

  function validateForm(): boolean {
    const next: Errors = {};
    if (!name.trim()) next.name = t("errors.name");
    if (!subject.trim()) next.subject = t("errors.subject");
    if (isEmptyEditorHtml(bodyHtml)) next.body = t("errors.body");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save() {
    setNotice(null);
    if (!validateForm()) return;
    try {
      if (!templateId) {
        const created = await create.mutateAsync({
          influencerId,
          name: name.trim(),
          subject: subject.trim(),
          ...(preHeader.trim() ? { preHeader: preHeader.trim() } : {}),
          bodyHtml,
        });
        setDirty(false);
        router.replace(`/dashboard/creators/${influencerId}/templates/${created.id}`);
        return;
      }
      const payload = {
        ...(name.trim() !== saved?.name ? { name: name.trim() } : {}),
        ...(subject.trim() !== saved?.subject ? { subject: subject.trim() } : {}),
        ...(preHeader.trim() !== (saved?.preHeader ?? "") ? { preHeader: preHeader.trim() } : {}),
        ...(bodyHtml !== saved?.bodyHtml ? { bodyHtml } : {}),
      };
      if (Object.keys(payload).length === 0) {
        setDirty(false);
        setNotice({ kind: "ok", text: t("notices.noChanges") });
        return;
      }
      const updated = await update.mutateAsync({ id: templateId, payload });
      // Keep the editor as is (its content is what was saved); refresh issues only.
      setSaved(updated);
      setIssues(updated.validation.issues);
      setDirty(false);
      setNotice({ kind: "ok", text: t("notices.saved") });
    } catch (error) {
      setNotice({ kind: "error", text: getApiErrorMessage(error, t("notices.saveError")) });
    }
  }

  async function toggleArchive() {
    if (!templateId) return;
    if (!archived && !window.confirm(t("archiveConfirm"))) return;
    try {
      const res = await archive.mutateAsync({ id: templateId, archived: !archived });
      setStatus(res.status);
      setNotice({ kind: "ok", text: archived ? t("notices.restored") : t("notices.archived") });
    } catch (error) {
      setNotice({ kind: "error", text: getApiErrorMessage(error, t("notices.saveError")) });
    }
  }

  async function copyForSaleshandy() {
    if (!templateId) return;
    if (dirty) {
      setNotice({ kind: "error", text: t("notices.saveFirst") });
      return;
    }
    try {
      const out = await exportTemplateForSaleshandy(templateId);
      const html = `<p><strong>Subject:</strong> ${out.subject}</p>${out.preheader ? `<p><strong>Preheader:</strong> ${out.preheader}</p>` : ""}${out.content}`;
      const plain = `Subject: ${out.subject}\n${out.preheader ? `Preheader: ${out.preheader}\n` : ""}\n${out.content.replace(/<[^>]+>/g, "")}`;
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([plain], { type: "text/plain" }) }),
        ]);
      } else {
        await navigator.clipboard.writeText(plain);
      }
      const missing = out.missingInfluencerValues.length ? ` ${t("notices.missingTalent", { keys: out.missingInfluencerValues.join(", ") })}` : "";
      setNotice({ kind: "ok", text: `${t("notices.copied")}${missing}` });
    } catch (error) {
      setNotice({ kind: "error", text: getApiErrorMessage(error, t("notices.copyError")) });
    }
  }

  const errorsCount = issues.filter((i) => i.severity === "error").length;
  const warningsCount = issues.length - errorsCount;

  return (
    <VariableChipContext.Provider value={chipContext}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <Link href={`/dashboard/creators/${influencerId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" aria-hidden />
              {talent.data?.name ?? t("back")}
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{templateId ? t("editTitle") : t("createTitle")}</h1>
            <p className="text-xs text-muted-foreground">{dirty ? t("unsaved") : templateId ? t("savedState") : t("newHint")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewOpen(true)} disabled={!subject.trim() || isEmptyEditorHtml(bodyHtml)}>
              <Eye className="size-4" aria-hidden />
              {t("preview")}
            </Button>
            {templateId ? (
              <>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void copyForSaleshandy()}>
                  <Copy className="size-4" aria-hidden />
                  {t("copySaleshandy")}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void toggleArchive()} disabled={archive.isPending}>
                  {archived ? <ArchiveRestore className="size-4" aria-hidden /> : <Archive className="size-4" aria-hidden />}
                  {archived ? t("restore") : t("archive")}
                </Button>
              </>
            ) : null}
            <Button size="sm" className="gap-1.5" onClick={() => void save()} disabled={saving || archived}>
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {templateId ? t("save") : t("create")}
            </Button>
          </div>
        </div>

        {notice ? (
          <div
            className={cn("rounded-md px-4 py-3 text-sm", notice.kind === "ok" ? "bg-primary/10 text-foreground" : "bg-destructive/10 text-destructive")}
            role="status"
          >
            {notice.text}
          </div>
        ) : null}
        {archived ? <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">{t("archivedNotice")}</div> : null}

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <fieldset disabled={archived} className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">
                {t("name")} <span className="text-destructive">*</span>
              </span>
              <input
                className={inputClass}
                value={name}
                maxLength={150}
                aria-invalid={Boolean(errors.name)}
                placeholder={t("namePlaceholder")}
                onChange={(e) => {
                  setName(e.target.value);
                  setDirty(true);
                }}
              />
              {errors.name ? <span className="text-xs text-destructive">{errors.name}</span> : null}
            </label>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="template-subject" className="text-sm font-medium">
                  {t("subject")} <span className="text-destructive">*</span>
                </label>
                <VariablePicker catalog={catalog.data} onSelect={(v) => insertInto("subject", v)} label={t("insertVariable")} />
              </div>
              <input
                id="template-subject"
                ref={subjectRef}
                className={inputClass}
                value={subject}
                maxLength={300}
                aria-invalid={Boolean(errors.subject)}
                placeholder={t("subjectPlaceholder")}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setDirty(true);
                }}
              />
              {errors.subject ? <span className="text-xs text-destructive">{errors.subject}</span> : null}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="template-preheader" className="text-sm font-medium">
                  {t("preHeader")} <span className="font-normal text-muted-foreground">({t("optional")})</span>
                </label>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums">{preHeader.length} / 120</span>
                  <VariablePicker catalog={catalog.data} onSelect={(v) => insertInto("preHeader", v)} size="icon" />
                </span>
              </div>
              <input
                id="template-preheader"
                ref={preHeaderRef}
                className={inputClass}
                value={preHeader}
                maxLength={300}
                placeholder={t("preHeaderPlaceholder")}
                onChange={(e) => {
                  setPreHeader(e.target.value);
                  setDirty(true);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-sm font-medium">
                {t("body")} <span className="text-destructive">*</span>
              </span>
              <TemplateBodyEditor
                initialHtml={bodyHtml}
                catalog={catalog.data}
                invalid={Boolean(errors.body)}
                onChange={(html) => {
                  setBodyHtml(html);
                  setDirty(true);
                }}
              />
              {errors.body ? <span className="text-xs text-destructive">{errors.body}</span> : null}
            </div>
          </fieldset>

          <aside className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs lg:sticky lg:top-4 lg:self-start" aria-label={t("issues.title")}>
            <h2 className="text-sm font-semibold">{t("issues.title")}</h2>
            {issues.length === 0 ? (
              <p className="flex items-center gap-1.5 text-sm text-notion-green">
                <CheckCircle2 className="size-4" aria-hidden />
                {t("issues.none")}
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {[
                    errorsCount ? t("issues.errors", { count: errorsCount }) : null,
                    warningsCount ? t("issues.warnings", { count: warningsCount }) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <ul className="space-y-2">
                  {issues.map((issue, i) => (
                    <li
                      key={`${issue.code}-${issue.raw}-${i}`}
                      className={cn(
                        "rounded-md border px-2.5 py-2 text-xs",
                        issue.severity === "error"
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-amber-400/40 bg-amber-50 dark:bg-amber-400/10",
                      )}
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="size-3.5" aria-hidden />
                        {t(`issues.codes.${issue.code}`)}
                      </span>
                      <span className="mt-0.5 block text-muted-foreground">
                        <code className="font-mono">{issue.key ? `{{${issue.key}}}` : issue.raw}</code> · {t(`issues.locations.${issue.location}`)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-muted-foreground">{t("issues.saveAllowed")}</p>
              </>
            )}
            <div className="border-t border-border pt-3 text-[11px] text-muted-foreground">{t("issues.help")}</div>
          </aside>
        </div>

        <TemplatePreviewSheet
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          influencerId={influencerId}
          templateId={templateId}
          content={{ subject, preHeader: preHeader || undefined, bodyHtml }}
        />
      </div>
    </VariableChipContext.Provider>
  );
}
