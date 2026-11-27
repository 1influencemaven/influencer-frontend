/** Prospects per talent (approved discovered contacts + CSV imports). */

export const PROSPECT_SOURCES = ["LEAD", "BRAND_CONTACT", "AGENCY_CONTACT", "CSV", "MANUAL", "SALESHANDY"] as const;
export type ProspectSource = (typeof PROSPECT_SOURCES)[number];
export type ProspectContactKind = "PERSON" | "MAILBOX";
export type ProspectStatus = "ACTIVE" | "ARCHIVED";
export type CommercialRelevance = "HIGH" | "NEUTRAL" | "LOW" | "UNKNOWN";

export type Prospect = {
  id: string;
  influencerId: string;
  influencerName: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  company: string | null;
  companyDomain: string | null;
  website: string | null;
  linkedInUrl: string | null;
  country: string | null;
  phoneNumber: string | null;
  contactKind: ProspectContactKind;
  isGeneric: boolean;
  mailboxLabel: string | null;
  commercialRelevance: CommercialRelevance;
  source: ProspectSource;
  brandCandidateId: string | null;
  brandName: string | null;
  leadId: string | null;
  brandBusinessContactId: string | null;
  agencyId: string | null;
  agencyName: string | null;
  agencyContactId: string | null;
  tags: string[];
  status: ProspectStatus;
  syncStatus: "LOCAL_ONLY" | "SYNCING" | "SYNCED" | "SYNC_FAILED";
  customFields: Array<{ fieldId: string; key: string; label: string; value: string }>;
  createdAt: string;
  updatedAt: string;
};

export type ProspectsQuery = {
  influencerId?: string;
  search?: string;
  source?: ProspectSource;
  contactKind?: ProspectContactKind;
  status: "active" | "archived" | "all";
  sortBy: "createdAt" | "email" | "company";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
};

export type ProspectsPage = {
  data: Prospect[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  counts: { active: number; archived: number; bySource: Partial<Record<ProspectSource, number>> };
};

export type ApprovalSourceType = "LEAD" | "BRAND_CONTACT" | "AGENCY_CONTACT";
export type ApprovalItem = { type: ApprovalSourceType; id: string; influencerId?: string };
export type ApprovalResult = {
  type: ApprovalSourceType;
  id: string;
  outcome: "created" | "updated" | "unchanged" | "skipped";
  prospectId?: string;
  reason?: "NOT_FOUND" | "NO_VALID_EMAIL" | "INFLUENCER_REQUIRED" | "AGENCY_NOT_LINKED";
};

export type ApprovedIds = { leadIds: string[]; brandBusinessContactIds: string[]; agencyContactIds: string[] };

export const CONFLICT_ACTIONS = ["addMissingFields", "overwrite", "noUpdate"] as const;
export type ConflictAction = (typeof CONFLICT_ACTIONS)[number];
export const CSV_MAX_ROWS = 5000;

export type CsvImportPayload = {
  influencerId: string;
  conflictAction: ConflictAction;
  tags?: string[];
  rows: Array<Record<string, string>>;
};

export type CsvImportResult = {
  jobId: string;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; email: string | null; reason: string }>;
};

export type UpdateProspectPayload = Partial<
  Pick<Prospect, "firstName" | "lastName" | "jobTitle" | "company" | "companyDomain" | "website" | "linkedInUrl" | "country" | "phoneNumber" | "mailboxLabel" | "tags">
> & { status?: ProspectStatus; customFields?: Array<{ fieldId: string; value: string }> };
