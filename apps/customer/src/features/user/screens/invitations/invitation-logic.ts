/** Decisions from the web's invitations-page.tsx and invitation-preview.tsx, kept out of the screen so they can be tested. */
import type { CustomerProfile } from "@wedwizz/core/api/types";

export interface InvitationDetails {
  partnerOne: string;
  partnerTwo: string;
  /** "YYYY-MM-DD", or "". */
  date: string;
  venue: string;
  message: string;
}

/** The form's first values: first names and the wedding date from the profile, else the web's examples. */
export function initialDetails(profile: Pick<CustomerProfile, "name" | "partnerName" | "weddingDate"> | null | undefined): InvitationDetails {
  return {
    partnerOne: profile?.name.split(" ")[0] || "Anjali",
    partnerTwo: profile?.partnerName?.split(" ")[0] || "Rahul",
    date: profile?.weddingDate ?? "",
    venue: "Ashtamudi Grand, Kollam",
    message: "We joyfully invite you to celebrate our wedding with us.",
  };
}

/** "Sunday, 14 February 2027", or "Date to be announced". */
export function invitationDateLabel(day: string): string {
  if (!day) return "Date to be announced";
  return new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
