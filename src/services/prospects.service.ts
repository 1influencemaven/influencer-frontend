import apiClient from "@/lib/api/client";
import type {
  ApprovalItem,
  ApprovalResult,
  ApprovedIds,
  CsvImportPayload,
  CsvImportResult,
  Prospect,
  ProspectsPage,
  ProspectsQuery,
  UpdateProspectPayload,
} from "@/types/prospects";

const BASE = "/prospects";

/** Large CSV imports can take a while on the server. */
const CSV_IMPORT_TIMEOUT_MS = 120_000;

export async function listProspects(query: ProspectsQuery): Promise<ProspectsPage> {
  const params: Record<string, string | number> = {
    status: query.status,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    page: query.page,
    limit: query.limit,
  };
  if (query.influencerId) params.influencerId = query.influencerId;
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.source) params.source = query.source;
  if (query.contactKind) params.contactKind = query.contactKind;
  const { data } = await apiClient.get<ProspectsPage>(BASE, { params });
  return data;
}

export async function getApprovedIds(influencerId: string): Promise<ApprovedIds> {
  const { data } = await apiClient.get<ApprovedIds>(`${BASE}/approved-ids`, { params: { influencerId } });
  return data;
}

export async function approveContacts(items: ApprovalItem[]): Promise<ApprovalResult[]> {
  const { data } = await apiClient.post<{ results: ApprovalResult[] }>(`${BASE}/approve`, { items });
  return data.results;
}

export async function unapproveContacts(items: ApprovalItem[]): Promise<{ archived: number }> {
  const { data } = await apiClient.post<{ archived: number }>(`${BASE}/unapprove`, { items });
  return data;
}

export async function importProspectsCsv(payload: CsvImportPayload): Promise<CsvImportResult> {
  const { data } = await apiClient.post<CsvImportResult>(`${BASE}/import-csv`, payload, {
    timeout: CSV_IMPORT_TIMEOUT_MS,
  });
  return data;
}

export async function updateProspect(id: string, payload: UpdateProspectPayload): Promise<Prospect> {
  const { data } = await apiClient.patch<Prospect>(`${BASE}/${encodeURIComponent(id)}`, payload);
  return data;
}
