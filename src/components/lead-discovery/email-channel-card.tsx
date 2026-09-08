"use client";

import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { ContactChannel } from "@/types/lead-discovery";

type EmailChannelCardProps = {
  channel: ContactChannel;
};

export function EmailChannelCard({ channel }: EmailChannelCardProps) {
  const t = useTranslations("LeadDiscovery.email");
  const tChannels = useTranslations("LeadDiscovery.channels");
  const { copy, status } = useCopyToClipboard();

  const isGeneric = channel.isGeneric === true;
  const showFoundOnWebsite =
    channel.source === "PUBLIC_WEB" || Boolean(channel.sourceUrl);

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="size-4 shrink-0" aria-hidden />
          {isGeneric ? t("genericLabel") : tChannels("EMAIL")}
        </CardTitle>
        {!isGeneric ? (
          <CardDescription>{t("publicFound")}</CardDescription>
        ) : null}
        {isGeneric && showFoundOnWebsite ? (
          <CardDescription>{t("foundOnWebsite")}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <p className="truncate text-sm">{channel.value}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void copy(channel.value)}
          >
            {t("copy")}
          </Button>
          {channel.sourceUrl ? (
            <Button type="button" variant="ghost" size="sm" asChild>
              <a href={channel.sourceUrl} target="_blank" rel="noreferrer">
                {t("viewSource")}
              </a>
            </Button>
          ) : null}
        </div>
        {status === "success" ? (
          <p className="text-sm text-primary" role="status">
            {t("copied")}
          </p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-destructive" role="alert">
            {t("copyFailed")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
