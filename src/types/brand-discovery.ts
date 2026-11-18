export type BrandDiscoveryStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export type BrandCandidateStatus =
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "POSTPONED";

/** Prisma EvidenceStatus — SERP/grounding classifier (not field-level research). */
export type BrandEvidenceStatus = "VERIFIED" | "UNVERIFIED" | "NOT_ASSESSED";

export type BrandResearchFieldStatus =
  | "VERIFIED"
  | "PARTIAL"
  | "NOT_FOUND"
  | "UNAVAILABLE";

export type BrandResearchPageRole =
  | "homepage"
  | "about"
  | "products"
  | "partnerships"
  | "other";

export type BrandCommercialSignalKind =
  | "influencer_marketing"
  | "affiliate"
  | "creator_program"
  | "ambassador"
  | "partnerships"
  | "sponsorship"
  | "ugc";

export type BrandResearchEvidenceRef = {
  url: string;
  excerpt?: string;
  pageRole?: BrandResearchPageRole;
};

export type BrandResearchedField<T> = {
  value: T | null;
  status: BrandResearchFieldStatus;
  evidence: BrandResearchEvidenceRef[];
  note?: string;
};

export type BrandCommercialSignal = {
  kind: BrandCommercialSignalKind;
  value: boolean | null;
  status: BrandResearchFieldStatus;
  evidence: BrandResearchEvidenceRef[];
  note?: string;
};

export type BrandDeepResearchPage = {
  url: string;
  role: string;
  fetchStatus: string;
  httpStatus?: number;
  errorMessage?: string;
};

export type BrandDeepResearch = {
  researchStatus: "COMPLETED" | "PARTIAL" | "FAILED";
  agentResearchStatus?: "COMPLETED" | "PARTIAL" | "FAILED";
  identity: {
    name: BrandResearchedField<string>;
    officialWebsite: BrandResearchedField<string>;
    domain: BrandResearchedField<string>;
  };
  company: {
    description: BrandResearchedField<string>;
    brandSize: BrandResearchedField<string>;
  };
  industry: {
    sectors: BrandResearchedField<string[]>;
    categories: BrandResearchedField<string[]>;
  };
  offerings: {
    productsAndServices: BrandResearchedField<string[]>;
  };
  markets: {
    countriesOrRegions: BrandResearchedField<string[]>;
  };
  commercialSignals: BrandCommercialSignal[];
  influencerFit: {
    score?: number;
    rationale: BrandResearchedField<string>;
    alignmentNotes?: BrandResearchedField<string[]>;
  };
  pages: BrandDeepResearchPage[];
  warnings?: string[];
};

export type BrandCandidateMetadata = {
  groundingSource?: string;
  groundingProvenance?: unknown;
  deepResearch?: BrandDeepResearch;
  [key: string]: unknown;
};

export type BrandDiscoverySearchMetadata = {
  queries?: string[];
  searchHitsCount?: number;
  afterHardFiltersCount?: number;
  persistedCount?: number;
  verifiedCount?: number;
  unverifiedCount?: number;
  skippedPersistReason?: string;
  serpQueryFallbackUsed?: boolean;
  engine?: string;
  researchedCount?: number;
  researchFailedCount?: number;
  researchPartialCount?: number;
};

export type BrandDiscoveryRun = {
  id: string;
  influencerId: string;
  status: BrandDiscoveryStatus;
  source: string;
  limit: number;
  ibpSnapshot: unknown;
  searchMetadata?: BrandDiscoverySearchMetadata | null;
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
  evidenceStatus?: BrandEvidenceStatus;
  status: BrandCandidateStatus;
  metadata: BrandCandidateMetadata | null | unknown;
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

export function getBrandDeepResearch(
  metadata: BrandCandidate["metadata"],
): BrandDeepResearch | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }
  const deep = (metadata as BrandCandidateMetadata).deepResearch;
  if (!deep || typeof deep !== "object") {
    return null;
  }
  return deep;
}
