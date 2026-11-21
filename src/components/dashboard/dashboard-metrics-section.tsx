"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { getDashboardMetrics } from "@/services/dashboard.service";
import type { DashboardMetric } from "@/types/dashboard";

export function DashboardMetricsSection() {
  const t = useTranslations("Dashboard");
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadMetrics() {
      const data = await getDashboardMetrics();

      if (!isMounted) {
        return;
      }

      setMetrics([
        {
          id: "total-influencers",
          label: t("metricTotalInfluencers"),
          value: data.totalInfluencers ?? "—",
          accent: "purple",
          isPlaceholder: data.totalInfluencers === null,
        },
        {
          id: "active-influencers",
          label: t("metricActiveInfluencers"),
          value: data.activeInfluencers ?? "—",
          accent: "green",
          isPlaceholder: data.activeInfluencers === null,
        },
        {
          id: "brands-found",
          label: t("metricBrandsFound"),
          value: "—",
          hint: t("metricsPlaceholder"),
          accent: "teal",
          isPlaceholder: true,
        },
        {
          id: "active-campaigns",
          label: t("metricCampaigns"),
          value: "—",
          hint: t("metricsPlaceholder"),
          accent: "sky",
          isPlaceholder: true,
        },
      ]);
    }

    void loadMetrics();

    return () => {
      isMounted = false;
    };
  }, [t]);

  if (metrics.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  return <MetricsGrid metrics={metrics} />;
}
