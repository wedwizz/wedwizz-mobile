import { useState } from "react";
import { Linking } from "react-native";
import { useRouter, type Href } from "expo-router";
import { ContactBar } from "@wedwizz/ui";
import { toApiError } from "@wedwizz/core/api/api-error";
import type { ContactChannel, VendorType } from "@wedwizz/core/api/types";
import { callLink, whatsappLink } from "@wedwizz/core/chat/contact-links";
import { useCustomerProfile } from "@/features/user/hooks/use-customer-profile";
import { useContactBusiness, useEnquiries } from "@/features/user/hooks/use-enquiries";
import { usePendingAction, useRequireLogin } from "@/features/user/hooks/use-require-login";
import { enquiryMessage, suggestedEventDate, todayKey } from "@/features/user/lib/enquiry-templates";
import { useUserStore } from "@/features/user/store/user-store";
import { contactNote } from "@/features/user/screens/detail/detail-logic";

/** The business a customer can message from its page (web ContactBusiness). */
export interface ContactBusiness {
  slug: string;
  name: string;
  category: VendorType;
  /** The WhatsApp and Call buttons it shows (catalogue detail); Message is always there. */
  contactChannels: ContactChannel[];
}

/**
 * "Message": opens the customer's open thread with this business if there is one, otherwise the compose sheet with
 * a prefilled first message (web useMessageBusiness).
 */
function useMessageBusiness(business: ContactBusiness | null) {
  const router = useRouter();
  const openEnquiry = useUserStore((s) => s.openEnquiry);
  const weddingDate = useCustomerProfile().data?.profile?.weddingDate;
  const threads = useEnquiries({ slug: business?.slug }, { enabled: !!business });
  const openThread = threads.data?.find((thread) => thread.open);
  const requireLogin = useRequireLogin();

  const message = () => {
    if (!business) return;
    if (openThread) {
      router.push(`/user/enquiries/${openThread.enquiryId}` as Href);
      return;
    }
    openEnquiry({ ...business, source: "MESSAGE", eventDate: suggestedEventDate(weddingDate, todayKey()), guestCount: null });
  };

  // Message (or "Ask about this date") tapped while signed out: continued once back here after logging in, when
  // the customer's threads are known. A question about a date reopens the composer with that date and guests.
  usePendingAction("message", business?.slug, !!business && !threads.isPending, (action) => {
    if (business && action.draft) openEnquiry({ ...business, ...action.draft });
    else message();
  });

  return () => {
    if (business) requireLogin({ type: "message", slug: business.slug }, message);
  };
}

/**
 * WhatsApp and Call (web useContactChannel): the contact is recorded first (it becomes the vendor's lead, or a note
 * in the open thread), and only then does the API hand out the number to open. On a phone the link opens WhatsApp
 * or the dialer directly (the web opens a tab first because of popup blockers).
 */
function useContactChannel(business: ContactBusiness | null) {
  const contact = useContactBusiness();
  const weddingDate = useCustomerProfile().data?.profile?.weddingDate;
  const [error, setError] = useState("");
  const requireLogin = useRequireLogin();
  // Tapped while signed out: after logging in the button is only highlighted, as on the web: WhatsApp or the dialer
  // never opens without a fresh tap.
  const [resume, setResume] = useState<ContactChannel | null>(null);
  usePendingAction("whatsapp", business?.slug, !!business, () => setResume("WHATSAPP"));
  usePendingAction("call", business?.slug, !!business, () => setResume("CALL"));

  const openNow = async (channel: ContactChannel, business: ContactBusiness) => {
    setError("");
    const eventDate = suggestedEventDate(weddingDate, todayKey());
    try {
      const { phoneNumber } = await contact.mutateAsync({ slug: business.slug, channel, eventDate });
      const link =
        channel === "WHATSAPP"
          ? whatsappLink(phoneNumber, enquiryMessage({ businessName: business.name, category: business.category, eventDate, guestCount: null, kind: "message" }))
          : callLink(phoneNumber);
      await Linking.openURL(link).catch(() =>
        setError(channel === "WHATSAPP" ? "Couldn't open WhatsApp on this phone." : "Couldn't open the phone's dialer."),
      );
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  const open = (channel: ContactChannel) => {
    if (!business) return;
    setResume(null);
    requireLogin({ type: channel === "WHATSAPP" ? "whatsapp" : "call", slug: business.slug }, () => void openNow(channel, business));
  };
  return { open, pending: contact.isPending, error, resume };
}

/** The pinned Message / WhatsApp / Call bar of a detail page (web ContactPanel's phone bar). */
export function DetailContactBar({ business, unavailableNote }: { business: ContactBusiness | null; unavailableNote?: string }) {
  const message = useMessageBusiness(business);
  const direct = useContactChannel(business);
  const channels = business?.contactChannels ?? [];
  const action = (channel: ContactChannel) => ({ onPress: () => direct.open(channel), disabled: direct.pending, highlighted: direct.resume === channel });
  return (
    <ContactBar
      onMessage={message}
      messageDisabled={!business}
      whatsapp={channels.includes("WHATSAPP") ? action("WHATSAPP") : undefined}
      call={channels.includes("CALL") ? action("CALL") : undefined}
      note={contactNote({ error: direct.error, resume: direct.resume, unavailableNote, channels })}
    />
  );
}
