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

/** RF-01 provenance concepts (metadata; not SMTP enums). */
export type ContactEmailDiscoveryStatus = "FOUND";
export type ContactEmailAttributionStatus = "ATTRIBUTED" | "UNATTRIBUTED";
export type ContactEmailVerificationStatus = "UNVERIFIED" | "VERIFIED";

/** RF-02.1 commercial coverage for UI (orthogonal to Prisma commercialRelevance). */
export type CommercialCoverageTier =
  | "HIGH"
  | "MEDIUM"
  | "GENERAL"
  | "LOW"
  | "OTHER";

/** 2C.4.7 — AgencyContact commercial list item (read-only). Not a Lead. */
export type AgencyContactKind = "MAILBOX" | "PERSON";

export type AgencyRelevanceStatus =
  | "UNDER_REVIEW"
  | "RELEVANT"
  | "NOT_RELEVANT"
  | "DISCARDED";

export type AgencyContactEligibilityStatus =
  | "ACTIONABLE"
  | "VISIBLE_NOT_ACTIONABLE"
  | "VISIBLE_NOT_PRIORITY";

export type AgencyContactEvidence = {
  sourceUrl: string;
  evidenceSnippet: string;
  discoveredAt: string;
};

export type AgencyContactCommercial = {
  agencyId: string;
  agencyName: string;
  agencyDomain: string;
  agencyRelevanceStatus: AgencyRelevanceStatus;
  agencyContactId: string;
  contactKind: AgencyContactKind;
  email: string;
  displayName: string | null;
  title: string | null;
  label: string | null;
  isGeneric: boolean;
  commercialRelevance: CommercialRelevance;
  sourceKind: string | null;
  provenance: {
    discoveryStatus: ContactEmailDiscoveryStatus;
    attributionStatus: ContactEmailAttributionStatus;
    verificationStatus: ContactEmailVerificationStatus;
  };
  attributionStatus: ContactEmailAttributionStatus;
  evidence: AgencyContactEvidence[];
  outreachRole: string | null;
  discoveredAt: string;
  eligibilityStatus: AgencyContactEligibilityStatus;
  eligibilityReason: string;
  priority: boolean;
  origin: "AGENCY_CONTACT_RESEARCH";
  track: "2C";
  researchOperation: "FIND_AGENCY_EMAILS" | "FIND_AGENCY_PEOPLE";
};

/** Enrichment strategy tiers (backend-derived). GENERIC = info@/hello@ kept as fallback. */
export type ContactTier = "TIER_1" | "TIER_2" | "TIER_3" | "GENERIC" | "REJECTED";

/** ADR-0016/0018 — brand inbox without a person. Not a Lead. */
export type BrandBusinessContact = {
  id: string;
  brandCandidateId: string;
  email: string;
  label: string | null;
  isGeneric: boolean;
  commercialRelevance: CommercialRelevance;
  /** Prefer this for commercial badge; OTHER ≠ General. */
  commercialCoverageTier?: CommercialCoverageTier;
  contactTier?: ContactTier;
  source: ContactChannelSource;
  sourceUrl: string | null;
  evidences: BrandBusinessContactEvidence[];
  /** Literal discovery — always FOUND when returned from RF-01 writer. */
  discoveryStatus?: ContactEmailDiscoveryStatus;
  /** Brand association strength. */
  attributionStatus?: ContactEmailAttributionStatus;
  /** Mailbox verification — VERIFIED only after a real verify (none today). */
  verificationStatus?: ContactEmailVerificationStatus;
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

/** Logical provider id for Contact Discovery BBC v1 (ADR-0020). */
export const BBC_BRIGHTDATA_PROVIDER_ID = "bbc-brightdata" as const;

/** Mastra FIND_BRAND_EMAILS write path (Paso 3+; Nest CONTACT_DISCOVERY_ENGINE=mastra). */
export const MASTRA_CONTACT_EMAILS_PROVIDER_ID = "mastra-contact-emails" as const;

/** Providers that write BrandBusinessContact (not person Lead discovery). */
export function isBbcWriteProviderId(providerId: string | null | undefined): boolean {
  return (
    providerId === BBC_BRIGHTDATA_PROVIDER_ID ||
    providerId === MASTRA_CONTACT_EMAILS_PROVIDER_ID
  );
}

export type LeadProvidersResponse = {
  available: string[];
  default: string | null;
  /**
   * When true, POST /search uses BBC v1 (`contact-discovery` queue).
   * When false, legacy `find-leads` / prospecting.
   */
  rebuildMode?: boolean;
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
  plannedSearchQueries?: string[];
  searchHitsProcessed?: number;
  discardCountsByReason?: Record<string, number>;
};

/**
 * COMPLETED-run quality (status stays COMPLETED|FAILED).
 * Absent on historical runs → treat as unknown.
 * BBC v1 (schemaVersion 2): RESULTS_FOUND | NO_MATCHES | PROVIDER_FAILURE.
 * Legacy 2A/2B: FULL | EMPTY_LEGITIMATE | PROVIDER_FAILURE.
 */
export type LeadDiscoveryOutcome =
  | "FULL"
  | "EMPTY_LEGITIMATE"
  | "PROVIDER_FAILURE"
  | "RESULTS_FOUND"
  | "NO_MATCHES";

export type BbcProviderFailureKind =
  | "transport"
  | "http"
  | "empty_body"
  | "malformed";

export type BbcRunOutcome =
  | "RESULTS_FOUND"
  | "NO_MATCHES"
  | "PROVIDER_FAILURE";

/** Nested businessContacts block on BBC searchMetadata schemaVersion 2. */
export type BbcBusinessContactsMeta = {
  created: number;
  updated: number;
  emailsFound: number;
  pagesAttempted: number;
  pagesSucceeded: number;
  pagesFailed: number;
  failureCountsByCategory?: Record<string, number>;
  discardCountsByReason?: Record<string, number>;
  pageResults?: BusinessContactPageResult[];
};

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

/**
 * Run audit metadata.
 * - Legacy ADR-0017/0018: strategy/tracks/…
 * - BBC v1 schemaVersion 2: outcome + businessContacts (no person pipeline)
 */
export type LeadSearchMetadata = {
  /** 2 = Contact Discovery BBC v1 */
  schemaVersion?: number;
  providerId?: string;
  /** Legacy planning fields — often absent on BBC v1. */
  strategy?: "llm" | "manual" | "unknown";
  tracks?: Array<"2A" | "2B" | "2C">;
  priorityRoles?: string[];
  scraperIds?: string[];
  plannedQueriesCount?: number;
  validatedQueriesCount?: number;
  queries?: string[];
  fallbackUsed?: boolean;
  fallbackReason?: string | null;
  searchHitsCount?: number;
  outcome?: LeadDiscoveryOutcome;
  providerFailureKind?: BbcProviderFailureKind;
  errorSummary?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
  warningCode?: LeadDiscoveryWarningCode | null;
  warningMessage?: string | null;
  /** 2C.3: Agency Discovery track status (omit / executed:false when not started). */
  track2C?: {
    executed: boolean;
    outcome?: "RESULTS_FOUND" | "NO_MATCHES" | "PROVIDER_FAILURE";
    error?: string | null;
    candidatesCount?: number;
    persistedCount?: number;
    searchMetadata?: {
      serpCalls?: number;
      dedupedHitsCount?: number;
      persistedCount?: number;
      providerErrors?: string[];
    };
  };
  /** Person Leads persisted (orthogonal to BrandBusinessContact). */
  personLeadsCreated?: number;
  /** BrandBusinessContact upserts created in this run (legacy top-level). */
  businessContactsCreated?: number;
  /** Legacy 2A summary shape. */
  businessContactDiscovery?: BusinessContactDiscoverySummary;
  /** BBC v1 nested summary (schemaVersion 2). */
  businessContacts?: BbcBusinessContactsMeta;
  peopleSearchTrace?: PeopleSearchTrace;
  /** AI research orchestration (demo) — operational steps, not private chain-of-thought. */
  orchestrationMode?: string;
  researchTrace?: {
    mode?: string;
    serpQueriesUsed?: number;
    pagesFetched?: number;
    maxSerp?: number;
    maxPages?: number;
    finalizeSummary?: string;
    steps?: Array<{
      iteration: number;
      action: string;
      reason: string;
      query?: string;
      url?: string;
      observation: string;
    }>;
  };
};

export function isBbcSearchMetadata(
  metadata: LeadSearchMetadata | null | undefined,
): metadata is LeadSearchMetadata & {
  schemaVersion: 2;
  outcome: BbcRunOutcome;
  businessContacts: BbcBusinessContactsMeta;
} {
  if (!metadata || metadata.schemaVersion !== 2) {
    return false;
  }
  const outcome = metadata.outcome;
  return (
    (outcome === "RESULTS_FOUND" ||
      outcome === "NO_MATCHES" ||
      outcome === "PROVIDER_FAILURE") &&
    metadata.businessContacts != null
  );
}

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
  /** Strategy tier; list is sorted Tier 1 first by the API. */
  contactTier?: ContactTier;
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
