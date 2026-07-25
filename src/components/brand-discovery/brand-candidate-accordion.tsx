"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type {
  BrandCandidate,
  UpdateBrandCandidateStatusPayload,
} from "@/types/brand-discovery";

type BrandCandidateAccordionProps = {
  candidates: BrandCandidate[];
  updatingId: string | null;
  onUpdateStatus: (
    id: string,
    payload: UpdateBrandCandidateStatusPayload,
  ) => void;
  emptyMessage?: string;
};

export function BrandCandidateAccordion({
  candidates,
  updatingId,
  onUpdateStatus,
  emptyMessage,
}: BrandCandidateAccordionProps) {
  const t = useTranslations("BrandDiscovery");

  if (candidates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyMessage ?? t("emptyResults")}
      </p>
    );
  }

  return (
    <Accordion type="multiple" className="w-full rounded-lg border border-border px-3">
      {candidates.map((candidate) => (
        <AccordionItem key={candidate.id} value={candidate.id}>
          <AccordionTrigger className="hover:no-underline">
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left">
              <span className="truncate font-medium">{candidate.name}</span>
              {candidate.score !== null ? (
                <Badge variant="secondary">
                  {t("score", { value: Math.round(candidate.score) })}
                </Badge>
              ) : null}
              <Badge variant="outline">
                {t(`candidateStatus.${candidate.status}`)}
              </Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <a
                  href={candidate.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  {candidate.website}
                </a>
                <p className="text-xs text-muted-foreground">
                  {[candidate.sector, candidate.market, candidate.brandSize]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {candidate.fitReason ? (
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {candidate.fitReason}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{candidate.source}</Badge>
                </div>
                {candidate.evidenceUrls.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {candidate.evidenceUrls.slice(0, 3).map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                      >
                        {t("evidence")}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
              {candidate.status === "UNDER_REVIEW" ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={updatingId === candidate.id}
                    onClick={() =>
                      onUpdateStatus(candidate.id, { status: "APPROVED" })
                    }
                  >
                    {t("approve")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={updatingId === candidate.id}
                    onClick={() =>
                      onUpdateStatus(candidate.id, { status: "POSTPONED" })
                    }
                  >
                    {t("postpone")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={updatingId === candidate.id}
                    onClick={() =>
                      onUpdateStatus(candidate.id, { status: "REJECTED" })
                    }
                  >
                    {t("reject")}
                  </Button>
                </div>
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
