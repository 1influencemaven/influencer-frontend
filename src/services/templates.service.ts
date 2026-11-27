import apiClient from "@/lib/api/client";
import type {
  CreateTemplatePayload,
  SaleshandyExport,
  TemplateContent,
  TemplateDetail,
  TemplatePreview,
  TemplatesPage,
  TemplatesQuery,
  UpdateTemplatePayload,
  VariableIssue,
  VariablesCatalog,
} from "@/types/templates";

const BASE = "/templates";
const id = (value: string) => encodeURIComponent(value);

export async function listTemplates(query: TemplatesQuery): Promise<TemplatesPage> {
  const params: Record<string, string | number> = { status: query.status, page: query.page, limit: query.limit };
  if (query.influencerId) params.influencerId = query.influencerId;
  if (query.search?.trim()) params.search = query.search.trim();
  const { data } = await apiClient.get<TemplatesPage>(BASE, { params });
  return data;
}

export async function getTemplate(templateId: string): Promise<TemplateDetail> {
  const { data } = await apiClient.get<TemplateDetail>(`${BASE}/${id(templateId)}`);
  return data;
}

export async function getVariablesCatalog(locale: string): Promise<VariablesCatalog> {
  const { data } = await apiClient.get<VariablesCatalog>(`${BASE}/variables`, { params: { locale } });
  return data;
}

export async function createTemplate(payload: CreateTemplatePayload): Promise<TemplateDetail> {
  const { data } = await apiClient.post<TemplateDetail>(BASE, payload);
  return data;
}

export async function updateTemplate(templateId: string, payload: UpdateTemplatePayload): Promise<TemplateDetail> {
  const { data } = await apiClient.patch<TemplateDetail>(`${BASE}/${id(templateId)}`, payload);
  return data;
}

export async function setTemplateArchived(templateId: string, archived: boolean): Promise<TemplateDetail> {
  const { data } = await apiClient.post<TemplateDetail>(`${BASE}/${id(templateId)}/${archived ? "archive" : "restore"}`);
  return data;
}

export async function validateTemplate(content: TemplateContent): Promise<{ valid: boolean; issues: VariableIssue[] }> {
  const { data } = await apiClient.post<{ valid: boolean; issues: VariableIssue[] }>(`${BASE}/validate`, content);
  return data;
}

export async function previewTemplate(payload: {
  templateId?: string;
  influencerId?: string;
  prospectId?: string;
  subject?: string;
  preHeader?: string;
  bodyHtml?: string;
}): Promise<TemplatePreview> {
  const { data } = await apiClient.post<TemplatePreview>(`${BASE}/preview`, { ...payload, highlightMissing: true });
  return data;
}

export async function exportTemplateForSaleshandy(templateId: string): Promise<SaleshandyExport> {
  const { data } = await apiClient.get<SaleshandyExport>(`${BASE}/${id(templateId)}/saleshandy`);
  return data;
}
