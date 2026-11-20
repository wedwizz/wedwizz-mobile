/** Nearby search: rounding, radii, distance labels, and what is remembered where. Plain TS (web and React Native). */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** The radii customers can pick, in km (the API accepts only these). */
export const NEARBY_RADII_KM = [5, 10, 25, 50] as const;
export type NearbyRadiusKm = (typeof NEARBY_RADII_KM)[number];
export const DEFAULT_NEARBY_RADIUS_KM: NearbyRadiusKm = 25;

/** 3 decimals: about 100 m. A customer's position is never sent more precisely. */
export function roundCoordinate(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function roundPoint(point: GeoPoint): GeoPoint {
  return { latitude: roundCoordinate(point.latitude), longitude: roundCoordinate(point.longitude) };
}

/**
 * The API's distance: a venue to one decimal under 10 km, else whole km; a service-based business in whole km
 * only ("approximate"), with 0 meaning "under 1 km".
 */
export interface PublicDistance {
  km: number;
  approximate: boolean;
}

export function distanceLabel(distance: PublicDistance): string {
  if (distance.approximate) return distance.km < 1 ? "under 1 km away" : `about ${Math.round(distance.km)} km away`;
  const km = distance.km < 10 ? distance.km.toFixed(1) : String(Math.round(distance.km));
  return `${km} km away`;
}

/** A small synchronous key-value store: sessionStorage / localStorage on the web; native/storage.ts in the apps. */
export interface SyncStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const POINT_KEY = "wedplan.nearPoint";
const CITY_KEY = "wedplan.city";

/**
 * The customer's position, for this visit only (session storage on the web, memory in the apps: gone when the tab or app closes).
 * Never sent anywhere but nearby search, and never saved to the profile.
 */
export function loadPoint(storage: SyncStorage | null): GeoPoint | null {
  try {
    const value = JSON.parse(storage?.getItem(POINT_KEY) ?? "null") as Partial<GeoPoint> | null;
    return value && typeof value.latitude === "number" && typeof value.longitude === "number"
      ? roundPoint({ latitude: value.latitude, longitude: value.longitude })
      : null;
  } catch {
    return null;
  }
}

export function savePoint(storage: SyncStorage | null, point: GeoPoint | null): void {
  try {
    if (point) storage?.setItem(POINT_KEY, JSON.stringify(roundPoint(point)));
    else storage?.removeItem(POINT_KEY);
  } catch {
    // Storage unavailable (private mode): the point lasts as long as the page.
  }
}

/** The last city the customer chose, remembered between visits. */
export function loadCity(storage: SyncStorage | null): string | null {
  try {
    const city = storage?.getItem(CITY_KEY);
    return city && city.trim() ? city : null;
  } catch {
    return null;
  }
}

export function saveCity(storage: SyncStorage | null, city: string): void {
  try {
    storage?.setItem(CITY_KEY, city);
  } catch {
    // Not remembered this time.
  }
}
