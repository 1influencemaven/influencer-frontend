import {
  createCreateInfluencerSchema,
  toCreateInfluencerPayload,
} from "@/schemas/create-influencer.schema";
import {
  expectFieldError,
  expectParseSuccess,
  expectRequiredFieldFailure,
} from "@/schemas/schema-test-utils";

const messages = {
  nameRequired: "Name is required.",
  nameMin: "Name must be at least 2 characters.",
  nameMax: "Name cannot exceed 200 characters.",
  instagramMax: "Instagram cannot exceed 255 characters.",
  tiktokMax: "TikTok cannot exceed 255 characters.",
  youtubeMax: "YouTube cannot exceed 255 characters.",
  countryLength: "Country must be exactly 2 characters.",
  languageLength: "Language must be exactly 2 characters.",
  nicheMax: "Niche cannot exceed 100 characters.",
  subNicheMax: "Sub-niche cannot exceed 100 characters.",
  followersMin: "Followers must be 0 or greater.",
  followersInt: "Followers must be a whole number.",
  engagementMin: "Engagement must be 0 or greater.",
  engagementMax: "Engagement cannot exceed 100.",
  engagementDecimals: "Engagement allows at most 2 decimal places.",
  emailInvalid: "Enter a valid email address.",
  mediaKitUrlInvalid: "Enter a valid URL.",
  mediaKitUrlMax: "Media kit URL cannot exceed 2048 characters.",
};

const schema = createCreateInfluencerSchema(messages);

describe("create-influencer.schema", () => {
  it("accepts a valid payload", () => {
    const result = schema.safeParse({
      name: "Laura Martinez",
      instagram: "@laura",
      country: "ES",
      language: "es",
      followers: 1000,
      engagement: 4.5,
      email: "laura@example.com",
      mediaKitUrl: "https://example.com/mediakit",
    });

    expectParseSuccess(result);
    expect(result.data.name).toBe("Laura Martinez");
  });

  it("requires name with minimum length", () => {
    expectRequiredFieldFailure(schema.safeParse({ name: "" }), "name");
    expectFieldError(
      schema.safeParse({ name: "A" }),
      "name",
      messages.nameMin,
    );
  });

  it("validates country and language length", () => {
    expectFieldError(
      schema.safeParse({ name: "Laura Martinez", country: "ESP" }),
      "country",
      messages.countryLength,
    );
    expectFieldError(
      schema.safeParse({ name: "Laura Martinez", language: "spa" }),
      "language",
      messages.languageLength,
    );
  });

  it("validates engagement range and decimals", () => {
    expectFieldError(
      schema.safeParse({ name: "Laura Martinez", engagement: 101 }),
      "engagement",
      messages.engagementMax,
    );
    expectFieldError(
      schema.safeParse({ name: "Laura Martinez", engagement: 1.234 }),
      "engagement",
      messages.engagementDecimals,
    );
  });

  it("maps form values to API payload", () => {
    const payload = toCreateInfluencerPayload({
      name: "Laura Martinez",
      instagram: "@laura",
      tiktok: "",
      youtube: "",
      country: "ES",
      language: "es",
      niche: "",
      subNiche: "",
      followers: 1000,
      engagement: 4.5,
      email: "",
      mediaKitUrl: "",
    });

    expect(payload).toEqual({
      name: "Laura Martinez",
      instagram: "@laura",
      country: "ES",
      language: "es",
      followers: 1000,
      engagement: 4.5,
    });
  });
});
