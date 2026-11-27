/** Saleshandy prospect fields (HU-FLD-002..005), as returned by /v1/fields. */

export const FIELD_TYPES = [
  "text",
  "number",
  "date",
  "long-text",
  "dropdown",
  "currency",
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export type FieldOrigin = "SYSTEM" | "CUSTOM";
export type FieldDisabledReason = "MANUAL" | "REMOVED_IN_SALESHANDY";

export const CURRENCY_CODES = [
  "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "INR", "SGD",
  "HKD", "NZD", "KRW", "SEK", "AED", "BRL", "MXN", "ZAR", "SAR",
] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const MAX_DROPDOWN_OPTIONS = 50;
export const MAX_FIELD_TAGS = 20;

export type FieldMetadata = { options?: string[]; currencyCode?: CurrencyCode };

export type CustomField = {
  id: string;
  key: string;
  label: string;
  fieldType: FieldType;
  origin: FieldOrigin;
  fallbackText: string | null;
  metadata: FieldMetadata | null;
  tags: string[];
  isActive: boolean;
  disabledReason: FieldDisabledReason | null;
  editable: boolean;
  saleshandyFieldId: string | null;
  systemMapping: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FieldOriginFilter = "all" | "custom" | "system";
export type FieldStatusFilter = "active" | "disabled" | "all";
export const FIELD_SORT_KEYS = ["label", "fieldType", "updatedAt"] as const;
export type FieldSortKey = (typeof FIELD_SORT_KEYS)[number];

export type FieldsQuery = {
  origin: FieldOriginFilter;
  status: FieldStatusFilter;
  fieldTypes?: FieldType[];
  tags?: string[];
  search?: string;
  sortBy: FieldSortKey;
  sortOrder: "asc" | "desc";
};

export type FieldsLastSync = {
  status: "COMPLETED" | "FAILED";
  trigger: "MANUAL" | "BOOTSTRAP" | "AFTER_WRITE";
  at: string;
  errorCode: string | null;
  errorMessage: string | null;
  lastSuccessAt: string | null;
  counts: { created: number; updated: number; deactivated: number } | null;
};

export type FieldsListResponse = {
  data: CustomField[];
  counts: { all: number; custom: number; system: number; disabled: number };
  availableTags: string[];
  lastSync: FieldsLastSync | null;
};

export type FieldsSyncResult = {
  runId: string;
  remote: number;
  created: number;
  updated: number;
  unchanged: number;
  deactivated: number;
  reactivated: number;
  skipped: number;
  syncedAt: string;
};

export type CreateFieldPayload = {
  label: string;
  fieldType: FieldType;
  fallbackText?: string;
  metadata?: FieldMetadata;
  tags?: string[];
};

/** Omit `tags` to keep them; send the full list to replace them (HU-FLD-004). */
export type UpdateFieldPayload = {
  label?: string;
  fallbackText?: string;
  tags?: string[];
};
