const AUTH_PATHS_WITHOUT_REFRESH = [
  "/auth/refresh",
  "/auth/login",
  "/auth/logout",
] as const;

export function shouldAttemptRefresh(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  return !AUTH_PATHS_WITHOUT_REFRESH.some((path) => url.includes(path));
}
