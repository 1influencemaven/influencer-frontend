import { z } from "zod";

import type { CreateInfluencerPayload } from "@/types/influencer";

export type CreateInfluencerSchemaMessages = {
  nameRequired: string;
  nameMin: string;
  nameMax: string;
  instagramMax: string;
  tiktokMax: string;
  youtubeMax: string;
  countryLength: string;
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

function toOptionalNumber(value: unknown): number | undefined {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function createCreateInfluencerSchema(
  messages: CreateInfluencerSchemaMessages,
) {
  return z.object({
    name: z
      .string()
      .min(1, messages.nameRequired)
      .min(2, messages.nameMin)
      .max(200, messages.nameMax),
    instagram: optionalString.refine(
      (value) => !value || value.length <= 255,
      messages.instagramMax,
    ),
    tiktok: optionalString.refine(
      (value) => !value || value.length <= 255,
      messages.tiktokMax,
    ),
    youtube: optionalString.refine(
      (value) => !value || value.length <= 255,
      messages.youtubeMax,
    ),
    country: optionalString.refine(
      (value) => !value || value.length === 2,
      messages.countryLength,
    ),
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
    followers: z.preprocess(
      toOptionalNumber,
      z
        .number({ invalid_type_error: messages.followersInt })
        .int(messages.followersInt)
        .min(0, messages.followersMin)
        .optional(),
    ),
    engagement: z.preprocess(
      toOptionalNumber,
      z
        .number({ invalid_type_error: messages.engagementDecimals })
        .min(0, messages.engagementMin)
        .max(100, messages.engagementMax)
        .refine(
          (value) => {
            const decimals = value.toString().split(".")[1];
            return !decimals || decimals.length <= 2;
          },
          messages.engagementDecimals,
        )
        .optional(),
    ),
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

export type CreateInfluencerFormValues = z.infer<
  ReturnType<typeof createCreateInfluencerSchema>
>;

export function toCreateInfluencerPayload(
  values: CreateInfluencerFormValues,
): CreateInfluencerPayload {
  const payload: CreateInfluencerPayload = {
    name: values.name.trim(),
  };

  const optionalFields: (keyof CreateInfluencerFormValues)[] = [
    "instagram",
    "tiktok",
    "youtube",
    "country",
    "language",
    "niche",
    "subNiche",
    "email",
    "mediaKitUrl",
  ];

  for (const field of optionalFields) {
    const value = values[field];
    if (typeof value === "string" && value.trim()) {
      payload[field] = value.trim();
    }
  }

  if (values.followers !== undefined) {
    payload.followers = values.followers;
  }

  if (values.engagement !== undefined) {
    payload.engagement = values.engagement;
  }

  return payload;
}
