import apiClient from "@/lib/api/client";
import type {
  BulkUpdatePayload,
  EmailAccountConnection,
  EmailAccountJob,
  EmailAccountOptions,
  EmailAccountsPage,
  EmailAccountsQuery,
  SaleshandyIntegrationStatus,
  SmtpImapConnectResult,
} from "@/types/email-accounts";

const BASE = "/email-accounts";

/** SMTP + IMAP verification against slow mail servers can take > 30 s. */
const SINGLE_CONNECT_TIMEOUT_MS = 130_000;

function toParams(query: EmailAccountsQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.status) params.status = query.status;
  if (query.providers?.length) params.providers = query.providers.join(",");
  if (query.sequenceIds?.length) params.sequenceIds = query.sequenceIds.join(",");
  if (query.clientIds?.length) params.clientIds = query.clientIds.join(",");
  return params;
}

export async function listEmailAccounts(
  query: EmailAccountsQuery,
): Promise<EmailAccountsPage> {
  const { data } = await apiClient.get<EmailAccountsPage>(BASE, {
    params: toParams(query),
  });
  return data;
}

export async function getEmailAccountOptions(): Promise<EmailAccountOptions> {
  const { data } = await apiClient.get<EmailAccountOptions>(`${BASE}/options`);
  return data;
}

export async function getSaleshandyStatus(): Promise<SaleshandyIntegrationStatus> {
  const { data } = await apiClient.get<SaleshandyIntegrationStatus>(
    `${BASE}/integration/status`,
  );
  return data;
}

export async function connectEmailAccount(
  account: EmailAccountConnection,
): Promise<SmtpImapConnectResult> {
  const { data } = await apiClient.post<SmtpImapConnectResult>(
    `${BASE}/smtp-imap/connect`,
    account,
    { timeout: SINGLE_CONNECT_TIMEOUT_MS },
  );
  return data;
}

export async function connectEmailAccounts(
  accounts: EmailAccountConnection[],
): Promise<EmailAccountJob> {
  const { data } = await apiClient.post<EmailAccountJob>(`${BASE}/connect`, {
    accounts,
  });
  return data;
}

export async function reconnectEmailAccounts(
  emailAccountIds: string[],
): Promise<EmailAccountJob> {
  const { data } = await apiClient.post<EmailAccountJob>(`${BASE}/reconnect`, {
    emailAccountIds,
  });
  return data;
}

export async function listEmailAccountJobs(): Promise<EmailAccountJob[]> {
  const { data } = await apiClient.get<EmailAccountJob[]>(`${BASE}/jobs`);
  return data;
}

export async function getEmailAccountJob(id: string): Promise<EmailAccountJob> {
  const { data } = await apiClient.get<EmailAccountJob>(`${BASE}/jobs/${id}`);
  return data;
}

export async function bulkUpdateEmailAccounts(
  payload: BulkUpdatePayload,
): Promise<{ updated: number; requests: number }> {
  const { data } = await apiClient.post<{ updated: number; requests: number }>(
    `${BASE}/bulk-update`,
    payload,
  );
  return data;
}

export const emailAccountsService = {
  listEmailAccounts,
  getEmailAccountOptions,
  getSaleshandyStatus,
  connectEmailAccount,
  connectEmailAccounts,
  reconnectEmailAccounts,
  listEmailAccountJobs,
  getEmailAccountJob,
  bulkUpdateEmailAccounts,
};
