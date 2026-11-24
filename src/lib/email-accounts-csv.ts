import {
  EMAIL_PROVIDERS,
  MAIL_ENCRYPTIONS,
  type EmailAccountConnection,
  type EmailProvider,
  type MailEncryption,
} from "@/types/email-accounts";

/** CSV columns for bulk import (same order as the downloadable template). */
export const CSV_COLUMNS = [
  "provider",
  "fromFirstName",
  "fromLastName",
  "smtpEmail",
  "smtpUserName",
  "smtpPassword",
  "smtpHost",
  "smtpPort",
  "smtpEncryption",
  "imapEmail",
  "imapUserName",
  "imapPassword",
  "imapHost",
  "imapPort",
  "imapEncryption",
] as const;

export function csvTemplate(): string {
  const example = [
    "zoho",
    "Ana",
    "Pérez",
    "ana@brand-mail.com",
    "ana@brand-mail.com",
    "smtp-password",
    "smtp.zoho.com",
    "465",
    "ssl",
    "ana@brand-mail.com",
    "ana@brand-mail.com",
    "imap-password",
    "imap.zoho.com",
    "993",
    "ssl",
  ];
  return `${CSV_COLUMNS.join(",")}\n${example.join(",")}\n`;
}

/** Minimal RFC 4180 parser: quoted fields, escaped quotes, CRLF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const input = text.replace(/^﻿/, "");
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === "," || char === ";") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

export type CsvImportResult = {
  accounts: EmailAccountConnection[];
  errors: Array<{ line: number; message: string }>;
};

const lower = (value: string | undefined) => (value ?? "").trim().toLowerCase();

/** Parses the template format into connections. Header row is required. */
export function importAccountsCsv(text: string): CsvImportResult {
  const rows = parseCsv(text);
  const errors: CsvImportResult["errors"] = [];
  if (rows.length === 0) return { accounts: [], errors: [{ line: 1, message: "empty" }] };

  const header = rows[0].map((h) => h.trim());
  const index = new Map(header.map((name, i) => [name, i]));
  const missing = CSV_COLUMNS.filter((column) => !index.has(column));
  if (missing.length > 0) {
    return { accounts: [], errors: [{ line: 1, message: `missingColumns:${missing.join("|")}` }] };
  }

  const accounts: EmailAccountConnection[] = [];
  rows.slice(1).forEach((cells, offset) => {
    const line = offset + 2;
    const get = (column: (typeof CSV_COLUMNS)[number]) =>
      (cells[index.get(column)!] ?? "").trim();
    const provider = lower(get("provider"));
    const smtpEncryption = lower(get("smtpEncryption"));
    const imapEncryption = lower(get("imapEncryption"));
    if (!EMAIL_PROVIDERS.includes(provider as EmailProvider)) {
      errors.push({ line, message: `provider:${provider}` });
      return;
    }
    if (
      !MAIL_ENCRYPTIONS.includes(smtpEncryption as MailEncryption) ||
      !MAIL_ENCRYPTIONS.includes(imapEncryption as MailEncryption)
    ) {
      errors.push({ line, message: "encryption" });
      return;
    }
    accounts.push({
      provider: provider as EmailProvider,
      fromFirstName: get("fromFirstName"),
      fromLastName: get("fromLastName"),
      smtp: {
        emailAddress: get("smtpEmail"),
        userName: get("smtpUserName"),
        password: get("smtpPassword"),
        host: get("smtpHost"),
        port: Number(get("smtpPort")),
        encryption: smtpEncryption as MailEncryption,
      },
      imap: {
        emailAddress: get("imapEmail"),
        userName: get("imapUserName") || get("imapEmail"),
        password: get("imapPassword"),
        host: get("imapHost"),
        port: Number(get("imapPort")),
        encryption: imapEncryption as MailEncryption,
      },
    });
  });
  return { accounts, errors };
}
