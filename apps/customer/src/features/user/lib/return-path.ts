/**
 * Where to go after signing in: back to the customer page that sent them to sign in (e.g. after tapping a heart),
 * else home. Only paths inside the customer app are accepted, so a crafted link cannot send anyone elsewhere.
 */
export function returnPath(from: unknown, fallback = "/user/home"): string {
  if (typeof from !== "string") return fallback;
  if (!from.startsWith("/user/") || from.startsWith("//") || from.includes("\\")) return fallback;
  // The sign-in screens themselves would loop.
  if (/^\/user\/(welcome|login|verify-otp)(\/|\?|$)/.test(from)) return fallback;
  return from;
}
