export type MetricAccent =
  | "sky"
  | "purple"
  | "teal"
  | "green"
  | "pink"
  | "orange";

export type DashboardMetric = {
  id: string;
  label: string;
  value: string | number;
  hint?: string;
  accent?: MetricAccent;
  isPlaceholder?: boolean;
};
