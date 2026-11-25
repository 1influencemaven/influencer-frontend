"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { deselectLeadForOutreach, selectLeadForOutreach } from "@/services/lead-discovery.service";
import { getApiErrorMessage } from "@/types/api-error";
import type { Lead } from "@/types/lead-discovery";

/**
 * Per-contact outreach actions: select / unselect as the brand's outreach
 * contact (exclusive per brand, backend ADR-0011) and open the lead detail.
 */
export function LeadOutreachActions({ lead, onChanged }: { lead: Lead; onChanged?: () => void }) {
  const t = useTranslations("LeadDiscovery");
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: (select: boolean) =>
      select ? selectLeadForOutreach(lead.id) : deselectLeadForOutreach(lead.id),
  });
  const selected = lead.selectedForOutreach;
  const discarded = lead.status === "DISCARDED" || lead.status === "DUPLICATE";

  async function toggle() {
    setError(null);
    try {
      await mutation.mutateAsync(!selected);
      onChanged?.();
    } catch (toggleError) {
      setError(getApiErrorMessage(toggleError, selected ? t("deselectError") : t("selectError")));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!discarded ? (
        <Button
          type="button"
          size="sm"
          variant={selected ? "secondary" : "outline"}
          className="h-7 gap-1.5 px-2 text-xs"
          disabled={mutation.isPending}
          onClick={() => void toggle()}
          title={selected ? t("deselectForOutreach") : undefined}
        >
          {mutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : selected ? (
            <CheckCircle2 className="size-3.5 text-notion-green" aria-hidden />
          ) : (
            <Send className="size-3.5" aria-hidden />
          )}
          {mutation.isPending
            ? selected
              ? t("deselecting")
              : t("selecting")
            : selected
              ? t("selectedForOutreach")
              : t("selectForOutreach")}
        </Button>
      ) : null}
      <Button asChild size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs text-muted-foreground">
        <Link href={`/dashboard/leads/${lead.id}`}>
          <ExternalLink className="size-3.5" aria-hidden />
          {t("peopleLeads.viewDetail")}
        </Link>
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
