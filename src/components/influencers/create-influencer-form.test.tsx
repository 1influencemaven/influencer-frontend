/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateInfluencerForm } from "@/components/influencers/create-influencer-form";
import {
  createInfluencer,
  getInstagramResearchRun,
  listInfluencerManagers,
  startInstagramUsernameResearch,
} from "@/services/influencers.service";
import { createQueryWrapper } from "@/test-utils/query-wrapper";

const createMessages = {
  nameLabel: "Talent",
  namePlaceholder: "Laura Martinez",
  instagramLabel: "Instagram",
  instagramPlaceholder: "@laura",
  countryLocationLabel: "Country where the talent is located",
  countrySelectPlaceholder: "Select a country",
  nichesLabel: "Niches",
  nichesPlaceholder: "Add niche",
  nichesHint: "Press Enter",
  quartersLabel: "Quarters",
  quarterYearLabel: "Year",
  quartersAdd: "Add",
  quartersEmpty: "No quarters",
  managerLabel: "Manager",
  managerPlaceholder: "Select manager",
  managerLoading: "Loading managers",
  managerEmpty: "No managers",
  outgoingEmailLabel: "Outgoing email",
  outgoingEmailPlaceholder: "out@agency.com",
  externalLockedHint: "Read-only",
  submit: "Create talent",
  submitting: "Creating talent...",
  cancel: "Cancel",
  errors: {
    nameRequired: "Name is required.",
    nameMin: "Name must be at least 2 characters.",
    nameMax: "Name cannot exceed 200 characters.",
    instagramRequired: "Instagram is required.",
    instagramMax: "Instagram cannot exceed 100 characters.",
    countryRequired: "Select the country where the talent is located.",
    countryInvalid: "Select a valid country from the list.",
    nicheItemMax: "Niche too long.",
    nichesMax: "Too many niches.",
    quarterYearInvalid: "Invalid year.",
    quartersDuplicate: "Duplicate quarters.",
    outgoingEmailInvalid: "Invalid outgoing email.",
    managerIdRequired: "This field is required.",
    managerIdInvalid: "Invalid manager.",
    instagramConflict: "Instagram already exists.",
    generic: "Could not create the influencer.",
  },
};

const lookupMessages = {
  title: "Research Instagram username",
  description: "Look up first",
  usernameLabel: "Instagram username",
  usernamePlaceholder: "belu.deltoro",
  action: "Research profile",
  researching: "Researching…",
  found: "Profile found.",
  private: "Private.",
  notFound: "Not found.",
  incomplete: "Incomplete.",
  timeout: "Timeout.",
  notConfigured: "Not configured.",
  invalidUsername: "Invalid.",
  inProgress: "In progress.",
  duplicate: "Duplicate.",
  error: "Error.",
  previewAccount: "Account",
  previewName: "Display name",
  previewFollowers: "Followers",
  previewFollowing: "Following",
  previewPosts: "Posts",
  previewFlags: "Visibility",
  flagPrivate: "Private",
  flagPublic: "Public",
  flagVerified: "Verified",
  flagUnverified: "Not verified",
  previewBio: "Biography",
  previewBioHashtags: "Bio hashtags",
  previewPostHashtags: "Post hashtags",
  notPersistedHint: "Not saved yet.",
  hashtagsNotNichesHint: "Hashtags are evidence only.",
};

jest.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: (namespace: string) => {
    if (namespace === "CreateInfluencer") {
      return (key: string) => {
        if (key.startsWith("errors.")) {
          const errorKey = key.replace("errors.", "");
          return createMessages.errors[
            errorKey as keyof typeof createMessages.errors
          ];
        }

        return createMessages[key as keyof typeof createMessages] ?? key;
      };
    }

    if (namespace === "CreateInfluencer.errors") {
      return (key: string) =>
        createMessages.errors[key as keyof typeof createMessages.errors] ?? key;
    }

    if (namespace === "CreateInfluencer.instagramLookup") {
      return (key: string) =>
        lookupMessages[key as keyof typeof lookupMessages] ?? key;
    }

    return (key: string) => key;
  },
}));

const replace = jest.fn();

jest.mock("../../i18n/navigation", () => ({
  Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
  useRouter: () => ({ replace }),
}));

jest.mock("../../services/influencers.service", () => ({
  createInfluencer: jest.fn(),
  listInfluencerManagers: jest.fn(),
  startInstagramUsernameResearch: jest.fn(),
  getInstagramResearchRun: jest.fn(),
}));

const mockedCreateInfluencer = jest.mocked(createInfluencer);
const mockedListManagers = jest.mocked(listInfluencerManagers);
const mockedStartResearch = jest.mocked(startInstagramUsernameResearch);
const mockedGetResearchRun = jest.mocked(getInstagramResearchRun);

describe("CreateInfluencerForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedListManagers.mockResolvedValue([
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Ana",
        email: "ana@example.com",
        role: "ADMIN",
      },
    ]);
  });

  it("validates required Instagram before submit", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createQueryWrapper();

    render(<CreateInfluencerForm />, { wrapper: Wrapper });

    await user.type(screen.getByLabelText("Talent"), "Laura Martinez");
    await user.click(screen.getByRole("button", { name: "Create talent" }));

    await waitFor(() => {
      expect(screen.getByText("Instagram is required.")).toBeInTheDocument();
    });
    expect(mockedCreateInfluencer).not.toHaveBeenCalled();
  });

  it("validates required country before submit", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createQueryWrapper();

    render(<CreateInfluencerForm />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByLabelText("Manager")).toBeEnabled();
    });

    await user.type(screen.getByLabelText("Talent"), "Laura Martinez");
    await user.type(screen.getByLabelText("Instagram username"), "@laura");
    await user.selectOptions(
      screen.getByLabelText("Manager"),
      "550e8400-e29b-41d4-a716-446655440000",
    );
    await user.click(screen.getByRole("button", { name: "Create talent" }));

    await waitFor(() => {
      expect(
        screen.getByText("Select the country where the talent is located."),
      ).toBeInTheDocument();
    });
    expect(mockedCreateInfluencer).not.toHaveBeenCalled();
  });

  it("submits PASO 1 data with manager, niches and quarters", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createQueryWrapper();

    mockedCreateInfluencer.mockResolvedValue({
      id: "inf-1",
      name: "Laura Martinez",
      instagram: "@laura",
      instagramNormalized: "laura",
      tiktok: null,
      youtube: null,
      countries: ["CO"],
      language: null,
      niche: null,
      subNiche: null,
      niches: ["Fitness"],
      followers: null,
      engagement: null,
      email: null,
      outgoingEmail: "out@agency.com",
      mediaKitUrl: null,
      managerId: "550e8400-e29b-41d4-a716-446655440000",
      manager: null,
      quarterAssignments: [],
      idealBrandProfile: null,
      createdAt: "2026-06-28T12:00:00.000Z",
      updatedAt: "2026-06-28T12:00:00.000Z",
    });

    render(<CreateInfluencerForm />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByLabelText("Manager")).toBeEnabled();
    });

    await user.type(screen.getByLabelText("Talent"), "Laura Martinez");
    await user.type(screen.getByLabelText("Instagram username"), "@laura");
    await user.selectOptions(
      screen.getByLabelText("Country where the talent is located"),
      "CO",
    );
    await user.type(screen.getByLabelText("Niches"), "Fitness{Enter}");
    await user.type(screen.getByLabelText("Outgoing email"), "out@agency.com");
    await user.selectOptions(
      screen.getByLabelText("Manager"),
      "550e8400-e29b-41d4-a716-446655440000",
    );

    await user.click(screen.getByRole("button", { name: "Q1" }));
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Create talent" }));

    await waitFor(() => {
      expect(mockedCreateInfluencer).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Laura Martinez",
          instagram: "@laura",
          countries: ["CO"],
          niches: ["Fitness"],
          outgoingEmail: "out@agency.com",
          managerId: "550e8400-e29b-41d4-a716-446655440000",
          quarters: expect.arrayContaining([
            expect.objectContaining({ quarter: "Q1" }),
          ]),
        }),
      );
      expect(replace).toHaveBeenCalledWith("/dashboard/creators/inf-1");
    });
  });

  it("prefills from username research and submits research evidence without niches", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createQueryWrapper();

    const usernameResult = {
      research: {
        outcome: "FOUND" as const,
        queriedUsername: "pixel.vnzla",
        handleNormalized: "pixel.vnzla",
        profileUrl: "https://www.instagram.com/pixel.vnzla/",
        source: "brightdata:instagram:gd_x",
        fetchedAt: "2026-11-13T20:00:00.000Z",
        persisted: false as const,
      },
      normalized: {
        account: "pixel.vnzla",
        displayName: "PIXEL SPARTAN",
        biography: "Bio for Mastra",
        followers: 10232,
        following: 2244,
        postsCount: 583,
        isPrivate: false,
        isVerified: false,
        emailAddress: null,
        profileImageUrl: null,
        profileUrl: "https://www.instagram.com/pixel.vnzla/",
        externalUrls: [],
        bioHashtags: ["venezuela"],
        postHashtags: ["dancehall"],
      },
      provider: { account: "pixel.vnzla", followers: 10232 },
    };
    mockedStartResearch.mockResolvedValue({
      id: "run-create-1",
      status: "PROCESSING",
      mode: "USERNAME",
      username: "pixel.vnzla",
      handleNormalized: "pixel.vnzla",
      influencerId: null,
      result: null,
      errorCode: null,
      errorMessage: null,
      createdAt: "2026-11-13T20:00:00.000Z",
      updatedAt: "2026-11-13T20:00:00.000Z",
    });
    mockedGetResearchRun.mockResolvedValue({
      id: "run-create-1",
      status: "COMPLETED",
      mode: "USERNAME",
      username: "pixel.vnzla",
      handleNormalized: "pixel.vnzla",
      influencerId: null,
      result: usernameResult,
      errorCode: null,
      errorMessage: null,
      createdAt: "2026-11-13T20:00:00.000Z",
      updatedAt: "2026-11-13T20:00:00.000Z",
    });

    mockedCreateInfluencer.mockResolvedValue({
      id: "inf-research",
      name: "PIXEL SPARTAN",
      instagram: "@pixel.vnzla",
      instagramNormalized: "pixel.vnzla",
      tiktok: null,
      youtube: null,
      countries: ["VE"],
      language: null,
      niche: null,
      subNiche: null,
      niches: [],
      followers: 10232,
      engagement: null,
      email: null,
      outgoingEmail: null,
      mediaKitUrl: null,
      managerId: "550e8400-e29b-41d4-a716-446655440000",
      manager: null,
      quarterAssignments: [],
      idealBrandProfile: null,
      createdAt: "2026-11-13T20:05:00.000Z",
      updatedAt: "2026-11-13T20:05:00.000Z",
    });

    render(<CreateInfluencerForm />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByLabelText("Manager")).toBeEnabled();
    });

    await user.type(
      screen.getByPlaceholderText("belu.deltoro"),
      "pixel.vnzla",
    );
    await user.click(screen.getByRole("button", { name: "Research profile" }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("PIXEL SPARTAN")).toBeInTheDocument();
      expect(screen.getByDisplayValue("@pixel.vnzla")).toBeInTheDocument();
      expect(screen.getByText("Bio for Mastra")).toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getByLabelText("Country where the talent is located"),
      "VE",
    );
    await user.selectOptions(
      screen.getByLabelText("Manager"),
      "550e8400-e29b-41d4-a716-446655440000",
    );
    await user.click(screen.getByRole("button", { name: "Create talent" }));

    await waitFor(() => {
      expect(mockedCreateInfluencer).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "PIXEL SPARTAN",
          instagram: "@pixel.vnzla",
          countries: ["VE"],
          managerId: "550e8400-e29b-41d4-a716-446655440000",
          instagramResearch: expect.objectContaining({
            source: "brightdata:instagram:gd_x",
            handleNormalized: "pixel.vnzla",
            normalized: expect.objectContaining({
              biography: "Bio for Mastra",
              followers: 10232,
              bioHashtags: ["venezuela"],
              postHashtags: ["dancehall"],
            }),
          }),
        }),
      );
    });

    const submitted = mockedCreateInfluencer.mock.calls[0]?.[0];
    expect(submitted).not.toHaveProperty("niches");
    expect(replace).toHaveBeenCalledWith("/dashboard/creators/inf-research");
  });

  it("shows backend conflict error for duplicate Instagram", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createQueryWrapper();

    mockedCreateInfluencer.mockRejectedValue({
      status: 409,
      message: "conflict",
    });

    render(<CreateInfluencerForm />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByLabelText("Manager")).toBeEnabled();
    });

    await user.type(screen.getByLabelText("Talent"), "Laura Martinez");
    await user.type(screen.getByLabelText("Instagram username"), "@laura");
    await user.selectOptions(
      screen.getByLabelText("Country where the talent is located"),
      "ES",
    );
    await user.selectOptions(
      screen.getByLabelText("Manager"),
      "550e8400-e29b-41d4-a716-446655440000",
    );
    await user.click(screen.getByRole("button", { name: "Create talent" }));

    await waitFor(() => {
      expect(screen.getByText("Instagram already exists.")).toBeInTheDocument();
    });
  });
});
