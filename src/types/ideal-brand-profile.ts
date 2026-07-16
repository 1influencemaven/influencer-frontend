export const IBP_STATUSES = [
  "DRAFT",
  "PROCESSING",
  "ACTIVE",
  "FAILED",
] as const;

export type IbpStatus = (typeof IBP_STATUSES)[number];

export type IbpMetadata = {
  provider?: string;
  model?: string;
  lastGeneratedAt?: string;
  promptVersion?: string;
};

export type IdealBrandProfile = {
  id: string;
  influencerId: string;
  status: IbpStatus;
  targetSectors: string[];
  excludedSectors: string[];
  brandSize: string[];
  markets: string[];
  collaborationTypes: string[];
  summary: string;
  alertSignals: string[];
  desirableCriteria: string[];
  metadata: IbpMetadata | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateIdealBrandProfilePayload = {
  targetSectors: string[];
  excludedSectors: string[];
  brandSize: string[];
  markets: string[];
  collaborationTypes: string[];
  summary: string;
  alertSignals: string[];
  desirableCriteria: string[];
};

export type GenerateIbpResponse = {
  message: string;
  influencerId: string;
  status: IbpStatus;
};
