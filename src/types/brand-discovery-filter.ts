import type { BrandCandidateStatus } from "@/types/brand-discovery";

export type BrandCandidateStatusFilterValue = BrandCandidateStatus | "ALL";

export const BRAND_CANDIDATE_STATUS_FILTERS: BrandCandidateStatusFilterValue[] =
  ["ALL", "UNDER_REVIEW", "APPROVED", "REJECTED", "POSTPONED"];
