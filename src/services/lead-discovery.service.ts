import apiClient from "@/lib/api/client";
import type {
  AgencyContactCommercial,
  AgencyContactKind,
  BrandBusinessContact,
  CommercialRelevance,
  Lead,
  LeadDetail,
  LeadDiscoveryRun,
  LeadProviderOptionsResponse,
  LeadProvidersResponse,
  LeadStatus,
  SearchLeadsPayload,
  SearchLeadsResponse,
  UnlockerDiagnosticResult,
  UpdateLeadStatusPayload,
} from "@/types/lead-discovery";
import { UNLOCKER_DIAGNOSTIC_ALLOWED_URL } from "@/types/lead-discovery";

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

export async function listBrandBusinessContacts(
  brandCandidateId: string,
): Promise<BrandBusinessContact[]> {
  const params = new URLSearchParams({ brandCandidateId });
  const { data } = await apiClient.get<BrandBusinessContact[]>(
    `${PATH}/business-contacts?${params.toString()}`,
  );
  return data;
}

/** 2C.4.8 — read-only AgencyContact commercial list for an influencer. */
export async function listAgencyContacts(filters: {
  influencerId: string;
  contactKind?: AgencyContactKind;
  commercialRelevance?: CommercialRelevance;
}): Promise<AgencyContactCommercial[]> {
  const params = new URLSearchParams({ influencerId: filters.influencerId });
  if (filters.contactKind) {
    params.set("contactKind", filters.contactKind);
  }
  if (filters.commercialRelevance) {
    params.set("commercialRelevance", filters.commercialRelevance);
  }
  const { data } = await apiClient.get<AgencyContactCommercial[]>(
    `${PATH}/agency-contacts?${params.toString()}`,
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

export async function getLeadById(id: string): Promise<LeadDetail> {
  const { data } = await apiClient.get<LeadDetail>(`${PATH}/leads/${id}`);
  return data;
}

export async function updateLeadStatus(
  id: string,
  payload: UpdateLeadStatusPayload,
): Promise<Lead> {
  const { data } = await apiClient.patch<Lead>(`${PATH}/leads/${id}`, payload);
  return data;
}

export async function selectLeadForOutreach(id: string): Promise<Lead> {
  const { data } = await apiClient.post<Lead>(`${PATH}/leads/${id}/select`);
  return data;
}

export async function deselectLeadForOutreach(id: string): Promise<Lead> {
  const { data } = await apiClient.delete<Lead>(`${PATH}/leads/${id}/select`);
  return data;
}

/** ADMIN local Unlocker probe — one URL, no discovery run, no HTML in response. */
export async function probeUnlockerDiagnostic(
  url: typeof UNLOCKER_DIAGNOSTIC_ALLOWED_URL = UNLOCKER_DIAGNOSTIC_ALLOWED_URL,
): Promise<UnlockerDiagnosticResult> {
  const { data } = await apiClient.post<UnlockerDiagnosticResult>(
    `${PATH}/diagnostics/unlocker`,
    { url },
  );
  return data;
}
