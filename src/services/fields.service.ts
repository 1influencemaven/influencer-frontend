import apiClient from "@/lib/api/client";
import type {
  CreateFieldPayload,
  CustomField,
  FieldsListResponse,
  FieldsQuery,
  FieldsSyncResult,
  UpdateFieldPayload,
} from "@/types/fields";

const BASE = "/fields";

function toParams(query: FieldsQuery): Record<string, string> {
  const params: Record<string, string> = {
    origin: query.origin,
    status: query.status,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.fieldTypes?.length) params.fieldTypes = query.fieldTypes.join(",");
  if (query.tags?.length) params.tags = query.tags.join(",");
  return params;
}

export async function listFields(query: FieldsQuery): Promise<FieldsListResponse> {
  const { data } = await apiClient.get<FieldsListResponse>(BASE, { params: toParams(query) });
  return data;
}

export async function syncFields(): Promise<FieldsSyncResult> {
  const { data } = await apiClient.post<FieldsSyncResult>(`${BASE}/sync`);
  return data;
}

export async function createField(payload: CreateFieldPayload): Promise<CustomField> {
  const { data } = await apiClient.post<CustomField>(BASE, payload);
  return data;
}

export async function updateField(id: string, payload: UpdateFieldPayload): Promise<CustomField> {
  const { data } = await apiClient.patch<CustomField>(`${BASE}/${encodeURIComponent(id)}`, payload);
  return data;
}

export async function setFieldStatus(id: string, isActive: boolean): Promise<CustomField> {
  const { data } = await apiClient.patch<CustomField>(
    `${BASE}/${encodeURIComponent(id)}/status`,
    { isActive },
  );
  return data;
}
