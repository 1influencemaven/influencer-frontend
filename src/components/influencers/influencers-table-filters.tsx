"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InfluencersListFilters } from "@/hooks/use-influencers-list";
import { IBP_STATUSES } from "@/types/ideal-brand-profile";

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

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2 md:col-span-2 xl:col-span-3">
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

        <div className="space-y-2">
          <Label htmlFor="influencers-ibp-status">{t("filters.ibpStatus")}</Label>
          <select
            id="influencers-ibp-status"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            value={filters.ibpStatus}
            disabled={disabled}
            onChange={(event) =>
              onFiltersChange({
                ibpStatus: event.target.value as InfluencersListFilters["ibpStatus"],
              })
            }
          >
            <option value="">{t("filters.allStatuses")}</option>
            {IBP_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`ibpStatus.${status}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="influencers-country">{t("filters.country")}</Label>
          <Input
            id="influencers-country"
            placeholder={t("filters.countryPlaceholder")}
            value={filters.country}
            maxLength={2}
            disabled={disabled}
            onChange={(event) =>
              onFiltersChange({ country: event.target.value.toUpperCase() })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="influencers-language">{t("filters.language")}</Label>
          <Input
            id="influencers-language"
            placeholder={t("filters.languagePlaceholder")}
            value={filters.language}
            maxLength={2}
            disabled={disabled}
            onChange={(event) =>
              onFiltersChange({ language: event.target.value.toLowerCase() })
            }
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="influencers-niche">{t("filters.niche")}</Label>
          <Input
            id="influencers-niche"
            placeholder={t("filters.nichePlaceholder")}
            value={filters.niche}
            disabled={disabled}
            onChange={(event) => onFiltersChange({ niche: event.target.value })}
          />
          <p className="text-xs text-muted-foreground">{t("filters.exactMatchHint")}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() =>
            onFiltersChange({
              search: "",
              country: "",
              language: "",
              niche: "",
              ibpStatus: "",
            })
          }
        >
          {t("filters.clear")}
        </Button>
      </div>
    </section>
  );
}
