import type { NearbyRadiusKm, PublicDistance } from "../geo/geo";

/**
 * Contracts of WeddingPlannerServer (`/api/v1`). These mirror the backend DTOs exactly;
 * do not add fields here that the server does not send.
 */

/** Every successful response: `{ success: true, message, data }`. */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export type AccountRole = "USER" | "VENDOR" | "ADMIN";

/** Validation rules enforced by the server (auth.schemas.ts). */
export const PHONE_NUMBER_PATTERN = /^[6-9]\d{9}$/;
export const OTP_PATTERN = /^\d{6}$/;

export interface RequestOtpPayload {
  phoneNumber: string;
  role: AccountRole;
}

export interface VerifyOtpPayload extends RequestOtpPayload {
  otp: string;
}

export interface AuthAccount {
  accountId: string;
  phoneNumber: string;
  role: AccountRole;
}

/**
 * What `verifyOtp` returns to screens. The response body also carries the refresh token (body transport, see
 * `VerifyOtpResponse`); auth.api.ts stores it and leaves it out of this, so it never reaches a screen or a cache.
 */
export interface VerifyOtpData {
  isNewAccount: boolean;
  accessToken: string;
  account: AuthAccount;
}

/** `POST /auth/otp/verify` in body transport (no `X-Token-Transport: cookie` header). */
export interface VerifyOtpResponse extends VerifyOtpData {
  refreshToken: string;
}

/** `POST /auth/refresh` in body transport: the rotated refresh token is in the body. */
export interface RefreshData {
  accessToken: string;
  refreshToken: string;
}

export type VendorType = "VENUE" | "PHOTOGRAPHY" | "MAKEUP" | "DECORATION" | "DJ" | "CATERING" | "WEDDING_PLANNING";

/** `VENUE` is listed per physical place; every other category is one profile with service areas. */
export type CategoryKind = "LOCATION_BOUND" | "SERVICE_BASED";

export type ProfileStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type OwnerField = "ownerName" | "email";
/** `details.<key>` is an unanswered required category question; `proof.*` is missing proof of place (venues). */
export type ProfileField =
  | "displayName"
  | "baseCity"
  | "location"
  | "serviceAreas"
  | "proof.document"
  | "proof.photos"
  | `details.${string}`;

/** `VendorOwnerSummary`: the person behind the account, shared by all of their businesses. */
export interface VendorOwner {
  vendorId: string;
  ownerName: string | null;
  email: string | null;
  phoneNumber: string;
  /** Optional public name of the owner's business group ("More venues by …"). */
  brandName: string | null;
  status: "ACTIVE" | "SUSPENDED";
  missingFields: OwnerField[];
}

export type ProfileDetailValue = string | number | boolean | string[];
export type ProfileDetails = Record<string, ProfileDetailValue>;

/** A business's one map pin. The street address and pincode are required for venues, optional otherwise. */
export interface ServiceLocation {
  addressLine: string | null;
  district: string;
  city: string;
  pincode: string | null;
  latitude: number;
  longitude: number;
  googlePlaceId?: string | null;
}

export interface ServiceArea {
  district: string;
  /** Null means the whole district. */
  city: string | null;
}

/**
 * Admin permission a business may need before it can be submitted: beyond the profile limit
 * (PROFILE_LIMIT), or an owner's second venue (SECOND_LOCATION).
 */
export type AllowanceReason = "PROFILE_LIMIT" | "SECOND_LOCATION";
export type AllowanceState = "NOT_NEEDED" | "NEEDED" | "REQUESTED" | "ALLOWED" | "DENIED";

export interface ProfileAllowance {
  reasons: AllowanceReason[];
  state: AllowanceState;
  requestedAt: string | null;
  deniedReason: string | null;
}

/** `ServiceProfileSummary`: one business ("listing"), onboarded and approved on its own. */
export interface ServiceProfile {
  profileId: string;
  category: VendorType;
  kind: CategoryKind;
  displayName: string | null;
  baseCity: string | null;
  /** Copied by the server from `details.startingPrice` (search filters and sorts on it). */
  startingPrice: number | null;
  /** Venues: maximum guests, copied by the server from `details.capacity`. */
  capacity: number | null;
  details: ProfileDetails;
  location: ServiceLocation | null;
  serviceAreas: ServiceArea[];
  status: ProfileStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  /** Shown while an admin has the business suspended. */
  suspensionReason: string | null;
  /** The phone customers call; the owner's phone when not set. */
  contactPhone: string | null;
  gstin: string | null;
  /** Processed proof of place (venues). */
  proof: { documents: number; photos: number };
  allowance: ProfileAllowance;
  /** Processed public photos. */
  photoCount: number;
  /** Computed by the server from the profile form: the basics, then one entry per form section. */
  completion: ProfileCompletion;
  /** Name, location or GSTIN changes of a live business, waiting for our team. */
  pendingChanges: PendingChanges | null;
  /** Why the latest change request was rejected. */
  lastChangeRejection: { reason: string; decidedAt: string } | null;
  /** Business fields still needed before submitting; owner fields are on `VendorOwner`. */
  missingFields: ProfileField[];
  /** Onboarding: draft or rejected. */
  canEdit: boolean;
  /** Profile content (form sections, phone, areas) can change; also while live. */
  canEditContent: boolean;
}

export interface ProfileCompletion {
  percent: number;
  sections: { key: string; done: number; total: number }[];
}

/** What a live business asked to change; the live values stay until our team decides. */
export interface ReviewedChanges {
  displayName?: string;
  gstin?: string | null;
  location?: ServiceLocation;
}

export interface PendingChanges {
  requestId: string;
  changes: ReviewedChanges;
  requestedAt: string;
}

export type SectionIcon = "building" | "camera" | "wallet" | "shield" | "award" | "utensils" | "sparkles" | "link" | "users";

/** One section of a category's profile form (`GET /vendor/profile-form/:category`). */
export interface ProfileFormSection {
  key: string;
  title: string;
  subtitle: string;
  icon: SectionIcon;
  fields: CategoryQuestion[];
}

export interface ProfileFormConfig {
  category: VendorType;
  sections: ProfileFormSection[];
}

/** `GET /vendor/profiles`. Beyond `maxProfiles` a business needs permission; `hardLimit` is the most. */
export interface ServiceProfileList {
  profiles: ServiceProfile[];
  maxProfiles: number;
  hardLimit: number;
}

/** The vendor part of `GET /auth/me`. */
export interface CurrentVendor extends ServiceProfileList {
  owner: VendorOwner;
}

/** `GET /auth/me`. `vendor` is only present for VENDOR accounts (null until they set anything up). */
export interface MeData {
  account: AuthAccount & { isActive: boolean; createdAt: string };
  vendor?: CurrentVendor | null;
}

export type GuestRange = "UNDER_100" | "FROM_100_TO_300" | "FROM_300_TO_500" | "FROM_500_TO_1000" | "OVER_1000";
export type BudgetRange = "UNDER_1L" | "FROM_1L_TO_3L" | "FROM_3L_TO_6L" | "FROM_6L_TO_10L" | "OVER_10L";
/** Who is planning: the bride, the groom, or someone else (family, friend, planner). */
export type WeddingRole = "BRIDE" | "GROOM" | "OTHER";

/** The signed-in customer's own profile (`GET /me/profile`). Private to that account. */
export interface CustomerProfile {
  name: string;
  weddingRole: WeddingRole;
  email: string | null;
  /** A listed Kerala town, in its listed spelling. */
  city: string;
  /** A calendar date, "YYYY-MM-DD". */
  weddingDate: string | null;
  partnerName: string | null;
  guestRange: GuestRange | null;
  budgetRange: BudgetRange | null;
  updatedAt: string;
}

/** `GET` / `PUT /me/profile`. `profile` is null until the customer completes profile setup. */
export interface CustomerProfileData {
  profile: CustomerProfile | null;
}

/** `DELETE /me/account`: the account is gone; upcoming bookings were cancelled with it. */
export interface DeleteAccountData {
  cancelledBookings: number;
}

/** `PUT /me/profile`: the whole form; optional fields left null are cleared. */
export interface SaveCustomerProfilePayload {
  name: string;
  weddingRole: WeddingRole;
  email: string | null;
  city: string;
  weddingDate: string | null;
  partnerName: string | null;
  guestRange: GuestRange | null;
  budgetRange: BudgetRange | null;
}

/** Where a lead is in the vendor's pipeline. LOST and DECLINED close the thread; BOOKED stays open. */
export type LeadStatus = "NEW" | "REPLIED" | "QUOTED" | "BOOKED" | "LOST" | "DECLINED";
/** How the customer first got in touch: a chat, or the WhatsApp or Call button. */
export type EnquirySource = "MESSAGE" | "AVAILABILITY_CHECK" | "WHATSAPP" | "CALL";
export type MessageSender = "CUSTOMER" | "VENDOR";
export type PhoneShareChannel = "CHAT" | "WHATSAPP" | "CALL";
/** The buttons a business can show besides Message (always on). */
export type ContactChannel = "WHATSAPP" | "CALL";
/** TEXT, or a note (empty text) that the customer used the WhatsApp or Call button. */
export type MessageKind = "TEXT" | ContactChannel;
/**
 * The statuses a vendor can choose (`PATCH /vendor/leads/:id/status`); NEW becomes REPLIED by replying.
 * BOOKED is reached only through a booking the customer confirms (`POST /vendor/leads/:id/booking`).
 */
export type VendorSetStatus = "QUOTED" | "LOST" | "DECLINED";
/** What a lead may move to next (`allowedStatuses`): a status, or BOOKED through a booking. */
export type LeadNextStatus = VendorSetStatus | "BOOKED";

/** A text message or a contact note. `readAt` is when the other side read it. */
export interface ChatMessage {
  messageId: string;
  sender: MessageSender;
  kind: MessageKind;
  text: string;
  sentAt: string;
  readAt: string | null;
}

interface EnquiryBase {
  enquiryId: string;
  status: LeadStatus;
  /** False once LOST or DECLINED: the thread is read-only. */
  open: boolean;
  source: EnquirySource;
  /** "YYYY-MM-DD"; null when the date is not fixed yet. */
  eventDate: string | null;
  guestCount: number | null;
  budgetRange: BudgetRange | null;
  createdAt: string;
  lastMessageAt: string;
  lastMessage: ChatMessage | null;
  /** Messages from the other side this side has not read. */
  unreadCount: number;
  /** The booking agreed in this thread, if one was proposed. */
  booking: EnquiryBooking | null;
}

/** A customer's conversation with a business (`/me/enquiries`). */
export interface CustomerEnquiry extends EnquiryBase {
  business: {
    slug: string | null;
    name: string;
    category: VendorType;
    thumbnailUrl: string | null;
    /** False when the business no longer takes messages. */
    live: boolean;
  };
  /** When the customer shared their phone number with this business (it cannot be unshared). */
  phoneSharedAt: string | null;
}

/** A lead of one of the vendor's businesses (`/vendor/leads`). */
export interface VendorLead extends EnquiryBase {
  business: { profileId: string; name: string; category: VendorType };
  customer: {
    name: string;
    city: string | null;
    weddingRole: WeddingRole | null;
    partnerName: string | null;
    /** Only once the customer shared it with this business. */
    phoneNumber: string | null;
    phoneSharedAt: string | null;
    phoneShareChannel: PhoneShareChannel | null;
  };
  firstRepliedAt: string | null;
  responseSeconds: number | null;
  allowedStatuses: LeadNextStatus[];
}

// ---- Bookings and reviews (`/me/bookings`, `/vendor/bookings`) ----

/** PENDING until the side that did not propose it confirms; DISPUTED when that side says it was not booked. */
export type BookingStatus = "PENDING" | "CONFIRMED" | "DISPUTED" | "CANCELLED";

/** What an enquiry shows of its booking. */
export interface EnquiryBooking {
  bookingId: string;
  status: BookingStatus;
  proposedBy: MessageSender;
  /** "YYYY-MM-DD". */
  eventDate: string;
  /** Rupees. */
  amount: number | null;
}

/** What the signed-in side may do now; the server decides. */
export interface BookingActions {
  confirm: boolean;
  dispute: boolean;
  cancel: boolean;
}

/** The customer's review, as its author and the business see it. The admin's reason for hiding it is never shown. */
export interface BookingReview {
  reviewId: string;
  rating: number;
  text: string;
  createdAt: string;
  reply: { text: string; repliedAt: string } | null;
  hidden: boolean;
}

interface BookingBase extends EnquiryBooking {
  enquiryId: string;
  vendorConfirmedAt: string | null;
  customerConfirmedAt: string | null;
  /** Who disputed or cancelled it, and why. */
  closedBy: MessageSender | null;
  closedReason: string | null;
  closedAt: string | null;
  createdAt: string;
  actions: BookingActions;
  review: BookingReview | null;
}

export interface CustomerBooking extends BookingBase {
  business: { slug: string | null; name: string; category: VendorType; thumbnailUrl: string | null };
  /** Confirmed, its event has passed, and not reviewed yet. */
  canReview: boolean;
}

export interface VendorBooking extends BookingBase {
  business: { profileId: string; name: string; category: VendorType };
  customer: { name: string };
  /** A review without a reply yet. */
  canReply: boolean;
}

/** "Mark as booked" or "I booked them". */
export interface ProposeBookingPayload {
  eventDate: string;
  amount: number | null;
}

/** On a public profile: the reviewer's first name only. */
export interface PublicReview {
  reviewId: string;
  rating: number;
  text: string;
  createdAt: string;
  authorName: string;
  /** "YYYY-MM" of the event. */
  eventMonth: string;
  reply: { text: string; repliedAt: string } | null;
}

export interface PublicReviewPage {
  reviews: PublicReview[];
  nextCursor: string | null;
}

/** `POST /me/enquiries`: the structured fields travel next to the text. */
export interface StartEnquiryPayload {
  slug: string;
  text: string;
  source: "MESSAGE" | "AVAILABILITY_CHECK";
  eventDate: string | null;
  guestCount: number | null;
  budgetRange: BudgetRange | null;
}

export interface StartEnquiryResult {
  /** False when the message joined the open thread with this business. */
  created: boolean;
  enquiry: CustomerEnquiry;
}

/** `POST /enquiries/contact`: the date and guests are used only when the contact creates the lead. */
export interface ContactBusinessPayload {
  slug: string;
  channel: ContactChannel;
  eventDate?: string | null;
  guestCount?: number | null;
}

export interface ContactBusinessResult {
  channel: ContactChannel;
  /** The business's verified number, 10 digits. */
  phoneNumber: string;
  enquiryId: string;
  /** False when the contact was added to the open thread with this business. */
  created: boolean;
}

/** A business's WhatsApp or Call button, as its owner sees it (`/vendor/profiles/:id/contact-channels`). */
export interface ContactChannelSetting {
  channel: ContactChannel;
  /** The verified number; null until one is verified. */
  phoneNumber: string | null;
  /** Whether the button is shown. */
  enabled: boolean;
}

/** A page of a thread: messages newest first, `hasEarlier` when older ones exist. */
export interface CustomerThread {
  enquiry: CustomerEnquiry;
  messages: ChatMessage[];
  hasEarlier: boolean;
}

export interface VendorThread {
  lead: VendorLead;
  messages: ChatMessage[];
  hasEarlier: boolean;
}

/** One step-4 question, as defined by the server (`CATEGORY_QUESTIONS`). Answers go in `details[key]`. */
export interface CategoryQuestion {
  key: string;
  label: string;
  type: "number" | "text" | "textarea" | "radio" | "chips";
  required: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
}

/** `GET /vendor/onboarding-options`: what onboarding is validated against on the server. */
export interface OnboardingOptions {
  categories: { category: VendorType; kind: CategoryKind; questions: CategoryQuestion[] }[];
  districts: { district: string; cities: string[] }[];
}

/** `PhotoSummary`: a processed photo, served straight from storage/CDN (never through the API). */
export interface Photo {
  assetId: string;
  thumbnailUrl: string;
  displayUrl: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isCover: boolean;
}

export type PhotoType = "image/jpeg" | "image/png" | "image/webp";

/** `GET /vendor/profiles/:id/photos`. `canEdit` is false while the business is under review or suspended. */
export interface PhotoList {
  photos: Photo[];
  limits: { maxPhotos: number; maxBytes: number; types: PhotoType[] };
  canEdit: boolean;
}

/** `POST …/photos/uploads` (and `…/proof/uploads`): a form POST straight to object storage. */
export interface PhotoUploadTarget {
  assetId: string;
  upload: { url: string; fields: Record<string, string> };
  expiresAt: string;
}

export type ProofDocumentKind = "TRADE_LICENCE" | "OWNERSHIP_OR_LEASE" | "GST_REGISTRATION";
export type ProofDocumentType = "application/pdf" | "image/jpeg" | "image/png";

/** A private proof file. Links are signed and expire after a few minutes; never store them. */
export interface ProofFile {
  assetId: string;
  kind: "DOCUMENT" | "PHOTO";
  documentKind: ProofDocumentKind | null;
  contentType: string;
  url: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

/** `GET /vendor/profiles/:id/proof` (venues only). */
export interface ProofList {
  files: ProofFile[];
  required: { documents: number; photos: number };
  maxFiles: number;
  maxBytes: number;
  canEdit: boolean;
}

export type ProofUploadRequest =
  | { kind: "DOCUMENT"; documentKind: ProofDocumentKind; contentType: ProofDocumentType; size: number }
  | { kind: "PHOTO"; contentType: PhotoType; size: number };

// ---- Public catalogue (`/catalog`, no sign-in) ----

/** "distance" needs lat/lng (nearest first). */
/** "nearby-first" (mobile Venues, 2026-11-25): within the radius nearest first, then every other match, recommended order. */
export type CatalogSort = "recommended" | "price-low" | "price-high" | "distance" | "nearby-first";

/** A listing in search results. Never carries contact or owner details: enquiries go through the platform. */
export interface CatalogCard {
  slug: string;
  name: string;
  category: VendorType;
  kind: CategoryKind;
  city: string | null;
  area: string | null;
  startingPrice: number | null;
  capacity: number | null;
  coverUrl: string | null;
  thumbnailUrl: string | null;
  venueType: string | null;
  verified: true;
  /** Average of the visible reviews, to one decimal; null before the first review ("New"). */
  rating: number | null;
  reviewCount: number;
  /** Searching near a point: how far, rounded (service-based: whole km, "approximate"); null otherwise. */
  distance: PublicDistance | null;
}

export interface CatalogDetail extends CatalogCard {
  description: string | null;
  services: string[];
  answers: { section: string; label: string; value: ProfileDetailValue }[];
  photos: { thumbnailUrl: string; displayUrl: string; width: number | null; height: number | null }[];
  location: { addressLine: string; city: string; district: string; pincode: string; latitude: number; longitude: number } | null;
  serviceAreas: ServiceArea[];
  /** The active packages, in the vendor's order. */
  packages: CatalogPackage[];
  /** The owner's public brand, if set. */
  brand: string | null;
  /** Venues: the same owner's other public venues. */
  moreFromOwner: CatalogCard[];
  /** The WhatsApp and Call buttons the business shows; their numbers come only from `POST /enquiries/contact`. */
  contactChannels: ContactChannel[];
}

/** How a package's price is charged. */
export type PackagePriceUnit = "PER_EVENT" | "PER_DAY" | "PER_PLATE" | "PER_HOUR";

/** A package as customers see it on a business's page. */
export interface CatalogPackage {
  name: string;
  /** Rupees. */
  price: number;
  priceUnit: PackagePriceUnit;
  items: string[];
}

/** One of the vendor's packages; hidden ones (active: false) are not on the public page. */
export interface VendorPackage extends CatalogPackage {
  packageId: string;
  active: boolean;
  updatedAt: string;
}

/** Adds a package (also how one is duplicated). */
export interface PackagePayload {
  name: string;
  price: number;
  priceUnit: PackagePriceUnit;
  items: string[];
  active: boolean;
}

/** A date a business is not taking work. The note is the vendor's own; customers never see it. */
export interface BlockedDate {
  profileId: string;
  /** "YYYY-MM-DD". */
  date: string;
  note: string | null;
}

/** "Check availability": never says why a date is blocked. UNKNOWN when the business's calendar is not kept up. */
export type AvailabilityStatus = "AVAILABLE" | "BLOCKED" | "UNKNOWN";

/** The vendor's stats cover today (India) and the 29 or 89 days before. */
export type StatsRange = "30d" | "90d";

export interface StatsTotals {
  /** One per visitor per day; never the owner's own. */
  views: number;
  enquiries: number;
  /** Leads replied to in the chat, quoted or booked. */
  responded: number;
  /** responded ÷ enquiries (0–1); null without leads. */
  acceptRate: number | null;
  /** Median time from a lead to the first chat reply; null when none was answered in the chat. */
  medianResponseSeconds: number | null;
  /** Confirmed by both sides. */
  bookings: number;
  /** Amounts the vendor entered on bookings: reported, not verified. */
  reportedRevenue: { amount: number; bookings: number };
  /** All-time, of visible reviews. */
  rating: { average: number | null; count: number };
}

export interface StatsDay {
  date: string;
  views: number;
  enquiries: number;
  bookings: number;
}

export interface VendorStats {
  range: StatsRange;
  from: string;
  to: string;
  totals: StatsTotals;
  /** Every day of the range, oldest first. */
  series: StatsDay[];
  byProfile: { profileId: string; totals: StatsTotals }[];
}

export interface Availability {
  date: string;
  status: AvailabilityStatus;
  /** Venues with a stated capacity; `fits` is null when no guest count was given. */
  capacity: { maxGuests: number; fits: boolean | null } | null;
}

export interface CatalogPage {
  items: CatalogCard[];
  /** Pass back as `cursor` for the next page; null on the last one. */
  nextCursor: string | null;
}

export interface CatalogQuery {
  category?: VendorType;
  kind?: CategoryKind;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  q?: string;
  /** Near a point (send it rounded to 3 decimals): both or neither. */
  lat?: number;
  lng?: number;
  /** 5, 10, 25 or 50 km; only with lat/lng (default 25). */
  radiusKm?: NearbyRadiusKm;
  sort?: CatalogSort;
  limit?: number;
  cursor?: string;
  /** Exactly these listings (favourites), comma-separated on the wire. */
  slugs?: string[];
}

// ---- Admin (`/admin`) ----

export type StatusAction = "APPROVE" | "REJECT" | "SUSPEND" | "REINSTATE";
export type ListingFlagReason =
  | "DUPLICATE_LOCATION"
  | "DUPLICATE_PHOTO"
  | "NEARBY_LOCATION"
  | "SIMILAR_NAME"
  | "SHARED_PHONE"
  | "SHARED_GSTIN";

/** One row of `GET /admin/service-profiles`. */
export interface AdminProfileListItem {
  profileId: string;
  displayName: string | null;
  category: VendorType;
  kind: CategoryKind;
  baseCity: string | null;
  status: ProfileStatus;
  submittedAt: string | null;
  createdAt: string;
  owner: { vendorId: string; ownerName: string | null; phoneNumber: string; status: VendorOwner["status"] };
  openFlagCount: number;
  allowance: ProfileAllowance;
}

export interface AdminProfileList {
  items: AdminProfileListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminProfileListQuery {
  /** Defaults to SUBMITTED unless `allowance` is given. */
  status?: ProfileStatus | "ALL";
  allowance?: "REQUESTED";
  category?: VendorType;
  page?: number;
  pageSize?: number;
}

export interface ReviewFlag {
  id: string;
  reason: ListingFlagReason;
  details: Record<string, unknown>;
  createdAt: string;
  resolvedAt: string | null;
  /** FLAGGED: this business was flagged against `other`; MATCHED: `other` was flagged against this one. */
  direction: "FLAGGED" | "MATCHED";
  other: { profileId: string; displayName: string | null; category: VendorType; status: ProfileStatus; vendorId: string; ownerName: string | null };
}

export interface AuditEntry {
  id: string;
  action: StatusAction | "ALLOW_PROFILE" | "DENY_PROFILE" | "APPROVE_CHANGES" | "REJECT_CHANGES";
  reason: string | null;
  details: Record<string, unknown>;
  createdAt: string;
  admin: { accountId: string; phoneNumber: string };
}

/** `GET /admin/service-profiles/:id`, also returned by every admin action. */
export interface AdminProfileDetail {
  /** `updatedAt` is the version to send back as `expectedUpdatedAt` when approving or rejecting. */
  profile: ServiceProfile & { createdAt: string; updatedAt: string };
  answers: { key: string; label: string; value: ProfileDetailValue | null }[];
  photos: Photo[];
  proof: ProofFile[];
  owner: VendorOwner & { createdAt: string };
  siblings: { profileId: string; displayName: string | null; category: VendorType; baseCity: string | null; status: ProfileStatus; createdAt: string }[];
  flags: ReviewFlag[];
  history: AuditEntry[];
  actions: StatusAction[];
  canDecideAllowance: boolean;
  /** `profile.pendingChanges` can be approved or rejected. */
  canDecideChanges: boolean;
}

/** One row of `GET /admin/change-requests`: live values, plus the proposed `changes`. */
export interface ChangeRequestListItem {
  requestId: string;
  requestedAt: string;
  changes: ReviewedChanges;
  profileId: string;
  displayName: string | null;
  category: VendorType;
  baseCity: string | null;
  owner: { vendorId: string; ownerName: string | null; phoneNumber: string };
}

export interface ChangeRequestList {
  items: ChangeRequestListItem[];
  page: number;
  pageSize: number;
  total: number;
}

/** A customer review for moderation (`/admin/reviews`), newest first. */
export interface AdminReview extends BookingReview {
  authorName: string;
  eventDate: string;
  business: { profileId: string; slug: string | null; name: string; category: VendorType };
  hiddenAt: string | null;
  /** Why an admin hid it; kept in the audit log, never shown to the customer or the business. */
  hiddenReason: string | null;
}

export interface AdminReviewList {
  items: AdminReview[];
  page: number;
  pageSize: number;
  total: number;
}

// ---- Planner: favourites and the wedding checklist (`/me/favourites`, `/me/checklist`) ----

/** A saved venue or vendor. `listing` is null once it is no longer public; it stays saved until removed. */
export interface Favourite {
  slug: string;
  savedAt: string;
  listing: CatalogCard | null;
}

/** When a task is due, counted back from the wedding date. */
export type ChecklistStage = "MONTHS_12" | "MONTHS_9" | "MONTHS_6" | "MONTHS_3" | "MONTH_1" | "WEDDING_WEEK";

export interface ChecklistTask {
  taskId: string;
  title: string;
  stage: ChecklistStage;
  category: string;
  /** The date the customer set, else worked out from the stage and the wedding date; null without either. */
  dueDate: string | null;
  /** True when the customer set the date; false when it follows the wedding date. */
  dueDateSet: boolean;
  done: boolean;
  doneAt: string | null;
  createdAt: string;
}

export interface Checklist {
  weddingDate: string | null;
  tasks: ChecklistTask[];
}

export interface NewChecklistTaskPayload {
  title: string;
  stage: ChecklistStage;
  category: string;
  /** "YYYY-MM-DD", or null to follow the wedding date. */
  dueDate: string | null;
}

export type ChecklistTaskPatch = Partial<NewChecklistTaskPayload & { done: boolean }>;
