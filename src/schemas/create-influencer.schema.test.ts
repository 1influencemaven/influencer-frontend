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
  instagramRequired: "Instagram is required.",
  instagramMax: "Instagram cannot exceed 100 characters.",
  countryRequired: "Country is required.",
  countryInvalid: "Invalid country.",
  nicheItemMax: "Each niche cannot exceed 100 characters.",
  nichesMax: "Too many niches.",
  quarterYearInvalid: "Invalid year.",
  quartersDuplicate: "Duplicate quarters.",
  outgoingEmailInvalid: "Invalid outgoing email.",
  managerIdRequired: "This field is required.",
  managerIdInvalid: "Invalid manager.",
};

const schema = createCreateInfluencerSchema(messages);
const VALID_MANAGER_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("create-influencer.schema", () => {
  it("accepts PASO 1 payload with Instagram, niches and quarters", () => {
    const result = schema.safeParse({
      name: "Laura Martinez",
      instagram: "@laura",
      countries: ["CO"],
      niches: ["Fitness", "Lifestyle"],
      quarters: [
        { year: 2026, quarter: "Q1" },
        { year: 2025, quarter: "Q4" },
      ],
      managerId: VALID_MANAGER_ID,
      outgoingEmail: "out@agency.com",
    });

    expectParseSuccess(result);
    expect(result.data.countries).toEqual(["CO"]);
    expect(result.data.niches).toEqual(["Fitness", "Lifestyle"]);
    expect(result.data.quarters).toHaveLength(2);
  });

  it("rejects create without country", () => {
    expectRequiredFieldFailure(
      schema.safeParse({
        name: "Laura Martinez",
        instagram: "@laura",
        managerId: VALID_MANAGER_ID,
        countries: [],
      }),
      "countries",
    );
  });

  it("rejects invalid country codes", () => {
    expectFieldError(
      schema.safeParse({
        name: "Laura Martinez",
        instagram: "@laura",
        countries: ["XX"],
        managerId: VALID_MANAGER_ID,
      }),
      "countries",
      messages.countryInvalid,
    );
  });

  describe("managerId validation", () => {
    it("rejects omitted managerId", () => {
      expectRequiredFieldFailure(
        schema.safeParse({
          name: "Laura Martinez",
          instagram: "@laura",
        }),
        "managerId",
      );
    });

    it("rejects managerId undefined", () => {
      expectRequiredFieldFailure(
        schema.safeParse({
          name: "Laura Martinez",
          instagram: "@laura",
          managerId: undefined,
        }),
        "managerId",
      );
    });

    it("rejects empty managerId with managerIdRequired message", () => {
      expectFieldError(
        schema.safeParse({
          name: "Laura Martinez",
          instagram: "@laura",
          managerId: "",
        }),
        "managerId",
        messages.managerIdRequired,
      );
    });

    it("rejects invalid manager UUID with managerIdInvalid message", () => {
      expectFieldError(
        schema.safeParse({
          name: "Laura Martinez",
          instagram: "@laura",
          managerId: "not-a-uuid",
        }),
        "managerId",
        messages.managerIdInvalid,
      );
    });

    it("accepts a valid manager UUID", () => {
      expectParseSuccess(
        schema.safeParse({
          name: "Laura Martinez",
          instagram: "@laura",
          countries: ["ES"],
          managerId: VALID_MANAGER_ID,
        }),
      );
    });
  });

  it("requires name and Instagram", () => {
    expectRequiredFieldFailure(
      schema.safeParse({ name: "", instagram: "@laura" }),
      "name",
    );
    expectFieldError(
      schema.safeParse({ name: "Laura", instagram: "" }),
      "instagram",
      messages.instagramRequired,
    );
  });

  it("rejects duplicate year+quarter pairs", () => {
    expectFieldError(
      schema.safeParse({
        name: "Laura",
        instagram: "@laura",
        quarters: [
          { year: 2026, quarter: "Q1" },
          { year: 2026, quarter: "Q1" },
        ],
      }),
      "quarters",
      messages.quartersDuplicate,
    );
  });

  it("validates outgoing email independently from contact email", () => {
    expectFieldError(
      schema.safeParse({
        name: "Laura",
        instagram: "@laura",
        outgoingEmail: "not-an-email",
      }),
      "outgoingEmail",
      messages.outgoingEmailInvalid,
    );
  });

  it("maps form values to API payload and always includes managerId", () => {
    const values = {
      name: "Laura Martinez",
      instagram: "@laura",
      countries: ["CO"],
      niches: ["Fitness"],
      quarters: [{ year: 2026, quarter: "Q2" as const }],
      managerId: VALID_MANAGER_ID,
      outgoingEmail: "out@agency.com",
    };

    const payload = toCreateInfluencerPayload(values);

    expect(payload).toEqual({
      name: "Laura Martinez",
      instagram: "@laura",
      countries: ["CO"],
      niches: ["Fitness"],
      quarters: [{ year: 2026, quarter: "Q2" }],
      managerId: VALID_MANAGER_ID,
      outgoingEmail: "out@agency.com",
    });
    expect(payload.managerId).toBe(values.managerId);
    expect(payload).toHaveProperty("managerId");
  });

  it("attaches Instagram research evidence without inventing niches", () => {
    const values = {
      name: "PIXEL SPARTAN",
      instagram: "@pixel.vnzla",
      countries: ["VE"],
      niches: [],
      quarters: [],
      managerId: VALID_MANAGER_ID,
      outgoingEmail: "",
    };

    const payload = toCreateInfluencerPayload(values, {
      instagramResearch: {
        source: "brightdata:instagram:gd_x",
        fetchedAt: "2026-11-13T20:00:00.000Z",
        handleNormalized: "pixel.vnzla",
        profileUrl: "https://www.instagram.com/pixel.vnzla/",
        normalized: {
          account: "pixel.vnzla",
          displayName: "PIXEL SPARTAN",
          biography: "Bio",
          followers: 10232,
          following: 1,
          postsCount: 2,
          isPrivate: false,
          isVerified: false,
          emailAddress: null,
          profileImageUrl: null,
          profileUrl: "https://www.instagram.com/pixel.vnzla/",
          externalUrls: [],
          bioHashtags: ["venezuela"],
          postHashtags: ["dancehall"],
        },
      },
    });

    expect(payload.instagramResearch?.normalized.bioHashtags).toEqual([
      "venezuela",
    ]);
    expect(payload).not.toHaveProperty("niches");
    expect(payload.followers).toBeUndefined();
  });
});
