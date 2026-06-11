import type { AxiosRequestConfig } from "axios";

export type ApiRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

export type ApiLogContext = {
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
};
