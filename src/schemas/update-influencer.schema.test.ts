import { toUpdateInfluencerPayload } from "@/schemas/update-influencer.schema";

describe("update-influencer.schema", () => {
  it("omits empty optional strings so backend validation does not fail", () => {
    const payload = toUpdateInfluencerPayload({
      name: "Laura Martinez",
      instagram: "",
      tiktok: "",
      youtube: "",
      country: "",
      language: "",
      niche: "Fitness",
      subNiche: "",
      email: "",
      mediaKitUrl: "",
      followers: undefined,
      engagement: undefined,
    });

    expect(payload).toEqual({
      name: "Laura Martinez",
      niche: "Fitness",
    });
  });

  it("includes trimmed optional values when present", () => {
    const payload = toUpdateInfluencerPayload({
      name: "Laura Martinez",
      instagram: " @laura ",
      country: "ES",
      language: "es",
      email: "laura@example.com",
      mediaKitUrl: "https://example.com/mediakit",
      followers: 180000,
      engagement: 4.5,
    });

    expect(payload).toEqual({
      name: "Laura Martinez",
      instagram: "@laura",
      country: "ES",
      language: "es",
      email: "laura@example.com",
      mediaKitUrl: "https://example.com/mediakit",
      followers: 180000,
      engagement: 4.5,
    });
  });
});
