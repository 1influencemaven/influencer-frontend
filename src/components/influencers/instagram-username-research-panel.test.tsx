/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InstagramUsernameResearchPanel } from "@/components/influencers/instagram-username-research-panel";
import {
  getInstagramResearchRun,
  startInstagramUsernameResearch,
} from "../../services/influencers.service";

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
  startInstagramUsernameResearch: jest.fn(),
  getInstagramResearchRun: jest.fn(),
}));

const mockedStart = jest.mocked(startInstagramUsernameResearch);
const mockedGet = jest.mocked(getInstagramResearchRun);

const usernameResult = {
  research: {
    outcome: "FOUND" as const,
    queriedUsername: "belu.deltoro",
    handleNormalized: "belu.deltoro",
    profileUrl: "https://www.instagram.com/belu.deltoro/",
    source: "brightdata:instagram:gd_x",
    fetchedAt: new Date().toISOString(),
    persisted: false as const,
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
};

describe("InstagramUsernameResearchPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("enqueues research, polls run, and notifies onFound", async () => {
    const user = userEvent.setup();
    const onFound = jest.fn();
    mockedStart.mockResolvedValue({
      id: "run-1",
      status: "PROCESSING",
      mode: "USERNAME",
      username: "belu.deltoro",
      handleNormalized: "belu.deltoro",
      influencerId: null,
      result: null,
      errorCode: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockedGet.mockResolvedValue({
      id: "run-1",
      status: "COMPLETED",
      mode: "USERNAME",
      username: "belu.deltoro",
      handleNormalized: "belu.deltoro",
      influencerId: null,
      result: usernameResult,
      errorCode: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    expect(mockedStart).toHaveBeenCalledWith("belu.deltoro");
    expect(mockedGet).toHaveBeenCalledWith("run-1");
    expect(onFound).toHaveBeenCalled();
    expect(screen.getByText("Not saved yet.")).toBeInTheDocument();
  });

  it("surfaces FAILED run error codes", async () => {
    const user = userEvent.setup();
    mockedStart.mockResolvedValue({
      id: "run-2",
      status: "PROCESSING",
      mode: "USERNAME",
      username: "missing",
      handleNormalized: "missing",
      influencerId: null,
      result: null,
      errorCode: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockedGet.mockResolvedValue({
      id: "run-2",
      status: "FAILED",
      mode: "USERNAME",
      username: "missing",
      handleNormalized: "missing",
      influencerId: null,
      result: null,
      errorCode: "PROFILE_NOT_FOUND",
      errorMessage: "not found",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<InstagramUsernameResearchPanel />);

    await user.type(screen.getByPlaceholderText("belu.deltoro"), "missing");
    await user.click(screen.getByRole("button", { name: "Research profile" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Not found.");
    });
  });
});
