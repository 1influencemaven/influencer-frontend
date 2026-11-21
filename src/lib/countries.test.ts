import {
  getCountryLabel,
  getCountryOptions,
  isIsoCountryCode,
} from "@/lib/countries";

describe("countries", () => {
  it("accepts valid ISO alpha-2 codes", () => {
    expect(isIsoCountryCode("CO")).toBe(true);
    expect(isIsoCountryCode("us")).toBe(true);
    expect(isIsoCountryCode("ESP")).toBe(false);
    expect(isIsoCountryCode("")).toBe(false);
  });

  it("returns searchable localized options", () => {
    const es = getCountryOptions("es");
    const en = getCountryOptions("en");
    expect(es.length).toBeGreaterThan(50);
    expect(es.some((o) => o.code === "CO")).toBe(true);
    expect(en.find((o) => o.code === "US")?.label.toLowerCase()).toContain(
      "united",
    );
    const colombia = es.find((o) => o.code === "CO");
    expect(colombia?.label.toLowerCase()).toContain("colombia");
  });

  it("resolves display labels", () => {
    expect(getCountryLabel("CO", "es")?.toLowerCase()).toContain("colombia");
    expect(getCountryLabel(null, "en")).toBeNull();
  });
});
