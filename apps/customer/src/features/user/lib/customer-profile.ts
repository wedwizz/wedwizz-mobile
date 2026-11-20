import type { BudgetRange, CustomerProfile, GuestRange, SaveCustomerProfilePayload, WeddingRole } from "@wedwizz/core/api/types";

/** Plain TS, so the mobile app can reuse it. Values match the server's GuestRange / BudgetRange. */
export const GUEST_RANGE_OPTIONS: { value: GuestRange; label: string }[] = [
  { value: "UNDER_100", label: "Under 100" },
  { value: "FROM_100_TO_300", label: "100 – 300" },
  { value: "FROM_300_TO_500", label: "300 – 500" },
  { value: "FROM_500_TO_1000", label: "500 – 1,000" },
  { value: "OVER_1000", label: "Over 1,000" },
];

export const BUDGET_RANGE_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: "UNDER_1L", label: "Under ₹1 lakh" },
  { value: "FROM_1L_TO_3L", label: "₹1 – 3 lakh" },
  { value: "FROM_3L_TO_6L", label: "₹3 – 6 lakh" },
  { value: "FROM_6L_TO_10L", label: "₹6 – 10 lakh" },
  { value: "OVER_10L", label: "Above ₹10 lakh" },
];

export const WEDDING_ROLE_OPTIONS: { value: WeddingRole; label: string }[] = [
  { value: "BRIDE", label: "Bride" },
  { value: "GROOM", label: "Groom" },
  { value: "OTHER", label: "Other" },
];

export const weddingRoleLabel = (value: WeddingRole): string =>
  WEDDING_ROLE_OPTIONS.find((o) => o.value === value)?.label ?? value;
export const guestRangeLabel = (value: GuestRange | null): string =>
  GUEST_RANGE_OPTIONS.find((o) => o.value === value)?.label ?? "Not set";
export const budgetRangeLabel = (value: BudgetRange | null): string =>
  BUDGET_RANGE_OPTIONS.find((o) => o.value === value)?.label ?? "Not set";

/** The profile form as the inputs hold it: empty strings for fields not given. */
export interface ProfileForm {
  name: string;
  weddingRole: WeddingRole | "";
  email: string;
  city: string;
  weddingDate: string;
  partnerName: string;
  guestRange: GuestRange | "";
  budgetRange: BudgetRange | "";
}

export function emptyProfileForm(city = ""): ProfileForm {
  return { name: "", weddingRole: "", email: "", city, weddingDate: "", partnerName: "", guestRange: "", budgetRange: "" };
}

export function toProfileForm(profile: CustomerProfile): ProfileForm {
  return {
    name: profile.name,
    weddingRole: profile.weddingRole,
    email: profile.email ?? "",
    city: profile.city,
    weddingDate: profile.weddingDate ?? "",
    partnerName: profile.partnerName ?? "",
    guestRange: profile.guestRange ?? "",
    budgetRange: profile.budgetRange ?? "",
  };
}

const orNull = (value: string): string | null => value.trim() || null;

/** The whole form for `PUT /me/profile`. Call it only after validateProfileForm passes (role chosen). */
export function toSaveRequest(form: ProfileForm): SaveCustomerProfilePayload {
  return {
    name: form.name.trim(),
    weddingRole: form.weddingRole as WeddingRole,
    email: orNull(form.email),
    city: form.city,
    weddingDate: form.weddingDate || null,
    partnerName: orNull(form.partnerName),
    guestRange: form.guestRange || null,
    budgetRange: form.budgetRange || null,
  };
}

export type ProfileFormErrors = Partial<Record<keyof ProfileForm, string>>;

/** Quick checks before saving; the server checks everything again (and that the date is not past). */
export function validateProfileForm(form: ProfileForm): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  if (form.name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!form.weddingRole) errors.weddingRole = "Choose bride, groom or other.";
  if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (!form.city) errors.city = "Choose your city.";
  const partner = form.partnerName.trim();
  if (partner && partner.length < 2) errors.partnerName = "Enter at least 2 characters, or leave it empty.";
  return errors;
}

/** The server's field issues (`details.issues`) for the fields this form has. */
export function serverFieldErrors(details: Record<string, unknown> | undefined): ProfileFormErrors {
  const issues = details?.issues;
  if (!Array.isArray(issues)) return {};
  const fields: (keyof ProfileForm)[] = ["name", "weddingRole", "email", "city", "weddingDate", "partnerName", "guestRange", "budgetRange"];
  const errors: ProfileFormErrors = {};
  for (const issue of issues as { field?: unknown; message?: unknown }[]) {
    const field = fields.find((f) => f === issue.field);
    if (field && typeof issue.message === "string" && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

// Readable before setup: profile setup links to the privacy policy and terms.
const BEFORE_SETUP_PATHS = ["/user/profile-setup", "/user/profile/privacy", "/user/profile/terms"];

/**
 * Where a signed-in customer must go instead of `pathname`, or null to stay: setup until the profile is
 * saved (the legal pages stay readable), and never back to setup after it is.
 */
export function profileRedirect(pathname: string, hasProfile: boolean): string | null {
  const path = pathname.replace(/\/+$/, "");
  if (!hasProfile) return BEFORE_SETUP_PATHS.includes(path) ? null : "/user/profile-setup";
  return path === "/user/profile-setup" ? "/user/home" : null;
}
