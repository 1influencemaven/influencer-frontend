import apiClient from "@/lib/api/client";
import type {
  GenerateIbpResponse,
  IdealBrandProfile,
  UpdateIdealBrandProfilePayload,
} from "@/types/ideal-brand-profile";

function ibpPath(influencerId: string): string {
  return `/influencers/${influencerId}/ideal-brand-profile`;
}

export async function getIdealBrandProfile(
  influencerId: string,
): Promise<IdealBrandProfile> {
  const { data } = await apiClient.get<IdealBrandProfile>(
    ibpPath(influencerId),
  );
  return data;
}

export async function generateIdealBrandProfile(
  influencerId: string,
): Promise<GenerateIbpResponse> {
  const { data } = await apiClient.post<GenerateIbpResponse>(
    `${ibpPath(influencerId)}/generate`,
  );
  return data;
}

export async function regenerateIdealBrandProfile(
  influencerId: string,
): Promise<GenerateIbpResponse> {
  const { data } = await apiClient.post<GenerateIbpResponse>(
    `${ibpPath(influencerId)}/regenerate`,
  );
  return data;
}

export async function saveIdealBrandProfile(
  influencerId: string,
  payload: UpdateIdealBrandProfilePayload,
): Promise<IdealBrandProfile> {
  const { data } = await apiClient.patch<IdealBrandProfile>(
    ibpPath(influencerId),
    payload,
  );
  return data;
}

export const idealBrandProfilesService = {
  getIdealBrandProfile,
  generateIdealBrandProfile,
  regenerateIdealBrandProfile,
  saveIdealBrandProfile,
};
