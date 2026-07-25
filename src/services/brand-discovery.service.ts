import apiClient from "@/lib/api/client";
import type {
  BrandCandidate,
  BrandCandidateStatus,
  BrandDiscoveryRun,
  SearchBrandsResponse,
  UpdateBrandCandidateStatusPayload,
} from "@/types/brand-discovery";

const PATH = "/brand-discovery";

export async function searchBrands(
  influencerIds: string[],
  limit = 20,
): Promise<SearchBrandsResponse> {
  const { data } = await apiClient.post<SearchBrandsResponse>(
    `${PATH}/search`,
    { influencerIds, limit },
  );
  return data;
}

export async function listBrandDiscoveryRuns(
  influencerId?: string,
): Promise<BrandDiscoveryRun[]> {
  const query = influencerId
    ? `?influencerId=${encodeURIComponent(influencerId)}`
    : "";
  const { data } = await apiClient.get<BrandDiscoveryRun[]>(
    `${PATH}/runs${query}`,
  );
  return data;
}

export async function listBrandCandidates(filters?: {
  influencerId?: string;
  runId?: string;
  status?: BrandCandidateStatus;
}): Promise<BrandCandidate[]> {
  const params = new URLSearchParams();
  if (filters?.influencerId) {
    params.set("influencerId", filters.influencerId);
  }
  if (filters?.runId) {
    params.set("runId", filters.runId);
  }
  if (filters?.status) {
    params.set("status", filters.status);
  }
  const query = params.toString();
  const { data } = await apiClient.get<BrandCandidate[]>(
    `${PATH}/candidates${query ? `?${query}` : ""}`,
  );
  return data;
}

export async function updateBrandCandidateStatus(
  id: string,
  payload: UpdateBrandCandidateStatusPayload,
): Promise<BrandCandidate> {
  const { data } = await apiClient.patch<BrandCandidate>(
    `${PATH}/candidates/${id}`,
    payload,
  );
  return data;
}
