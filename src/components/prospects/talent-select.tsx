"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { listInfluencers } from "@/services/influencers.service";
import { cn } from "@/lib/utils";

export function useTalentOptions() {
  return useQuery({
    queryKey: ["influencers", "options"],
    queryFn: () => listInfluencers({ limit: 100 }),
    staleTime: 60_000,
    select: (page) => page.data.map((i) => ({ id: i.id, name: i.name })).sort((a, b) => a.name.localeCompare(b.name)),
  });
}

/** Native select of talents (accessible, works on mobile). */
export function TalentSelect({
  value,
  onChange,
  allowAll = true,
  id,
  className,
  invalid,
}: {
  value: string;
  onChange: (id: string) => void;
  allowAll?: boolean;
  id?: string;
  className?: string;
  invalid?: boolean;
}) {
  const t = useTranslations("Prospects.talent");
  const options = useTalentOptions();
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-9 rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive",
        className,
      )}
    >
      <option value="">{allowAll ? t("all") : t("choose")}</option>
      {(options.data ?? []).map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
