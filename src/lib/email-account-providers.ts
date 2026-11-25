import type {
  EmailAccountConnection,
  EmailProvider,
  MailEncryption,
  MailServerSettings,
} from "@/types/email-accounts";

type ServerPreset = { host: string; port: number; encryption: MailEncryption };

/** Common SMTP/IMAP settings so users only type credentials. Editable after applying. */
export const PROVIDER_PRESETS: Partial<
  Record<EmailProvider, { smtp: ServerPreset; imap: ServerPreset }>
> = {
  gsuite: {
    smtp: { host: "smtp.gmail.com", port: 465, encryption: "ssl" },
    imap: { host: "imap.gmail.com", port: 993, encryption: "ssl" },
  },
  microsoft: {
    smtp: { host: "smtp.office365.com", port: 587, encryption: "tls" },
    imap: { host: "outlook.office365.com", port: 993, encryption: "ssl" },
  },
  o365: {
    smtp: { host: "smtp.office365.com", port: 587, encryption: "tls" },
    imap: { host: "outlook.office365.com", port: 993, encryption: "ssl" },
  },
  yahoo: {
    smtp: { host: "smtp.mail.yahoo.com", port: 465, encryption: "ssl" },
    imap: { host: "imap.mail.yahoo.com", port: 993, encryption: "ssl" },
  },
  zoho: {
    smtp: { host: "smtp.zoho.com", port: 465, encryption: "ssl" },
    imap: { host: "imap.zoho.com", port: 993, encryption: "ssl" },
  },
  godaddy: {
    smtp: { host: "smtpout.secureserver.net", port: 465, encryption: "ssl" },
    imap: { host: "imap.secureserver.net", port: 993, encryption: "ssl" },
  },
  yandex: {
    smtp: { host: "smtp.yandex.com", port: 465, encryption: "ssl" },
    imap: { host: "imap.yandex.com", port: 993, encryption: "ssl" },
  },
};

const emptyServer = (preset?: ServerPreset, fallbackPort = 465): MailServerSettings => ({
  emailAddress: "",
  userName: "",
  password: "",
  host: preset?.host ?? "",
  port: preset?.port ?? fallbackPort,
  encryption: preset?.encryption ?? "ssl",
});

export function emptyConnection(provider: EmailProvider = "zoho"): EmailAccountConnection {
  const preset = PROVIDER_PRESETS[provider];
  return {
    provider,
    fromFirstName: "",
    fromLastName: "",
    fromName: "",
    smtp: emptyServer(preset?.smtp, 465),
    imap: emptyServer(preset?.imap, 993),
  };
}

/** Applies the provider's hosts/ports/encryption, keeping credentials. */
export function applyProviderPreset(
  account: EmailAccountConnection,
  provider: EmailProvider,
): EmailAccountConnection {
  const preset = PROVIDER_PRESETS[provider];
  if (!preset) return { ...account, provider };
  return {
    ...account,
    provider,
    smtp: { ...account.smtp, ...preset.smtp },
    imap: { ...account.imap, ...preset.imap },
  };
}

/** "IMAP uses the same credentials as SMTP": copies address, user and password. */
export function mirrorSmtpCredentials(account: EmailAccountConnection): EmailAccountConnection {
  return {
    ...account,
    imap: {
      ...account.imap,
      emailAddress: account.smtp.emailAddress,
      userName: account.smtp.userName,
      password: account.smtp.password,
    },
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ConnectionErrorKey = "required" | "email" | "port" | "sslOrTls";
export type ConnectionErrors = Partial<Record<string, ConnectionErrorKey>>;

/** Client-side validation mirroring the backend DTO. Keys are field paths. */
export function validateConnection(
  account: EmailAccountConnection,
  options: { requireSslOrTls?: boolean } = {},
): ConnectionErrors {
  const errors: ConnectionErrors = {};
  if (!account.fromFirstName.trim()) errors.fromFirstName = "required";
  if (!account.fromLastName.trim()) errors.fromLastName = "required";
  for (const side of ["smtp", "imap"] as const) {
    const server = account[side];
    if (!EMAIL_RE.test(server.emailAddress.trim())) errors[`${side}.emailAddress`] = "email";
    if (!server.userName.trim()) errors[`${side}.userName`] = "required";
    if (!server.password) errors[`${side}.password`] = "required";
    if (server.host.trim().length < 3) errors[`${side}.host`] = "required";
    if (!Number.isInteger(server.port) || server.port < 1 || server.port > 65535) {
      errors[`${side}.port`] = "port";
    }
    if (options.requireSslOrTls && server.encryption === "none") {
      errors[`${side}.encryption`] = "sslOrTls";
    }
  }
  return errors;
}

/** Trims text fields before sending. */
export function normalizeConnection(account: EmailAccountConnection): EmailAccountConnection {
  const server = (s: MailServerSettings): MailServerSettings => ({
    ...s,
    emailAddress: s.emailAddress.trim(),
    userName: s.userName.trim(),
    host: s.host.trim(),
  });
  return {
    ...account,
    fromFirstName: account.fromFirstName.trim(),
    fromLastName: account.fromLastName.trim(),
    fromName: account.fromName?.trim() || undefined,
    smtp: server(account.smtp),
    imap: server(account.imap),
  };
}
