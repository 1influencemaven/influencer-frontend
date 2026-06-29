"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/influencer";

type InfluencersTablePaginationProps = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function InfluencersTablePagination({
  meta,
  onPageChange,
  onLimitChange,
  disabled = false,
}: InfluencersTablePaginationProps) {
  const t = useTranslations("Influencers.pagination");
  const canGoPrevious = meta.page > 1;
  const canGoNext = meta.page < meta.totalPages;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {t("summary", {
          page: meta.page,
          totalPages: Math.max(meta.totalPages, 1),
          total: meta.total,
        })}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t("pageSize")}</span>
          <select
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            value={meta.limit}
            disabled={disabled}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || !canGoPrevious}
            onClick={() => onPageChange(meta.page - 1)}
          >
            {t("previous")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || !canGoNext}
            onClick={() => onPageChange(meta.page + 1)}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
