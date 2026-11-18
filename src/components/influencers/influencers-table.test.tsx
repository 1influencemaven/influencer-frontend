/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InfluencersTable } from "@/components/influencers/influencers-table";
import {
  deleteInfluencer,
  listInfluencerManagers,
  listInfluencers,
} from "@/services/influencers.service";
import { createQueryWrapper } from "@/test-utils/query-wrapper";

const influencersMessages = {
  emptyState: "No influencers match the current filters.",
  loadError: "Could not load influencers.",
  retry: "Retry",
  deleteConfirm: "Delete this influencer?",
  deleteConfirmAction: "Confirm",
  deleteCancel: "Cancel",
  deleting: "Deleting...",
  viewAction: "View",
  editAction: "Edit",
  deleteAction: "Delete",
  deleteError: "Could not delete the influencer.",
  deleteNotFound: "The influencer was not found.",
  filters: {
    search: "Search",
    searchPlaceholder: "Search...",
    ibpStatus: "Ideal profile status",
    allStatuses: "All statuses",
    country: "Country",
    countryPlaceholder: "ES",
    language: "Language",
    languagePlaceholder: "es",
    niche: "Niche",
    nichePlaceholder: "Fitness",
    niches: "Niches",
    nichesPlaceholder: "Fitness",
    manager: "Manager",
    allManagers: "All managers",
    year: "Year",
    yearPlaceholder: "2026",
    quarter: "Quarter",
    allQuarters: "All",
    exactMatchHint: "Exact match required.",
    clear: "Clear filters",
  },
  pagination: {
    summary: "Page 1 of 1 · 1 influencers",
    pageSize: "Per page",
    previous: "Previous",
    next: "Next",
  },
  ibpStatus: {
    DRAFT: "Draft",
    PROCESSING: "Processing",
    ACTIVE: "Active",
    FAILED: "Failed",
    none: "No profile",
  },
  columns: {
    name: "Name",
    instagram: "Instagram",
    niches: "Niches",
    manager: "Manager",
    niche: "Niche",
    followers: "Followers",
    engagement: "Engagement",
    ibpStatus: "Ideal profile",
    createdAt: "Created",
    actions: "Actions",
  },
};

const translateInfluencers = (key: string) => {
  if (key.startsWith("columns.")) {
    const column = key.replace("columns.", "");
    return influencersMessages.columns[
      column as keyof typeof influencersMessages.columns
    ];
  }

  if (key.startsWith("filters.")) {
    const filter = key.replace("filters.", "");
    return influencersMessages.filters[
      filter as keyof typeof influencersMessages.filters
    ];
  }

  if (key.startsWith("pagination.")) {
    const paginationKey = key.replace("pagination.", "");
    return influencersMessages.pagination[
      paginationKey as keyof typeof influencersMessages.pagination
    ];
  }

  if (key.startsWith("ibpStatus.")) {
    const status = key.replace("ibpStatus.", "");
    return influencersMessages.ibpStatus[
      status as keyof typeof influencersMessages.ibpStatus
    ];
  }

  return influencersMessages[key as keyof typeof influencersMessages] ?? key;
};

jest.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    if (namespace === "IdealBrandProfile.status") {
      return (
        influencersMessages.ibpStatus[
          key as keyof typeof influencersMessages.ibpStatus
        ] ?? key
      );
    }

    return translateInfluencers(key);
  },
  useLocale: () => "en",
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

jest.mock("../../services/influencers.service", () => ({
  listInfluencers: jest.fn(),
  listInfluencerManagers: jest.fn(),
  deleteInfluencer: jest.fn(),
}));

const mockedListInfluencers = jest.mocked(listInfluencers);
const mockedListManagers = jest.mocked(listInfluencerManagers);
const mockedDeleteInfluencer = jest.mocked(deleteInfluencer);

const influencer = {
  id: "inf-1",
  name: "Laura Martinez",
  instagram: "@laura",
  instagramNormalized: "laura",
  tiktok: null,
  youtube: null,
  country: "ES",
  language: "es",
  niche: "Fitness",
  subNiche: null,
  niches: ["Fitness"],
  followers: 180000,
  engagement: "4.50",
  email: "laura@example.com",
  outgoingEmail: "out@agency.com",
  mediaKitUrl: null,
  managerId: "mgr-1",
  manager: {
    id: "mgr-1",
    name: "Ana Manager",
    email: "ana@example.com",
    role: "ADMIN",
  },
  quarterAssignments: [],
  idealBrandProfile: null,
  createdAt: "2026-06-01T10:00:00.000Z",
  updatedAt: "2026-06-01T10:00:00.000Z",
};

describe("InfluencersTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedListManagers.mockResolvedValue([
      {
        id: "mgr-1",
        name: "Ana Manager",
        email: "ana@example.com",
        role: "ADMIN",
      },
    ]);
  });

  it("renders empty state when there are no influencers", async () => {
    mockedListInfluencers.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    const { Wrapper } = createQueryWrapper();
    render(<InfluencersTable />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(influencersMessages.emptyState)).toBeInTheDocument();
    });
  });

  it("renders catalog rows with niches and manager filters", async () => {
    const user = userEvent.setup();

    mockedListInfluencers.mockResolvedValue({
      data: [influencer],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    mockedDeleteInfluencer.mockResolvedValue({
      message: "Influencer deleted successfully",
    });

    const { Wrapper } = createQueryWrapper();
    render(<InfluencersTable />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Laura Martinez")).toBeInTheDocument();
      expect(screen.getByText("@laura")).toBeInTheDocument();
      expect(screen.getAllByText("Fitness").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Ana Manager").length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Manager")).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText("Manager"), "mgr-1");

    await waitFor(() => {
      expect(mockedListInfluencers).toHaveBeenCalledWith(
        expect.objectContaining({ managerId: "mgr-1" }),
      );
    });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText(influencersMessages.deleteConfirm)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: influencersMessages.deleteConfirmAction }),
    );

    await waitFor(() => {
      expect(mockedDeleteInfluencer).toHaveBeenCalledWith("inf-1");
    });
  });

  it("renders retry action on load error", async () => {
    mockedListInfluencers.mockRejectedValue({
      status: 500,
      message: influencersMessages.loadError,
    });

    const { Wrapper } = createQueryWrapper();
    render(<InfluencersTable />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(influencersMessages.loadError)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    });
  });
});
