export const IBP_STATUSES = [
  "DRAFT",
  "PROCESSING",
  "ACTIVE",
  "FAILED",
] as const;

export type IbpStatus = (typeof IBP_STATUSES)[number];

export type InterpretationConfidence = "low" | "medium" | "high";

export type InterpretationEvidenceRef = {
  fieldPath: string;
  value: string | number | boolean | null;
  note?: string;
};

export type InterpretationProfileSummary = {
  text: string;
  confidence: InterpretationConfidence;
  evidence: InterpretationEvidenceRef[];
};

export type InterpretationClassificationItem = {
  label: string;
  rationale: string;
  confidence: InterpretationConfidence;
  evidence: InterpretationEvidenceRef[];
};

export type CommercialSignalType =
  | "brand_reference"
  | "product_reference"
  | "sponsorship_disclosure"
  | "affiliate_or_discount"
  | "business_contact"
  | "commercial_intent";

export type InterpretationCommercialSignal = {
  type: CommercialSignalType;
  label: string;
  rationale: string;
  confidence: InterpretationConfidence;
  evidence: InterpretationEvidenceRef[];
  disclaimer?: string;
};

/** HU-TM-004 block persisted under IdealBrandProfile.metadata.talentInterpretation */
export type TalentInterpretation = {
  outputVersion: "1.0";
  insufficientEvidence: boolean;
  summary: InterpretationProfileSummary | null;
  niches: InterpretationClassificationItem[];
  contentCategories: InterpretationClassificationItem[];
  commercialSignals: InterpretationCommercialSignal[];
  limitations: string[];
};

export type IbpMetadata = {
  provider?: string;
  model?: string;
  lastGeneratedAt?: string;
  promptVersion?: string;
  llmCallCount?: number;
  promptInstructionsHash?: string;
  aiExecution?: Record<string, unknown>;
  talentInterpretation?: TalentInterpretation;
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
