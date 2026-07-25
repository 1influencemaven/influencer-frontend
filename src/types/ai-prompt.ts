export type IbpPromptTemplate = {
  id: string;
  instructions: string;
  updatedById: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  isDefault: boolean;
};

export type BrandDiscoveryPromptTemplate = {
  id: string;
  instructions: string;
  updatedById: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  isDefault: boolean;
};

export type UpdateIbpPromptPayload = {
  instructions: string;
};

export type UpdateBrandDiscoveryPromptPayload = {
  instructions: string;
};
