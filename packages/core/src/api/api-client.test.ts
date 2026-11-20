import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { apiClient, getAccessToken, memoryRefreshTokenStore, readRefreshToken, refreshAccessToken, saveRefreshToken, setAccessToken, setRefreshTokenStore } from "./api-client";
import { logout, verifyOtp } from "./auth.api";

// The app's session over the server's body transport: the refresh token is stored on the device and sent in the body.

interface Sent {
  url?: string;
  body: unknown;
  headers: Record<string, unknown>;
  withCredentials?: boolean;
}

let sent: Sent[] = [];
const originalAdapter = apiClient.defaults.adapter;

/** Answers each request with `reply(url)`: a body to return, or an error to throw. */
function fakeServer(reply: (url: string | undefined, config: InternalAxiosRequestConfig) => unknown) {
  const adapter: AxiosAdapter = async (config) => {
    sent.push({ url: config.url, body: config.data ? JSON.parse(config.data as string) : undefined, headers: config.headers.toJSON(), withCredentials: config.withCredentials });
    const data = reply(config.url, config);
    if (data instanceof Error) throw data;
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
  apiClient.defaults.adapter = adapter;
}

function httpError(status: number, config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError("Request failed", "ERR_BAD_RESPONSE", config, null, {
    data: { success: false, message: "Unauthorized" },
    status,
    statusText: "",
    headers: {},
    config,
  });
}

const ok = <T>(data: T) => ({ success: true, message: "ok", data });

beforeEach(() => {
  sent = [];
  setRefreshTokenStore(memoryRefreshTokenStore());
  setAccessToken(null);
});
afterEach(() => {
  apiClient.defaults.adapter = originalAdapter;
});

describe("signing in", () => {
  it("keeps the refresh token from the body on the device and never returns it", async () => {
    fakeServer(() => ok({ isNewAccount: false, accessToken: "access-1", refreshToken: "refresh-1", account: { accountId: "a1", phoneNumber: "9876543210", role: "USER" } }));
    const result = await verifyOtp({ phoneNumber: "9876543210", role: "USER", otp: "123456" });
    expect(result).not.toHaveProperty("refreshToken");
    expect(result.accessToken).toBe("access-1");
    expect(getAccessToken()).toBe("access-1");
    expect(await readRefreshToken()).toBe("refresh-1");
  });

  it("asks for the body transport: no cookie header, no credentials", async () => {
    fakeServer(() => ok({ isNewAccount: false, accessToken: "a", refreshToken: "r", account: {} }));
    await verifyOtp({ phoneNumber: "9876543210", role: "USER", otp: "123456" });
    expect(sent[0].headers).not.toHaveProperty("X-Token-Transport");
    expect(sent[0].withCredentials).toBeFalsy();
  });
});

describe("refreshing the session", () => {
  it("sends the stored token in the body and keeps the rotated one", async () => {
    await saveRefreshToken("refresh-1");
    fakeServer(() => ok({ accessToken: "access-2", refreshToken: "refresh-2" }));
    expect(await refreshAccessToken()).toBe("access-2");
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ url: "/auth/refresh", body: { refreshToken: "refresh-1" } });
    expect(await readRefreshToken()).toBe("refresh-2");
  });

  it("fails at once for a visitor, without a request", async () => {
    fakeServer(() => ok({}));
    await expect(refreshAccessToken()).rejects.toMatchObject({ status: 401 });
    expect(sent).toHaveLength(0);
  });

  it("shares one request between concurrent callers, so a token is never sent twice", async () => {
    await saveRefreshToken("refresh-1");
    fakeServer(() => ok({ accessToken: "access-2", refreshToken: "refresh-2" }));
    const [a, b] = await Promise.all([refreshAccessToken(), refreshAccessToken()]);
    expect([a, b]).toEqual(["access-2", "access-2"]);
    expect(sent).toHaveLength(1);
  });

  it("forgets a token the server refused", async () => {
    await saveRefreshToken("revoked");
    fakeServer((_url, config) => httpError(401, config));
    await expect(refreshAccessToken()).rejects.toMatchObject({ kind: "http", status: 401 });
    expect(await readRefreshToken()).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it("keeps the token when the phone is offline or the server fails, so the next launch can still sign in", async () => {
    await saveRefreshToken("refresh-1");
    fakeServer((_url, config) => new AxiosError("Network Error", "ERR_NETWORK", config));
    await expect(refreshAccessToken()).rejects.toMatchObject({ kind: "network" });
    expect(await readRefreshToken()).toBe("refresh-1");

    fakeServer((_url, config) => httpError(503, config));
    await expect(refreshAccessToken()).rejects.toMatchObject({ status: 503 });
    expect(await readRefreshToken()).toBe("refresh-1");
  });

  it("replays a request that failed on an expired access token, with the new one", async () => {
    await saveRefreshToken("refresh-1");
    setAccessToken("expired");
    fakeServer((url, config) => {
      if (url === "/auth/refresh") return ok({ accessToken: "access-2", refreshToken: "refresh-2" });
      return config.headers.get("Authorization") === "Bearer access-2" ? ok("fine") : httpError(401, config);
    });
    const { data } = await apiClient.get("/me/things");
    expect(data.data).toBe("fine");
    expect(sent.map((s) => s.url)).toEqual(["/me/things", "/auth/refresh", "/me/things"]);
  });
});

describe("logging out", () => {
  it("sends the refresh token in the body and forgets both tokens", async () => {
    await saveRefreshToken("refresh-1");
    setAccessToken("access-1");
    fakeServer(() => ok(null));
    await logout();
    expect(sent[0]).toMatchObject({ url: "/auth/logout", body: { refreshToken: "refresh-1" } });
    expect(getAccessToken()).toBeNull();
    expect(await readRefreshToken()).toBeNull();
  });

  it("forgets both tokens on this device even when the call fails", async () => {
    await saveRefreshToken("refresh-1");
    setAccessToken("access-1");
    fakeServer((_url, config) => new AxiosError("Network Error", "ERR_NETWORK", config));
    await expect(logout()).rejects.toBeTruthy();
    expect(getAccessToken()).toBeNull();
    expect(await readRefreshToken()).toBeNull();
  });
});
