import { MetricCard } from "@/components/dashboard/metric-card";
import type { DashboardMetric } from "@/types/dashboard";

type MetricsGridProps = {
  metrics: DashboardMetric[];
};

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          label={metric.label}
          value={metric.value}
          hint={metric.hint}
          accent={metric.accent}
          isPlaceholder={metric.isPlaceholder}
        />
      ))}
    </div>
  );
}
