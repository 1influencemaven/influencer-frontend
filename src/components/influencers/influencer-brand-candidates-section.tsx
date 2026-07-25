"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { BrandCandidateAccordion } from "@/components/brand-discovery/brand-candidate-accordion";
import { BrandCandidateStatusFilter } from "@/components/brand-discovery/brand-candidate-status-filter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import {
  listBrandCandidates,
  updateBrandCandidateStatus,
} from "@/services/brand-discovery.service";
import { getApiErrorMessage } from "@/types/api-error";
import type {
  BrandCandidate,
  UpdateBrandCandidateStatusPayload,
} from "@/types/brand-discovery";
import type { BrandCandidateStatusFilterValue } from "@/types/brand-discovery-filter";

type InfluencerBrandCandidatesSectionProps = {
  influencerId: string;
};

export function InfluencerBrandCandidatesSection({
  influencerId,
}: InfluencerBrandCandidatesSectionProps) {
  const t = useTranslations("BrandDiscovery");
  const [statusFilter, setStatusFilter] =
    useState<BrandCandidateStatusFilterValue>("ALL");
  const [candidates, setCandidates] = useState<BrandCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listBrandCandidates({
        influencerId,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setCandidates(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [influencerId, statusFilter]);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  const handleUpdateStatus = useCallback(
    async (id: string, payload: UpdateBrandCandidateStatusPayload) => {
      setUpdatingId(id);
      setError(null);
      try {
        const updated = await updateBrandCandidateStatus(id, payload);
        setCandidates((prev) => {
          if (statusFilter !== "ALL" && updated.status !== statusFilter) {
            return prev.filter((item) => item.id !== id);
          }
          return prev.map((item) => (item.id === id ? updated : item));
        });
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setUpdatingId(null);
      }
    },
    [statusFilter],
  );

  return (
    <Card className="gap-0 border-border/80 py-0 shadow-sm">
      <CardHeader className="gap-1 py-5">
        <CardTitle className="text-base font-semibold">
          {t("influencerSectionTitle")}
        </CardTitle>
        <CardDescription>{t("influencerSectionDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-5">
        <BrandCandidateStatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
        />

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loadingCandidates")}</p>
        ) : candidates.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("emptyInfluencerResults")}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/brand-discovery">{t("goToSearch")}</Link>
            </Button>
          </div>
        ) : (
          <BrandCandidateAccordion
            candidates={candidates}
            updatingId={updatingId}
            onUpdateStatus={(id, payload) => {
              void handleUpdateStatus(id, payload);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
