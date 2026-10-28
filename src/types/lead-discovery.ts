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

/** ADR-0016 — orthogonal to isGeneric. Surfaced on BrandBusinessContact Visibility. */
export type CommercialRelevance = "HIGH" | "NEUTRAL" | "LOW" | "UNKNOWN";

export type BrandBusinessContactEvidence = {
  sourceUrl: string;
  evidenceSnippet: string;
  discoveredAt: string;
};

/** ADR-0016/0018 — brand inbox without a person. Not a Lead. */
export type BrandBusinessContact = {
  id: string;
  brandCandidateId: string;
  email: string;
  label: string | null;
  isGeneric: boolean;
  commercialRelevance: CommercialRelevance;
  source: ContactChannelSource;
  sourceUrl: string | null;
  evidences: BrandBusinessContactEvidence[];
  createdAt: string;
  updatedAt: string;
};

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

/** Fixed allowlist URL for ADMIN Unlocker diagnostic probe (local only). */
export const UNLOCKER_DIAGNOSTIC_ALLOWED_URL =
  "https://lightartsy.com/contact" as const;

/** Response of POST /lead-discovery/diagnostics/unlocker (no HTML). */
export type UnlockerDiagnosticResult = {
  url: string;
  outcome: string;
  /** Bright Data API `/request` status — not the target site. */
  apiHttpStatus: number;
  bodyLength: number;
  elapsedMs: number;
  zone: string;
  errorName?: string;
  errorMessage?: string;
  /** Sanitized transport `error.cause` fields (outbound BD API connection). */
  causeName?: string;
  causeCode?: string;
  causeSyscall?: string;
  causeHostname?: string;
  causePort?: number;
};

/** Per-page Unlocker diagnostics (2A). No HTML bodies or emails. */
export type BusinessContactPageOutcome =
  | "ok"
  | "http_error"
  | "empty_body"
  | "timeout"
  | "network_error"
  | "url_normalization_error"
  | "unknown_error";

export type BusinessContactPageResult = {
  url: string;
  outcome: BusinessContactPageOutcome;
  /** Bright Data API `/request` status — not the target site. */
  apiHttpStatus: number;
  bodyLength: number;
  elapsedMs: number;
  zone: string;
  errorName?: string;
  errorMessage?: string;
  causeName?: string;
  causeCode?: string;
  causeSyscall?: string;
  causeHostname?: string;
  causePort?: number;
};

export type BusinessContactDiscoverySummary = {
  pagesAttempted: number;
  pagesSucceeded: number;
  pagesFailed: number;
  emailsFound: number;
  contactsCreated: number;
  contactsUpdated: number;
  unlockerZone?: string;
  failureCountsByCategory?: Record<string, number>;
  pageResults?: BusinessContactPageResult[];
};

/**
 * COMPLETED-run quality (status stays COMPLETED|FAILED).
 * Absent on historical runs → treat as unknown.
 */
export type LeadDiscoveryOutcome =
  | "FULL"
  | "EMPTY_LEGITIMATE"
  | "PROVIDER_FAILURE";

export type LeadDiscoveryWarningCode =
  | "unlocker_all_pages_failed"
  | "people_scraper_all_failed"
  | "people_search_provider_failed"
  | "mixed_provider_failure";

export type PeopleSearchBrightDataDiagnostics = {
  requests: number;
  hits: number;
  emptyBody: number;
  parseError: number;
  organicEmpty: number;
  networkError: number;
  httpError: number;
  httpStatusCounts: Record<string, number>;
};

export type PeopleSearchTavilyDiagnostics = {
  requests: number;
  hits: number;
  httpOkWithResults: number;
  httpOkEmptyResults: number;
  httpError: number;
  networkError: number;
  timeout: number;
};

/**
 * 2B people-search audit. Absent → counters unknown (legacy).
 * Present with `0` → known zero (not unknown).
 */
export type PeopleSearchTrace = {
  searchHitsReceived: number;
  linkedinUrlValidated: number;
  scoredCandidates: number;
  qualifiedCandidates: number;
  selectedProfileUrlsCount: number;
  selectedProfileUrls: string[];
  brightDataSearchRequests: number;
  brightDataSearchFailures: number;
  tavilyFallbackRequests: number;
  scraperInvocations: number;
  scraperSuccesses: number;
  scraperFailures: number;
  searchFailureCodes: string[];
  scraperErrorCodes: string[];
  brightDataDiagnostics?: PeopleSearchBrightDataDiagnostics;
  tavilyDiagnostics?: PeopleSearchTavilyDiagnostics;
};

/** ADR-0017 / ADR-0018 run audit (+ outcome / peopleSearchTrace). */
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
  outcome?: LeadDiscoveryOutcome;
  warningCode?: LeadDiscoveryWarningCode | null;
  warningMessage?: string | null;
  /** Person Leads persisted (orthogonal to BrandBusinessContact). */
  personLeadsCreated?: number;
  /** BrandBusinessContact upserts created in this run. */
  businessContactsCreated?: number;
  businessContactDiscovery?: BusinessContactDiscoverySummary;
  peopleSearchTrace?: PeopleSearchTrace;
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
