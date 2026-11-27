"use client";

import {
  AlignLeft,
  Calendar,
  CircleDollarSign,
  Hash,
  ListChecks,
  Lock,
  Type,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { NotionTag } from "@/components/email-accounts/email-account-badges";
import { cn } from "@/lib/utils";
import type { CustomField, FieldType } from "@/types/fields";

export const FIELD_TYPE_ICONS: Record<FieldType, LucideIcon> = {
  text: Type,
  "long-text": AlignLeft,
  number: Hash,
  currency: CircleDollarSign,
  date: Calendar,
  dropdown: ListChecks,
};

/** Type with its Saleshandy-like glyph; dropdown shows its option count, currency its code. */
export function FieldTypeBadge({ field }: { field: Pick<CustomField, "fieldType" | "metadata"> }) {
  const t = useTranslations("Fields");
  const Icon = FIELD_TYPE_ICONS[field.fieldType];
  const extra =
    field.fieldType === "dropdown" && field.metadata?.options?.length
      ? t("type.optionsCount", { count: field.metadata.options.length })
      : field.fieldType === "currency" && field.metadata?.currencyCode
        ? field.metadata.currencyCode
        : null;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-foreground">
      <Icon className="size-3.5 text-muted-foreground" aria-hidden />
      {t(`types.${field.fieldType}`)}
      {extra ? <span className="text-xs text-muted-foreground">· {extra}</span> : null}
    </span>
  );
}

export function FieldOriginBadge({ field }: { field: Pick<CustomField, "origin"> }) {
  const t = useTranslations("Fields.origin");
  const system = field.origin === "SYSTEM";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium whitespace-nowrap",
        system ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
      )}
    >
      {system ? <Lock className="size-3" aria-hidden /> : null}
      {t(field.origin)}
    </span>
  );
}

export function FieldStatusBadge({ field }: { field: Pick<CustomField, "isActive" | "disabledReason"> }) {
  const t = useTranslations("Fields.status");
  if (field.isActive) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-destructive/10 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-destructive">
      {t(field.disabledReason === "REMOVED_IN_SALESHANDY" ? "removed" : "disabled")}
    </span>
  );
}

export function FieldTags({ tags, max = 2 }: { tags: string[]; max?: number }) {
  if (tags.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const shown = tags.slice(0, max);
  const rest = tags.length - shown.length;
  return (
    <span className="flex flex-wrap items-center gap-1" title={tags.join(", ")}>
      {shown.map((tag) => (
        <NotionTag key={tag}>{tag}</NotionTag>
      ))}
      {rest > 0 ? <span className="text-xs text-muted-foreground">+{rest}</span> : null}
    </span>
  );
}

/** `{{key}}` merge-tag pill. */
export function FieldVariable({ fieldKey, className }: { fieldKey: string; className?: string }) {
  return (
    <code
      className={cn(
        "rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px] text-secondary-foreground",
        className,
      )}
    >
      {`{{${fieldKey}}}`}
    </code>
  );
}
