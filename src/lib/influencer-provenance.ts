import type {
  InfluencerDataOrigin,
  InfluencerFieldKey,
  InfluencerFieldProvenance,
} from "@/types/influencer";

export function getFieldOrigin(
  provenances: InfluencerFieldProvenance[] | undefined,
  fieldKey: InfluencerFieldKey | string,
): InfluencerDataOrigin | undefined {
  return provenances?.find((row) => row.fieldKey === fieldKey)?.origin;
}

/** EXTERNAL values come from automated sources and must stay read-only in UI. */
export function isExternallyManagedField(
  provenances: InfluencerFieldProvenance[] | undefined,
  fieldKey: InfluencerFieldKey | string,
): boolean {
  return getFieldOrigin(provenances, fieldKey) === "EXTERNAL";
}
