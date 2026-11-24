"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { ContactTier } from "@/types/lead-discovery";

const VARIANT: Record<ContactTier, "default" | "secondary" | "outline" | "destructive"> = {
  TIER_1: "default",
  TIER_2: "secondary",
  TIER_3: "outline",
  GENERIC: "outline",
  REJECTED: "destructive",
};

/** Strategy tier (Tier 1 verified nominal → Generic fallback). */
export function ContactTierBadge({ tier }: { tier?: ContactTier | null }) {
  const t = useTranslations("LeadDiscovery.contactTier");
  if (!tier) return null;
  return (
    <Badge variant={VARIANT[tier]} data-testid="contact-tier-badge">
      {t(tier)}
    </Badge>
  );
}
