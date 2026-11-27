"use client";

import { Check, Loader2, UserPlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useApprovedProspectIds, useProspectMutations } from "@/hooks/use-prospects";
import { cn } from "@/lib/utils";
import type { ApprovalItem, ApprovalResult, ApprovedIds } from "@/types/prospects";

type ApproveProspectButtonProps = {
  type: ApprovalItem["type"];
  id: string;
  /** Talent that owns the contact (required for agency contacts; enables the "approved" state). */
  influencerId?: string | null;
  className?: string;
};

export function isApproved(ids: ApprovedIds | undefined, type: ApprovalItem["type"], id: string): boolean {
  if (!ids) return false;
  if (type === "LEAD") return ids.leadIds.includes(id);
  if (type === "BRAND_CONTACT") return ids.brandBusinessContactIds.includes(id);
  return ids.agencyContactIds.includes(id);
}

/**
 * "Approve → Prospects" (product decision 2026-11-26: a discovered contact
 * becomes a prospect only when the user approves it). Shows the approved state
 * and lets the user remove it again (archives the prospect).
 */
export function ApproveProspectButton({ type, id, influencerId, className }: ApproveProspectButtonProps) {
  const t = useTranslations("Prospects.approve");
  const approved = useApprovedProspectIds(influencerId);
  const { approve, unapprove } = useProspectMutations();
  const [localApproved, setLocalApproved] = useState<boolean | null>(null);
  const [skipReason, setSkipReason] = useState<ApprovalResult["reason"] | null>(null);
  const [error, setError] = useState(false);

  const item: ApprovalItem = { type, id, ...(influencerId ? { influencerId } : {}) };
  const isOn = localApproved ?? isApproved(approved.data, type, id);
  const busy = approve.isPending || unapprove.isPending;

  async function onApprove() {
    setError(false);
    setSkipReason(null);
    try {
      const [result] = await approve.mutateAsync([item]);
      if (result?.outcome === "skipped") setSkipReason(result.reason ?? "NOT_FOUND");
      else setLocalApproved(true);
    } catch {
      setError(true);
    }
  }

  async function onRemove() {
    setError(false);
    try {
      await unapprove.mutateAsync([item]);
      setLocalApproved(false);
    } catch {
      setError(true);
    }
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {isOn ? (
        <span className="group inline-flex items-center gap-1">
          <span className="inline-flex items-center gap-1 rounded-sm bg-notion-green/10 px-1.5 py-0.5 text-xs font-medium text-notion-green">
            <Check className="size-3" aria-hidden />
            {t("approved")}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-1.5 text-xs text-muted-foreground"
            disabled={busy}
            onClick={() => void onRemove()}
            aria-label={t("remove")}
            title={t("remove")}
          >
            {unapprove.isPending ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <X className="size-3" aria-hidden />}
          </Button>
        </span>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2.5 text-xs"
          disabled={busy}
          onClick={() => void onApprove()}
        >
          {approve.isPending ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <UserPlus className="size-3" aria-hidden />}
          {t("approve")}
        </Button>
      )}
      {skipReason ? <span className="text-xs text-destructive">{t(`skip.${skipReason}`)}</span> : null}
      {error ? <span className="text-xs text-destructive">{t("error")}</span> : null}
    </span>
  );
}

/** Bulk "Approve all" for a list of contacts. */
export function ApproveAllButton({
  items,
  influencerId,
  label,
}: {
  items: ApprovalItem[];
  influencerId?: string | null;
  label?: string;
}) {
  const t = useTranslations("Prospects.approve");
  const approved = useApprovedProspectIds(influencerId);
  const { approve } = useProspectMutations();
  const [summary, setSummary] = useState<string | null>(null);
  const pending = items.filter((i) => !isApproved(approved.data, i.type, i.id));
  if (items.length === 0) return null;

  async function run() {
    setSummary(null);
    try {
      const results = await approve.mutateAsync(pending);
      const added = results.filter((r) => r.outcome !== "skipped").length;
      const skipped = results.length - added;
      setSummary(t("bulkDone", { added, skipped }));
    } catch {
      setSummary(t("error"));
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 gap-1 px-2.5 text-xs"
        disabled={approve.isPending || pending.length === 0}
        onClick={() => void run()}
      >
        {approve.isPending ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <UserPlus className="size-3" aria-hidden />}
        {label ?? t("approveAll", { count: pending.length })}
      </Button>
      {summary ? <span className="text-xs text-muted-foreground">{summary}</span> : null}
    </span>
  );
}
