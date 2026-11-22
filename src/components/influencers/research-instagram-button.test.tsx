/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ResearchInstagramButton } from "@/components/influencers/research-instagram-button";
import {
  getActiveInfluencerInstagramResearch,
  getInstagramResearchRun,
  startInfluencerInstagramResearch,
} from "../../services/influencers.service";

const researchMessages = {
  action: "Research Instagram",
  researching: "Researching…",
  updated: "Updated {count} field(s) from Instagram.",
  noChanges: "No fields changed.",
  private: "The Instagram profile is private.",
  notFound: "Instagram profile was not found.",
  incomplete: "Incomplete profile.",
  timeout: "Timed out.",
  notConfigured: "Not configured.",
  duplicate: "Duplicate.",
  invalidHandle: "Invalid handle.",
  inProgress: "In progress.",
  error: "Could not research.",
};

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    if (namespace === "InfluencerDetail.instagramResearch") {
      return (key: string, values?: Record<string, unknown>) => {
        const template =
          researchMessages[key as keyof typeof researchMessages] ?? key;
        if (values?.count !== undefined) {
          return template.replace("{count}", String(values.count));
        }
        return template;
      };
    }
    return (key: string) => key;
  },
}));

jest.mock("../../services/influencers.service", () => ({
  startInfluencerInstagramResearch: jest.fn(),
  getInstagramResearchRun: jest.fn(),
  getActiveInfluencerInstagramResearch: jest.fn(),
}));

const mockedStart = jest.mocked(startInfluencerInstagramResearch);
const mockedGet = jest.mocked(getInstagramResearchRun);
const mockedActive = jest.mocked(getActiveInfluencerInstagramResearch);

describe("ResearchInstagramButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedActive.mockResolvedValue(null);
  });

  it("enqueues research, polls run, and reports UPDATED", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const result = {
      influencer: { id: "inf-1" } as never,
      research: {
        outcome: "UPDATED" as const,
        handle: "laura",
        profileUrl: "https://www.instagram.com/laura/",
        source: "brightdata:instagram:gd_x",
        fetchedAt: new Date().toISOString(),
        updatedFields: ["followers"],
        skippedManualFields: ["name"],
      },
    };

    mockedStart.mockResolvedValue({
      id: "run-1",
      status: "PROCESSING",
      mode: "INFLUENCER",
      username: "@laura",
      handleNormalized: "laura",
      influencerId: "inf-1",
      result: null,
      errorCode: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockedGet.mockResolvedValue({
      id: "run-1",
      status: "COMPLETED",
      mode: "INFLUENCER",
      username: "@laura",
      handleNormalized: "laura",
      influencerId: "inf-1",
      result,
      errorCode: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(
      <ResearchInstagramButton influencerId="inf-1" onSuccess={onSuccess} />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Research Instagram" }),
      ).toBeEnabled();
    });

    await user.click(
      screen.getByRole("button", { name: "Research Instagram" }),
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Updated 1 field(s) from Instagram.",
      );
    });
    expect(mockedStart).toHaveBeenCalledWith("inf-1");
    expect(mockedGet).toHaveBeenCalledWith("run-1");
    expect(onSuccess).toHaveBeenCalled();
  });

  it("keeps button disabled and resumes polling when an active run exists", async () => {
    mockedActive.mockResolvedValue({
      id: "run-active",
      status: "PROCESSING",
      mode: "INFLUENCER",
      username: null,
      handleNormalized: "laura",
      influencerId: "inf-1",
      result: null,
      errorCode: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockedGet.mockResolvedValue({
      id: "run-active",
      status: "PROCESSING",
      mode: "INFLUENCER",
      username: null,
      handleNormalized: "laura",
      influencerId: "inf-1",
      result: null,
      errorCode: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<ResearchInstagramButton influencerId="inf-1" />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Researching…" }),
      ).toBeDisabled();
    });
    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalledWith("run-active");
    });
  });

  it("surfaces PROFILE_NOT_FOUND from FAILED run", async () => {
    const user = userEvent.setup();
    mockedStart.mockResolvedValue({
      id: "run-2",
      status: "PROCESSING",
      mode: "INFLUENCER",
      username: null,
      handleNormalized: "laura",
      influencerId: "inf-1",
      result: null,
      errorCode: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockedGet.mockResolvedValue({
      id: "run-2",
      status: "FAILED",
      mode: "INFLUENCER",
      username: null,
      handleNormalized: "laura",
      influencerId: "inf-1",
      result: null,
      errorCode: "PROFILE_NOT_FOUND",
      errorMessage: "not found",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<ResearchInstagramButton influencerId="inf-1" />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Research Instagram" }),
      ).toBeEnabled();
    });

    await user.click(
      screen.getByRole("button", { name: "Research Instagram" }),
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Instagram profile was not found.",
      );
    });
  });
});
