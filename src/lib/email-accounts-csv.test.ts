import { csvTemplate, importAccountsCsv, parseCsv } from "@/lib/email-accounts-csv";
import {
  applyProviderPreset,
  emptyConnection,
  mirrorSmtpCredentials,
  validateConnection,
} from "@/lib/email-account-providers";

describe("email accounts CSV", () => {
  it("parses quoted fields, escaped quotes, semicolons and CRLF", () => {
    expect(parseCsv('a,"b, c","d ""e"""\r\n1;2;3\n\n')).toEqual([
      ["a", "b, c", 'd "e"'],
      ["1", "2", "3"],
    ]);
  });

  it("round-trips the template into a valid connection", () => {
    const { accounts, errors } = importAccountsCsv(csvTemplate());
    expect(errors).toEqual([]);
    expect(accounts).toHaveLength(1);
    expect(accounts[0]).toMatchObject({
      provider: "zoho",
      fromFirstName: "Ana",
      smtp: { host: "smtp.zoho.com", port: 465, encryption: "ssl" },
      imap: { host: "imap.zoho.com", port: 993 },
    });
    expect(validateConnection(accounts[0])).toEqual({});
  });

  it("reports missing columns and invalid rows by line", () => {
    expect(importAccountsCsv("provider,fromFirstName\nzoho,Ana").errors[0].message).toMatch(
      /^missingColumns:/,
    );
    const template = csvTemplate().split("\n");
    const badRow = template[1].replace(/^zoho/, "hotmail");
    const result = importAccountsCsv(`${template[0]}\n${badRow}\n`);
    expect(result.accounts).toEqual([]);
    expect(result.errors).toEqual([{ line: 2, message: "provider:hotmail" }]);
  });
});

describe("email account provider presets", () => {
  it("applies host/port/encryption while keeping credentials", () => {
    const base = { ...emptyConnection("zoho"), smtp: { ...emptyConnection().smtp, password: "secret" } };
    const next = applyProviderPreset(base, "microsoft");
    expect(next.smtp).toMatchObject({ host: "smtp.office365.com", port: 587, encryption: "tls", password: "secret" });
    expect(next.imap.host).toBe("outlook.office365.com");
  });

  it("mirrors SMTP credentials into IMAP", () => {
    const account = emptyConnection("zoho");
    account.smtp = { ...account.smtp, emailAddress: "a@b.com", userName: "a", password: "p" };
    expect(mirrorSmtpCredentials(account).imap).toMatchObject({ emailAddress: "a@b.com", userName: "a", password: "p" });
  });

  it("validates required fields and SSL/TLS for single connect", () => {
    const errors = validateConnection(emptyConnection("zoho"));
    expect(errors).toMatchObject({ fromFirstName: "required", "smtp.emailAddress": "email", "imap.password": "required" });
    const account = emptyConnection("zoho");
    account.smtp.encryption = "none";
    expect(validateConnection(account, { requireSslOrTls: true })["smtp.encryption"]).toBe("sslOrTls");
  });
});
