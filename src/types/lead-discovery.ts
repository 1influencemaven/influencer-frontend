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
  email: string;
  emailConfidence: LeadEmailConfidence;
  isGeneric: boolean;
  profileUrl: string | null;
  providerId: string;
  sourceOptionId: string | null;
  fitReason: string | null;
  source: string;
  status: LeadStatus;
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
