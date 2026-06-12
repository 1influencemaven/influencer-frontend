/**
 * @jest-environment node
 */

import { getQueryClient, makeQueryClient } from "@/lib/query-client";

describe("query-client", () => {
  it("creates a query client with project defaults", () => {
    const client = makeQueryClient();

    expect(client.getDefaultOptions().queries?.staleTime).toBe(60_000);
    expect(client.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(
      false,
    );
    expect(client.getDefaultOptions().queries?.retry).toBe(1);
    expect(client.getDefaultOptions().mutations?.retry).toBe(false);
  });

  it("returns a fresh client on the server", () => {
    const first = getQueryClient();
    const second = getQueryClient();

    expect(first).not.toBe(second);
  });
});
