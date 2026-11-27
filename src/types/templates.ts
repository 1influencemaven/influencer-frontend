/** Email templates per talent (HU-TPL-003..011). */

export type TemplateStatus = "ACTIVE" | "ARCHIVED";
export type VariableSource = "influencer" | "prospect" | "custom";
export type VariableLocation = "subject" | "preHeader" | "body";

export type TemplateListItem = {
  id: string;
  influencerId: string;
  influencerName: string | null;
  name: string;
  subject: string;
  preHeader: string | null;
  status: TemplateStatus;
  validationIssues: number;
  influencerVariables: string[];
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VariableIssue = {
  code: "MALFORMED_TOKEN" | "INVALID_KEY" | "UNKNOWN_VARIABLE" | "FIELD_DISABLED" | "FIELD_REMOVED_IN_SALESHANDY";
  severity: "error" | "warning";
  key: string | null;
  raw: string;
  location: VariableLocation;
};

export type TemplateDetail = TemplateListItem & {
  bodyHtml: string;
  bodyText: string;
  fieldReferences: Array<{ fieldId: string; key: string; label: string; isActive: boolean; locations: string[] }>;
  validation: { valid: boolean; issues: VariableIssue[] };
};

export type TemplatesPage = {
  data: TemplateListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  counts: { active: number; archived: number };
};

export type TemplatesQuery = {
  influencerId?: string;
  search?: string;
  status: "active" | "archived" | "all";
  page: number;
  limit: number;
};

export type VariableDefinition = {
  key: string;
  token: string;
  label: string;
  source: VariableSource;
  fieldType: string;
  fallbackText: string | null;
  isActive: boolean;
  disabledReason: string | null;
  fieldId: string | null;
};

export type VariablesCatalog = { groups: Record<VariableSource, VariableDefinition[]> };

export type TemplateContent = { subject: string; preHeader?: string; bodyHtml: string };

export type CreateTemplatePayload = TemplateContent & { influencerId: string; name: string };
export type UpdateTemplatePayload = Partial<TemplateContent & { name: string }>;

export type ResolutionNote = { key: string; label: string; location: VariableLocation; source: VariableSource };

export type TemplatePreview = {
  from: string | null;
  to: string | null;
  subject: string;
  preHeader: string | null;
  bodyHtml: string;
  bodyText: string;
  usedFallbacks: Array<ResolutionNote & { value: string }>;
  unresolved: ResolutionNote[];
  validationIssues: VariableIssue[];
};

export type SaleshandyExport = {
  subject: string;
  preheader: string | null;
  content: string;
  missingInfluencerValues: string[];
  unknownVariables: string[];
};
