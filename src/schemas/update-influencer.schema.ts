import { z } from "zod";

import {
  createCreateInfluencerSchema,
  type CreateInfluencerSchemaMessages,
} from "@/schemas/create-influencer.schema";
import type { UpdateInfluencerPayload } from "@/types/influencer";

export function createUpdateInfluencerSchema(
  messages: CreateInfluencerSchemaMessages,
) {
  return createCreateInfluencerSchema(messages).partial().extend({
    name: z
      .string()
      .min(1, messages.nameRequired)
      .min(2, messages.nameMin)
      .max(200, messages.nameMax)
      .optional(),
  });
}

export type UpdateInfluencerFormValues = z.infer<
  ReturnType<typeof createUpdateInfluencerSchema>
>;

const optionalStringFields = [
  "instagram",
  "tiktok",
  "youtube",
  "country",
  "language",
  "niche",
  "subNiche",
  "email",
  "mediaKitUrl",
] as const;

export function toUpdateInfluencerPayload(
  values: UpdateInfluencerFormValues,
): UpdateInfluencerPayload {
  const payload: UpdateInfluencerPayload = {};

  if (values.name !== undefined && values.name.trim()) {
    payload.name = values.name.trim();
  }

  for (const field of optionalStringFields) {
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
