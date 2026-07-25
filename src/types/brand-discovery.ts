export type BrandDiscoveryStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export type BrandCandidateStatus =
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "POSTPONED";

export type BrandDiscoveryRun = {
  id: string;
  influencerId: string;
  status: BrandDiscoveryStatus;
  source: string;
  limit: number;
  ibpSnapshot: unknown;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  influencer: {
    id: string;
    name: string;
  };
};

export type BrandCandidate = {
  id: string;
  influencerId: string;
  discoveryRunId: string;
  name: string;
  website: string;
  domain: string;
  sector: string | null;
  market: string | null;
  brandSize: string | null;
  score: number | null;
  fitReason: string | null;
  source: string;
  evidenceUrls: string[];
  status: BrandCandidateStatus;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
  influencer: {
    id: string;
    name: string;
  };
};

export type SearchBrandsResponse = {
  message: string;
  runs: BrandDiscoveryRun[];
};

export type UpdateBrandCandidateStatusPayload = {
  status: Extract<
    BrandCandidateStatus,
    "APPROVED" | "REJECTED" | "POSTPONED"
  >;
};
