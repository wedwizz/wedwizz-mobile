import { useState } from "react";
import { useRouter, type Href } from "expo-router";
import { toApiError } from "@wedwizz/core/api/api-error";
import type { CustomerBooking } from "@wedwizz/core/api/types";
import { bookingAmountLabel, bookingNote, bookingStatusLabel, bookingTone } from "@wedwizz/core/bookings/booking-view";
import { eventDateLabel } from "@wedwizz/core/chat/chat-view";
import { ReasonSheet, ReviewSheet } from "@/features/user/components/booking-sheets";
import { useCancelBooking, useConfirmBooking, useCreateReview, useDisputeBooking, useMyBookings } from "@/features/user/hooks/use-bookings";
import { useGoBack } from "@/features/user/hooks/use-go-back";
import { categoryLabel } from "@/features/user/lib/catalog-categories";
import { todayKey } from "@/features/user/lib/enquiry-templates";
import { RequireUser } from "@/features/user/routes/guards";
import { businessPath } from "@/features/user/screens/enquiries/chat-logic";
import { BOOKING_PILL_TONE, cancelLabel, cancelSheetBody } from "./booking-logic";
import { BookingCardView, BookingsView } from "./bookings-view";

type SheetKind = "dispute" | "cancel" | "review";
type OpenSheet = { kind: SheetKind; booking: CustomerBooking } | null;

/** Web bookings-page.tsx: confirming what a business marked as booked, and reviewing after the event. Customers only. */
export function BookingsScreen() {
  return (
    <RequireUser>
      <Bookings />
    </RequireUser>
  );
}

function Bookings() {
  const router = useRouter();
  const goBack = useGoBack();
  const query = useMyBookings();
  const dispute = useDisputeBooking();
  const cancel = useCancelBooking();
  const review = useCreateReview();
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [refreshing, setRefreshing] = useState(false);
  const close = () => setSheet(null);
  const refresh = () => {
    setRefreshing(true);
    void query.refetch().finally(() => setRefreshing(false));
  };

  const sheets = (
    <>
      <ReasonSheet
        visible={sheet?.kind === "dispute"}
        title="It wasn't booked?"
        body={`${sheet?.booking.business.name ?? "The business"} will see that you didn't confirm this booking.`}
        confirmLabel="It wasn't booked"
        pending={dispute.isPending}
        onConfirm={(reason, onError) => sheet && dispute.mutate({ bookingId: sheet.booking.bookingId, reason }, { onSuccess: close, onError })}
        onClose={close}
      />
      <ReasonSheet
        visible={sheet?.kind === "cancel"}
        title="Cancel this booking?"
        body={sheet ? cancelSheetBody(sheet.booking.status, sheet.booking.business.name) : ""}
        confirmLabel="Cancel booking"
        pending={cancel.isPending}
        onConfirm={(reason, onError) => sheet && cancel.mutate({ bookingId: sheet.booking.bookingId, reason }, { onSuccess: close, onError })}
        onClose={close}
      />
      <ReviewSheet
        businessName={sheet?.booking.business.name ?? ""}
        visible={sheet?.kind === "review"}
        pending={review.isPending}
        onSubmit={(input, onError) =>
          sheet && review.mutate({ bookingId: sheet.booking.bookingId, slug: sheet.booking.business.slug, ...input }, { onSuccess: close, onError })
        }
        onClose={close}
      />
    </>
  );

  const view = (state: Parameters<typeof BookingsView>[0]["state"]) => (
    <BookingsView onBack={goBack} state={state} refreshing={refreshing} onRefresh={refresh} sheets={sheets} />
  );

  if (query.isPending) return view({ kind: "loading" });
  // Only when nothing loaded: a failed background refresh keeps showing the last list.
  if (!query.data) return view({ kind: "error", onRetry: () => void query.refetch() });
  if (query.data.length === 0) return view({ kind: "empty", onEnquiries: () => router.push("/user/enquiries" as Href) });
  return view({
    kind: "ready",
    cards: query.data.map((booking) => (
      <BookingCard key={booking.bookingId} booking={booking} onSheet={(kind) => setSheet({ kind, booking })} onOpen={(path) => router.push(path as Href)} />
    )),
  });
}

/** One booking with its own "Confirm booking" request and error (web BookingCard). */
function BookingCard({ booking, onSheet, onOpen }: { booking: CustomerBooking; onSheet: (kind: SheetKind) => void; onOpen: (path: string) => void }) {
  const confirm = useConfirmBooking();
  const [error, setError] = useState("");
  const today = todayKey();
  const { business, actions, review } = booking;
  const path = businessPath(booking);

  return (
    <BookingCardView
      name={business.name}
      onOpenBusiness={path ? () => onOpen(path) : null}
      meta={`${categoryLabel(business.category)} · ${eventDateLabel(booking.eventDate)}`}
      status={bookingStatusLabel(booking, "customer", today)}
      tone={BOOKING_PILL_TONE[bookingTone(booking, "customer", today)]}
      amount={bookingAmountLabel(booking.amount)}
      note={bookingNote(booking, "customer", business.name)}
      review={review ? { rating: review.rating, text: review.text, hidden: review.hidden, reply: review.reply?.text ?? null } : null}
      actions={[
        ...(actions.confirm
          ? [
              {
                label: "Confirm booking",
                variant: "primary" as const,
                disabled: confirm.isPending,
                onPress: () => {
                  setError("");
                  confirm.mutate(booking.bookingId, { onError: (err) => setError(toApiError(err).message) });
                },
              },
            ]
          : []),
        ...(actions.dispute ? [{ label: "It wasn't booked", variant: "neutral" as const, onPress: () => onSheet("dispute") }] : []),
        ...(booking.canReview ? [{ label: "Write a review", variant: "primary" as const, onPress: () => onSheet("review") }] : []),
        ...(actions.cancel ? [{ label: cancelLabel(booking.status), variant: "neutral" as const, onPress: () => onSheet("cancel") }] : []),
      ]}
      error={error}
    />
  );
}
