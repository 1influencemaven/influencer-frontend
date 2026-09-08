/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";

import { ContactChannelSummary } from "@/components/lead-discovery/contact-channel-summary";
import type { ContactChannel } from "@/types/lead-discovery";

jest.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    const labels: Record<string, string> = {
      LINKEDIN: "LinkedIn",
      EMAIL: "Email",
      WEBSITE: "Website",
    };
    return labels[key] ?? key;
  },
}));

function channel(type: ContactChannel["type"]): ContactChannel {
  return {
    id: `c-${type}`,
    leadId: "l1",
    type,
    value: "x",
    status: "ACTIVE",
    source: "LINKEDIN_SCRAPER",
    sourceUrl: null,
    isGeneric: null,
    metadata: null,
    createdAt: "",
    updatedAt: "",
  };
}

describe("ContactChannelSummary", () => {
  it("shows LinkedIn only", () => {
    render(<ContactChannelSummary channels={[channel("LINKEDIN")]} />);
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  it("shows LinkedIn and Website", () => {
    render(
      <ContactChannelSummary
        channels={[channel("LINKEDIN"), channel("WEBSITE")]}
      />,
    );
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument();
  });

  it("shows Email without exposing address", () => {
    render(
      <ContactChannelSummary
        channels={[
          {
            ...channel("EMAIL"),
            value: "secret@company.com",
          },
        ]}
      />,
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.queryByText("secret@company.com")).not.toBeInTheDocument();
  });

  it("shows all three channel labels", () => {
    render(
      <ContactChannelSummary
        channels={[
          channel("LINKEDIN"),
          channel("EMAIL"),
          channel("WEBSITE"),
        ]}
      />,
    );
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument();
  });
});
