"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BrandDeepResearchPanel } from "@/components/brand-discovery/brand-deep-research-panel";
import { BrandBusinessContactsPanel } from "@/components/lead-discovery/brand-business-contacts-panel";
import type {
  BrandCandidate,
  UpdateBrandCandidateStatusPayload,
} from "@/types/brand-discovery";
import {
  getBrandDeepResearch,
  hasCreatorProgram,
  isKnownBrandSeed,
} from "@/types/brand-discovery";

type BrandCandidateAccordionProps = {
  candidates: BrandCandidate[];
  updatingId: string | null;
  deletingId?: string | null;
  onUpdateStatus: (
    id: string,
    payload: UpdateBrandCandidateStatusPayload,
  ) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
};

export function BrandCandidateAccordion({
  candidates,
  updatingId,
  deletingId = null,
  onUpdateStatus,
  onDelete,
  emptyMessage,
}: BrandCandidateAccordionProps) {
  const t = useTranslations("BrandDiscovery");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (candidates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyMessage ?? t("emptyResults")}
      </p>
    );
  }

  return (
    <Accordion type="multiple" className="w-full rounded-lg border border-border px-3">
      {candidates.map((candidate) => {
        const isBusy =
          updatingId === candidate.id || deletingId === candidate.id;
        const isPendingDelete = pendingDeleteId === candidate.id;
        const deepResearch = getBrandDeepResearch(candidate.metadata);

        return (
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
                {candidate.evidenceStatus ? (
                  <Badge variant="outline">
                    {t(`evidenceStatus.${candidate.evidenceStatus}`)}
                  </Badge>
                ) : null}
                {hasCreatorProgram(candidate.metadata) ? (
                  <Badge variant="default">{t("signals.creatorProgram")}</Badge>
                ) : null}
                {isKnownBrandSeed(candidate.metadata) ? (
                  <Badge variant="outline">{t("signals.knownBrand")}</Badge>
                ) : null}
                {deepResearch ? (
                  <Badge variant="secondary">
                    {t(
                      `deepResearch.researchStatus.${deepResearch.researchStatus}`,
                    )}
                  </Badge>
                ) : null}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3">
                {candidate.status === "UNDER_REVIEW" || onDelete ? (
                  isPendingDelete ? (
                    <div className="flex flex-col gap-2">
                      <p className="max-w-xs text-sm text-muted-foreground">
                        {t("deleteConfirm")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => setPendingDeleteId(null)}
                        >
                          {t("deleteCancel")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={isBusy}
                          onClick={() => {
                            onDelete?.(candidate.id);
                            setPendingDeleteId(null);
                          }}
                        >
                          {deletingId === candidate.id
                            ? t("deleting")
                            : t("deleteConfirmAction")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {candidate.status === "UNDER_REVIEW" ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                              onUpdateStatus(candidate.id, {
                                status: "APPROVED",
                              })
                            }
                          >
                            {t("approve")}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() =>
                              onUpdateStatus(candidate.id, {
                                status: "POSTPONED",
                              })
                            }
                          >
                            {t("postpone")}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={isBusy}
                            onClick={() =>
                              onUpdateStatus(candidate.id, {
                                status: "REJECTED",
                              })
                            }
                          >
                            {t("reject")}
                          </Button>
                        </>
                      ) : null}
                      {onDelete ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={isBusy}
                          onClick={() => setPendingDeleteId(candidate.id)}
                        >
                          {t("delete")}
                        </Button>
                      ) : null}
                    </div>
                  )
                ) : null}

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
                  {deepResearch ? (
                    <BrandDeepResearchPanel research={deepResearch} />
                  ) : null}
                </div>
              </div>
              {candidate.status === "APPROVED" ? (
                <BrandBusinessContactsPanel
                  key={candidate.id}
                  brandCandidateId={candidate.id}
                  influencerId={candidate.influencerId}
                />
              ) : null}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
