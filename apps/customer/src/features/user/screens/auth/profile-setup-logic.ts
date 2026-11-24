/**
 * The web's profile setup form (profile-setup-page.tsx), split into the onboarding designs' three steps. Same fields,
 * rules and save request; only the order on screen changes.
 */
import type { BudgetRange, GuestRange, WeddingRole } from "@wedwizz/core/api/types";
import {
  BUDGET_RANGE_OPTIONS,
  GUEST_RANGE_OPTIONS,
  WEDDING_ROLE_OPTIONS,
  budgetRangeLabel,
  guestRangeLabel,
  type ProfileForm,
  type ProfileFormErrors,
} from "@/features/user/lib/customer-profile";

export interface SetupStep {
  kicker: string;
  title: string;
  lead: string;
  fields: (keyof ProfileForm)[];
}

/** The designs' headings; each step owns some of the web form's fields. */
export const SETUP_STEPS: SetupStep[] = [
  { kicker: "Let's get acquainted", title: "I am the", lead: "This helps us personalise your planning space.", fields: ["weddingRole", "name", "email"] },
  { kicker: "Your celebration", title: "Tell us about the day", lead: "You can always change these details later.", fields: ["city", "weddingDate", "partnerName"] },
  { kicker: "One last detail", title: "Shape your celebration", lead: "A rough estimate helps us make better suggestions.", fields: ["guestRange", "budgetRange"] },
];

/** Only the errors of one step's fields (Continue checks the step on screen). */
export function stepErrors(errors: ProfileFormErrors, step: number): ProfileFormErrors {
  const fields = SETUP_STEPS[step]?.fields ?? [];
  return Object.fromEntries(Object.entries(errors).filter(([field]) => fields.includes(field as keyof ProfileForm)));
}

/** The first step with an error (e.g. one the server returned on save), or null. */
export function firstStepWithError(errors: ProfileFormErrors): number | null {
  const step = SETUP_STEPS.findIndex((s) => s.fields.some((f) => errors[f]));
  return step === -1 ? null : step;
}

/** The role tiles: the web's three roles, each with its first letter as the badge. */
export const ROLE_TILES: { value: WeddingRole; label: string; letter: string }[] = WEDDING_ROLE_OPTIONS.map((o) => ({ ...o, letter: o.label[0] }));

/** "Not sure yet" first, then the web's ranges: the stepper and the slider move through these. */
export const GUEST_STOPS: (GuestRange | "")[] = ["", ...GUEST_RANGE_OPTIONS.map((o) => o.value)];
export const BUDGET_STOPS: (BudgetRange | "")[] = ["", ...BUDGET_RANGE_OPTIONS.map((o) => o.value)];

export const stopIndex = <T extends string>(stops: readonly T[], value: T): number => Math.max(0, stops.indexOf(value));

export const guestSummary = (value: GuestRange | ""): string => (value ? `${guestRangeLabel(value)} guests` : "Not sure yet");
export const guestStepperLabel = (value: GuestRange | ""): string => (value ? guestRangeLabel(value) : "Not sure");
export const budgetSummary = (value: BudgetRange | ""): string => (value ? budgetRangeLabel(value) : "Not sure yet");

/** "Skip for now": save without the estimates. */
export const withoutEstimates = (form: ProfileForm): ProfileForm => ({ ...form, guestRange: "", budgetRange: "" });

/** The signed-in number as the design shows it: "+91 98765 43021". Anything else is shown as it is. */
export function phoneLabel(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  return /^\d{10}$/.test(digits) ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : phoneNumber;
}
