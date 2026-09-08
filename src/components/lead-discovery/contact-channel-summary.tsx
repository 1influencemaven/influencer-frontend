"use client";

import type { ComponentType } from "react";
import { Globe, Link, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

import { getActiveChannelTypes } from "@/lib/lead-contact-channels";
import { cn } from "@/lib/utils";
import type { ContactChannel, ContactChannelType } from "@/types/lead-discovery";

const channelIcons: Record<
  ContactChannelType,
  ComponentType<{ className?: string }>
> = {
  LINKEDIN: Link,
  EMAIL: Mail,
  WEBSITE: Globe,
};

type ContactChannelSummaryProps = {
  channels: ContactChannel[];
  className?: string;
};

export function ContactChannelSummary({
  channels,
  className,
}: ContactChannelSummaryProps) {
  const t = useTranslations("LeadDiscovery.channels");
  const types = getActiveChannelTypes(channels);

  if (types.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground",
        className,
      )}
    >
      {types.map((type, index) => {
        const Icon = channelIcons[type];
        return (
          <span key={type} className="inline-flex items-center gap-1">
            {index > 0 ? (
              <span className="text-muted-foreground/60" aria-hidden>
                ·
              </span>
            ) : null}
            <Icon className="size-3 shrink-0" aria-hidden />
            <span>{t(type)}</span>
          </span>
        );
      })}
    </div>
  );
}
