import { z } from "zod";

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLines(values: string[]): string {
  return values.join("\n");
}

export const idealBrandProfileFormSchema = z.object({
  targetSectors: z
    .string()
    .min(1, "required")
    .refine((value) => linesToArray(value).length > 0, "required"),
  excludedSectors: z.string(),
  brandSize: z
    .string()
    .min(1, "required")
    .refine((value) => linesToArray(value).length > 0, "required"),
  markets: z
    .string()
    .min(1, "required")
    .refine((value) => linesToArray(value).length > 0, "required"),
  collaborationTypes: z
    .string()
    .min(1, "required")
    .refine((value) => linesToArray(value).length > 0, "required"),
  summary: z.string().min(1, "required").max(2000),
  alertSignals: z.string(),
  desirableCriteria: z.string(),
});

export type IdealBrandProfileFormValues = z.infer<
  typeof idealBrandProfileFormSchema
>;

export function ibpToFormValues(
  profile: import("@/types/ideal-brand-profile").IdealBrandProfile,
): IdealBrandProfileFormValues {
  return {
    targetSectors: arrayToLines(profile.targetSectors),
    excludedSectors: arrayToLines(profile.excludedSectors),
    brandSize: arrayToLines(profile.brandSize),
    markets: arrayToLines(profile.markets),
    collaborationTypes: arrayToLines(profile.collaborationTypes),
    summary: profile.summary,
    alertSignals: arrayToLines(profile.alertSignals),
    desirableCriteria: arrayToLines(profile.desirableCriteria),
  };
}

export function formValuesToPayload(
  values: IdealBrandProfileFormValues,
): import("@/types/ideal-brand-profile").UpdateIdealBrandProfilePayload {
  return {
    targetSectors: linesToArray(values.targetSectors),
    excludedSectors: linesToArray(values.excludedSectors),
    brandSize: linesToArray(values.brandSize),
    markets: linesToArray(values.markets),
    collaborationTypes: linesToArray(values.collaborationTypes),
    summary: values.summary.trim(),
    alertSignals: linesToArray(values.alertSignals),
    desirableCriteria: linesToArray(values.desirableCriteria),
  };
}

export { linesToArray, arrayToLines };
