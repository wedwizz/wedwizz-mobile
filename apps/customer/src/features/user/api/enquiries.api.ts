import { apiClient } from "@wedwizz/core/api/api-client";
import type {
  ApiSuccess,
  ChatMessage,
  ContactBusinessPayload,
  ContactBusinessResult,
  CustomerEnquiry,
  CustomerThread,
  StartEnquiryPayload,
  StartEnquiryResult,
} from "@wedwizz/core/api/types";

interface RequestOptions {
  signal?: AbortSignal;
}

/**
 * `POST /me/enquiries`: the first message to a business creates its lead; later ones join the open thread
 * (an availability check also updates its date and guests). 403 without a saved profile, 404 when the
 * business is not public, 429 at the daily limit of new conversations.
 */
export async function startEnquiry(payload: StartEnquiryPayload): Promise<StartEnquiryResult> {
  const { data } = await apiClient.post<ApiSuccess<StartEnquiryResult>>("/me/enquiries", payload);
  return data.data;
}

/** `GET /me/enquiries`: most recent conversation first; with `slug`, only those with that business. */
export async function listEnquiries(query: { slug?: string } = {}, options: RequestOptions = {}): Promise<CustomerEnquiry[]> {
  const { data } = await apiClient.get<ApiSuccess<{ enquiries: CustomerEnquiry[] }>>("/me/enquiries", { params: query, signal: options.signal });
  return data.data.enquiries;
}

/** `GET /me/enquiries/:id`: the thread and its newest messages, or older ones `before` a message id. */
export async function getEnquiryThread(enquiryId: string, query: { before?: string } = {}, options: RequestOptions = {}): Promise<CustomerThread> {
  const { data } = await apiClient.get<ApiSuccess<CustomerThread>>(`/me/enquiries/${enquiryId}`, { params: query, signal: options.signal });
  return data.data;
}

/** `POST /me/enquiries/:id/messages`. 409 once the thread is closed. */
export async function sendEnquiryMessage(enquiryId: string, text: string): Promise<ChatMessage> {
  const { data } = await apiClient.post<ApiSuccess<{ message: ChatMessage }>>(`/me/enquiries/${enquiryId}/messages`, { text });
  return data.data.message;
}

/** `POST /me/enquiries/:id/read`: marks the business's messages as read. */
export async function markEnquiryRead(enquiryId: string): Promise<void> {
  await apiClient.post(`/me/enquiries/${enquiryId}/read`);
}

/** `POST /me/enquiries/:id/share-phone`: shows the customer's number to this business only. Cannot be undone. */
export async function shareEnquiryPhone(enquiryId: string): Promise<{ phoneSharedAt: string }> {
  const { data } = await apiClient.post<ApiSuccess<{ phoneSharedAt: string }>>(`/me/enquiries/${enquiryId}/share-phone`);
  return data.data;
}

/**
 * `POST /enquiries/contact`: the WhatsApp or Call button. Records the contact as a lead (or a note in the open
 * thread), then returns the business's number to open. 404 when the business does not show that button.
 */
export async function contactBusiness(payload: ContactBusinessPayload): Promise<ContactBusinessResult> {
  const { data } = await apiClient.post<ApiSuccess<ContactBusinessResult>>("/enquiries/contact", payload);
  return data.data;
}
