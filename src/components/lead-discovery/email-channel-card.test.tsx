/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";

import { EmailChannelCard } from "@/components/lead-discovery/email-channel-card";
import type { ContactChannel } from "@/types/lead-discovery";

let copyStatus: "idle" | "success" | "error" = "idle";

jest.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    if (namespace === "LeadDiscovery.email") {
      const labels: Record<string, string> = {
        genericLabel: "Generic company email",
        publicFound: "Public email found",
        foundOnWebsite: "Found on company website",
        copy: "Copy email",
        copied: "Email copied",
        copyFailed: "Could not copy email",
        viewSource: "View source",
      };
      return labels[key] ?? key;
    }
    return key === "EMAIL" ? "Email" : key;
  },
}));

jest.mock("../../hooks/use-copy-to-clipboard", () => ({
  useCopyToClipboard: () => ({
    copy: jest.fn(),
    status: copyStatus,
  }),
}));

function emailChannel(overrides: Partial<ContactChannel> = {}): ContactChannel {
  return {
    id: "c-email",
    leadId: "l1",
    type: "EMAIL",
    value: "info@acme.com",
    status: "ACTIVE",
    source: "PUBLIC_WEB",
    sourceUrl: "https://acme.com/contact",
    isGeneric: true,
    metadata: null,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("EmailChannelCard", () => {
  beforeEach(() => {
    copyStatus = "idle";
  });

  it("shows copied feedback when copy succeeds", () => {
    copyStatus = "success";
    render(<EmailChannelCard channel={emailChannel()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Email copied");
  });

  it("shows view source only when sourceUrl exists", () => {
    render(<EmailChannelCard channel={emailChannel()} />);
    expect(screen.getByRole("link", { name: "View source" })).toHaveAttribute(
      "href",
      "https://acme.com/contact",
    );
  });

  it("hides view source when sourceUrl is missing", () => {
    render(<EmailChannelCard channel={emailChannel({ sourceUrl: null })} />);
    expect(screen.queryByRole("link", { name: "View source" })).not.toBeInTheDocument();
  });
});
