import apiClient from "@/lib/api/client";
import type {
  IbpPromptTemplate,
  UpdateIbpPromptPayload,
} from "@/types/ai-prompt";

const IBP_PROMPT_PATH = "/settings/ibp-prompt";

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

export const aiPromptsService = {
  getIbpPrompt,
  updateIbpPrompt,
  resetIbpPrompt,
};
