"use client";

import { Lock, Pencil, Power, PowerOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { NotionTag } from "@/components/email-accounts/email-account-badges";
import {
  FieldOriginBadge,
  FieldStatusBadge,
  FieldTypeBadge,
  FieldVariable,
} from "@/components/fields/field-badges";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CustomField } from "@/types/fields";

type PeekProps = {
  field: CustomField | null;
  canManage: boolean;
  onClose: () => void;
  onEdit: (field: CustomField) => void;
  onToggleStatus: (field: CustomField) => void;
};

function Property({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] items-start gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}

const dash = <span className="text-muted-foreground">—</span>;

/** Notion-style side peek with every property of a field. */
export function FieldPeek({ field, canManage, onClose, onEdit, onToggleStatus }: PeekProps) {
  const t = useTranslations("Fields");
  const locale = useLocale();
  const date = (iso: string | null) =>
    iso ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : dash;
  const fromSaleshandyOnly = (field: CustomField) =>
    field.origin === "CUSTOM" && field.metadata === null && ["dropdown", "currency"].includes(field.fieldType);

  return (
    <Sheet open={field !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
        {field ? (
          <>
            <SheetHeader className="border-b border-border px-6 pt-8 pb-5">
              <SheetTitle className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                {field.label}
                <FieldStatusBadge field={field} />
              </SheetTitle>
              <SheetDescription asChild>
                <div>
                  <FieldVariable fieldKey={field.key} />
                </div>
              </SheetDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                {field.origin === "SYSTEM" ? (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3.5" aria-hidden />
                    {t("peek.systemNotice")}
                  </p>
                ) : canManage ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={!field.editable || !field.isActive}
                      onClick={() => onEdit(field)}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      {t("actions.edit")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={field.disabledReason === "REMOVED_IN_SALESHANDY"}
                      onClick={() => onToggleStatus(field)}
                    >
                      {field.isActive ? <PowerOff className="size-3.5" aria-hidden /> : <Power className="size-3.5" aria-hidden />}
                      {field.isActive ? t("actions.disable") : t("actions.enable")}
                    </Button>
                  </>
                ) : null}
              </div>
              {field.disabledReason === "REMOVED_IN_SALESHANDY" ? (
                <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {t("peek.removedNotice")}
                </p>
              ) : null}
            </SheetHeader>

            <div className="space-y-6 px-6 py-5">
              <section>
                <Property label={t("peek.type")}>
                  <FieldTypeBadge field={field} />
                </Property>
                <Property label={t("peek.origin")}>
                  <FieldOriginBadge field={field} />
                </Property>
                <Property label={t("peek.fallback")}>{field.fallbackText || dash}</Property>
                <Property label={t("peek.tags")}>
                  {field.tags.length ? (
                    <div className="flex flex-wrap gap-1">
                      {field.tags.map((tag) => (
                        <NotionTag key={tag}>{tag}</NotionTag>
                      ))}
                    </div>
                  ) : (
                    dash
                  )}
                </Property>
                {field.fieldType === "dropdown" ? (
                  <Property label={t("peek.options")}>
                    {field.metadata?.options?.length ? (
                      <ul className="space-y-0.5">
                        {field.metadata.options.map((option) => (
                          <li key={option}>{option}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">{t("peek.notAvailable")}</span>
                    )}
                  </Property>
                ) : null}
                {field.fieldType === "currency" ? (
                  <Property label={t("peek.currency")}>
                    {field.metadata?.currencyCode ?? <span className="text-muted-foreground">{t("peek.notAvailable")}</span>}
                  </Property>
                ) : null}
                {fromSaleshandyOnly(field) ? (
                  <p className="mt-1 text-xs text-muted-foreground">{t("peek.metadataHint")}</p>
                ) : null}
              </section>

              <section>
                <h3 className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("peek.integration")}
                </h3>
                <Property label={t("peek.saleshandyId")}>
                  {field.saleshandyFieldId ? <code className="font-mono text-xs">{field.saleshandyFieldId}</code> : dash}
                </Property>
                {field.systemMapping ? (
                  <Property label={t("peek.systemMapping")}>
                    <code className="font-mono text-xs">{field.systemMapping}</code>
                  </Property>
                ) : null}
                <Property label={t("peek.lastSynced")}>{date(field.lastSyncedAt)}</Property>
                <Property label={t("peek.updatedAt")}>{date(field.updatedAt)}</Property>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
