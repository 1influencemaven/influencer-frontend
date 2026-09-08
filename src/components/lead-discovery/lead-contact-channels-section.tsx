"use client";

import { useTranslations } from "next-intl";

import { EmailChannelCard } from "@/components/lead-discovery/email-channel-card";
import { LinkedInChannelCard } from "@/components/lead-discovery/linkedin-channel-card";
import { WebsiteChannelCard } from "@/components/lead-discovery/website-channel-card";
import {
  getActiveChannelsOrdered,
  hasActiveEmailChannel,
} from "@/lib/lead-contact-channels";
import type { ContactChannel } from "@/types/lead-discovery";

type LeadContactChannelsSectionProps = {
  channels: ContactChannel[];
};

export function LeadContactChannelsSection({
  channels,
}: LeadContactChannelsSectionProps) {
  const t = useTranslations("LeadDiscovery.channels");
  const activeChannels = getActiveChannelsOrdered(channels);
  const hasEmail = hasActiveEmailChannel(channels);

  return (
    <section className="space-y-4" aria-labelledby="lead-contact-channels">
      <h2
        id="lead-contact-channels"
        className="text-sm font-medium tracking-wide text-muted-foreground uppercase"
      >
        {t("sectionTitle")}
      </h2>

      {activeChannels.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-1">
          {activeChannels.map((channel) => {
            if (channel.type === "LINKEDIN") {
              return (
                <LinkedInChannelCard key={channel.id} channel={channel} />
              );
            }
            if (channel.type === "EMAIL") {
              return <EmailChannelCard key={channel.id} channel={channel} />;
            }
            return <WebsiteChannelCard key={channel.id} channel={channel} />;
          })}
        </div>
      )}

      {activeChannels.length > 0 && !hasEmail ? (
        <p className="text-sm text-muted-foreground">{t("noEmailYet")}</p>
      ) : null}
    </section>
  );
}
