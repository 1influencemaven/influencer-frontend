import apiClient from "@/lib/api/client";
import type {
  Lead,
  LeadDiscoveryRun,
  LeadProviderOptionsResponse,
  LeadProvidersResponse,
  LeadStatus,
  SearchLeadsPayload,
  SearchLeadsResponse,
  UpdateLeadStatusPayload,
} from "@/types/lead-discovery";

const PATH = "/lead-discovery";

export async function listLeadProviders(): Promise<LeadProvidersResponse> {
  const { data } = await apiClient.get<LeadProvidersResponse>(
    `${PATH}/providers`,
  );
  return data;
}

export async function listLeadProviderOptions(
  providerId: string,
): Promise<LeadProviderOptionsResponse> {
  const { data } = await apiClient.get<LeadProviderOptionsResponse>(
    `${PATH}/providers/${encodeURIComponent(providerId)}/options`,
  );
  return data;
}

export async function searchLeads(
  payload: SearchLeadsPayload,
): Promise<SearchLeadsResponse> {
  const { data } = await apiClient.post<SearchLeadsResponse>(
    `${PATH}/search`,
    payload,
  );
  return data;
}

export async function listLeadDiscoveryRuns(filters?: {
  brandCandidateId?: string;
  influencerId?: string;
}): Promise<LeadDiscoveryRun[]> {
  const params = new URLSearchParams();
  if (filters?.brandCandidateId) {
    params.set("brandCandidateId", filters.brandCandidateId);
  }
  if (filters?.influencerId) {
    params.set("influencerId", filters.influencerId);
  }
  const query = params.toString();
  const { data } = await apiClient.get<LeadDiscoveryRun[]>(
    `${PATH}/runs${query ? `?${query}` : ""}`,
  );
  return data;
}

export async function listLeads(filters?: {
  brandCandidateId?: string;
  influencerId?: string;
  runId?: string;
  status?: LeadStatus;
}): Promise<Lead[]> {
  const params = new URLSearchParams();
  if (filters?.brandCandidateId) {
    params.set("brandCandidateId", filters.brandCandidateId);
  }
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
  const { data } = await apiClient.get<Lead[]>(
    `${PATH}/leads${query ? `?${query}` : ""}`,
  );
  return data;
}

export async function updateLeadStatus(
  id: string,
  payload: UpdateLeadStatusPayload,
): Promise<Lead> {
  const { data } = await apiClient.patch<Lead>(`${PATH}/leads/${id}`, payload);
  return data;
}
