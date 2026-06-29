/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";

import { ProfileStatusBadge } from "@/components/influencers/profile-status-badge";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ProfileStatusBadge", () => {
  it.each([
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
  ] as const)("renders the status label for %s", (status) => {
    render(<ProfileStatusBadge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });
});
