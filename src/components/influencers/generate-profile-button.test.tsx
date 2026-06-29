/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GenerateProfileButton } from "@/components/influencers/generate-profile-button";
import { generateProfile } from "@/services/influencers.service";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("../../services/influencers.service", () => ({
  generateProfile: jest.fn(),
}));

const mockedGenerateProfile = jest.mocked(generateProfile);

describe("GenerateProfileButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("queues profile generation on click", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    mockedGenerateProfile.mockResolvedValue({
      message: "Profile generation job enqueued",
      influencerId: "inf-1",
      profileStatus: "PROCESSING",
    });

    render(
      <GenerateProfileButton
        influencerId="inf-1"
        profileStatus="PENDING"
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: "action" }));

    await waitFor(() => {
      expect(mockedGenerateProfile).toHaveBeenCalledWith("inf-1");
      expect(onSuccess).toHaveBeenCalled();
      expect(screen.getByText("success")).toBeInTheDocument();
    });
  });

  it("shows conflict message when generation is already in progress", async () => {
    const user = userEvent.setup();

    mockedGenerateProfile.mockRejectedValue({
      status: 409,
      message: "Conflict",
    });

    render(
      <GenerateProfileButton
        influencerId="inf-1"
        profileStatus="PENDING"
      />,
    );

    await user.click(screen.getByRole("button", { name: "action" }));

    await waitFor(() => {
      expect(screen.getByText("alreadyProcessing")).toBeInTheDocument();
    });
  });

  it("disables the button while processing status is active", () => {
    render(
      <GenerateProfileButton
        influencerId="inf-1"
        profileStatus="PROCESSING"
      />,
    );

    expect(screen.getByRole("button", { name: "action" })).toBeDisabled();
  });
});
