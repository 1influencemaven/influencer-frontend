/**
 * @jest-environment jsdom
 */

import { getQueryClient } from "@/lib/query-client";

describe("getQueryClient in browser", () => {
  it("reuses the same singleton instance", () => {
    const first = getQueryClient();
    const second = getQueryClient();

    expect(first).toBe(second);
  });
});
