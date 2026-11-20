import axios, { type InternalAxiosRequestConfig } from "axios";
import { ApiError, toApiError } from "./api-error";
import type { ApiSuccess, RefreshData } from "./types";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Never try to refresh the session for this request (auth endpoints). */
    skipAuthRefresh?: boolean;
    /** Set once a request has been retried after a refresh, to prevent loops. */
    _retried?: boolean;
  }
}

/** The API root, e.g. http://192.168.1.10:3000/api/v1. Must be absolute: a phone has no page origin to resolve against. */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
if (!API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env in the app folder and set the API URL.");
}

/**
 * The only HTTP client of the app. Pages call typed functions in `*.api.ts` files, never this directly.
 *
 * Session model (matches WeddingPlannerServer's body transport; the web uses its cookie transport instead):
 * - The access token lives in memory only and is sent as `Authorization: Bearer`.
 * - The refresh token is kept by a `RefreshTokenStore` (the phone's secure storage) and sent in the request body of
 *   `/auth/refresh` and `/auth/logout`. Without the `X-Token-Transport: cookie` header the server also returns it in
 *   the response body.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/** Where the refresh token is kept between launches (expo-secure-store in the apps: native/secure-refresh-token.ts). */
export interface RefreshTokenStore {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  clear(): Promise<void>;
}

/** Until the app installs its store: memory only, so a restart signs out. */
export function memoryRefreshTokenStore(): RefreshTokenStore {
  let token: string | null = null;
  return {
    get: async () => token,
    set: async (value) => {
      token = value;
    },
    clear: async () => {
      token = null;
    },
  };
}

let refreshTokenStore: RefreshTokenStore = memoryRefreshTokenStore();
// Reads and writes run one after another, so a sign-out's clear can never land after the next sign-in's save.
let tokenQueue: Promise<unknown> = Promise.resolve();

function queued<T>(task: () => Promise<T>): Promise<T> {
  const result = tokenQueue.then(task);
  tokenQueue = result.catch(() => undefined);
  return result;
}

/** Called once at app start, before the session is restored. */
export function setRefreshTokenStore(store: RefreshTokenStore): void {
  refreshTokenStore = store;
}

/** Keeps the refresh token from a sign-in or refresh. A failed write only costs staying signed in after a restart. */
export function saveRefreshToken(token: string): Promise<void> {
  return queued(() => refreshTokenStore.set(token)).catch(() => undefined);
}

/** Forgets the refresh token (sign-out, or the server refused it). */
export function forgetRefreshToken(): Promise<void> {
  return queued(() => refreshTokenStore.clear()).catch(() => undefined);
}

/** The stored refresh token, or null (a visitor, or storage unreadable). */
export function readRefreshToken(): Promise<string | null> {
  return queued(() => refreshTokenStore.get()).catch(() => null);
}

let accessToken: string | null = null;
const sessionExpiredListeners = new Set<() => void>();
const tokenListeners = new Set<(token: string | null) => void>();

export function setAccessToken(token: string | null): void {
  if (token === accessToken) return;
  accessToken = token;
  for (const listener of tokenListeners) listener(token);
}

/** The access token in memory, e.g. for the chat socket's connect packet. Null when signed out. */
export function getAccessToken(): string | null {
  return accessToken;
}

/** Called with the new token after every sign-in, refresh and sign-out (null). */
export function onAccessTokenChange(listener: (token: string | null) => void): () => void {
  tokenListeners.add(listener);
  return () => tokenListeners.delete(listener);
}

/** True once a sign-in or refresh has put an access token in memory (it is lost on reload). */
export function hasAccessToken(): boolean {
  return accessToken !== null;
}

/** Called when the session can no longer be refreshed (logged out elsewhere, expired, revoked). */
export function onSessionExpired(listener: () => void): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

/**
 * The browser-wide lock serialises refreshes across tabs: refresh tokens rotate, and sending an
 * already-rotated token makes the server revoke the whole session. An app has one JS runtime and no
 * `navigator.locks`, so there it falls through to `refreshInFlight` below, which already shares one request.
 */
function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    return navigator.locks.request("wedwizz-auth-refresh", task);
  }
  return task();
}

let refreshInFlight: Promise<string> | null = null;

/** The server refused the refresh token itself (expired, revoked, already rotated): it will never work again. */
function isRejectedRefreshToken(error: ApiError): boolean {
  return error.kind === "http" && (error.status === 400 || error.status === 401);
}

/**
 * Exchanges the stored refresh token for a new access token, and stores the rotated refresh token. Concurrent callers
 * (including React StrictMode's double effects) share one request, so the token is never sent twice.
 * Without a stored token (a visitor) it fails at once, without a request. A network or server error keeps the stored
 * token: an offline launch is signed out for now, not for good.
 */
export function refreshAccessToken(): Promise<string> {
  refreshInFlight ??= withRefreshLock(async () => {
    const refreshToken = await readRefreshToken();
    if (!refreshToken) throw new ApiError("http", "Not signed in.", 401);
    try {
      const { data } = await apiClient.post<ApiSuccess<RefreshData>>("/auth/refresh", { refreshToken }, { skipAuthRefresh: true });
      await saveRefreshToken(data.data.refreshToken);
      setAccessToken(data.data.accessToken);
      return data.data.accessToken;
    } catch (error) {
      const apiError = toApiError(error);
      if (isRejectedRefreshToken(apiError)) await forgetRefreshToken();
      throw apiError;
    }
  })
    .catch((error: unknown) => {
      setAccessToken(null);
      throw toApiError(error);
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const config = axios.isAxiosError(error) ? error.config : undefined;
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const sentAccessToken = config?.headers.has("Authorization") ?? false;

    // An expired access token is rejected by the auth middleware before any handler runs,
    // so replaying the request once after a refresh cannot apply it twice.
    if (status === 401 && config && sentAccessToken && !config.skipAuthRefresh && !config._retried) {
      config._retried = true;
      try {
        const token = await refreshAccessToken();
        config.headers.set("Authorization", `Bearer ${token}`);
        return apiClient(config);
      } catch (refreshError) {
        sessionExpiredListeners.forEach((listener) => listener());
        return Promise.reject(toApiError(refreshError));
      }
    }

    return Promise.reject(toApiError(error));
  },
);
