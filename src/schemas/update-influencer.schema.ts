import { z } from "zod";

import { isIsoCountryCode } from "@/lib/countries";
import {
  createCreateInfluencerSchema,
  type CreateInfluencerSchemaMessages,
} from "@/schemas/create-influencer.schema";
import type {
  InfluencerFieldKey,
  InfluencerQuarter,
  UpdateInfluencerPayload,
} from "@/types/influencer";

export type UpdateInfluencerSchemaMessages = CreateInfluencerSchemaMessages & {
  tiktokMax: string;
  youtubeMax: string;
  countryLength: string;
  countryInvalid: string;
  languageLength: string;
  nicheMax: string;
  subNicheMax: string;
  followersMin: string;
  followersInt: string;
  engagementMin: string;
  engagementMax: string;
  engagementDecimals: string;
  emailInvalid: string;
  mediaKitUrlInvalid: string;
  mediaKitUrlMax: string;
};

const optionalString = z.string().optional().or(z.literal(""));
const optionalNumericInput = z.union([z.string(), z.number()]).optional();

function parseOptionalNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function createUpdateInfluencerSchema(
  messages: UpdateInfluencerSchemaMessages,
) {
  const base = createCreateInfluencerSchema(messages);

  return base.partial().extend({
    name: z
      .string()
      .min(1, messages.nameRequired)
      .min(2, messages.nameMin)
      .max(200, messages.nameMax)
      .optional(),
    instagram: z
      .string()
      .min(1, messages.instagramRequired)
      .max(100, messages.instagramMax)
      .optional(),
    /**
     * Update allows clearing the manager via empty string (mapper → null).
     * Create schema still requires a non-empty UUID.
     */
    managerId: optionalString.refine(
      (value) =>
        !value || z.string().uuid().safeParse(value).success,
      messages.managerIdInvalid,
    ),
    tiktok: optionalString.refine(
      (value) => !value || value.length <= 255,
      messages.tiktokMax,
    ),
    youtube: optionalString.refine(
      (value) => !value || value.length <= 255,
      messages.youtubeMax,
    ),
    countries: z
      .array(
        z
          .string()
          .trim()
          .transform((value) => value.toUpperCase())
          .refine((value) => isIsoCountryCode(value), messages.countryInvalid),
      )
      .min(1, messages.countryRequired)
      .max(30)
      .optional(),
    language: optionalString.refine(
      (value) => !value || value.length === 2,
      messages.languageLength,
    ),
    niche: optionalString.refine(
      (value) => !value || value.length <= 100,
      messages.nicheMax,
    ),
    subNiche: optionalString.refine(
      (value) => !value || value.length <= 100,
      messages.subNicheMax,
    ),
    followers: optionalNumericInput
      .refine(
        (value) => {
          if (value === undefined || value === "") return true;
          const parsed = parseOptionalNumber(value);
          return parsed !== undefined && Number.isInteger(parsed) && parsed >= 0;
        },
        messages.followersInt,
      )
      .transform((value) => parseOptionalNumber(value)),
    engagement: optionalNumericInput
      .refine(
        (value) => {
          if (value === undefined || value === "") return true;
          const parsed = parseOptionalNumber(value);
          if (parsed === undefined) return false;
          if (parsed < 0 || parsed > 100) return false;
          const decimals = parsed.toString().split(".")[1];
          return !decimals || decimals.length <= 2;
        },
        messages.engagementDecimals,
      )
      .transform((value) => parseOptionalNumber(value)),
    email: optionalString.refine(
      (value) => !value || z.string().email().safeParse(value).success,
      messages.emailInvalid,
    ),
    mediaKitUrl: optionalString
      .refine(
        (value) => !value || z.string().url().safeParse(value).success,
        messages.mediaKitUrlInvalid,
      )
      .refine(
        (value) => !value || value.length <= 2048,
        messages.mediaKitUrlMax,
      ),
  });
}

export type UpdateInfluencerFormInput = z.input<
  ReturnType<typeof createUpdateInfluencerSchema>
>;

export type UpdateInfluencerFormValues = z.output<
  ReturnType<typeof createUpdateInfluencerSchema>
>;

const optionalStringFields = [
  "instagram",
  "tiktok",
  "youtube",
  "language",
  "niche",
  "subNiche",
  "email",
  "outgoingEmail",
  "mediaKitUrl",
] as const;

export function toUpdateInfluencerPayload(
  values: UpdateInfluencerFormValues,
  options?: {
    lockedFields?: ReadonlySet<InfluencerFieldKey | string>;
  },
): UpdateInfluencerPayload {
  const locked = options?.lockedFields ?? new Set<string>();
  const payload: UpdateInfluencerPayload = {};

  if (
    values.name !== undefined &&
    values.name.trim() &&
    !locked.has("name")
  ) {
    payload.name = values.name.trim();
  }

  for (const field of optionalStringFields) {
    if (locked.has(field)) {
      continue;
    }

    const value = values[field];
    if (typeof value === "string" && value.trim()) {
      payload[field] = value.trim();
    }
  }

  if (values.countries !== undefined && !locked.has("countries")) {
    payload.countries = values.countries
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean);
  }

  if (values.niches !== undefined && !locked.has("niches")) {
    payload.niches = values.niches.map((niche) => niche.trim()).filter(Boolean);
  }

  if (values.quarters !== undefined) {
    payload.quarters = values.quarters.map((item) => ({
      year: item.year,
      quarter: item.quarter as InfluencerQuarter,
    }));
  }

  if (values.managerId !== undefined && !locked.has("managerId")) {
    payload.managerId = values.managerId.trim()
      ? values.managerId.trim()
      : null;
  }

  if (values.followers !== undefined && !locked.has("followers")) {
    payload.followers = values.followers;
  }

  if (values.engagement !== undefined && !locked.has("engagement")) {
    payload.engagement = values.engagement;
  }

  return payload;
}
