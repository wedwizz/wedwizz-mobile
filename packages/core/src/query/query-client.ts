import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/api-error";

const MAX_RETRIES = 2;

/**
 * Retry only failures that can succeed on a second try: network drops, timeouts, 5xx, 408 and 429.
 * Other 4xx answers (validation, 401/403, 404) will not change, so retrying only delays the error.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (!(error instanceof ApiError)) return true;
  if (error.kind === "canceled") return false;
  if (error.kind !== "http" || error.status === undefined) return true;
  return error.status >= 500 || error.status === 408 || error.status === 429;
}

/** The one cache of server data for the whole app. Components read it through query hooks only. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
    mutations: {
      // Writes are not guaranteed idempotent, so they are never replayed automatically.
      retry: false,
    },
  },
});
