/** Email Accounts module (Saleshandy sender mailboxes, HU-EA-000..006). */

export const EMAIL_ACCOUNT_STATUSES = ["CONNECTED", "DISCONNECTED", "PAUSED"] as const;
export type EmailAccountStatus = (typeof EMAIL_ACCOUNT_STATUSES)[number];

export const EMAIL_PROVIDERS = [
  "gsuite",
  "microsoft",
  "o365",
  "yahoo",
  "zoho",
  "godaddy",
  "yandex",
  "sendgrid",
  "other",
] as const;
export type EmailProvider = (typeof EMAIL_PROVIDERS)[number];

export const MAIL_ENCRYPTIONS = ["ssl", "tls", "none"] as const;
export type MailEncryption = (typeof MAIL_ENCRYPTIONS)[number];

export type EmailAccountSettings = {
  dailySendingLimit: number | null;
  availableQuota: number | null;
  maxSendingLimit: number | null;
  minIntervalSeconds: number | null;
  maxIntervalSeconds: number | null;
  rampUpEnabled: boolean | null;
  rampUpInitialSendingLimit: number | null;
  rampUpPercent: number | null;
  rampUpLimit: number | null;
  bcc: string | null;
  signatureHtml: string | null;
};

export type EmailAccount = {
  id: string;
  fromName: string;
  fromEmail: string;
  senderFirstName: string;
  provider: string | null;
  type: "GMAIL" | "MICROSOFT" | "SMTP_IMAP";
  status: EmailAccountStatus;
  isDefault: boolean;
  healthScore: number | null;
  createdAt: string | null;
  addedBy: string | null;
  client: { id: string; name: string } | null;
  sequences: Array<{ id: string; title: string; active: boolean }>;
  settings: EmailAccountSettings;
};

export type EmailAccountsPage = {
  data: EmailAccount[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  counts: { connected: number; disconnected: number; paused: number };
};

export const EMAIL_ACCOUNT_SORT_KEYS = [
  "createdAt",
  "healthScore",
  "remainingQuota",
  "client",
] as const;
export type EmailAccountSortKey = (typeof EMAIL_ACCOUNT_SORT_KEYS)[number];

export type EmailAccountsQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: EmailAccountStatus;
  providers?: string[];
  sequenceIds?: string[];
  clientIds?: string[];
  sortBy: EmailAccountSortKey;
  sortOrder: "asc" | "desc";
};

export type EmailAccountOptions = {
  sequences: Array<{ id: string; title: string; active: boolean }>;
  clients: Array<{ id: string; name: string }>;
};

export type MailServerSettings = {
  emailAddress: string;
  userName: string;
  password: string;
  host: string;
  port: number;
  encryption: MailEncryption;
};

/** One sender mailbox (single connect, bulk connect and CSV share this shape). */
export type EmailAccountConnection = {
  provider: EmailProvider;
  fromFirstName: string;
  fromLastName: string;
  fromName?: string;
  smtp: MailServerSettings;
  imap: MailServerSettings;
};

export type SmtpImapConnectResult = {
  saved: true;
  verified: boolean;
  status: 0 | 1;
  emailAccountId: string | null;
  smtp: { ok: boolean; error: string | null };
  imap: { ok: boolean; error: string | null };
  message: string | null;
};

export type EmailAccountJobStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export type EmailAccountJob = {
  id: string;
  requestId: string;
  type: "CONNECT" | "RECONNECT";
  status: EmailAccountJobStatus;
  accountCount: number;
  targets: string[];
  reportUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  initiatedBy?: { id: string; name: string; email: string } | null;
};

export type BulkUpdatePayload = {
  emailAccountIds: string[];
  senderFirstName?: string;
  senderLastName?: string;
  dailyQuota?: number;
  bcc?: string;
  signatureHtml?: string;
  sendingIntervalMin?: number;
  sendingIntervalMax?: number;
  rampUpInitialSendingLimit?: number;
  rampUpPercent?: number;
  clientId?: string;
};

export type SaleshandyIntegrationStatus = {
  configured: boolean;
  connected: boolean;
  latencyMs?: number;
  credits?: number | null;
  errorCode?: string;
  message?: string;
};
