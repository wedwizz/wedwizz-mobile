/**
 * Decisions from the web's venue / vendor detail pages, availability-card.tsx, enquiry-modal.tsx and
 * detail-chrome.tsx (ContactPanel), kept out of the screens so they can be tested without rendering.
 */
import type { CatalogCard, ContactChannel } from "@wedwizz/core/api/types";
import type { ListingCardView } from "@/features/user/lib/catalog-view";

const MAX_GUESTS = 100_000;

const badGuests = (guestCount: number | null) => guestCount !== null && (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > MAX_GUESTS);

export type AvailabilityStep =
  | { kind: "error"; message: string }
  /** "Date not fixed yet": straight to the message. */
  | { kind: "ask"; guestCount: number | null }
  | { kind: "check"; checked: { date: string; guests?: number } };

/** The availability card's "Check availability" tap (web `check`). */
export function availabilityStep(input: { date: string; notFixed: boolean; guests: string; askGuests: boolean; today: string }): AvailabilityStep {
  const { date, notFixed, guests, askGuests, today } = input;
  if (!notFixed && !date) return { kind: "error", message: "Choose a date, or tick “Date not fixed yet”." };
  if (!notFixed && date < today) return { kind: "error", message: "Choose a date from today on." };
  const guestCount = askGuests && guests ? Number(guests) : null;
  if (badGuests(guestCount)) return { kind: "error", message: "Enter the number of guests, e.g. 400." };
  if (notFixed) return { kind: "ask", guestCount };
  return { kind: "check", checked: { date, ...(guestCount !== null ? { guests: guestCount } : {}) } };
}

/** The compose sheet's checks before sending (web ComposeForm `submit`); null when it can be sent. */
export function composeError(input: { eventDate: string | null; guestCount: number | null; message: string; today: string }): string | null {
  if (input.eventDate && input.eventDate < input.today) return "The event date cannot be in the past.";
  if (badGuests(input.guestCount)) return "Enter the number of guests, e.g. 400.";
  if (!input.message.trim()) return "Write a message.";
  return null;
}

/**
 * The line above the contact buttons (web ContactPanel `note`): an error, then "Tap WhatsApp to continue." after
 * logging in from it, then why messaging is unavailable, then the privacy note when WhatsApp or Call is offered.
 */
export function contactNote(input: { error: string; resume: ContactChannel | null; unavailableNote?: string; channels: ContactChannel[] }): {
  text: string;
  tone: "error" | "resume" | "muted";
} | null {
  if (input.error) return { text: input.error, tone: "error" };
  if (input.resume) return { text: `Tap ${input.resume === "WHATSAPP" ? "WhatsApp" : "Call"} to continue.`, tone: "resume" };
  if (input.unavailableNote) return { text: input.unavailableNote, tone: "muted" };
  if (input.channels.length > 0) return { text: "WhatsApp and Call share your number with this business.", tone: "muted" };
  return null;
}

/** "Similar venues" / "More <category>": up to 4 others, without this listing and the ones already shown as the owner's. */
export function otherListings(items: CatalogCard[] | undefined, slug: string, alreadyShown: ListingCardView[] = []): CatalogCard[] {
  const shown = new Set(alreadyShown.map((c) => c.slug));
  return (items ?? []).filter((c) => c.slug !== slug && !shown.has(c.slug)).slice(0, 4);
}

/** The photos at the top of the page: the cover first, then the gallery, each once. */
export function heroPhotos(cover: string | null, photos: string[]): string[] {
  return [...new Set([...(cover ? [cover] : []), ...photos])];
}
