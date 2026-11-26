"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InfluencersListFilters } from "@/hooks/use-influencers-list";

type InfluencersTableFiltersProps = {
  filters: InfluencersListFilters;
  onFiltersChange: (filters: Partial<InfluencersListFilters>) => void;
  disabled?: boolean;
};

export function InfluencersTableFilters({
  filters,
  onFiltersChange,
  disabled = false,
}: InfluencersTableFiltersProps) {
  const t = useTranslations("Influencers");
  const hasSearch = Boolean(filters.search.trim());

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="influencers-search">{t("filters.search")}</Label>
          <Input
            id="influencers-search"
            type="search"
            placeholder={t("filters.searchPlaceholder")}
            value={filters.search}
            disabled={disabled}
            onChange={(event) => onFiltersChange({ search: event.target.value })}
          />
        </div>
        {hasSearch ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={disabled}
            onClick={() => onFiltersChange({ search: "" })}
          >
            {t("filters.clear")}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
