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
  href?: string;
};

export type DashboardAttentionType =
  | "IBP_DRAFT"
  | "IBP_FAILED"
  | "BRANDS_UNDER_REVIEW"
  | "APPROVED_NO_CONTACTS"
  | "DISCOVERY_FAILED"
  | "EMAIL_DISCONNECTED";

export type DashboardAttentionItem = {
  id: string;
  type: DashboardAttentionType;
  title: string;
  count: number;
  href: string;
  entityId?: string;
  entityLabel?: string;
};

export type DashboardMetrics = {
  talentsActiveIbp: number;
  talentsNeedingIbp: number;
  brandsUnderReview: number;
  approvedWithoutContacts: number;
  readyContacts: number;
  emailAccountsConnected: number | null;
  emailAccountsDisconnected: number | null;
};

export type DashboardStats = {
  metrics: DashboardMetrics;
  attention: DashboardAttentionItem[];
};
