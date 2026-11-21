"use client";

import { Globe } from "lucide-react";
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

type WebsiteChannelCardProps = {
  channel: ContactChannel;
};

export function WebsiteChannelCard({ channel }: WebsiteChannelCardProps) {
  const t = useTranslations("LeadDiscovery.channels");

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="size-4 shrink-0" aria-hidden />
          {t("WEBSITE")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <CardDescription className="truncate text-sm text-foreground">
          {channel.value}
        </CardDescription>
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={channel.value} target="_blank" rel="noreferrer">
            {t("openWebsite")}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
