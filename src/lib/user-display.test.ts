import { getEmailInitials } from "@/lib/user-display";

describe("getEmailInitials", () => {
  it("returns two initials from dotted local parts", () => {
    expect(getEmailInitials("maria.garcia@example.com")).toBe("MG");
  });

  it("returns two characters from a single local part", () => {
    expect(getEmailInitials("admin@example.com")).toBe("AD");
  });

  it("supports underscore and hyphen separators", () => {
    expect(getEmailInitials("john_doe-test@example.com")).toBe("JD");
  });
});
