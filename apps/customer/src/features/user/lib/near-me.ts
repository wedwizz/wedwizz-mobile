import type { LocationResult } from "@wedwizz/core/geo/location-provider";

/** Where "Near me" stands: never asked yet / asking, or why the location couldn't be used. */
export type NearMeStatus = "idle" | "asking" | Exclude<LocationResult["status"], "granted">;

/**
 * Said just before the browser's own prompt, so the customer knows why it appears. It must match what happens: the
 * point, rounded to about 100 m (nearQuery), goes with each nearby search; the server doesn't store or log it, and no
 * vendor-facing request carries it.
 */
export const NEAR_ME_EXPLAINER =
  "We use your approximate location (to about 100 m) to find vendors near you: it's sent with each nearby search to sort results by distance. It isn't saved to your profile, and vendors never see it.";

/**
 * What to show when the location couldn't be used: always the city picker (the app never blocks on it), with a
 * short note on what happened and how to turn location on.
 */
export function nearMeFallback(status: NearMeStatus): { showCityPicker: boolean; note: string | null } {
  switch (status) {
    case "denied":
      return {
        showCityPicker: true,
        note: "Location is off for WedPlan. To turn it on, tap the lock icon next to the address, then Location → Allow. On a phone, also check that Location is on in Settings. Or pick your city:",
      };
    case "unavailable":
      return { showCityPicker: true, note: "We couldn't find your location on this device. Pick your city instead:" };
    case "timeout":
      return { showCityPicker: true, note: "Finding your location took too long. Try again, or pick your city:" };
    default:
      return { showCityPicker: false, note: null };
  }
}
