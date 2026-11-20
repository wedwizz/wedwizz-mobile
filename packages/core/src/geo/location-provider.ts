/**
 * The device's current position, asked for only when the user taps "Near me" / "Use my current location".
 * Plain TS: the web uses navigator.geolocation; the React Native app plugs in its own location module behind the
 * same interface. Never tracks: one position per call, and nothing is stored here.
 */
export type LocationResult =
  | { status: "granted"; latitude: number; longitude: number }
  /** The user (or the browser/phone settings) said no. */
  | { status: "denied" }
  /** No location on this device or browser, or it couldn't get a fix. */
  | { status: "unavailable" }
  /** No answer in time. */
  | { status: "timeout" };

export interface LocationProvider {
  current(): Promise<LocationResult>;
}

export const LOCATION_TIMEOUT_MS = 10_000;

/** The browser's geolocation (or the given one, in tests). Never rejects: every failure is a status. */
export function createWebLocationProvider(
  geolocation: Pick<Geolocation, "getCurrentPosition"> | undefined = typeof navigator !== "undefined" ? navigator.geolocation : undefined,
  timeoutMs = LOCATION_TIMEOUT_MS,
): LocationProvider {
  return {
    current: () =>
      new Promise<LocationResult>((resolve) => {
        if (!geolocation) return resolve({ status: "unavailable" });
        let settled = false;
        const settle = (result: LocationResult) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(result);
        };
        // Some browsers never call back while their permission prompt is ignored.
        const timer = setTimeout(() => settle({ status: "timeout" }), timeoutMs + 1_000);
        try {
          geolocation.getCurrentPosition(
            (position) => settle({ status: "granted", latitude: position.coords.latitude, longitude: position.coords.longitude }),
            (error) =>
              settle({ status: error.code === 1 ? "denied" : error.code === 3 ? "timeout" : "unavailable" }),
            // A base or a search area, not navigation: a quick, coarse fix is enough.
            { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60_000 },
          );
        } catch {
          settle({ status: "unavailable" });
        }
      }),
  };
}
