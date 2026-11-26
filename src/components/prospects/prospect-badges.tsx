"use client";

import { Building2, FileSpreadsheet, Mail, PenLine, UserRound, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { Prospect, ProspectSource } from "@/types/prospects";

const SOURCE_ICONS: Record<ProspectSource, typeof Mail> = {
  LEAD: UserRound,
  BRAND_CONTACT: Mail,
  AGENCY_CONTACT: Building2,
  CSV: FileSpreadsheet,
  MANUAL: PenLine,
  SALESHANDY: Users,
};

export function ProspectSourceBadge({ source }: { source: ProspectSource }) {
  const t = useTranslations("Prospects.source");
  const Icon = SOURCE_ICONS[source];
  return (
    <span className="inline-flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground">
      <Icon className="size-3.5" aria-hidden />
      {t(source)}
    </span>
  );
}

export function ProspectKindBadge({ prospect }: { prospect: Pick<Prospect, "contactKind" | "isGeneric"> }) {
  const t = useTranslations("Prospects.kind");
  const mailbox = prospect.contactKind === "MAILBOX";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        mailbox ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
      )}
    >
      {mailbox ? (prospect.isGeneric ? t("generic") : t("mailbox")) : t("person")}
    </span>
  );
}

/** Display name without inventing one (RF-01): person name, else mailbox label, else nothing. */
export function prospectDisplayName(p: Pick<Prospect, "firstName" | "lastName" | "mailboxLabel">): string | null {
  const name = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
  return name || p.mailboxLabel || null;
}
