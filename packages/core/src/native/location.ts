/**
 * The phone's position for "Near me" / "Use my current location", behind the same `LocationProvider` interface as
 * the web's navigator.geolocation provider (geo/location-provider.ts). Asked for only on a tap; one position per call,
 * never tracked, nothing stored here.
 */
import * as Location from "expo-location";
import { LOCATION_TIMEOUT_MS, type LocationProvider, type LocationResult } from "../geo/location-provider";

/** The parts of expo-location used here (a fake in tests). */
export type ExpoLocationLike = Pick<
  typeof Location,
  "hasServicesEnabledAsync" | "requestForegroundPermissionsAsync" | "getLastKnownPositionAsync" | "getCurrentPositionAsync"
>;

/** Same as the web's `maximumAge`: a fix from the last 5 minutes is good enough for a search area. */
export const LAST_KNOWN_MAX_AGE_MS = 5 * 60_000;

/** Never rejects: every failure is a status, as on the web. */
export function createExpoLocationProvider(location: ExpoLocationLike = Location, timeoutMs = LOCATION_TIMEOUT_MS): LocationProvider {
  return {
    current: async (): Promise<LocationResult> => {
      try {
        if (!(await location.hasServicesEnabledAsync())) return { status: "unavailable" };
        // The system prompt waits for the user, so it has no timeout; only getting a fix does.
        const permission = await location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") return { status: "denied" };

        const recent = await location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS });
        if (recent) return { status: "granted", latitude: recent.coords.latitude, longitude: recent.coords.longitude };

        // A base or a search area, not navigation: a quick, coarse fix is enough (the web's enableHighAccuracy: false).
        const fix = await withTimeout(location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), timeoutMs);
        if (!fix) return { status: "timeout" };
        return { status: "granted", latitude: fix.coords.latitude, longitude: fix.coords.longitude };
      } catch {
        return { status: "unavailable" };
      }
    },
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
