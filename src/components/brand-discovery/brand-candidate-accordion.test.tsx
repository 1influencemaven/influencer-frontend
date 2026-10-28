/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BrandCandidateAccordion } from "@/components/brand-discovery/brand-candidate-accordion";
import type { BrandCandidate } from "@/types/brand-discovery";

const messages: Record<string, string> = {
  emptyResults: "No brands yet.",
  score: "Score {value}",
  evidence: "Evidence",
  approve: "Approve",
  postpone: "Postpone",
  reject: "Reject",
  delete: "Delete brand",
  deleteConfirm: "Delete this brand and all its leads? This cannot be undone.",
  deleteCancel: "Cancel",
  deleteConfirmAction: "Delete",
  deleting: "Deleting...",
  "candidateStatus.UNDER_REVIEW": "Under review",
  "candidateStatus.APPROVED": "Approved",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: { value?: number }) => {
    if (key === "score" && values?.value !== undefined) {
      return `Score ${values.value}`;
    }
    if (key.startsWith("candidateStatus.")) {
      return messages[key] ?? key;
    }
    return messages[key] ?? key;
  },
}));

jest.mock("../lead-discovery/lead-contacts-panel", () => ({
  LeadContactsPanel: () => <div>Lead contacts</div>,
}));

jest.mock("../lead-discovery/brand-business-contacts-panel", () => ({
  BrandBusinessContactsPanel: () => <div>Brand business contacts</div>,
}));

function candidate(
  overrides: Partial<BrandCandidate> = {},
): BrandCandidate {
  return {
    id: "bc-1",
    influencerId: "inf-1",
    discoveryRunId: "run-1",
    name: "Movavi",
    website: "https://movavi.com",
    domain: "movavi.com",
    sector: "software",
    market: "Global",
    brandSize: "smb",
    score: 80,
    fitReason: "fit",
    source: "ai+tavily",
    evidenceUrls: [],
    status: "UNDER_REVIEW",
    metadata: null,
    createdAt: "",
    updatedAt: "",
    influencer: { id: "inf-1", name: "Ada" },
    ...overrides,
  };
}

describe("BrandCandidateAccordion delete", () => {
  it("shows Delete brand for UNDER_REVIEW and APPROVED", async () => {
    const user = userEvent.setup();
    render(
      <BrandCandidateAccordion
        candidates={[
          candidate(),
          candidate({ id: "bc-2", name: "Senic", status: "APPROVED" }),
        ]}
        updatingId={null}
        onUpdateStatus={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    await user.click(screen.getByText("Movavi"));
    expect(
      screen.getByRole("button", { name: "Delete brand" }),
    ).toBeInTheDocument();

    await user.click(screen.getByText("Senic"));
    expect(
      screen.getAllByRole("button", { name: "Delete brand" }),
    ).toHaveLength(2);
  });

  it("confirms before deleting and can cancel", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(
      <BrandCandidateAccordion
        candidates={[candidate()]}
        updatingId={null}
        onUpdateStatus={jest.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByText("Movavi"));
    await user.click(screen.getByRole("button", { name: "Delete brand" }));
    expect(
      screen.getByText(
        "Delete this brand and all its leads? This cannot be undone.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Delete brand" }),
    ).toBeInTheDocument();
  });

  it("calls onDelete after confirm", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(
      <BrandCandidateAccordion
        candidates={[candidate()]}
        updatingId={null}
        onUpdateStatus={jest.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByText("Movavi"));
    await user.click(screen.getByRole("button", { name: "Delete brand" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("bc-1");
  });
});

describe("BrandDiscovery delete i18n", () => {
  it("has delete keys in en and es", () => {
    const en = require("../../messages/en.json") as {
      BrandDiscovery: Record<string, string>;
    };
    const es = require("../../messages/es.json") as {
      BrandDiscovery: Record<string, string>;
    };
    for (const key of [
      "delete",
      "deleteConfirm",
      "deleteCancel",
      "deleteConfirmAction",
      "deleting",
      "deleteError",
    ]) {
      expect(en.BrandDiscovery[key]).toBeTruthy();
      expect(es.BrandDiscovery[key]).toBeTruthy();
    }
  });
});
