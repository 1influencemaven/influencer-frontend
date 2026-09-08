import { mapWithConcurrency } from "@/lib/map-with-concurrency";

describe("mapWithConcurrency", () => {
  it("respects concurrency limit", async () => {
    let inFlight = 0;
    let maxInFlight = 0;

    const items = [1, 2, 3, 4, 5, 6];
    await mapWithConcurrency(items, 2, async (item) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return item * 2;
    });

    expect(maxInFlight).toBeLessThanOrEqual(2);
  });

  it("returns mapped results in order", async () => {
    const result = await mapWithConcurrency([1, 2, 3], 8, async (n) => n + 1);
    expect(result).toEqual([2, 3, 4]);
  });
});
