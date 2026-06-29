/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InfluencersTable } from "@/components/influencers/influencers-table";
import { deleteInfluencer, listInfluencers } from "@/services/influencers.service";

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
    profileStatus: "Profile status",
    allStatuses: "All statuses",
    country: "Country",
    countryPlaceholder: "ES",
    language: "Language",
    languagePlaceholder: "es",
    niche: "Niche",
    nichePlaceholder: "Fitness",
    exactMatchHint: "Exact match required.",
    clear: "Clear filters",
  },
  pagination: {
    summary: "Page 1 of 1 · 1 influencers",
    pageSize: "Per page",
    previous: "Previous",
    next: "Next",
  },
  profileStatus: {
    PENDING: "Pending",
    PROCESSING: "Processing",
    COMPLETED: "Completed",
    FAILED: "Failed",
  },
  columns: {
    name: "Name",
    niche: "Niche",
    followers: "Followers",
    engagement: "Engagement",
    profileStatus: "Status",
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

  if (key.startsWith("profileStatus.")) {
    const status = key.replace("profileStatus.", "");
    return influencersMessages.profileStatus[
      status as keyof typeof influencersMessages.profileStatus
    ];
  }

  return influencersMessages[key as keyof typeof influencersMessages] ?? key;
};

jest.mock("next-intl", () => ({
  useTranslations: () => translateInfluencers,
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
  deleteInfluencer: jest.fn(),
}));

const mockedListInfluencers = jest.mocked(listInfluencers);
const mockedDeleteInfluencer = jest.mocked(deleteInfluencer);

const influencer = {
  id: "inf-1",
  name: "Laura Martinez",
  instagram: "@laura",
  tiktok: null,
  youtube: null,
  country: "ES",
  language: "es",
  niche: "Fitness",
  subNiche: null,
  followers: 180000,
  engagement: "4.50",
  email: "laura@example.com",
  mediaKitUrl: null,
  profileStatus: "PENDING" as const,
  commercialProfile: null,
  createdAt: "2026-06-01T10:00:00.000Z",
  updatedAt: "2026-06-01T10:00:00.000Z",
};

describe("InfluencersTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders empty state when there are no influencers", async () => {
    mockedListInfluencers.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    render(<InfluencersTable />);

    await waitFor(() => {
      expect(screen.getByText(influencersMessages.emptyState)).toBeInTheDocument();
    });
  });

  it("renders influencers and supports inline delete confirmation", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    mockedListInfluencers.mockResolvedValue({
      data: [influencer],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    mockedDeleteInfluencer.mockResolvedValue({
      message: "Influencer deleted successfully",
    });

    render(<InfluencersTable />);

    await waitFor(() => {
      expect(screen.getByText("Laura Martinez")).toBeInTheDocument();
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

    render(<InfluencersTable />);

    await waitFor(() => {
      expect(screen.getByText(influencersMessages.loadError)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    });
  });
});
