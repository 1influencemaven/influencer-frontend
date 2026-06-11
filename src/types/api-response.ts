export type ApiResponse<T> = {
  data: T;
  message?: string;
  success?: boolean;
};

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  return response.data;
}
