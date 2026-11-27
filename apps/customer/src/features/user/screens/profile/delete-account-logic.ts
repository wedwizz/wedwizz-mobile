// Copied from the web: features/user/lib/delete-account.ts.
import type { BookingStatus } from "@wedwizz/core/api/types";

/** Bookings that deleting the account cancels: still pending or confirmed, event today or later (as the server counts). */
export function upcomingBookingCount(bookings: readonly { status: BookingStatus; eventDate: string }[] | undefined, today: string): number {
  return (bookings ?? []).filter((b) => (b.status === "PENDING" || b.status === "CONFIRMED") && b.eventDate >= today).length;
}

/** The warning above the button, or null when nothing upcoming would be cancelled. */
export function upcomingBookingsWarning(count: number): string | null {
  if (count === 0) return null;
  const which = count === 1 ? "1 upcoming booking" : `${count} upcoming bookings`;
  return `You have ${which}. Deleting your account cancels ${count === 1 ? "it" : "them"}, and the vendor will see that you deleted your account.`;
}
