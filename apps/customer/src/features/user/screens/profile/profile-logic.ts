/** Decisions from the web's profile-page.tsx, kept out of the screen so they can be tested. */
import type { CustomerProfile, Favourite } from "@wedwizz/core/api/types";
import { budgetRangeLabel, guestRangeLabel, weddingRoleLabel } from "@/features/user/lib/customer-profile";

/** "14 February 2027", or "Not set". */
export function weddingDateLabel(day: string | null): string {
  if (!day) return "Not set";
  return new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** The profile card's details, in the web's order. */
export function profileDetails(profile: CustomerProfile, phoneNumber: string | null): { label: string; value: string }[] {
  return [
    { label: "I am the", value: weddingRoleLabel(profile.weddingRole) },
    { label: "Phone", value: phoneNumber ? `+91 ${phoneNumber}` : "—" },
    { label: "Email", value: profile.email || "Not added" },
    { label: "City", value: profile.city },
    { label: "Wedding date", value: weddingDateLabel(profile.weddingDate) },
    { label: "Partner", value: profile.partnerName || "Not added" },
    { label: "Guests", value: guestRangeLabel(profile.guestRange) },
    { label: "Budget", value: budgetRangeLabel(profile.budgetRange) },
  ];
}

/** Saved listings still listed (web: favourites with a listing). */
export const savedCount = (favourites: readonly Favourite[] | undefined): number => (favourites ?? []).filter((f) => f.listing).length;

/** A count, or "–" while it isn't known (web shows "–" for enquiries until they load). */
export const countLabel = (count: number | undefined): string => (count === undefined ? "–" : String(count));
