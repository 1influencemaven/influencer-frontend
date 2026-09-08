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
