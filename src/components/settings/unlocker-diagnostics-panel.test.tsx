import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UnlockerDiagnosticsPanel } from "@/components/settings/unlocker-diagnostics-panel";
import { probeUnlockerDiagnostic } from "@/services/lead-discovery.service";
import {
  UNLOCKER_DIAGNOSTIC_ALLOWED_URL,
  type UnlockerDiagnosticResult,
} from "@/types/lead-discovery";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("../../hooks/use-role", () => ({
  useRole: () => ({ isAdmin: true, role: "ADMIN" }),
}));

jest.mock("../auth/role-gate", () => ({
  RoleGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("../../services/lead-discovery.service", () => ({
  probeUnlockerDiagnostic: jest.fn(),
}));

const mockedProbe = probeUnlockerDiagnostic as jest.MockedFunction<
  typeof probeUnlockerDiagnostic
>;

describe("UnlockerDiagnosticsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the fixed allowlisted URL", () => {
    render(<UnlockerDiagnosticsPanel />);
    expect(
      screen.getByText(UNLOCKER_DIAGNOSTIC_ALLOWED_URL),
    ).toBeInTheDocument();
  });

  it("disables the button while probing and shows the result", async () => {
    const user = userEvent.setup();
    let resolveProbe: (
      value: UnlockerDiagnosticResult | PromiseLike<UnlockerDiagnosticResult>,
    ) => void = () => undefined;
    mockedProbe.mockImplementation(
      () =>
        new Promise<UnlockerDiagnosticResult>((resolve) => {
          resolveProbe = resolve;
        }),
    );

    render(<UnlockerDiagnosticsPanel />);
    const button = screen.getByRole("button", { name: "probe" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByRole("button", { name: "probing" })).toBeDisabled();
    expect(mockedProbe).toHaveBeenCalledTimes(1);
    expect(mockedProbe).toHaveBeenCalledWith(UNLOCKER_DIAGNOSTIC_ALLOWED_URL);

    resolveProbe({
      url: UNLOCKER_DIAGNOSTIC_ALLOWED_URL,
      outcome: "network_error",
      apiHttpStatus: 0,
      bodyLength: 0,
      elapsedMs: 900,
      zone: "mcp_unlocker",
      errorName: "TypeError",
      errorMessage: "fetch failed",
      causeCode: "ENOTFOUND",
      causeSyscall: "getaddrinfo",
      causeHostname: "api.brightdata.com",
      causePort: 443,
    });

    await waitFor(() => {
      expect(screen.getByTestId("unlocker-diagnostic-result")).toBeInTheDocument();
    });
    expect(screen.getByText("network_error")).toBeInTheDocument();
    expect(screen.getByText("ENOTFOUND")).toBeInTheDocument();
    expect(screen.getByText("getaddrinfo")).toBeInTheDocument();
    expect(screen.getByText("api.brightdata.com")).toBeInTheDocument();
    expect(screen.getByText("443")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "probe" })).not.toBeDisabled();
  });

  it("shows an error when the probe fails", async () => {
    const user = userEvent.setup();
    mockedProbe.mockRejectedValue(new Error("diagnostics disabled"));

    render(<UnlockerDiagnosticsPanel />);
    await user.click(screen.getByRole("button", { name: "probe" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "diagnostics disabled",
      );
    });
  });
});
