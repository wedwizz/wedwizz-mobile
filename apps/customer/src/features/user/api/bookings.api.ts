import { apiClient } from "@wedwizz/core/api/api-client";
import type { ApiSuccess, CustomerBooking, ProposeBookingPayload } from "@wedwizz/core/api/types";

interface RequestOptions {
  signal?: AbortSignal;
}

const bookingPath = (bookingId: string) => `/me/bookings/${encodeURIComponent(bookingId)}`;

/** `GET /me/bookings`: the customer's bookings with every business, latest event first. */
export async function listMyBookings(options: RequestOptions = {}): Promise<CustomerBooking[]> {
  const { data } = await apiClient.get<ApiSuccess<{ bookings: CustomerBooking[] }>>("/me/bookings", { signal: options.signal });
  return data.data.bookings;
}

/**
 * `POST /me/enquiries/:id/booking`: "I booked them". Waits for the business to confirm. 409 when the thread
 * already has a booking waiting or confirmed, or is closed; 400 for a past date.
 */
export async function proposeBooking(enquiryId: string, payload: ProposeBookingPayload): Promise<CustomerBooking> {
  const { data } = await apiClient.post<ApiSuccess<{ booking: CustomerBooking }>>(`/me/enquiries/${encodeURIComponent(enquiryId)}/booking`, payload);
  return data.data.booking;
}

/** `POST /me/bookings/:id/confirm`: confirms what the business marked; the lead becomes Booked. */
export async function confirmBooking(bookingId: string): Promise<CustomerBooking> {
  const { data } = await apiClient.post<ApiSuccess<{ booking: CustomerBooking }>>(`${bookingPath(bookingId)}/confirm`);
  return data.data.booking;
}

/** `POST /me/bookings/:id/dispute`: "It wasn't booked". */
export async function disputeBooking(bookingId: string, reason: string | null): Promise<CustomerBooking> {
  const { data } = await apiClient.post<ApiSuccess<{ booking: CustomerBooking }>>(`${bookingPath(bookingId)}/dispute`, { reason });
  return data.data.booking;
}

/** `POST /me/bookings/:id/cancel`: withdraws a waiting booking or cancels a confirmed one, before the event. */
export async function cancelBooking(bookingId: string, reason: string | null): Promise<CustomerBooking> {
  const { data } = await apiClient.post<ApiSuccess<{ booking: CustomerBooking }>>(`${bookingPath(bookingId)}/cancel`, { reason });
  return data.data.booking;
}

/** `POST /me/bookings/:id/review`: once, after the event of a confirmed booking. */
export async function createReview(bookingId: string, review: { rating: number; text: string }): Promise<CustomerBooking> {
  const { data } = await apiClient.post<ApiSuccess<{ booking: CustomerBooking }>>(`${bookingPath(bookingId)}/review`, review);
  return data.data.booking;
}
