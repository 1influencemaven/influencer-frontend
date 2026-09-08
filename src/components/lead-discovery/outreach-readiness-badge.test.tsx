/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";

import { OutreachReadinessBadge } from "@/components/lead-discovery/outreach-readiness-badge";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      LIMITED: "Limited",
      PARTIAL: "Partial",
      READY: "Ready",
    };
    return labels[key] ?? key;
  },
}));

describe("OutreachReadinessBadge", () => {
  it("renders PARTIAL from prop", () => {
    render(<OutreachReadinessBadge readiness="PARTIAL" />);
    expect(screen.getByText("Partial")).toBeInTheDocument();
  });

  it("renders LIMITED from prop", () => {
    render(<OutreachReadinessBadge readiness="LIMITED" />);
    expect(screen.getByText("Limited")).toBeInTheDocument();
  });

  it("renders READY from prop", () => {
    render(<OutreachReadinessBadge readiness="READY" />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });
});
