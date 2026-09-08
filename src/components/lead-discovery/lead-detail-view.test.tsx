/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LeadDetailView } from "@/components/lead-discovery/lead-detail-view";
import { getLeadById } from "@/services/lead-discovery.service";
import type { ApiError } from "@/types/api-error";
import type { ContactChannel, LeadDetail } from "@/types/lead-discovery";

const messages = {
  detail: {
    back: "Back to leads",
    loading: "Loading lead…",
    notFound: "Lead not found.",
    loadFailed: "Could not load lead.",
    workflowTitle: "Workflow",
    workflowStatus: "Lead status",
    outreachSelected: "Selected for outreach",
    outreachNotSelected: "Not selected for outreach",
  },
  channels: {
    LINKEDIN: "LinkedIn",
    EMAIL: "Email",
    WEBSITE: "Website",
    sectionTitle: "Contact channels",
    empty: "No contact channels found yet.",
    noEmailYet: "No email found yet.",
    openLinkedIn: "Open LinkedIn",
    openWebsite: "Open website",
  },
  email: {
    genericLabel: "Generic company email",
    publicFound: "Public email found",
    foundOnWebsite: "Found on company website",
    copy: "Copy email",
    copied: "Email copied",
    copyFailed: "Could not copy email",
    viewSource: "View source",
  },
  contactability: {
    title: "Outreach readiness",
    LIMITED: "Limited",
    PARTIAL: "Partial",
    READY: "Ready",
    LIMITED_desc: "No contact channels are available yet.",
    PARTIAL_desc: "Some contact channels are available.",
    READY_desc: "Contact channels are available for outreach.",
  },
  outreachReadiness: {
    LIMITED: "Limited",
    PARTIAL: "Partial",
    READY: "Ready",
  },
  leadStatus: {
    UNDER_REVIEW: "Under review",
    APPROVED: "Approved",
    DISCARDED: "Discarded",
    DUPLICATE: "Duplicate",
  },
  selectedForOutreach: "Selected for outreach",
};

jest.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    if (namespace === "LeadDiscovery.detail") {
      return messages.detail[key as keyof typeof messages.detail] ?? key;
    }
    if (namespace === "LeadDiscovery.channels") {
      return messages.channels[key as keyof typeof messages.channels] ?? key;
    }
    if (namespace === "LeadDiscovery.email") {
      return messages.email[key as keyof typeof messages.email] ?? key;
    }
    if (namespace === "LeadDiscovery.contactability") {
      return (
        messages.contactability[
          key as keyof typeof messages.contactability
        ] ?? key
      );
    }
    if (namespace === "LeadDiscovery.outreachReadiness") {
      return (
        messages.outreachReadiness[
          key as keyof typeof messages.outreachReadiness
        ] ?? key
      );
    }
    if (key.startsWith("leadStatus.")) {
      const status = key.replace(
        "leadStatus.",
        "",
      ) as keyof typeof messages.leadStatus;
      return messages.leadStatus[status] ?? key;
    }
    return (
      messages[key as keyof typeof messages] as Record<string, string> | undefined
    )?.[key] ?? key;
  },
}));

jest.mock("../../i18n/navigation", () => ({
  Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("../../services/lead-discovery.service", () => ({
  getLeadById: jest.fn(),
}));

const copyMock = jest.fn();
let copyStatus: "idle" | "success" | "error" = "idle";

jest.mock("../../hooks/use-copy-to-clipboard", () => ({
  useCopyToClipboard: () => ({
    copy: copyMock,
    status: copyStatus,
  }),
}));

const mockedGetLeadById = jest.mocked(getLeadById);

function channel(
  type: ContactChannel["type"],
  overrides: Partial<ContactChannel> = {},
): ContactChannel {
  return {
    id: `c-${type}-${overrides.value ?? type}`,
    leadId: "l1",
    type,
    value:
      type === "EMAIL"
        ? "info@liquid-iv.com"
        : type === "LINKEDIN"
          ? "https://linkedin.com/in/mariano"
          : "https://liquid-iv.com",
    status: "ACTIVE",
    source: type === "EMAIL" ? "PUBLIC_WEB" : "LINKEDIN_SCRAPER",
    sourceUrl:
      type === "EMAIL" ? "https://liquid-iv.com/contact" : null,
    isGeneric: type === "EMAIL" ? true : null,
    metadata: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "",
    ...overrides,
  };
}

function baseLeadDetail(overrides: Partial<LeadDetail> = {}): LeadDetail {
  return {
    id: "l1",
    status: "APPROVED",
    selectedForOutreach: false,
    person: {
      name: "Mariano Said",
      position: "VP Marketing",
      company: "Liquid IV",
    },
    contactChannels: [
      channel("LINKEDIN"),
      channel("WEBSITE", { source: "BRAND_WEBSITE" }),
      channel("EMAIL"),
    ],
    outreachReadiness: "PARTIAL",
    email: "info@liquid-iv.com",
    profileUrl: "https://linkedin.com/in/mariano",
    ...overrides,
  };
}

/** QA Case A — Mariano: LinkedIn + Website + generic email */
const marianoLead = baseLeadDetail();

/** QA Case B — David: LinkedIn + Website, no email */
const davidLead = baseLeadDetail({
  id: "l2",
  person: {
    name: "David Chmiel",
    position: "Director",
    company: "Example Co",
  },
  contactChannels: [
    channel("LINKEDIN", {
      id: "c-li-david",
      value: "https://linkedin.com/in/david",
    }),
    channel("WEBSITE", {
      id: "c-web-david",
      value: "https://example.com",
      source: "BRAND_WEBSITE",
    }),
  ],
  outreachReadiness: "PARTIAL",
  email: null,
});

/** QA Case C — LinkedIn only */
const linkedInOnlyLead = baseLeadDetail({
  id: "l3",
  person: { name: "Solo LinkedIn", position: null, company: "Solo Inc" },
  contactChannels: [channel("LINKEDIN", { id: "c-li-only" })],
  outreachReadiness: "LIMITED",
});

/** QA Case D — Multiple channels */
const multiChannelLead = baseLeadDetail({
  id: "l4",
  contactChannels: [
    channel("LINKEDIN", { id: "c-li-m" }),
    channel("EMAIL", {
      id: "c-em-m",
      value: "partners@acme.com",
      isGeneric: true,
    }),
    channel("EMAIL", {
      id: "c-em-m2",
      value: "jane@acme.com",
      isGeneric: false,
      createdAt: "2026-01-02T00:00:00.000Z",
    }),
    channel("WEBSITE", { id: "c-web-m", source: "BRAND_WEBSITE" }),
  ],
});

describe("LeadDetailView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    copyMock.mockReset();
    copyStatus = "idle";
  });

  it("1. renders lead identity (name, position, company)", async () => {
    mockedGetLeadById.mockResolvedValue(marianoLead);

    render(<LeadDetailView leadId="l1" />);

    expect(await screen.findByRole("heading", { name: "Mariano Said" })).toBeInTheDocument();
    expect(screen.getByText("VP Marketing")).toBeInTheDocument();
    expect(screen.getByText("Liquid IV")).toBeInTheDocument();
  });

  it("2. renders LinkedIn card with external link", async () => {
    mockedGetLeadById.mockResolvedValue(marianoLead);

    render(<LeadDetailView leadId="l1" />);

    const link = await screen.findByRole("link", { name: "Open LinkedIn" });
    expect(link).toHaveAttribute("href", "https://linkedin.com/in/mariano");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("3. renders Website card with external link", async () => {
    mockedGetLeadById.mockResolvedValue(marianoLead);

    render(<LeadDetailView leadId="l1" />);

    const link = await screen.findByRole("link", { name: "Open website" });
    expect(link).toHaveAttribute("href", "https://liquid-iv.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("4. renders Email card with address", async () => {
    mockedGetLeadById.mockResolvedValue(marianoLead);

    render(<LeadDetailView leadId="l1" />);

    expect(await screen.findByText("info@liquid-iv.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy email" })).toBeInTheDocument();
  });

  it("5. renders generic email label (Case A — Mariano)", async () => {
    mockedGetLeadById.mockResolvedValue(marianoLead);

    render(<LeadDetailView leadId="l1" />);

    expect(
      await screen.findByText("Generic company email"),
    ).toBeInTheDocument();
    expect(screen.getByText("Found on company website")).toBeInTheDocument();
  });

  it("6. non-generic email does not show Personal/Verified/Confirmed", async () => {
    mockedGetLeadById.mockResolvedValue(
      baseLeadDetail({
        contactChannels: [
          channel("EMAIL", {
            value: "jane@acme.com",
            isGeneric: false,
            sourceUrl: null,
          }),
        ],
      }),
    );

    render(<LeadDetailView leadId="l1" />);

    await screen.findByText("jane@acme.com");
    expect(screen.getByText("Public email found")).toBeInTheDocument();
    expect(screen.queryByText(/Personal email/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Verified/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Confirmed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Direct/i)).not.toBeInTheDocument();
  });

  it("7. copies email on button click", async () => {
    mockedGetLeadById.mockResolvedValue(marianoLead);
    const user = userEvent.setup();

    render(<LeadDetailView leadId="l1" />);

    await user.click(await screen.findByRole("button", { name: "Copy email" }));
    expect(copyMock).toHaveBeenCalledWith("info@liquid-iv.com");
  });

  it("8. shows PARTIAL readiness explanation", async () => {
    mockedGetLeadById.mockResolvedValue(marianoLead);

    render(<LeadDetailView leadId="l1" />);

    expect(
      await screen.findByText("Some contact channels are available."),
    ).toBeInTheDocument();
  });

  it("9. shows LIMITED readiness explanation", async () => {
    mockedGetLeadById.mockResolvedValue(linkedInOnlyLead);

    render(<LeadDetailView leadId="l3" />);

    expect(
      await screen.findByText("No contact channels are available yet."),
    ).toBeInTheDocument();
  });

  it("10. supports READY readiness from backend (test fixture only)", async () => {
    mockedGetLeadById.mockResolvedValue(
      baseLeadDetail({ outreachReadiness: "READY" }),
    );

    render(<LeadDetailView leadId="l1" />);

    expect(
      await screen.findByText(
        "Contact channels are available for outreach.",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Ready").length).toBeGreaterThan(0);
  });

  it("11. shows no-email hint for David (Case B)", async () => {
    mockedGetLeadById.mockResolvedValue(davidLead);

    render(<LeadDetailView leadId="l2" />);

    expect(await screen.findByText("David Chmiel")).toBeInTheDocument();
    expect(screen.getByText("No email found yet.")).toBeInTheDocument();
    expect(screen.queryByText(/incomplete/i)).not.toBeInTheDocument();
  });

  it("12. shows empty state when no channels", async () => {
    mockedGetLeadById.mockResolvedValue(
      baseLeadDetail({ contactChannels: [], outreachReadiness: "LIMITED" }),
    );

    render(<LeadDetailView leadId="l1" />);

    expect(
      await screen.findByText("No contact channels found yet."),
    ).toBeInTheDocument();
    expect(screen.getByText("Mariano Said")).toBeInTheDocument();
  });

  it("13. shows loading state", () => {
    mockedGetLeadById.mockReturnValue(new Promise(() => {}));

    render(<LeadDetailView leadId="l1" />);

    expect(screen.getByText("Loading lead…")).toBeInTheDocument();
  });

  it("14. shows error state", async () => {
    mockedGetLeadById.mockRejectedValue(new Error("Network error"));

    render(<LeadDetailView leadId="l1" />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("15. shows not found state", async () => {
    const notFoundError: ApiError = { status: 404, message: "Not found" };
    mockedGetLeadById.mockRejectedValue(notFoundError);

    render(<LeadDetailView leadId="missing" />);

    expect(await screen.findByText("Lead not found.")).toBeInTheDocument();
  });

  it("16. back link points to brand discovery", async () => {
    mockedGetLeadById.mockResolvedValue(marianoLead);

    render(<LeadDetailView leadId="l1" />);

    const links = await screen.findAllByRole("link", { name: "Back to leads" });
    expect(links[0]).toHaveAttribute("href", "/dashboard/brand-discovery");
  });

  it("17. view source is optional secondary action when sourceUrl exists", async () => {
    mockedGetLeadById.mockResolvedValue(marianoLead);

    render(<LeadDetailView leadId="l1" />);

    const sourceLink = await screen.findByRole("link", { name: "View source" });
    expect(sourceLink).toHaveAttribute(
      "href",
      "https://liquid-iv.com/contact",
    );
    expect(sourceLink).toHaveAttribute("target", "_blank");
    expect(screen.queryByText("PUBLIC_WEB")).not.toBeInTheDocument();
  });

  it("18. i18n section titles resolve", async () => {
    mockedGetLeadById.mockResolvedValue(marianoLead);

    render(<LeadDetailView leadId="l1" />);

    expect(await screen.findByText("Contact channels")).toBeInTheDocument();
    expect(screen.getByText("Outreach readiness")).toBeInTheDocument();
    expect(screen.getByText("Workflow")).toBeInTheDocument();
  });

  it("Case C — LinkedIn-only lead renders", async () => {
    mockedGetLeadById.mockResolvedValue(linkedInOnlyLead);

    render(<LeadDetailView leadId="l3" />);

    expect(await screen.findByText("Solo LinkedIn")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open LinkedIn" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open website" })).not.toBeInTheDocument();
  });

  it("Case D — multiple email channels render", async () => {
    mockedGetLeadById.mockResolvedValue(multiChannelLead);

    render(<LeadDetailView leadId="l4" />);

    await waitFor(() => {
      expect(screen.getByText("partners@acme.com")).toBeInTheDocument();
      expect(screen.getByText("jane@acme.com")).toBeInTheDocument();
    });
    expect(screen.getAllByRole("button", { name: "Copy email" })).toHaveLength(2);
  });
});
