import { z } from "zod";

import { isIsoCountryCode } from "@/lib/countries";
import type {
  CreateInfluencerPayload,
  InfluencerQuarter,
  InstagramResearchCreatePayload,
  QuarterAssignmentInput,
} from "@/types/influencer";
import { INFLUENCER_QUARTERS } from "@/types/influencer";

export type CreateInfluencerSchemaMessages = {
  nameRequired: string;
  nameMin: string;
  nameMax: string;
  instagramRequired: string;
  instagramMax: string;
  countryRequired: string;
  countryInvalid: string;
  nicheItemMax: string;
  nichesMax: string;
  quarterYearInvalid: string;
  quartersDuplicate: string;
  outgoingEmailInvalid: string;
  managerIdRequired: string;
  managerIdInvalid: string;
};

function quarterKey(item: QuarterAssignmentInput): string {
  return `${item.year}:${item.quarter}`;
}

export function createCreateInfluencerSchema(
  messages: CreateInfluencerSchemaMessages,
) {
  const quarterSchema = z.object({
    year: z
      .number()
      .int()
      .min(2000, messages.quarterYearInvalid)
      .max(2100, messages.quarterYearInvalid),
    quarter: z.enum(INFLUENCER_QUARTERS),
  });

  return z.object({
    name: z
      .string()
      .min(1, messages.nameRequired)
      .min(2, messages.nameMin)
      .max(200, messages.nameMax),
    instagram: z
      .string()
      .min(1, messages.instagramRequired)
      .max(100, messages.instagramMax),
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
      .superRefine((items, ctx) => {
        const seen = new Set<string>();
        for (const code of items) {
          if (seen.has(code)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: messages.countryInvalid,
            });
            return;
          }
          seen.add(code);
        }
      }),
    niches: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(100, messages.nicheItemMax),
      )
      .max(50, messages.nichesMax)
      .default([]),
    quarters: z
      .array(quarterSchema)
      .max(40)
      .superRefine((items, ctx) => {
        const seen = new Set<string>();
        for (const item of items) {
          const key = quarterKey(item);
          if (seen.has(key)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: messages.quartersDuplicate,
            });
            return;
          }
          seen.add(key);
        }
      })
      .default([]),
    managerId: z
      .string()
      .min(1, messages.managerIdRequired)
      .refine(
        (value) => z.string().uuid().safeParse(value).success,
        messages.managerIdInvalid,
      ),
    outgoingEmail: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (value) =>
          !value || z.string().email().safeParse(value).success,
        messages.outgoingEmailInvalid,
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
  options?: {
    instagramResearch?: InstagramResearchCreatePayload | null;
  },
): CreateInfluencerPayload {
  const payload: CreateInfluencerPayload = {
    name: values.name.trim(),
    instagram: values.instagram.trim(),
    countries: values.countries.map((code) => code.trim().toUpperCase()),
    managerId: values.managerId.trim(),
  };

  if (values.niches.length > 0) {
    payload.niches = values.niches.map((niche) => niche.trim()).filter(Boolean);
  }

  if (values.quarters.length > 0) {
    payload.quarters = values.quarters.map((item) => ({
      year: item.year,
      quarter: item.quarter as InfluencerQuarter,
    }));
  }

  if (values.outgoingEmail && values.outgoingEmail.trim()) {
    payload.outgoingEmail = values.outgoingEmail.trim();
  }

  if (options?.instagramResearch) {
    payload.instagramResearch = options.instagramResearch;
  }

  return payload;
}

/** Builds the create research package from a username lookup response. */
export function toInstagramResearchCreatePayload(lookup: {
  research: {
    source: string;
    fetchedAt: string;
    handleNormalized: string;
    profileUrl: string;
  };
  normalized: InstagramResearchCreatePayload["normalized"];
}): InstagramResearchCreatePayload {
  return {
    source: lookup.research.source,
    fetchedAt: lookup.research.fetchedAt,
    handleNormalized: lookup.research.handleNormalized,
    profileUrl: lookup.research.profileUrl,
    normalized: lookup.normalized,
  };
}
