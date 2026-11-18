/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ResearchInstagramButton } from "@/components/influencers/research-instagram-button";
import { researchInfluencerInstagram } from "../../services/influencers.service";

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
  researchInfluencerInstagram: jest.fn(),
}));

const mockedResearch = jest.mocked(researchInfluencerInstagram);

describe("ResearchInstagramButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls backend research and reports UPDATED", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    mockedResearch.mockResolvedValue({
      influencer: { id: "inf-1" } as never,
      research: {
        outcome: "UPDATED",
        handle: "laura",
        profileUrl: "https://www.instagram.com/laura/",
        source: "brightdata:instagram:gd_x",
        fetchedAt: new Date().toISOString(),
        updatedFields: ["followers"],
        skippedManualFields: ["name"],
      },
    });

    render(
      <ResearchInstagramButton influencerId="inf-1" onSuccess={onSuccess} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Research Instagram" }),
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Updated 1 field(s) from Instagram.",
      );
    });
    expect(mockedResearch).toHaveBeenCalledWith("inf-1");
    expect(onSuccess).toHaveBeenCalled();
  });

  it("surfaces PROFILE_NOT_FOUND from API errors", async () => {
    const user = userEvent.setup();
    mockedResearch.mockRejectedValue({
      status: 404,
      message: "Instagram profile was not found",
      code: "PROFILE_NOT_FOUND",
    });

    render(<ResearchInstagramButton influencerId="inf-1" />);

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
