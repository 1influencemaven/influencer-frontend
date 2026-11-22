import apiClient from "@/lib/api/client";
import type {
  CreateInfluencerPayload,
  DeleteInfluencerResponse,
  Influencer,
  InfluencerManager,
  InfluencersQueryParams,
  InstagramResearchRun,
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

  if (params.niches) {
    searchParams.set("niches", params.niches);
  }

  if (params.subNiche) {
    searchParams.set("subNiche", params.subNiche);
  }

  if (params.managerId) {
    searchParams.set("managerId", params.managerId);
  }

  if (params.year !== undefined) {
    searchParams.set("year", String(params.year));
  }

  if (params.quarter) {
    searchParams.set("quarter", params.quarter);
  }

  if (params.ibpStatus) {
    searchParams.set("ibpStatus", params.ibpStatus);
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

export async function listInfluencerManagers(): Promise<InfluencerManager[]> {
  const { data } = await apiClient.get<InfluencerManager[]>(
    `${INFLUENCERS_PATH}/managers`,
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

/** Enqueue Instagram research for an existing talent (202 + PROCESSING run). */
export async function startInfluencerInstagramResearch(
  id: string,
): Promise<InstagramResearchRun> {
  const { data } = await apiClient.post<InstagramResearchRun>(
    `${INFLUENCERS_PATH}/${id}/instagram-research`,
  );
  return data;
}

/** Enqueue username lookup — does not create/update influencers. */
export async function startInstagramUsernameResearch(
  username: string,
): Promise<InstagramResearchRun> {
  const { data } = await apiClient.post<InstagramResearchRun>(
    `${INFLUENCERS_PATH}/instagram-research`,
    { username },
  );
  return data;
}

/** Poll durable Instagram research run status. */
export async function getInstagramResearchRun(
  runId: string,
): Promise<InstagramResearchRun> {
  const { data } = await apiClient.get<InstagramResearchRun>(
    `${INFLUENCERS_PATH}/instagram-research/runs/${runId}`,
  );
  return data;
}

/** Active PROCESSING run for a talent, or null. */
export async function getActiveInfluencerInstagramResearch(
  influencerId: string,
): Promise<InstagramResearchRun | null> {
  const { data } = await apiClient.get<InstagramResearchRun | null>(
    `${INFLUENCERS_PATH}/${influencerId}/instagram-research/active`,
  );
  return data;
}

export const influencersService = {
  listInfluencers,
  listInfluencerManagers,
  getInfluencer,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
  startInfluencerInstagramResearch,
  startInstagramUsernameResearch,
  getInstagramResearchRun,
  getActiveInfluencerInstagramResearch,
};
