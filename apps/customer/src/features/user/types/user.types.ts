import type { VendorType } from "@wedwizz/core/api/types";

export type FavouriteKind = "venue" | "vendor" | "market" | "inspiration";
/** Saved for the session only: market and inspiration items are still samples. Venues and vendors are saved on the server. */
export type SessionFavouriteKind = Extract<FavouriteKind, "market" | "inspiration">;

export type VendorCategoryKey =
  | "photographers"
  | "makeup"
  | "planners"
  | "decorators"
  | "catering"
  | "music";

export type MarketCategoryKey = "essentials" | "invitations" | "decor" | "photography" | "bridal";

export interface MarketItem {
  id: string;
  name: string;
  category: MarketCategoryKey;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  includes: string[];
}

export type InspirationCategory =
  | "Wedding Decor"
  | "Bridal Makeup"
  | "Wedding Photography"
  | "Wedding Outfits"
  | "Stage Decoration"
  | "Floral Arrangements";

export type InspirationShape = "tall" | "square" | "wide";

export interface InspirationItem {
  id: string;
  title: string;
  category: InspirationCategory;
  seed: string;
  shape: InspirationShape;
}

export interface InvitationTemplate {
  id: string;
  name: string;
  /** Literal Tailwind classes for each part of the card. */
  cardClass: string;
  namesClass: string;
  textClass: string;
  dividerClass: string;
}

/** The business a message is about to be sent to, and what the compose sheet is prefilled with. */
export interface EnquiryDraft {
  slug: string;
  name: string;
  category: VendorType;
  source: "MESSAGE" | "AVAILABILITY_CHECK";
  /** "YYYY-MM-DD", or null when not fixed yet. */
  eventDate: string | null;
  guestCount: number | null;
}
