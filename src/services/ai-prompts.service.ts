import apiClient from "@/lib/api/client";
import type {
  BrandDiscoveryPromptTemplate,
  IbpPromptTemplate,
  LeadDiscoveryPromptTemplate,
  UpdateBrandDiscoveryPromptPayload,
  UpdateIbpPromptPayload,
  UpdateLeadDiscoveryPromptPayload,
} from "@/types/ai-prompt";

const IBP_PROMPT_PATH = "/settings/ibp-prompt";
const BRAND_DISCOVERY_PROMPT_PATH = "/settings/brand-discovery-prompt";
const LEAD_DISCOVERY_PROMPT_PATH = "/settings/lead-discovery-prompt";

export async function getIbpPrompt(): Promise<IbpPromptTemplate> {
  const { data } = await apiClient.get<IbpPromptTemplate>(IBP_PROMPT_PATH);
  return data;
}

export async function updateIbpPrompt(
  payload: UpdateIbpPromptPayload,
): Promise<IbpPromptTemplate> {
  const { data } = await apiClient.patch<IbpPromptTemplate>(
    IBP_PROMPT_PATH,
    payload,
  );
  return data;
}

export async function resetIbpPrompt(): Promise<IbpPromptTemplate> {
  const { data } = await apiClient.post<IbpPromptTemplate>(
    `${IBP_PROMPT_PATH}/reset`,
  );
  return data;
}

export async function getBrandDiscoveryPrompt(): Promise<BrandDiscoveryPromptTemplate> {
  const { data } = await apiClient.get<BrandDiscoveryPromptTemplate>(
    BRAND_DISCOVERY_PROMPT_PATH,
  );
  return data;
}

export async function updateBrandDiscoveryPrompt(
  payload: UpdateBrandDiscoveryPromptPayload,
): Promise<BrandDiscoveryPromptTemplate> {
  const { data } = await apiClient.patch<BrandDiscoveryPromptTemplate>(
    BRAND_DISCOVERY_PROMPT_PATH,
    payload,
  );
  return data;
}

export async function resetBrandDiscoveryPrompt(): Promise<BrandDiscoveryPromptTemplate> {
  const { data } = await apiClient.post<BrandDiscoveryPromptTemplate>(
    `${BRAND_DISCOVERY_PROMPT_PATH}/reset`,
  );
  return data;
}

export async function getLeadDiscoveryPrompt(): Promise<LeadDiscoveryPromptTemplate> {
  const { data } = await apiClient.get<LeadDiscoveryPromptTemplate>(
    LEAD_DISCOVERY_PROMPT_PATH,
  );
  return data;
}

export async function updateLeadDiscoveryPrompt(
  payload: UpdateLeadDiscoveryPromptPayload,
): Promise<LeadDiscoveryPromptTemplate> {
  const { data } = await apiClient.patch<LeadDiscoveryPromptTemplate>(
    LEAD_DISCOVERY_PROMPT_PATH,
    payload,
  );
  return data;
}

export async function resetLeadDiscoveryPrompt(): Promise<LeadDiscoveryPromptTemplate> {
  const { data } = await apiClient.post<LeadDiscoveryPromptTemplate>(
    `${LEAD_DISCOVERY_PROMPT_PATH}/reset`,
  );
  return data;
}

export const aiPromptsService = {
  getIbpPrompt,
  updateIbpPrompt,
  resetIbpPrompt,
  getBrandDiscoveryPrompt,
  updateBrandDiscoveryPrompt,
  resetBrandDiscoveryPrompt,
  getLeadDiscoveryPrompt,
  updateLeadDiscoveryPrompt,
  resetLeadDiscoveryPrompt,
};
