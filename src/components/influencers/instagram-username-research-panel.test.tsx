/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InstagramUsernameResearchPanel } from "@/components/influencers/instagram-username-research-panel";
import { researchInstagramUsername } from "../../services/influencers.service";

const messages = {
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
  previewBioHashtags: "Bio hashtags (evidence)",
  previewPostHashtags: "Post hashtags (evidence)",
  notPersistedHint: "Not saved yet.",
  hashtagsNotNichesHint: "Hashtags are evidence only.",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    messages[key as keyof typeof messages] ?? key,
}));

jest.mock("../../services/influencers.service", () => ({
  researchInstagramUsername: jest.fn(),
}));

const mockedResearch = jest.mocked(researchInstagramUsername);

describe("InstagramUsernameResearchPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls username research and notifies onFound", async () => {
    const user = userEvent.setup();
    const onFound = jest.fn();
    mockedResearch.mockResolvedValue({
      research: {
        outcome: "FOUND",
        queriedUsername: "belu.deltoro",
        handleNormalized: "belu.deltoro",
        profileUrl: "https://www.instagram.com/belu.deltoro/",
        source: "brightdata:instagram:gd_x",
        fetchedAt: new Date().toISOString(),
        persisted: false,
      },
      normalized: {
        account: "belu.deltoro",
        displayName: "Belu",
        biography: "Host",
        followers: 1500,
        following: 10,
        postsCount: 5,
        isPrivate: false,
        isVerified: false,
        emailAddress: null,
        profileImageUrl: null,
        profileUrl: "https://www.instagram.com/belu.deltoro/",
        externalUrls: [],
        bioHashtags: [],
        postHashtags: [],
      },
      provider: { account: "belu.deltoro" },
    });

    render(<InstagramUsernameResearchPanel onFound={onFound} />);

    await user.type(
      screen.getByPlaceholderText("belu.deltoro"),
      "belu.deltoro",
    );
    await user.click(screen.getByRole("button", { name: "Research profile" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Profile found.");
    });
    expect(mockedResearch).toHaveBeenCalledWith("belu.deltoro");
    expect(onFound).toHaveBeenCalled();
    expect(screen.getByText("Not saved yet.")).toBeInTheDocument();
  });
});
