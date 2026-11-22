export const INFLUENCER_SORT_FIELDS = [
  "name",
  "followers",
  "engagement",
  "createdAt",
  "updatedAt",
] as const;

export type InfluencerSortBy = (typeof INFLUENCER_SORT_FIELDS)[number];

export const SORT_ORDERS = ["asc", "desc"] as const;

export type SortOrder = (typeof SORT_ORDERS)[number];

export const INFLUENCER_QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;

export type InfluencerQuarter = (typeof INFLUENCER_QUARTERS)[number];

export const INFLUENCER_DATA_ORIGINS = [
  "MANUAL",
  "EXTERNAL",
  "LEGACY",
] as const;

export type InfluencerDataOrigin = (typeof INFLUENCER_DATA_ORIGINS)[number];

export type IbpSummary = {
  id: string;
  status: import("./ideal-brand-profile").IbpStatus;
  metadata: import("./ideal-brand-profile").IbpMetadata | null;
  updatedAt: string;
};

export type InfluencerManager = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type InfluencerQuarterAssignment = {
  id: string;
  year: number;
  quarter: InfluencerQuarter;
  assignedAt: string;
};

export type InfluencerFieldProvenance = {
  fieldKey: string;
  origin: InfluencerDataOrigin;
  source: string | null;
  fetchedAt: string | null;
  updatedAt: string;
};

export type QuarterAssignmentInput = {
  year: number;
  quarter: InfluencerQuarter;
};

/** Research evidence persisted on create for Mastra (not niches). */
export type InstagramResearchEvidence = {
  version: 1;
  source: string;
  fetchedAt: string;
  handleNormalized: string;
  profileUrl: string;
  normalized: InstagramUsernameLookupNormalized;
};

/** Payload attached to create after username lookup (before Mastra). */
export type InstagramResearchCreatePayload = {
  source: string;
  fetchedAt: string;
  handleNormalized: string;
  profileUrl: string;
  normalized: InstagramUsernameLookupNormalized;
};

export type Influencer = {
  id: string;
  name: string;
  instagram: string | null;
  instagramNormalized?: string | null;
  tiktok: string | null;
  youtube: string | null;
  country: string | null;
  language: string | null;
  niche: string | null;
  subNiche: string | null;
  niches: string[];
  followers: number | null;
  engagement: string | null;
  email: string | null;
  outgoingEmail: string | null;
  mediaKitUrl: string | null;
  managerId: string | null;
  manager: InfluencerManager | null;
  quarterAssignments: InfluencerQuarterAssignment[];
  fieldProvenances?: InfluencerFieldProvenance[];
  /** Present on detail responses when create included username research. */
  instagramResearchEvidence?: InstagramResearchEvidence | null;
  idealBrandProfile: IbpSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedInfluencersResponse = {
  data: Influencer[];
  meta: PaginationMeta;
};

export type InfluencersQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  language?: string;
  niche?: string;
  niches?: string;
  subNiche?: string;
  managerId?: string;
  year?: number;
  quarter?: InfluencerQuarter;
  ibpStatus?: import("./ideal-brand-profile").IbpStatus;
  sortBy?: InfluencerSortBy;
  sortOrder?: SortOrder;
};

export type CreateInfluencerPayload = {
  name: string;
  instagram: string;
  /** ISO 3166-1 alpha-2 — país donde se encuentra el talento (obligatorio en alta). */
  country: string;
  niches?: string[];
  quarters?: QuarterAssignmentInput[];
  managerId?: string;
  outgoingEmail?: string;
  tiktok?: string;
  youtube?: string;
  language?: string;
  niche?: string;
  subNiche?: string;
  followers?: number;
  engagement?: number;
  email?: string;
  mediaKitUrl?: string;
  /** Username research package; Nest persists evidence + EXTERNAL followers/email. */
  instagramResearch?: InstagramResearchCreatePayload;
};

export type UpdateInfluencerPayload = Partial<
  Omit<CreateInfluencerPayload, "managerId" | "instagramResearch">
> & {
  managerId?: string | null;
};

export type DeleteInfluencerResponse = {
  message: string;
};

export type InstagramResearchOutcome =
  | "UPDATED"
  | "NO_CHANGES"
  | "PROFILE_PRIVATE"
  | "PROFILE_NOT_FOUND"
  | "INCOMPLETE_RESPONSE"
  | "PROVIDER_ERROR"
  | "PROVIDER_TIMEOUT"
  | "NOT_CONFIGURED";

export type InstagramResearchResponse = {
  influencer: Influencer;
  research: {
    outcome: InstagramResearchOutcome;
    handle: string;
    profileUrl: string;
    source: string;
    fetchedAt: string;
    updatedFields: string[];
    skippedManualFields: string[];
    message?: string;
  };
};

/** Phase 1: username lookup without persistence. */
export type InstagramUsernameLookupOutcome =
  | "FOUND"
  | "PROFILE_PRIVATE"
  | "PROFILE_NOT_FOUND"
  | "INCOMPLETE_RESPONSE";

export type InstagramUsernameLookupNormalized = {
  account: string | null;
  displayName: string | null;
  biography: string | null;
  followers: number | null;
  following: number | null;
  postsCount: number | null;
  isPrivate: boolean | null;
  isVerified: boolean | null;
  emailAddress: string | null;
  profileImageUrl: string | null;
  profileUrl: string | null;
  externalUrls: string[];
  bioHashtags: string[];
  postHashtags: string[];
};

export type InstagramUsernameResearchResponse = {
  research: {
    outcome: InstagramUsernameLookupOutcome;
    queriedUsername: string;
    handleNormalized: string;
    profileUrl: string;
    source: string;
    fetchedAt: string;
    persisted: false;
  };
  normalized: InstagramUsernameLookupNormalized;
  provider: Record<string, unknown>;
};

export type InstagramResearchRunStatus =
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type InstagramResearchRunMode = "USERNAME" | "INFLUENCER";

/** Durable BullMQ run for Instagram research (poll via GET). */
export type InstagramResearchRun = {
  id: string;
  status: InstagramResearchRunStatus;
  mode: InstagramResearchRunMode;
  username: string | null;
  handleNormalized: string | null;
  influencerId: string | null;
  result: InstagramUsernameResearchResponse | InstagramResearchResponse | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Field keys used by InfluencerFieldProvenance (backend contract). */
export const INFLUENCER_FIELD_KEYS = {
  NAME: "name",
  INSTAGRAM: "instagram",
  TIKTOK: "tiktok",
  YOUTUBE: "youtube",
  COUNTRY: "country",
  LANGUAGE: "language",
  NICHE: "niche",
  SUB_NICHE: "subNiche",
  NICHES: "niches",
  FOLLOWERS: "followers",
  ENGAGEMENT: "engagement",
  EMAIL: "email",
  OUTGOING_EMAIL: "outgoingEmail",
  MEDIA_KIT_URL: "mediaKitUrl",
  MANAGER_ID: "managerId",
} as const;

export type InfluencerFieldKey =
  (typeof INFLUENCER_FIELD_KEYS)[keyof typeof INFLUENCER_FIELD_KEYS];
