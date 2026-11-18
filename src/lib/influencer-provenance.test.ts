import { isExternallyManagedField } from "@/lib/influencer-provenance";

describe("influencer-provenance", () => {
  it("locks EXTERNAL fields and leaves MANUAL/LEGACY editable", () => {
    const provenances = [
      { fieldKey: "instagram", origin: "EXTERNAL" as const, source: "x", fetchedAt: null, updatedAt: "2026-01-01" },
      { fieldKey: "name", origin: "MANUAL" as const, source: null, fetchedAt: null, updatedAt: "2026-01-01" },
      { fieldKey: "email", origin: "LEGACY" as const, source: null, fetchedAt: null, updatedAt: "2026-01-01" },
    ];

    expect(isExternallyManagedField(provenances, "instagram")).toBe(true);
    expect(isExternallyManagedField(provenances, "name")).toBe(false);
    expect(isExternallyManagedField(provenances, "email")).toBe(false);
    expect(isExternallyManagedField(undefined, "followers")).toBe(false);
  });
});
