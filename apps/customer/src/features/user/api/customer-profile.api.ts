import { apiClient } from "@wedwizz/core/api/api-client";
import type { ApiSuccess, CustomerProfileData, SaveCustomerProfilePayload } from "@wedwizz/core/api/types";

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
