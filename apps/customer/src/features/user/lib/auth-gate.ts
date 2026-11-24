/**
 * The web's route guards (features/user/routes/user-route-guards.tsx) as plain decisions, so the app's screens and the
 * Expo Router layout make the same choices and they can be tested without rendering.
 */
import { profileRedirect } from "@/features/user/lib/customer-profile";

export type SessionStatus = "initializing" | "authenticated" | "unauthenticated";

/** Sign-in screens. Outside the web's CustomerArea: the profile-setup redirect never applies to them. */
const SIGN_IN_PATH = /^\/user\/(welcome|login|verify-otp)(\/|$)/;

/** Legal pages anyone can read (linked from welcome, login and profile setup). */
export const PUBLIC_PROFILE_SECTIONS = ["privacy", "terms"] as const;

/**
 * The web's CustomerArea (+ the profile check in RequireUser): where a signed-in customer must go instead of
 * `pathname`. Setup until the profile is saved, never back to setup after. Null to stay, and while the profile is
 * still unknown (`hasProfile` undefined).
 */
export function customerAreaRedirect(pathname: string, status: SessionStatus, hasProfile: boolean | undefined): string | null {
  if (status !== "authenticated" || hasProfile === undefined) return null;
  if (SIGN_IN_PATH.test(pathname)) return null;
  return profileRedirect(pathname, hasProfile);
}

export type RequireUserView = "loading" | "welcome" | "error" | "show";

/**
 * The web's RequireUser: what a customer-only screen shows. A guest goes to welcome (coming back after signing in);
 * the screen waits for the session and the profile, so nothing flashes before the setup redirect.
 */
export function requireUserView(
  status: SessionStatus,
  profile: { isPending: boolean; isError: boolean },
  redirect: string | null,
): RequireUserView {
  if (status === "initializing") return "loading";
  if (status === "unauthenticated") return "welcome";
  if (profile.isPending) return "loading";
  if (profile.isError) return "error";
  return redirect ? "loading" : "show";
}

/** Tabs that need an account. The web's bottom nav sends a guest's Profile tap to login, coming back to the tab. */
const ACCOUNT_TABS = new Set(["profile", "checklist"]);

/** Where a tab tap goes instead for a guest (web navTarget), or null to open the tab. */
export function guestTabTarget(tab: string, status: SessionStatus): { pathname: "/user/login"; params: { from: string } } | null {
  return status === "unauthenticated" && ACCOUNT_TABS.has(tab) ? { pathname: "/user/login", params: { from: `/user/${tab}` } } : null;
}

/** A route param as one string (Expo Router gives string | string[] | undefined). */
export function paramString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Link to a /user/profile/<section> page (privacy, terms, help, notifications) in Expo Router's typed form. */
export function profileSectionHref(section: string) {
  return { pathname: "/user/profile/[section]" as const, params: { section } };
}
