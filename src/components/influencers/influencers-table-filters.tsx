"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInfluencerManagers } from "@/hooks/use-influencer-managers";
import type { InfluencersListFilters } from "@/hooks/use-influencers-list";
import { IBP_STATUSES } from "@/types/ideal-brand-profile";
import { INFLUENCER_QUARTERS } from "@/types/influencer";

type InfluencersTableFiltersProps = {
  filters: InfluencersListFilters;
  onFiltersChange: (filters: Partial<InfluencersListFilters>) => void;
  disabled?: boolean;
};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

export function InfluencersTableFilters({
  filters,
  onFiltersChange,
  disabled = false,
}: InfluencersTableFiltersProps) {
  const t = useTranslations("Influencers");
  const managersQuery = useInfluencerManagers();

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
          <Label htmlFor="influencers-niches">{t("filters.niches")}</Label>
          <Input
            id="influencers-niches"
            placeholder={t("filters.nichesPlaceholder")}
            value={filters.niches}
            disabled={disabled}
            onChange={(event) => onFiltersChange({ niches: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="influencers-manager">{t("filters.manager")}</Label>
          <select
            id="influencers-manager"
            className={selectClassName}
            value={filters.managerId}
            disabled={disabled || managersQuery.isLoading}
            onChange={(event) =>
              onFiltersChange({ managerId: event.target.value })
            }
          >
            <option value="">{t("filters.allManagers")}</option>
            {(managersQuery.data ?? []).map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="influencers-year">{t("filters.year")}</Label>
          <Input
            id="influencers-year"
            type="number"
            min={2000}
            max={2100}
            placeholder={t("filters.yearPlaceholder")}
            value={filters.year}
            disabled={disabled}
            onChange={(event) => onFiltersChange({ year: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="influencers-quarter">{t("filters.quarter")}</Label>
          <select
            id="influencers-quarter"
            className={selectClassName}
            value={filters.quarter}
            disabled={disabled}
            onChange={(event) =>
              onFiltersChange({
                quarter: event.target
                  .value as InfluencersListFilters["quarter"],
              })
            }
          >
            <option value="">{t("filters.allQuarters")}</option>
            {INFLUENCER_QUARTERS.map((quarter) => (
              <option key={quarter} value={quarter}>
                {quarter}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="influencers-ibp-status">{t("filters.ibpStatus")}</Label>
          <select
            id="influencers-ibp-status"
            className={selectClassName}
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
              niches: "",
              managerId: "",
              year: "",
              quarter: "",
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
