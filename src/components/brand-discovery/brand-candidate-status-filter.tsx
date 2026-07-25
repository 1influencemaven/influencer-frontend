"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  BRAND_CANDIDATE_STATUS_FILTERS,
  type BrandCandidateStatusFilterValue,
} from "@/types/brand-discovery-filter";
import { cn } from "@/lib/utils";

type BrandCandidateStatusFilterProps = {
  value: BrandCandidateStatusFilterValue;
  onChange: (value: BrandCandidateStatusFilterValue) => void;
  className?: string;
};

export function BrandCandidateStatusFilter({
  value,
  onChange,
  className,
}: BrandCandidateStatusFilterProps) {
  const t = useTranslations("BrandDiscovery");

  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="group"
      aria-label={t("statusFilterLabel")}
    >
      {BRAND_CANDIDATE_STATUS_FILTERS.map((status) => {
        const selected = value === status;
        return (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={selected ? "default" : "outline"}
            onClick={() => onChange(status)}
            aria-pressed={selected}
          >
            {status === "ALL"
              ? t("statusFilter.all")
              : t(`candidateStatus.${status}`)}
          </Button>
        );
      })}
    </div>
  );
}
