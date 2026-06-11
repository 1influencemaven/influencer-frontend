export type ApiError = {
  status: number;
  message: string;
  code?: string;
  data?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStringField(data: unknown, key: string): string | undefined {
  if (!isRecord(data)) {
    return undefined;
  }

  const value = data[key];
  return typeof value === "string" ? value : undefined;
}

export function isApiError(error: unknown): error is ApiError {
  if (!isRecord(error)) {
    return false;
  }

  return (
    typeof error.status === "number" && typeof error.message === "string"
  );
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (isAxiosLikeError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const message =
      readStringField(data, "message") ??
      readStringField(data, "error") ??
      error.message ??
      "Request failed";

    const code = readStringField(data, "code");

    return {
      status,
      message,
      code,
      data,
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      message: error.message,
    };
  }

  return {
    status: 0,
    message: "Unknown error",
  };
}

type AxiosLikeError = {
  isAxiosError: true;
  message: string;
  response?: {
    status: number;
    data?: unknown;
  };
};

function isAxiosLikeError(error: unknown): error is AxiosLikeError {
  return isRecord(error) && error.isAxiosError === true;
}
