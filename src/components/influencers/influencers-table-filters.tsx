"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InfluencersListFilters } from "@/hooks/use-influencers-list";
import { PROFILE_STATUSES } from "@/types/influencer";

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
          <Label htmlFor="influencers-profile-status">
            {t("filters.profileStatus")}
          </Label>
          <select
            id="influencers-profile-status"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            value={filters.profileStatus}
            disabled={disabled}
            onChange={(event) =>
              onFiltersChange({
                profileStatus: event.target.value as InfluencersListFilters["profileStatus"],
              })
            }
          >
            <option value="">{t("filters.allStatuses")}</option>
            {PROFILE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`profileStatus.${status}`)}
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
              profileStatus: "",
            })
          }
        >
          {t("filters.clear")}
        </Button>
      </div>
    </section>
  );
}
