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

export type IbpSummary = {
  id: string;
  status: import("./ideal-brand-profile").IbpStatus;
  metadata: import("./ideal-brand-profile").IbpMetadata | null;
  updatedAt: string;
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
  subNiche?: string;
  ibpStatus?: import("./ideal-brand-profile").IbpStatus;
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
