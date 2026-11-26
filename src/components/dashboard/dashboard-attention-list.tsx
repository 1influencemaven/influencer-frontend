"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { DashboardAttentionItem } from "@/types/dashboard";

type DashboardAttentionListProps = {
  items: DashboardAttentionItem[];
  isLoading?: boolean;
};

export function DashboardAttentionList({
  items,
  isLoading = false,
}: DashboardAttentionListProps) {
  const t = useTranslations("Dashboard");

  return (
    <Card className="gap-0 border-border/80 py-0 shadow-xs">
      <CardHeader className="gap-1 border-b border-border/80 py-5">
        <CardTitle className="text-base font-semibold">
          {t("attentionTitle")}
        </CardTitle>
        <CardDescription>{t("attentionDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="py-0">
        {isLoading ? (
          <div className="space-y-3 py-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-lg bg-muted/50"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-5 text-sm text-muted-foreground">
            {t("attentionEmpty")}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {t(`attentionTypes.${item.type}`, {
                      count: item.count,
                      name: item.entityLabel ?? "",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(`attentionHints.${item.type}`)}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link href={item.href}>{t("attentionAction")}</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
