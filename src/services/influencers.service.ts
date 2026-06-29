import apiClient from "@/lib/api/client";
import type {
  CreateInfluencerPayload,
  DeleteInfluencerResponse,
  GenerateProfileResponse,
  Influencer,
  InfluencersQueryParams,
  PaginatedInfluencersResponse,
  UpdateInfluencerPayload,
} from "@/types/influencer";

const INFLUENCERS_PATH = "/influencers";

function buildQueryString(params: InfluencersQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.country) {
    searchParams.set("country", params.country);
  }

  if (params.language) {
    searchParams.set("language", params.language);
  }

  if (params.niche) {
    searchParams.set("niche", params.niche);
  }

  if (params.subNiche) {
    searchParams.set("subNiche", params.subNiche);
  }

  if (params.profileStatus) {
    searchParams.set("profileStatus", params.profileStatus);
  }

  if (params.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }

  if (params.sortOrder) {
    searchParams.set("sortOrder", params.sortOrder);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listInfluencers(
  params: InfluencersQueryParams = {},
): Promise<PaginatedInfluencersResponse> {
  const { data } = await apiClient.get<PaginatedInfluencersResponse>(
    `${INFLUENCERS_PATH}${buildQueryString(params)}`,
  );
  return data;
}

export async function getInfluencer(id: string): Promise<Influencer> {
  const { data } = await apiClient.get<Influencer>(
    `${INFLUENCERS_PATH}/${id}`,
  );
  return data;
}

export async function createInfluencer(
  payload: CreateInfluencerPayload,
): Promise<Influencer> {
  const { data } = await apiClient.post<Influencer>(
    INFLUENCERS_PATH,
    payload,
  );
  return data;
}

export async function updateInfluencer(
  id: string,
  payload: UpdateInfluencerPayload,
): Promise<Influencer> {
  const { data } = await apiClient.patch<Influencer>(
    `${INFLUENCERS_PATH}/${id}`,
    payload,
  );
  return data;
}

export async function deleteInfluencer(
  id: string,
): Promise<DeleteInfluencerResponse> {
  const { data } = await apiClient.delete<DeleteInfluencerResponse>(
    `${INFLUENCERS_PATH}/${id}`,
  );
  return data;
}

export async function generateProfile(
  id: string,
): Promise<GenerateProfileResponse> {
  const { data } = await apiClient.post<GenerateProfileResponse>(
    `${INFLUENCERS_PATH}/${id}/generate-profile`,
  );
  return data;
}

export const influencersService = {
  listInfluencers,
  getInfluencer,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
  generateProfile,
};
