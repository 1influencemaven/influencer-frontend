import {
  createUpdateInfluencerSchema,
  toUpdateInfluencerPayload,
} from "@/schemas/update-influencer.schema";
import {
  expectFieldError,
  expectParseSuccess,
} from "@/schemas/schema-test-utils";

const messages = {
  nameRequired: "Name is required.",
  nameMin: "Name must be at least 2 characters.",
  nameMax: "Name cannot exceed 200 characters.",
  instagramRequired: "Instagram is required.",
  instagramMax: "Instagram cannot exceed 100 characters.",
  countryRequired: "Country required",
  countryInvalid: "Country invalid",
  nicheItemMax: "Each niche cannot exceed 100 characters.",
  nichesMax: "Too many niches.",
  quarterYearInvalid: "Invalid year.",
  quartersDuplicate: "Duplicate quarters.",
  outgoingEmailInvalid: "Invalid outgoing email.",
  managerIdRequired: "This field is required.",
  managerIdInvalid: "Invalid manager.",
  tiktokMax: "TikTok max",
  youtubeMax: "YouTube max",
  countryLength: "Country length",
  languageLength: "Language length",
  nicheMax: "Niche max",
  subNicheMax: "Sub niche max",
  followersMin: "Followers min",
  followersInt: "Followers int",
  engagementMin: "Engagement min",
  engagementMax: "Engagement max",
  engagementDecimals: "Engagement decimals",
  emailInvalid: "Email invalid",
  mediaKitUrlInvalid: "URL invalid",
  mediaKitUrlMax: "URL max",
};

const schema = createUpdateInfluencerSchema(messages);
const VALID_MANAGER_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("update-influencer.schema", () => {
  describe("managerId validation", () => {
    it("accepts omitted managerId", () => {
      expectParseSuccess(schema.safeParse({ name: "Laura Martinez" }));
    });

    it("accepts managerId undefined", () => {
      expectParseSuccess(
        schema.safeParse({
          name: "Laura Martinez",
          managerId: undefined,
        }),
      );
    });

    it("accepts empty string managerId for disconnect", () => {
      expectParseSuccess(
        schema.safeParse({
          name: "Laura Martinez",
          managerId: "",
        }),
      );
    });

    it("accepts a valid manager UUID", () => {
      expectParseSuccess(
        schema.safeParse({
          name: "Laura Martinez",
          managerId: VALID_MANAGER_ID,
        }),
      );
    });

    it("rejects an invalid manager UUID with managerIdInvalid", () => {
      expectFieldError(
        schema.safeParse({
          name: "Laura Martinez",
          managerId: "not-a-uuid",
        }),
        "managerId",
        messages.managerIdInvalid,
      );
    });
  });

  describe("toUpdateInfluencerPayload manager mapping", () => {
    it("does not send manager disconnect when managerId is omitted", () => {
      const payload = toUpdateInfluencerPayload({
        name: "Laura Martinez",
        niches: ["Fitness"],
      });

      expect(payload).toEqual({
        name: "Laura Martinez",
        niches: ["Fitness"],
      });
      expect(payload).not.toHaveProperty("managerId");
    });

    it("maps empty managerId to null for disconnect", () => {
      const payload = toUpdateInfluencerPayload({
        name: "Laura Martinez",
        managerId: "",
      });

      expect(payload).toEqual({
        name: "Laura Martinez",
        managerId: null,
      });
    });

    it("keeps a valid manager UUID in the payload", () => {
      const payload = toUpdateInfluencerPayload({
        name: "Laura Martinez",
        managerId: VALID_MANAGER_ID,
      });

      expect(payload).toEqual({
        name: "Laura Martinez",
        managerId: VALID_MANAGER_ID,
      });
    });
  });

  it("maps TM fields and clears manager with null", () => {
    const payload = toUpdateInfluencerPayload({
      name: "Laura Martinez",
      instagram: "@laura",
      niches: ["Beauty"],
      quarters: [{ year: 2026, quarter: "Q1" }],
      managerId: "",
      outgoingEmail: "out@agency.com",
      email: "legacy@example.com",
    });

    expect(payload).toEqual({
      name: "Laura Martinez",
      instagram: "@laura",
      niches: ["Beauty"],
      quarters: [{ year: 2026, quarter: "Q1" }],
      managerId: null,
      outgoingEmail: "out@agency.com",
      email: "legacy@example.com",
    });
  });

  it("omits EXTERNAL locked fields from the PATCH payload", () => {
    const payload = toUpdateInfluencerPayload(
      {
        name: "Manual Name",
        instagram: "@scraped",
        niches: ["Fitness"],
        outgoingEmail: "manual@agency.com",
        followers: 999,
      },
      {
        lockedFields: new Set(["instagram", "followers"]),
      },
    );

    expect(payload).toEqual({
      name: "Manual Name",
      niches: ["Fitness"],
      outgoingEmail: "manual@agency.com",
    });
  });
});
