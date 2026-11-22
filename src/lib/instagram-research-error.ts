import { getApiErrorMessage, isApiError } from "@/types/api-error";

type Translate = (key: string) => string;

export function messageForInstagramResearchCode(
  code: string | null | undefined,
  t: Translate,
  options?: { invalidKey?: "invalidUsername" | "invalidHandle" },
): string {
  const invalidKey = options?.invalidKey ?? "invalidUsername";

  switch (code) {
    case "PROFILE_NOT_FOUND":
      return t("notFound");
    case "INCOMPLETE_RESPONSE":
      return t("incomplete");
    case "PROVIDER_TIMEOUT":
      return t("timeout");
    case "NOT_CONFIGURED":
      return t("notConfigured");
    case "INSTAGRAM_DUPLICATE":
      return t("duplicate");
    case "INVALID_INSTAGRAM":
      return t(invalidKey);
    case "RESEARCH_IN_PROGRESS":
      return t("inProgress");
    default:
      return t("error");
  }
}

export function messageForInstagramResearchError(
  error: unknown,
  t: Translate,
  options?: { invalidKey?: "invalidUsername" | "invalidHandle" },
): string {
  const invalidKey = options?.invalidKey ?? "invalidUsername";

  if (isApiError(error)) {
    if (error.code) {
      if (
        error.code === "RESEARCH_IN_PROGRESS" ||
        error.code === "INSTAGRAM_DUPLICATE" ||
        error.code === "PROFILE_NOT_FOUND" ||
        error.code === "INCOMPLETE_RESPONSE" ||
        error.code === "PROVIDER_TIMEOUT" ||
        error.code === "NOT_CONFIGURED" ||
        error.code === "INVALID_INSTAGRAM"
      ) {
        return messageForInstagramResearchCode(error.code, t, { invalidKey });
      }
    }

    if (error.status === 404) {
      return t("notFound");
    }
    if (error.status === 422) {
      return t("incomplete");
    }
    if (error.status === 504) {
      return t("timeout");
    }
    if (error.status === 503) {
      return t("notConfigured");
    }
    if (error.status === 409) {
      return t("inProgress");
    }
    if (error.status === 400) {
      return t(invalidKey);
    }

    return getApiErrorMessage(error, t("error"));
  }

  return getApiErrorMessage(error, t("error"));
}
