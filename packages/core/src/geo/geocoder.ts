import type { GeoPoint } from "./geo";

/**
 * Address search for placing a business's map pin. Uses Nominatim (OpenStreetMap) by default: no API key. Its
 * usage policy allows about one search per second, so search runs when the vendor submits, never per keystroke.
 * Before heavy production use, point VITE_GEOCODER_URL at a paid or self-hosted Nominatim-compatible service.
 */
export const DEFAULT_GEOCODER_URL = "https://nominatim.openstreetmap.org";

export interface PlaceResult extends GeoPoint {
  label: string;
}

type Fetch = (url: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

export async function searchPlaces(
  query: string,
  {
    baseUrl = DEFAULT_GEOCODER_URL,
    fetcher = (url, init) => fetch(url, init),
    signal,
  }: { baseUrl?: string; fetcher?: Fetch; signal?: AbortSignal } = {},
): Promise<PlaceResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  // Kerala first: businesses here are in Kerala, and it keeps similar names elsewhere out.
  const params = new URLSearchParams({ q: `${q}, Kerala`, format: "jsonv2", countrycodes: "in", limit: "5" });
  const response = await fetcher(`${baseUrl.replace(/\/+$/, "")}/search?${params}`, { signal, headers: { "Accept-Language": "en" } });
  if (!response.ok) throw new Error("Address search is unavailable right now");
  const rows = (await response.json()) as { lat?: string; lon?: string; display_name?: string }[];
  return rows.flatMap((row) => {
    const latitude = Number(row.lat);
    const longitude = Number(row.lon);
    return Number.isFinite(latitude) && Number.isFinite(longitude) && row.display_name
      ? [{ latitude, longitude, label: row.display_name }]
      : [];
  });
}
