import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelBooking, confirmBooking, createReview, disputeBooking, listMyBookings, proposeBooking } from "@/features/user/api/bookings.api";
import type { ProposeBookingPayload } from "@wedwizz/core/api/types";
import { bookingKeys, catalogKeys, enquiryKeys } from "@wedwizz/core/query/query-keys";

/** The customer's bookings. */
export function useMyBookings() {
  return useQuery({
    queryKey: bookingKeys.customer(),
    queryFn: ({ signal }) => listMyBookings({ signal }),
  });
}

/** A booking change shows in the bookings list, the threads (their banner) and, for a review, the rating. */
function useBookingMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.customer() });
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.all });
    },
  });
}

export function useProposeBooking(enquiryId: string) {
  return useBookingMutation((payload: ProposeBookingPayload) => proposeBooking(enquiryId, payload));
}

export function useConfirmBooking() {
  return useBookingMutation((bookingId: string) => confirmBooking(bookingId));
}

export function useDisputeBooking() {
  return useBookingMutation(({ bookingId, reason }: { bookingId: string; reason: string | null }) => disputeBooking(bookingId, reason));
}

export function useCancelBooking() {
  return useBookingMutation(({ bookingId, reason }: { bookingId: string; reason: string | null }) => cancelBooking(bookingId, reason));
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, rating, text }: { bookingId: string; slug: string | null; rating: number; text: string }) =>
      createReview(bookingId, { rating, text }),
    onSettled: (_data, _error, { slug }) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.customer() });
      // The business's rating and reviews changed.
      if (slug) void queryClient.invalidateQueries({ queryKey: catalogKeys.profile(slug) });
      void queryClient.invalidateQueries({ queryKey: catalogKeys.searches() });
    },
  });
}
