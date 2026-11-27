import { autoMapHeaders, buildMappedRows, errorsToCsv, looksLikeEmail, parseCsv } from "@/lib/prospects-csv";

const FIELDS = [
  { key: "email", label: "Email" },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "company", label: "Company" },
  { key: "jobTitle", label: "Job Title" },
  { key: "prospectOverview", label: "Prospect Overview" },
];

describe("prospects CSV helpers", () => {
  it("auto-maps Spanish/English headers, labels and keys once each", () => {
    expect(
      autoMapHeaders(["Correo", "Nombre", "Apellidos", "Empresa", "Cargo", "Prospect Overview", "Notas", "E-mail"], FIELDS),
    ).toEqual(["email", "firstName", "lastName", "company", "jobTitle", "prospectOverview", "", ""]);
  });

  it("ignores synonyms for fields that do not exist", () => {
    expect(autoMapHeaders(["Teléfono"], FIELDS)).toEqual([""]);
  });

  it("builds rows keyed by field, skipping blanks and unmapped columns", () => {
    const rows = parseCsv('email,nombre,notas\nana@brand.com,"Ana, M",x\n bob@b.com ,,y\n');
    expect(buildMappedRows(rows.slice(1), ["email", "firstName", ""])).toEqual([
      { email: "ana@brand.com", firstName: "Ana, M" },
      { email: "bob@b.com" },
    ]);
  });

  it("validates emails and exports errors as CSV", () => {
    expect(looksLikeEmail("pr@brand.co")).toBe(true);
    expect(looksLikeEmail("nope")).toBe(false);
    expect(errorsToCsv([{ row: 3, email: "x,y", reason: "INVALID_EMAIL" }])).toBe('row,email,reason\n3,"x,y",INVALID_EMAIL');
  });
});
