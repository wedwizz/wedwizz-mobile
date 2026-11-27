import { apiClient } from "@wedwizz/core/api/api-client";
import type { ApiSuccess, CustomerProfileData, DeleteAccountData, SaveCustomerProfilePayload } from "@wedwizz/core/api/types";

interface RequestOptions {
  signal?: AbortSignal;
}

/** `GET /me/profile`: the signed-in customer's profile, or `profile: null` before setup. */
export async function getCustomerProfile(options: RequestOptions = {}): Promise<CustomerProfileData> {
  const { data } = await apiClient.get<ApiSuccess<CustomerProfileData>>("/me/profile", { signal: options.signal });
  return data.data;
}

/** `PUT /me/profile`: creates or replaces the profile. 400 with field issues for invalid input. */
export async function saveCustomerProfile(payload: SaveCustomerProfilePayload): Promise<CustomerProfileData> {
  const { data } = await apiClient.put<ApiSuccess<CustomerProfileData>>("/me/profile", payload);
  return data.data;
}

/**
 * `DELETE /me/account`: deletes the signed-in customer's account (profile, favourites, checklist, sign-ins). Vendors keep
 * their threads and past bookings as "Customer"; upcoming bookings are cancelled. Sign out locally afterwards.
 */
export async function deleteCustomerAccount(): Promise<DeleteAccountData> {
  const { data } = await apiClient.delete<ApiSuccess<DeleteAccountData>>("/me/account");
  return data.data;
}
