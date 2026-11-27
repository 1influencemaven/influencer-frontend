"use client";

import { useQuery } from "@tanstack/react-query";
import { Archive, ArchiveRestore, Loader2, Pencil } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { NotionTag } from "@/components/email-accounts/email-account-badges";
import { ProspectKindBadge, ProspectSourceBadge, prospectDisplayName } from "@/components/prospects/prospect-badges";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { listFields } from "@/services/fields.service";
import { getApiErrorMessage } from "@/types/api-error";
import type { Prospect, UpdateProspectPayload } from "@/types/prospects";

const EDITABLE = [
  "firstName", "lastName", "jobTitle", "company", "companyDomain", "website", "linkedInUrl", "country", "phoneNumber", "mailboxLabel",
] as const;
type Editable = (typeof EDITABLE)[number];

function Property({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] items-start gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}

const dash = <span className="text-muted-foreground">—</span>;
const inputClass =
  "h-8 w-full rounded-md border border-input bg-card px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Notion-style side peek: every property, inline edit and archive/restore. */
export function ProspectPeek({
  prospect,
  onClose,
  onSave,
  onToggleArchive,
}: {
  prospect: Prospect | null;
  onClose: () => void;
  onSave: (id: string, payload: UpdateProspectPayload) => Promise<Prospect>;
  onToggleArchive: (p: Prospect) => void;
}) {
  const t = useTranslations("Prospects");
  const locale = useLocale();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customFields = useQuery({
    queryKey: ["fields", "custom-active"],
    queryFn: () => listFields({ origin: "custom", status: "active", sortBy: "label", sortOrder: "asc" }),
    enabled: prospect !== null,
    staleTime: 60_000,
    select: (r) => r.data,
  });

  function startEdit(p: Prospect) {
    setDraft(Object.fromEntries(EDITABLE.map((k) => [k, p[k] ?? ""])));
    setCustom(Object.fromEntries(p.customFields.map((c) => [c.fieldId, c.value])));
    setTags(p.tags.join(", "));
    setError(null);
    setEditing(true);
  }

  async function save(p: Prospect) {
    setSaving(true);
    setError(null);
    try {
      const payload: UpdateProspectPayload = {};
      for (const key of EDITABLE) {
        if ((draft[key] ?? "") !== (p[key] ?? "")) (payload as Record<Editable, string>)[key] = draft[key] ?? "";
      }
      const nextTags = tags.split(",").map((s) => s.trim()).filter(Boolean);
      if (nextTags.join("|") !== p.tags.join("|")) payload.tags = nextTags;
      const changedCustom = (customFields.data ?? [])
        .filter((f) => (custom[f.id] ?? "") !== (p.customFields.find((c) => c.fieldId === f.id)?.value ?? ""))
        .map((f) => ({ fieldId: f.id, value: custom[f.id] ?? "" }));
      if (changedCustom.length) payload.customFields = changedCustom;
      if (Object.keys(payload).length) await onSave(p.id, payload);
      setEditing(false);
    } catch (err) {
      setError(getApiErrorMessage(err, t("peek.saveError")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={prospect !== null}
      onOpenChange={(open) => {
        if (!open) {
          setEditing(false);
          onClose();
        }
      }}
    >
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
        {prospect ? (
          <>
            <SheetHeader className="border-b border-border px-6 pt-8 pb-5">
              <SheetTitle className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight break-all">
                {prospect.email}
                <ProspectKindBadge prospect={prospect} />
              </SheetTitle>
              <SheetDescription>
                {prospectDisplayName(prospect) ?? t("peek.noName")}
                {prospect.company ? ` · ${prospect.company}` : ""}
              </SheetDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                {!editing ? (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => startEdit(prospect)}>
                    <Pencil className="size-3.5" aria-hidden />
                    {t("actions.edit")}
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onToggleArchive(prospect)}>
                  {prospect.status === "ACTIVE" ? <Archive className="size-3.5" aria-hidden /> : <ArchiveRestore className="size-3.5" aria-hidden />}
                  {prospect.status === "ACTIVE" ? t("actions.archive") : t("actions.restore")}
                </Button>
              </div>
            </SheetHeader>

            {editing ? (
              <form
                className="space-y-3 px-6 py-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void save(prospect);
                }}
              >
                {EDITABLE.map((key) => (
                  <label key={key} className="grid grid-cols-[9rem_1fr] items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{t(`fields.${key}`)}</span>
                    <input
                      className={inputClass}
                      value={draft[key] ?? ""}
                      onChange={(event) => setDraft((d) => ({ ...d, [key]: event.target.value }))}
                    />
                  </label>
                ))}
                <label className="grid grid-cols-[9rem_1fr] items-center gap-3 text-sm">
                  <span className="text-muted-foreground">{t("fields.tags")}</span>
                  <input className={inputClass} value={tags} placeholder={t("peek.tagsHint")} onChange={(e) => setTags(e.target.value)} />
                </label>
                {(customFields.data ?? []).length ? (
                  <div className="space-y-3 border-t border-border pt-3">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{t("peek.customFields")}</p>
                    {(customFields.data ?? []).map((f) => (
                      <label key={f.id} className="grid grid-cols-[9rem_1fr] items-center gap-3 text-sm">
                        <span className="truncate text-muted-foreground">{f.label}</span>
                        {f.fieldType === "dropdown" && f.metadata?.options?.length ? (
                          <select
                            className={inputClass}
                            value={custom[f.id] ?? ""}
                            onChange={(e) => setCustom((c) => ({ ...c, [f.id]: e.target.value }))}
                          >
                            <option value="">—</option>
                            {f.metadata.options.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className={inputClass}
                            type={f.fieldType === "date" ? "date" : f.fieldType === "number" || f.fieldType === "currency" ? "number" : "text"}
                            value={custom[f.id] ?? ""}
                            onChange={(e) => setCustom((c) => ({ ...c, [f.id]: e.target.value }))}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                ) : null}
                {error ? (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" disabled={saving} onClick={() => setEditing(false)}>
                    {t("peek.cancel")}
                  </Button>
                  <Button type="submit" disabled={saving} className="gap-1.5">
                    {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                    {t("peek.save")}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 px-6 py-5">
                <section>
                  {EDITABLE.map((key) => (
                    <Property key={key} label={t(`fields.${key}`)}>
                      {prospect[key] ? (
                        key === "website" || key === "linkedInUrl" ? (
                          <a href={prospect[key] as string} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                            {prospect[key]}
                          </a>
                        ) : (
                          prospect[key]
                        )
                      ) : (
                        dash
                      )}
                    </Property>
                  ))}
                  <Property label={t("fields.tags")}>
                    {prospect.tags.length ? (
                      <div className="flex flex-wrap gap-1">
                        {prospect.tags.map((tag) => (
                          <NotionTag key={tag}>{tag}</NotionTag>
                        ))}
                      </div>
                    ) : (
                      dash
                    )}
                  </Property>
                </section>
                {prospect.customFields.length ? (
                  <section>
                    <h3 className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{t("peek.customFields")}</h3>
                    {prospect.customFields.map((c) => (
                      <Property key={c.fieldId} label={c.label}>
                        {c.value}
                      </Property>
                    ))}
                  </section>
                ) : null}
                <section>
                  <h3 className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{t("peek.origin")}</h3>
                  <Property label={t("table.columns.talent")}>{prospect.influencerName ?? dash}</Property>
                  <Property label={t("table.columns.source")}>
                    <ProspectSourceBadge source={prospect.source} />
                  </Property>
                  {prospect.brandName ? <Property label={t("peek.brand")}>{prospect.brandName}</Property> : null}
                  {prospect.agencyName ? <Property label={t("peek.agency")}>{prospect.agencyName}</Property> : null}
                  <Property label={t("peek.relevance")}>{t(`relevance.${prospect.commercialRelevance}`)}</Property>
                  <Property label={t("table.columns.added")}>
                    {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(prospect.createdAt))}
                  </Property>
                </section>
              </div>
            )}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
