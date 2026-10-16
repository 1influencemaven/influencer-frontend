export type LeadDiscoveryStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export type LeadStatus =
  | "UNDER_REVIEW"
  | "APPROVED"
  | "DISCARDED"
  | "DUPLICATE";

export type LeadEmailConfidence =
  | "VALID"
  | "PROBABLE"
  | "DOUBTFUL"
  | "INVALID"
  | "UNKNOWN";

export type ContactChannelType = "LINKEDIN" | "EMAIL" | "WEBSITE";

export type ContactChannelStatus = "ACTIVE" | "INVALID";

export type ContactChannelSource =
  | "LINKEDIN_SCRAPER"
  | "PUBLIC_WEB"
  | "MANUAL"
  | "LEGACY_MIGRATION"
  | "BRAND_WEBSITE";

/** ADR-0016 — orthogonal to isGeneric. UI does not surface this in Phase 0. */
export type CommercialRelevance = "HIGH" | "NEUTRAL" | "LOW" | "UNKNOWN";

export type OutreachReadiness = "LIMITED" | "PARTIAL" | "READY";

export type ContactChannel = {
  id: string;
  leadId: string;
  type: ContactChannelType;
  value: string;
  status: ContactChannelStatus;
  source: ContactChannelSource;
  sourceUrl: string | null;
  isGeneric: boolean | null;
  commercialRelevance?: CommercialRelevance;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
};

export type LeadPerson = {
  name: string;
  position: string | null;
  company: string;
};

/**
 * Enriched lead shape from GET /lead-discovery/leads/:id.
 * D3.1 uses this temporarily to power the list until GET /leads includes
 * contactChannels and outreachReadiness (see docs/codigo/frontend.md).
 */
export type LeadDetail = {
  id: string;
  status: LeadStatus;
  selectedForOutreach: boolean;
  person: LeadPerson;
  contactChannels: ContactChannel[];
  outreachReadiness: OutreachReadiness;
  email: string | null;
  profileUrl: string | null;
  brandCandidateId?: string;
  influencerId?: string;
  runId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LeadProvidersResponse = {
  available: string[];
  default: string | null;
};

export type LeadSourceOption = {
  id: string;
  name: string;
  kind?: string;
};

export type LeadProviderOptionsResponse = {
  providerId: string;
  options: LeadSourceOption[];
};

export type LeadDiscoveryRun = {
  id: string;
  brandCandidateId: string;
  influencerId: string;
  status: LeadDiscoveryStatus;
  providerId: string;
  providerOptions: unknown;
  limit: number;
  /** ADR-0017 — present on COMPLETED runs when provider returned audit metadata. */
  searchMetadata?: LeadSearchMetadata | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  brandCandidate?: {
    id: string;
    name: string;
    website: string;
    domain: string;
    status: string;
  };
  influencer?: {
    id: string;
    name: string;
  };
};

export type BusinessContactDiscoverySummary = {
  pagesAttempted: number;
  pagesSucceeded: number;
  pagesFailed: number;
  emailsFound: number;
  contactsCreated: number;
  contactsUpdated: number;
};

/** ADR-0017 / ADR-0018 run audit. See docs — not a UI surface yet. */
export type LeadSearchMetadata = {
  strategy: "llm" | "manual" | "unknown";
  tracks: Array<"2A" | "2B" | "2C">;
  priorityRoles: string[];
  scraperIds: string[];
  plannedQueriesCount: number;
  validatedQueriesCount: number;
  queries: string[];
  fallbackUsed: boolean;
  fallbackReason: string | null;
  searchHitsCount: number;
  businessContactDiscovery?: BusinessContactDiscoverySummary;
};

export type Lead = {
  id: string;
  brandCandidateId: string;
  influencerId: string;
  runId: string;
  contactName: string;
  title: string | null;
  email: string | null;
  emailConfidence: LeadEmailConfidence;
  isGeneric: boolean;
  profileUrl: string | null;
  providerId: string;
  sourceOptionId: string | null;
  fitReason: string | null;
  source: string;
  status: LeadStatus;
  selectedForOutreach: boolean;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
  brandCandidate?: { id: string; name: string };
  influencer?: { id: string; name: string };
};

export type SearchLeadsResponse = {
  message: string;
  runs: LeadDiscoveryRun[];
};

export type SearchLeadsPayload = {
  brandCandidateIds: string[];
  providerId?: string;
  options?: { optionIds: string[] };
  limit?: number;
};

export type UpdateLeadStatusPayload = {
  status: Extract<LeadStatus, "APPROVED" | "DISCARDED" | "DUPLICATE">;
};
