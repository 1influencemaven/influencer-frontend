/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EditInfluencerForm } from "@/components/influencers/edit-influencer-form";
import {
  getInfluencer,
  listInfluencerManagers,
  updateInfluencer,
} from "@/services/influencers.service";
import { createQueryWrapper } from "@/test-utils/query-wrapper";

const createMessages = {
  nameLabel: "Talent",
  namePlaceholder: "Laura",
  instagramLabel: "Instagram",
  instagramPlaceholder: "@laura",
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
  externalLockedHint: "Automatic value (EXTERNAL): read-only.",
  tiktokLabel: "TikTok",
  tiktokPlaceholder: "@tiktok",
  youtubeLabel: "YouTube",
  youtubePlaceholder: "@youtube",
  countryLabel: "Country",
  countryPlaceholder: "ES",
  countryLocationLabel: "Country where the talent is located",
  countrySelectPlaceholder: "Select a country",
  countrySearchPlaceholder: "Search country…",
  languageLabel: "Language",
  languagePlaceholder: "es",
  nicheLabel: "Legacy niche",
  nichePlaceholder: "Fitness",
  subNicheLabel: "Sub-niche",
  subNichePlaceholder: "Nutrition",
  followersLabel: "Followers",
  followersPlaceholder: "1000",
  engagementLabel: "Engagement",
  engagementPlaceholder: "4.5",
  emailLabel: "Contact email",
  emailPlaceholder: "laura@example.com",
  mediaKitUrlLabel: "Media kit",
  mediaKitUrlPlaceholder: "https://example.com",
  errors: {
    nameRequired: "Name is required.",
    nameMin: "Name min",
    nameMax: "Name max",
    instagramRequired: "Instagram is required.",
    instagramMax: "Instagram max",
    countryRequired: "Country required",
    countryInvalid: "Country invalid",
    nicheItemMax: "Niche item max",
    nichesMax: "Niches max",
    quarterYearInvalid: "Year invalid",
    quartersDuplicate: "Duplicate",
    outgoingEmailInvalid: "Outgoing invalid",
    managerIdRequired: "This field is required.",
    managerIdInvalid: "Manager invalid",
    tiktokMax: "TikTok max",
    youtubeMax: "YouTube max",
    countryLength: "Country length",
    languageLength: "Language length",
    nicheMax: "Niche max",
    subNicheMax: "Sub niche max",
    followersMin: "Followers min",
    followersInt: "Followers int",
    engagementMin: "Engagement min",
    engagementMax: "Engagement max",
    engagementDecimals: "Engagement decimals",
    emailInvalid: "Email invalid",
    mediaKitUrlInvalid: "URL invalid",
    mediaKitUrlMax: "URL max",
    instagramConflict: "Conflict",
  },
};

const editMessages = {
  submit: "Save changes",
  submitting: "Saving...",
  cancel: "Cancel",
  loading: "Loading talent...",
  backToList: "Back to list",
  sections: {
    talentManager: "Talent Manager",
    legacy: "Additional data",
  },
  errors: {
    generic: "Could not update.",
    notFound: "Not found",
    loadFailed: "Load failed",
  },
};

jest.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: (namespace: string) => {
    if (namespace === "CreateInfluencer") {
      return (key: string) => {
        if (key.startsWith("errors.")) {
          return (
            createMessages.errors[
              key.replace("errors.", "") as keyof typeof createMessages.errors
            ] ?? key
          );
        }
        return createMessages[key as keyof typeof createMessages] ?? key;
      };
    }

    if (namespace === "CreateInfluencer.errors") {
      return (key: string) =>
        createMessages.errors[key as keyof typeof createMessages.errors] ?? key;
    }

    if (namespace === "EditInfluencer") {
      return (key: string) => {
        if (key.startsWith("sections.")) {
          return (
            editMessages.sections[
              key.replace("sections.", "") as keyof typeof editMessages.sections
            ] ?? key
          );
        }
        if (key.startsWith("errors.")) {
          return (
            editMessages.errors[
              key.replace("errors.", "") as keyof typeof editMessages.errors
            ] ?? key
          );
        }
        return editMessages[key as keyof typeof editMessages] ?? key;
      };
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
  getInfluencer: jest.fn(),
  updateInfluencer: jest.fn(),
  listInfluencerManagers: jest.fn(),
}));

const mockedGetInfluencer = jest.mocked(getInfluencer);
const mockedUpdateInfluencer = jest.mocked(updateInfluencer);
const mockedListManagers = jest.mocked(listInfluencerManagers);

describe("EditInfluencerForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedListManagers.mockResolvedValue([]);
    mockedGetInfluencer.mockResolvedValue({
      id: "inf-1",
      name: "Laura Martinez",
      instagram: "@laura",
      instagramNormalized: "laura",
      tiktok: null,
      youtube: null,
      country: "ES",
      language: "es",
      niche: null,
      subNiche: null,
      niches: ["Fitness"],
      followers: 1000,
      engagement: "3.20",
      email: "laura@example.com",
      outgoingEmail: "out@agency.com",
      mediaKitUrl: null,
      managerId: null,
      manager: null,
      quarterAssignments: [{ id: "q1", year: 2026, quarter: "Q1", assignedAt: "2026-01-01" }],
      fieldProvenances: [
        {
          fieldKey: "followers",
          origin: "EXTERNAL",
          source: "scraper",
          fetchedAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ],
      idealBrandProfile: null,
      createdAt: "2026-06-28T12:00:00.000Z",
      updatedAt: "2026-06-28T12:00:00.000Z",
    });
  });

  it("loads detail and locks EXTERNAL fields on edit", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createQueryWrapper();

    mockedUpdateInfluencer.mockResolvedValue({
      id: "inf-1",
      name: "Laura Updated",
      instagram: "@laura",
      instagramNormalized: "laura",
      tiktok: null,
      youtube: null,
      country: "ES",
      language: "es",
      niche: null,
      subNiche: null,
      niches: ["Beauty"],
      followers: 1000,
      engagement: "3.20",
      email: "laura@example.com",
      outgoingEmail: "out@agency.com",
      mediaKitUrl: null,
      managerId: null,
      manager: null,
      quarterAssignments: [],
      idealBrandProfile: null,
      createdAt: "2026-06-28T12:00:00.000Z",
      updatedAt: "2026-06-28T12:00:00.000Z",
    });

    render(<EditInfluencerForm influencerId="inf-1" />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Laura Martinez")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Followers")).toBeDisabled();
    expect(
      screen.getAllByText("Automatic value (EXTERNAL): read-only.").length,
    ).toBeGreaterThan(0);

    await user.clear(screen.getByLabelText("Talent"));
    await user.type(screen.getByLabelText("Talent"), "Laura Updated");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockedUpdateInfluencer).toHaveBeenCalledWith(
        "inf-1",
        expect.not.objectContaining({ followers: expect.anything() }),
      );
      expect(mockedUpdateInfluencer).toHaveBeenCalledWith(
        "inf-1",
        expect.objectContaining({ name: "Laura Updated" }),
      );
      expect(replace).toHaveBeenCalledWith("/dashboard/creators/inf-1");
    });
  });
});
