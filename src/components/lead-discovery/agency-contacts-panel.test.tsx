/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AgencyContactsPanel } from "@/components/lead-discovery/agency-contacts-panel";
import * as leadDiscoveryService from "@/services/lead-discovery.service";
import type { AgencyContactCommercial } from "@/types/lead-discovery";

jest.mock("../prospects/approve-prospect-button", () => ({
  ApproveProspectButton: () => null,
  ApproveAllButton: () => null,
}));

jest.mock("../../services/lead-discovery.service", () => ({
  listAgencyContacts: jest.fn(),
}));

const messages: Record<string, string> = {
  contactsTitle: "Agency contacts",
  contactsDescription: "Read-only agency contacts",
  loading: "Loading agency contacts…",
  empty: "No visible agency contacts yet for this influencer.",
  missingInfluencer: "Influencer context is required to load agency contacts.",
  retry: "Retry",
  evidence: "Evidence",
  openEvidence: "Open evidence",
  operation: "Source",
  priority: "Priority",
  "contactKind.MAILBOX": "Agency mailbox",
  "contactKind.PERSON": "Person",
  "eligibility.ACTIONABLE": "Actionable",
  "eligibility.VISIBLE_NOT_ACTIONABLE": "Visible — under review",
  "eligibility.VISIBLE_NOT_PRIORITY": "Visible — not priority",
  "agencyRelevance.RELEVANT": "Relevant agency",
  "agencyRelevance.UNDER_REVIEW": "Agency under review",
  "relevance.HIGH": "High — partnerships/creators",
  "relevance.NEUTRAL": "Medium — marketing/press/affiliate",
  "relevance.UNKNOWN": "Unclassified commercial relevance",
  "researchOperation.FIND_AGENCY_EMAILS": "FIND_AGENCY_EMAILS",
  "researchOperation.FIND_AGENCY_PEOPLE": "FIND_AGENCY_PEOPLE",
  "attribution.ATTRIBUTED": "Attributed to agency",
  "attribution.UNATTRIBUTED": "Attribution uncertain",
  "verification.UNVERIFIED": "Not SMTP-verified",
  "verification.VERIFIED": "SMTP-verified",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => messages[key] ?? key,
}));

const listAgencyContacts = jest.mocked(
  leadDiscoveryService.listAgencyContacts,
);

function sampleContact(
  overrides: Partial<AgencyContactCommercial> = {},
): AgencyContactCommercial {
  return {
    agencyId: "agency-1",
    agencyName: "Creator Partners",
    agencyDomain: "creatorpartners.example",
    agencyRelevanceStatus: "RELEVANT",
    agencyContactId: "ac-1",
    contactKind: "MAILBOX",
    email: "partnerships@creatorpartners.example",
    displayName: null,
    title: null,
    label: "Partnerships",
    isGeneric: true,
    commercialRelevance: "HIGH",
    sourceKind: "agency_web",
    provenance: {
      discoveryStatus: "FOUND",
      attributionStatus: "ATTRIBUTED",
      verificationStatus: "UNVERIFIED",
    },
    attributionStatus: "ATTRIBUTED",
    evidence: [
      {
        sourceUrl: "https://creatorpartners.example/contact",
        evidenceSnippet: "partnerships@creatorpartners.example",
        discoveredAt: "2026-01-15T00:00:00.000Z",
      },
    ],
    outreachRole: "Partnerships",
    discoveredAt: "2026-01-15T00:00:00.000Z",
    eligibilityStatus: "ACTIONABLE",
    eligibilityReason: "relevant_high",
    priority: true,
    origin: "AGENCY_CONTACT_RESEARCH",
    track: "2C",
    researchOperation: "FIND_AGENCY_EMAILS",
    ...overrides,
  };
}

describe("AgencyContactsPanel (2C.4.8)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not call the API without influencerId", () => {
    render(<AgencyContactsPanel influencerId={null} />);
    expect(listAgencyContacts).not.toHaveBeenCalled();
    expect(
      screen.getByText("Influencer context is required to load agency contacts."),
    ).toBeInTheDocument();
  });

  it("queries with influencerId and shows loading then MAILBOX", async () => {
    listAgencyContacts.mockResolvedValue([sampleContact()]);
    render(<AgencyContactsPanel influencerId="inf-1" />);
    expect(screen.getByText("Loading agency contacts…")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole("link", {
          name: "partnerships@creatorpartners.example",
        }),
      ).toBeInTheDocument();
    });
    expect(listAgencyContacts).toHaveBeenCalledWith({ influencerId: "inf-1" });
    expect(screen.getByText("Agency mailbox")).toBeInTheDocument();
    expect(screen.getByText("Actionable")).toBeInTheDocument();
    expect(screen.getByText("Priority")).toBeInTheDocument();
    expect(screen.getByText(/FIND_AGENCY_EMAILS/)).toBeInTheDocument();
    expect(screen.getByText(/Not SMTP-verified/)).toBeInTheDocument();
    expect(screen.getByText(/Evidence/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open evidence" }),
    ).toHaveAttribute("href", "https://creatorpartners.example/contact");
  });

  it("renders PERSON with name/title and FIND_AGENCY_PEOPLE", async () => {
    listAgencyContacts.mockResolvedValue([
      sampleContact({
        agencyContactId: "ac-p",
        contactKind: "PERSON",
        email: "alex@creatorpartners.example",
        displayName: "Alex Partner",
        title: "Influencer Marketing",
        isGeneric: false,
        researchOperation: "FIND_AGENCY_PEOPLE",
        sourceKind: "linkedin",
      }),
    ]);
    render(<AgencyContactsPanel influencerId="inf-1" />);
    await waitFor(() => {
      expect(screen.getByText("Alex Partner · Influencer Marketing")).toBeInTheDocument();
    });
    expect(screen.getByText("Person")).toBeInTheDocument();
    expect(screen.getByText(/FIND_AGENCY_PEOPLE/)).toBeInTheDocument();
  });

  it("differentiates eligibility states and groups by agency", async () => {
    listAgencyContacts.mockResolvedValue([
      sampleContact({
        agencyContactId: "ac-a1",
        eligibilityStatus: "ACTIONABLE",
        priority: true,
      }),
      sampleContact({
        agencyId: "agency-2",
        agencyName: "Other Agency",
        agencyDomain: "other.example",
        agencyRelevanceStatus: "UNDER_REVIEW",
        agencyContactId: "ac-b1",
        email: "hello@other.example",
        commercialRelevance: "UNKNOWN",
        eligibilityStatus: "VISIBLE_NOT_ACTIONABLE",
        priority: false,
        researchOperation: "FIND_AGENCY_EMAILS",
        evidence: [
          {
            sourceUrl: "https://other.example/c",
            evidenceSnippet: "hello inbox",
            discoveredAt: "2026-01-15T00:00:00.000Z",
          },
        ],
      }),
    ]);
    render(<AgencyContactsPanel influencerId="inf-1" />);
    await waitFor(() => {
      expect(screen.getByText("Other Agency")).toBeInTheDocument();
    });
    expect(screen.getByText("Creator Partners")).toBeInTheDocument();
    expect(screen.getByText("Visible — under review")).toBeInTheDocument();
    const actionable = screen
      .getByRole("link", { name: "partnerships@creatorpartners.example" })
      .closest("li");
    expect(actionable).toHaveAttribute("data-eligibility", "ACTIONABLE");
    const reviewOnly = screen
      .getByRole("link", { name: "hello@other.example" })
      .closest("li");
    expect(reviewOnly).toHaveAttribute(
      "data-eligibility",
      "VISIBLE_NOT_ACTIONABLE",
    );
  });

  it("shows empty state", async () => {
    listAgencyContacts.mockResolvedValue([]);
    render(<AgencyContactsPanel influencerId="inf-1" />);
    await waitFor(() => {
      expect(
        screen.getByText("No visible agency contacts yet for this influencer."),
      ).toBeInTheDocument();
    });
  });

  it("handles endpoint error and retry", async () => {
    const user = userEvent.setup();
    listAgencyContacts
      .mockRejectedValueOnce({ status: 500, message: "boom" })
      .mockResolvedValueOnce([sampleContact()]);
    render(<AgencyContactsPanel influencerId="inf-1" />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("boom");
    });
    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => {
      expect(
        screen.getByRole("link", {
          name: "partnerships@creatorpartners.example",
        }),
      ).toBeInTheDocument();
    });
  });
});
