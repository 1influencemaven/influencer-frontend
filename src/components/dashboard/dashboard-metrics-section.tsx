"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { DashboardAttentionList } from "@/components/dashboard/dashboard-attention-list";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { getDashboardStats } from "@/services/dashboard.service";
import { getApiErrorMessage } from "@/types/api-error";
import type {
  DashboardAttentionItem,
  DashboardMetric,
  DashboardStats,
} from "@/types/dashboard";

export function DashboardMetricsSection() {
  const t = useTranslations("Dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getDashboardStats();
        if (!isMounted) return;
        setStats(data);
      } catch (loadError) {
        if (!isMounted) return;
        setError(getApiErrorMessage(loadError, t("loadError")));
        setStats(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadStats();
    return () => {
      isMounted = false;
    };
  }, [t]);

  const metrics: DashboardMetric[] = stats
    ? [
        {
          id: "talents-active-ibp",
          label: t("metricActiveIbp"),
          value: stats.metrics.talentsActiveIbp,
          accent: "green",
          href: "/dashboard/creators",
        },
        {
          id: "talents-needing-ibp",
          label: t("metricNeedingIbp"),
          value: stats.metrics.talentsNeedingIbp,
          accent: "orange",
          href: "/dashboard/creators",
        },
        {
          id: "brands-under-review",
          label: t("metricBrandsUnderReview"),
          value: stats.metrics.brandsUnderReview,
          accent: "purple",
          href: "/dashboard/brand-discovery",
        },
        {
          id: "approved-without-contacts",
          label: t("metricApprovedWithoutContacts"),
          value: stats.metrics.approvedWithoutContacts,
          accent: "pink",
          href: "/dashboard/brand-discovery",
        },
        {
          id: "ready-contacts",
          label: t("metricReadyContacts"),
          value: stats.metrics.readyContacts,
          accent: "teal",
          href: "/dashboard/brand-discovery",
        },
        {
          id: "email-accounts",
          label: t("metricEmailAccounts"),
          value:
            stats.metrics.emailAccountsConnected === null
              ? "—"
              : `${stats.metrics.emailAccountsConnected}/${
                  (stats.metrics.emailAccountsConnected ?? 0) +
                  (stats.metrics.emailAccountsDisconnected ?? 0)
                }`,
          hint:
            stats.metrics.emailAccountsConnected === null
              ? t("metricEmailAccountsUnavailable")
              : t("metricEmailAccountsHint", {
                  connected: stats.metrics.emailAccountsConnected,
                  disconnected: stats.metrics.emailAccountsDisconnected ?? 0,
                }),
          accent: "sky",
          isPlaceholder: stats.metrics.emailAccountsConnected === null,
          href: "/dashboard/campaigns",
        },
      ]
    : [];

  const attention: DashboardAttentionItem[] = stats?.attention ?? [];

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isLoading && metrics.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : (
        <MetricsGrid metrics={metrics} />
      )}

      <DashboardAttentionList items={attention} isLoading={isLoading} />
    </div>
  );
}
