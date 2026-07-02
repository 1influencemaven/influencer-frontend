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

const optionalNumericInput = z.union([z.string(), z.number()]).optional();

function parseOptionalNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function optionalIntField(
  messages: Pick<CreateInfluencerSchemaMessages, "followersMin" | "followersInt">,
) {
  return optionalNumericInput
    .refine(
      (value) => {
        if (value === undefined || value === "") return true;
        return parseOptionalNumber(value) !== undefined;
      },
      messages.followersInt,
    )
    .refine(
      (value) => {
        if (value === undefined || value === "") return true;
        const parsed = parseOptionalNumber(value);
        return parsed !== undefined && Number.isInteger(parsed);
      },
      messages.followersInt,
    )
    .refine(
      (value) => {
        if (value === undefined || value === "") return true;
        const parsed = parseOptionalNumber(value);
        return parsed !== undefined && parsed >= 0;
      },
      messages.followersMin,
    )
    .transform((value) => parseOptionalNumber(value));
}

function optionalEngagementField(
  messages: Pick<
    CreateInfluencerSchemaMessages,
    "engagementMin" | "engagementMax" | "engagementDecimals"
  >,
) {
  return optionalNumericInput
    .refine(
      (value) => {
        if (value === undefined || value === "") return true;
        return parseOptionalNumber(value) !== undefined;
      },
      messages.engagementDecimals,
    )
    .refine(
      (value) => {
        if (value === undefined || value === "") return true;
        const parsed = parseOptionalNumber(value);
        return parsed !== undefined && parsed >= 0;
      },
      messages.engagementMin,
    )
    .refine(
      (value) => {
        if (value === undefined || value === "") return true;
        const parsed = parseOptionalNumber(value);
        return parsed !== undefined && parsed <= 100;
      },
      messages.engagementMax,
    )
    .refine(
      (value) => {
        if (value === undefined || value === "") return true;
        const parsed = parseOptionalNumber(value);
        if (parsed === undefined) return true;
        const decimals = parsed.toString().split(".")[1];
        return !decimals || decimals.length <= 2;
      },
      messages.engagementDecimals,
    )
    .transform((value) => parseOptionalNumber(value));
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
    followers: optionalIntField(messages),
    engagement: optionalEngagementField(messages),
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

export type CreateInfluencerFormInput = z.input<
  ReturnType<typeof createCreateInfluencerSchema>
>;

export type CreateInfluencerFormValues = z.output<
  ReturnType<typeof createCreateInfluencerSchema>
>;

export function toCreateInfluencerPayload(
  values: CreateInfluencerFormValues,
): CreateInfluencerPayload {
  const payload: CreateInfluencerPayload = {
    name: values.name.trim(),
  };

  const optionalFields = [
    "instagram",
    "tiktok",
    "youtube",
    "country",
    "language",
    "niche",
    "subNiche",
    "email",
    "mediaKitUrl",
  ] as const satisfies ReadonlyArray<keyof CreateInfluencerFormValues>;

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
