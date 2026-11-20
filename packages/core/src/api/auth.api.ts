import { apiClient, forgetRefreshToken, readRefreshToken, saveRefreshToken, setAccessToken } from "./api-client";
import type { ApiSuccess, MeData, RequestOtpPayload, VerifyOtpData, VerifyOtpPayload, VerifyOtpResponse } from "./types";

interface RequestOptions {
  signal?: AbortSignal;
}

/** `POST /auth/otp/request`. Resolves only when the server confirms the OTP was sent. */
export async function requestOtp(payload: RequestOtpPayload, options: RequestOptions = {}): Promise<void> {
  await apiClient.post<ApiSuccess<null>>("/auth/otp/request", payload, {
    signal: options.signal,
    skipAuthRefresh: true,
  });
}

/**
 * `POST /auth/otp/verify`. Stores the access token in memory and the refresh token (from the body) in the app's
 * refresh-token store; the refresh token is not returned.
 */
export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpData> {
  const { data } = await apiClient.post<ApiSuccess<VerifyOtpResponse>>("/auth/otp/verify", payload, {
    skipAuthRefresh: true,
  });
  const { refreshToken, ...result } = data.data;
  await saveRefreshToken(refreshToken);
  setAccessToken(result.accessToken);
  return result;
}

/** `GET /auth/me` (requires an access token). */
export async function getMe(options: RequestOptions = {}): Promise<MeData> {
  const { data } = await apiClient.get<ApiSuccess<MeData>>("/auth/me", { signal: options.signal });
  return data.data;
}

/**
 * `POST /auth/logout`. The server revokes the session found via the refresh token in the body (or the access
 * token). Both tokens are dropped on this device even if the call fails.
 */
export async function logout(): Promise<void> {
  try {
    const refreshToken = await readRefreshToken();
    await apiClient.post<ApiSuccess<null>>("/auth/logout", refreshToken ? { refreshToken } : {}, { skipAuthRefresh: true });
  } finally {
    setAccessToken(null);
    await forgetRefreshToken();
  }
}
