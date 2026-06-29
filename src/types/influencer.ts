export const PROFILE_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
] as const;

export type ProfileStatus = (typeof PROFILE_STATUSES)[number];

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

export type BuyerPersona = {
  title: string;
  seniority?: string;
  responsibilities?: string[];
};

export type CommercialProfile = {
  idealBrands: string[];
  brandSize: string[];
  departments: string[];
  buyerPersonas: BuyerPersona[];
  futureMetadata?: Record<string, unknown>;
};

export type Influencer = {
  id: string;
  name: string;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  country: string | null;
  language: string | null;
  niche: string | null;
  subNiche: string | null;
  followers: number | null;
  engagement: string | null;
  email: string | null;
  mediaKitUrl: string | null;
  profileStatus: ProfileStatus;
  commercialProfile: CommercialProfile | null;
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
  subNiche?: string;
  profileStatus?: ProfileStatus;
  sortBy?: InfluencerSortBy;
  sortOrder?: SortOrder;
};

export type CreateInfluencerPayload = {
  name: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  country?: string;
  language?: string;
  niche?: string;
  subNiche?: string;
  followers?: number;
  engagement?: number;
  email?: string;
  mediaKitUrl?: string;
};

export type UpdateInfluencerPayload = Partial<CreateInfluencerPayload>;

export type DeleteInfluencerResponse = {
  message: string;
};

export type GenerateProfileResponse = {
  message: string;
  influencerId: string;
  profileStatus: ProfileStatus;
};
