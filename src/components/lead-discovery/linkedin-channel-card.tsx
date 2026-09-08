"use client";

import { Link as LinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ContactChannel } from "@/types/lead-discovery";

type LinkedInChannelCardProps = {
  channel: ContactChannel;
};

export function LinkedInChannelCard({ channel }: LinkedInChannelCardProps) {
  const t = useTranslations("LeadDiscovery.channels");

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <LinkIcon className="size-4 shrink-0" aria-hidden />
          {t("LINKEDIN")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <CardDescription className="truncate text-sm text-foreground">
          {channel.value}
        </CardDescription>
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={channel.value} target="_blank" rel="noreferrer">
            {t("openLinkedIn")}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
