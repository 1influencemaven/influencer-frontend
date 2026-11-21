import {
  getActiveChannelByType,
  getActiveChannelsOrdered,
  getActiveEmailChannels,
  hasActiveEmailChannel,
} from "./lead-contact-channels";
import type { ContactChannel } from "@/types/lead-discovery";

function channel(
  type: ContactChannel["type"],
  overrides: Partial<ContactChannel> = {},
): ContactChannel {
  return {
    id: `c-${type}`,
    leadId: "l1",
    type,
    value: type === "EMAIL" ? "a@b.com" : "https://example.com",
    status: "ACTIVE",
    source: "LINKEDIN_SCRAPER",
    sourceUrl: null,
    isGeneric: null,
    metadata: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "",
    ...overrides,
  };
}

describe("lead-contact-channels", () => {
  it("orders active channels LINKEDIN, EMAIL, WEBSITE", () => {
    const channels = [
      channel("WEBSITE", { id: "w", createdAt: "2026-01-03T00:00:00.000Z" }),
      channel("EMAIL", { id: "e", createdAt: "2026-01-02T00:00:00.000Z" }),
      channel("LINKEDIN", { id: "l", createdAt: "2026-01-01T00:00:00.000Z" }),
    ];

    expect(getActiveChannelsOrdered(channels).map((c) => c.id)).toEqual([
      "l",
      "e",
      "w",
    ]);
  });

  it("excludes inactive channels", () => {
    const channels = [
      channel("EMAIL", { status: "INVALID" }),
      channel("LINKEDIN"),
    ];

    expect(getActiveChannelsOrdered(channels)).toHaveLength(1);
    expect(getActiveChannelByType(channels, "EMAIL")).toBeUndefined();
  });

  it("returns all active email channels", () => {
    const channels = [
      channel("EMAIL", { id: "e1", value: "a@b.com" }),
      channel("EMAIL", {
        id: "e2",
        value: "info@acme.com",
        createdAt: "2026-01-02T00:00:00.000Z",
      }),
    ];

    expect(getActiveEmailChannels(channels).map((c) => c.id)).toEqual([
      "e1",
      "e2",
    ]);
  });

  it("detects active email presence", () => {
    expect(hasActiveEmailChannel([channel("LINKEDIN")])).toBe(false);
    expect(hasActiveEmailChannel([channel("EMAIL")])).toBe(true);
  });
});
