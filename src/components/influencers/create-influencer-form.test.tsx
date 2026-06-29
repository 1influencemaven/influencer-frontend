/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateInfluencerForm } from "@/components/influencers/create-influencer-form";
import { createInfluencer } from "@/services/influencers.service";

const createMessages = {
  nameLabel: "Name",
  namePlaceholder: "Laura Martinez",
  instagramLabel: "Instagram",
  instagramPlaceholder: "@laura",
  tiktokLabel: "TikTok",
  tiktokPlaceholder: "@laura",
  youtubeLabel: "YouTube",
  youtubePlaceholder: "@laura",
  countryLabel: "Country",
  countryPlaceholder: "ES",
  languageLabel: "Language",
  languagePlaceholder: "es",
  nicheLabel: "Niche",
  nichePlaceholder: "Fitness",
  subNicheLabel: "Sub-niche",
  subNichePlaceholder: "Sports nutrition",
  followersLabel: "Followers",
  followersPlaceholder: "180000",
  engagementLabel: "Engagement",
  engagementPlaceholder: "4.5",
  emailLabel: "Email",
  emailPlaceholder: "laura@example.com",
  mediaKitUrlLabel: "Media kit",
  mediaKitUrlPlaceholder: "https://example.com",
  submit: "Create influencer",
  submitting: "Creating influencer...",
  cancel: "Cancel",
  errors: {
    nameRequired: "Name is required.",
    nameMin: "Name must be at least 2 characters.",
    nameMax: "Name cannot exceed 200 characters.",
    instagramMax: "Instagram cannot exceed 255 characters.",
    tiktokMax: "TikTok cannot exceed 255 characters.",
    youtubeMax: "YouTube cannot exceed 255 characters.",
    countryLength: "Country must be exactly 2 characters.",
    languageLength: "Language must be exactly 2 characters.",
    nicheMax: "Niche cannot exceed 100 characters.",
    subNicheMax: "Sub-niche cannot exceed 100 characters.",
    followersMin: "Followers must be 0 or greater.",
    followersInt: "Followers must be a whole number.",
    engagementMin: "Engagement must be 0 or greater.",
    engagementMax: "Engagement cannot exceed 100.",
    engagementDecimals: "Engagement allows at most 2 decimal places.",
    emailInvalid: "Enter a valid email address.",
    mediaKitUrlInvalid: "Enter a valid URL.",
    mediaKitUrlMax: "Media kit URL cannot exceed 2048 characters.",
    generic: "Could not create the influencer.",
  },
};

jest.mock("next-intl", () => ({
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
}));

const mockedCreateInfluencer = jest.mocked(createInfluencer);

describe("CreateInfluencerForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits valid data and redirects to detail page", async () => {
    const user = userEvent.setup();

    mockedCreateInfluencer.mockResolvedValue({
      id: "inf-1",
      name: "Laura Martinez",
      instagram: null,
      tiktok: null,
      youtube: null,
      country: null,
      language: null,
      niche: null,
      subNiche: null,
      followers: null,
      engagement: null,
      email: null,
      mediaKitUrl: null,
      profileStatus: "PENDING",
      commercialProfile: null,
      createdAt: "2026-06-28T12:00:00.000Z",
      updatedAt: "2026-06-28T12:00:00.000Z",
    });

    render(<CreateInfluencerForm />);

    await user.type(screen.getByLabelText("Name"), "Laura Martinez");
    await user.click(screen.getByRole("button", { name: "Create influencer" }));

    await waitFor(() => {
      expect(mockedCreateInfluencer).toHaveBeenCalledWith({
        name: "Laura Martinez",
      });
      expect(replace).toHaveBeenCalledWith("/dashboard/creators/inf-1");
    });
  });
});
