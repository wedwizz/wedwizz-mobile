import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { toApiError } from "@wedwizz/core/api/api-error";
import type { CustomerEnquiry } from "@wedwizz/core/api/types";
import { threadBookingNote } from "@wedwizz/core/bookings/booking-view";
import { eventDateLabel, leadStatusLabel, threadMessages } from "@wedwizz/core/chat/chat-view";
import { ProposeBookingSheet } from "@/features/user/components/propose-booking-sheet";
import { useProposeBooking } from "@/features/user/hooks/use-bookings";
import { useEnquiryThread, useMarkEnquiryRead, useSendEnquiryMessage, useShareEnquiryPhone } from "@/features/user/hooks/use-enquiries";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { paramString } from "@/features/user/lib/auth-gate";
import { RequireUser } from "@/features/user/routes/guards";
import { STATUS_TONE, businessPath, canProposeBooking, composerClosedNote, threadDetails, threadRows } from "./chat-logic";
import { ThreadView, type ThreadContent } from "./thread-view";

/** Web enquiry-thread-page.tsx. Customers only. New messages arrive while it is open (ChatUpdates). */
export function ThreadScreen() {
  return (
    <RequireUser>
      <Thread />
    </RequireUser>
  );
}

function Thread() {
  const router = useRouter();
  const enquiryId = paramString(useLocalSearchParams<{ id?: string }>().id) ?? "";
  const thread = useEnquiryThread(enquiryId);
  const markRead = useMarkEnquiryRead(enquiryId);
  const enquiry = thread.data?.pages[0]?.enquiry;
  const unread = enquiry?.unreadCount ?? 0;
  const messages = threadMessages(thread.data?.pages ?? []);
  const lastId = messages[messages.length - 1]?.messageId;
  const [proposing, setProposing] = useState(false);

  // Reading the thread marks the business's messages as read.
  const { mutate: markAsRead } = markRead;
  useEffect(() => {
    if (unread > 0) markAsRead();
  }, [unread, lastId, markAsRead]);

  // Web: a link back to My Enquiries. Here: back to where the customer came from (a business's page after sending),
  // the inbox when there is nothing to go back to.
  const back = () => (router.canGoBack() ? router.back() : router.replace("/user/enquiries" as Href));

  const phone = usePhoneShare(enquiry);
  const send = useSendEnquiryMessage(enquiryId);
  const [sendError, setSendError] = useState("");
  const propose = useProposeBooking(enquiryId);

  if (thread.isPending) return <ThreadView onBack={back} state={{ kind: "loading" }} sheet={null} />;
  // Only when nothing loaded: a failed poll keeps the open conversation (and the message being typed).
  if (!enquiry) {
    return (
      <ThreadView
        onBack={back}
        state={toApiError(thread.error).status === 404 ? { kind: "not-found" } : { kind: "error", onRetry: () => void thread.refetch() }}
        sheet={null}
      />
    );
  }

  const path = businessPath(enquiry);
  const note = threadBookingNote(enquiry.booking, "customer", enquiry.business.name);
  const canPropose = canProposeBooking(enquiry);
  const content: ThreadContent = {
    name: enquiry.business.name,
    onOpenBusiness: path ? () => router.push(path as Href) : null,
    details: threadDetails(enquiry),
    status: leadStatusLabel(enquiry.status, "customer"),
    statusTone: STATUS_TONE[enquiry.status],
    phone: phone.view,
    phoneError: phone.error,
    booking:
      note || canPropose
        ? {
            note: enquiry.booking && note ? `Booking for ${eventDateLabel(enquiry.booking.eventDate)}: ${note}` : null,
            onMyBookings: () => router.push("/user/bookings" as Href),
            propose: canPropose
              ? { text: enquiry.booking && note ? null : `Booked ${enquiry.business.name}? Tell us so you can review them later.`, onPress: () => setProposing(true) }
              : null,
          }
        : null,
    rows: threadRows(messages),
    hasEarlier: thread.hasNextPage,
    loadingEarlier: thread.isFetchingNextPage,
    onLoadEarlier: () => void thread.fetchNextPage(),
    closedNote: composerClosedNote(enquiry),
    sending: send.isPending,
    sendError,
    onSend: (text, clear) => {
      setSendError("");
      send.mutate(text, { onSuccess: clear, onError: (err) => setSendError(toApiError(err).message) });
    },
  };

  return (
    <ThreadView
      onBack={back}
      state={{ kind: "ready", content }}
      sheet={
        <ProposeBookingSheet
          key={String(proposing)}
          businessName={enquiry.business.name}
          visible={proposing}
          defaultDate={enquiry.eventDate}
          pending={propose.isPending}
          onSubmit={(payload, onError) => propose.mutate(payload, { onSuccess: () => setProposing(false), onError })}
          onClose={() => setProposing(false)}
        />
      }
    />
  );
}

/** "Share my number": the consent for this business only, confirmed first because it cannot be undone (web PhoneShare). */
function usePhoneShare(enquiry: CustomerEnquiry | undefined) {
  const { account } = useUserSession();
  const share = useShareEnquiryPhone(enquiry?.enquiryId ?? "");
  const [error, setError] = useState("");
  if (!enquiry) return { view: null, error };

  if (enquiry.phoneSharedAt) return { view: { kind: "shared" as const, text: `You shared your number with ${enquiry.business.name}.` }, error };
  if (!enquiry.open) return { view: null, error };

  const confirm = () =>
    Alert.alert(
      "Share your number?",
      `${enquiry.business.name} will see your phone number${account ? ` (${account.phoneNumber})` : ""} so they can call or WhatsApp you. Only this business will see it, not any other. You can't unshare it later.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share my number",
          onPress: () => {
            setError("");
            // The dialog is already closed: say so here if it did not go through, e.g. the conversation was closed.
            share.mutate(undefined, { onError: (err) => setError(toApiError(err).message) });
          },
        },
      ],
    );
  return {
    view: { kind: "ask" as const, text: `Your number is hidden from ${enquiry.business.name}.`, onShare: confirm, sharing: share.isPending },
    error,
  };
}
