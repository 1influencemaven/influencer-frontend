/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useCopyToClipboard } from "./use-copy-to-clipboard";

describe("useCopyToClipboard", () => {
  const writeTextMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    writeTextMock.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });
  });

  it("sets success after copying", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("test@example.com");
    });

    expect(writeTextMock).toHaveBeenCalledWith("test@example.com");
    expect(result.current.status).toBe("success");
  });

  it("sets error when clipboard fails", async () => {
    writeTextMock.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("test@example.com");
    });

    expect(result.current.status).toBe("error");
  });
});
