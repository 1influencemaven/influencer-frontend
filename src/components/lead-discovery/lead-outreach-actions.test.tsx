import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";

import { renderWithUser } from "@/components/component-test-utils";
import { LeadOutreachActions } from "@/components/lead-discovery/lead-outreach-actions";
import { deselectLeadForOutreach, selectLeadForOutreach } from "@/services/lead-discovery.service";
import type { Lead } from "@/types/lead-discovery";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock("../../i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));
jest.mock("../../services/lead-discovery.service", () => ({
  selectLeadForOutreach: jest.fn(),
  deselectLeadForOutreach: jest.fn(),
}));

const lead = (over: Partial<Lead> = {}) =>
  ({ id: "lead-1", status: "UNDER_REVIEW", selectedForOutreach: false, ...over }) as Lead;

function renderActions(props: Parameters<typeof LeadOutreachActions>[0]) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return renderWithUser(
    <QueryClientProvider client={client}>
      <LeadOutreachActions {...props} />
    </QueryClientProvider>,
  );
}

describe("LeadOutreachActions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("selects the lead for outreach and notifies the parent", async () => {
    jest.mocked(selectLeadForOutreach).mockResolvedValue(lead({ selectedForOutreach: true }));
    const onChanged = jest.fn();
    const { user } = renderActions({ lead: lead(), onChanged });

    await user.click(screen.getByRole("button", { name: /selectForOutreach/ }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(selectLeadForOutreach).toHaveBeenCalledWith("lead-1");
    expect(screen.getByRole("link", { name: /viewDetail/ })).toHaveAttribute("href", "/dashboard/leads/lead-1");
  });

  it("unselects an already selected lead", async () => {
    jest.mocked(deselectLeadForOutreach).mockResolvedValue(lead());
    const { user } = renderActions({ lead: lead({ selectedForOutreach: true }) });
    await user.click(screen.getByRole("button", { name: /selectedForOutreach/ }));
    await waitFor(() => expect(deselectLeadForOutreach).toHaveBeenCalledWith("lead-1"));
  });

  it("hides selection for discarded leads but keeps the detail link", () => {
    renderActions({ lead: lead({ status: "DISCARDED" }) });
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("link", { name: /viewDetail/ })).toBeInTheDocument();
  });
});
