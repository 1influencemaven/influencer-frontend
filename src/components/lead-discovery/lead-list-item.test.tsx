/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";

import { LeadListItem } from "@/components/lead-discovery/lead-list-item";
import type { LeadDetail } from "@/types/lead-discovery";

jest.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    if (namespace === "LeadDiscovery.outreachReadiness") {
      const labels: Record<string, string> = {
        LIMITED: "Limited",
        PARTIAL: "Partial",
        READY: "Ready",
      };
      return labels[key] ?? key;
    }
    if (namespace === "LeadDiscovery.channels") {
      const labels: Record<string, string> = {
        LINKEDIN: "LinkedIn",
        EMAIL: "Email",
        WEBSITE: "Website",
      };
      return labels[key] ?? key;
    }
    const labels: Record<string, string> = {
      selectForOutreach: "Select for outreach",
      selectedForOutreach: "Selected for outreach",
      approve: "Approve",
      discard: "Discard",
    };
    if (key.startsWith("leadStatus.")) {
      return key.replace("leadStatus.", "");
    }
    return labels[key] ?? key;
  },
}));

jest.mock("../../i18n/navigation", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

function baseLeadDetail(overrides: Partial<LeadDetail> = {}): LeadDetail {
  return {
    id: "l1",
    status: "APPROVED",
    selectedForOutreach: false,
    person: {
      name: "Ada Lovelace",
      position: "CMO",
      company: "Acme",
    },
    contactChannels: [
      {
        id: "c1",
        leadId: "l1",
        type: "LINKEDIN",
        value: "https://linkedin.com/in/ada",
        status: "ACTIVE",
        source: "LINKEDIN_SCRAPER",
        sourceUrl: null,
        isGeneric: null,
        metadata: null,
        createdAt: "",
        updatedAt: "",
      },
    ],
    outreachReadiness: "PARTIAL",
    email: null,
    profileUrl: "https://linkedin.com/in/ada",
    ...overrides,
  };
}

describe("LeadListItem", () => {
  it("links to lead detail page", () => {
    render(
      <LeadListItem
        lead={baseLeadDetail()}
        isUpdating={false}
        onApprove={jest.fn()}
        onDiscard={jest.fn()}
        onSelectForOutreach={jest.fn()}
        onDeselectForOutreach={jest.fn()}
      />,
    );

    const link = screen.getByRole("link", { name: /Ada Lovelace/i });
    expect(link).toHaveAttribute("href", "/dashboard/leads/l1");
  });

  it("shows person and company without email address", () => {
    render(
      <LeadListItem
        lead={baseLeadDetail({ email: null })}
        isUpdating={false}
        onApprove={jest.fn()}
        onDiscard={jest.fn()}
        onSelectForOutreach={jest.fn()}
        onDeselectForOutreach={jest.fn()}
      />,
    );

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });
});
