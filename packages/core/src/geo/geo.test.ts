import { afterEach, describe, expect, it, vi } from "vitest";
import { distanceLabel, loadCity, loadPoint, roundCoordinate, roundPoint, saveCity, savePoint, type SyncStorage } from "./geo";
import { createWebLocationProvider } from "./location-provider";
import { searchPlaces } from "./geocoder";

function memory(): SyncStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe("distance labels", () => {
  it("show venues to one decimal under 10 km and whole km beyond", () => {
    expect(distanceLabel({ km: 2.3, approximate: false })).toBe("2.3 km away");
    expect(distanceLabel({ km: 9.9, approximate: false })).toBe("9.9 km away");
    expect(distanceLabel({ km: 14, approximate: false })).toBe("14 km away");
  });

  it("show service-based businesses as about whole km, or under 1 km", () => {
    expect(distanceLabel({ km: 2, approximate: true })).toBe("about 2 km away");
    expect(distanceLabel({ km: 0, approximate: true })).toBe("under 1 km away");
  });
});

describe("coordinate rounding", () => {
  it("keeps 3 decimals (about 100 m) before anything leaves the device", () => {
    expect(roundCoordinate(9.931234)).toBe(9.931);
    expect(roundPoint({ latitude: 9.93189, longitude: 76.26751 })).toEqual({ latitude: 9.932, longitude: 76.268 });
  });
});

describe("what is remembered", () => {
  it("keeps the point for the visit, rounded, and forgets it when cleared", () => {
    const session = memory();
    savePoint(session, { latitude: 9.931234, longitude: 76.267891 });
    expect(JSON.parse(session.data.get("wedplan.nearPoint")!)).toEqual({ latitude: 9.931, longitude: 76.268 });
    expect(loadPoint(session)).toEqual({ latitude: 9.931, longitude: 76.268 });
    savePoint(session, null);
    expect(loadPoint(session)).toBeNull();
    expect(loadPoint(null)).toBeNull();
  });

  it("remembers the last city between visits, and survives broken storage", () => {
    const local = memory();
    expect(loadCity(local)).toBeNull();
    saveCity(local, "Thrissur");
    expect(loadCity(local)).toBe("Thrissur");
    const broken: SyncStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => undefined,
    };
    expect(loadCity(broken)).toBeNull();
    expect(() => saveCity(broken, "Kochi")).not.toThrow();
  });
});

describe("web location provider", () => {
  afterEach(() => vi.useRealTimers());

  const geolocation = (answer: (ok: PositionCallback, fail: PositionErrorCallback) => void) => ({
    getCurrentPosition: (ok: PositionCallback, fail?: PositionErrorCallback | null) => answer(ok, fail!),
  });

  it("returns the position when allowed", async () => {
    const provider = createWebLocationProvider(
      geolocation((ok) => ok({ coords: { latitude: 9.9312, longitude: 76.2673 } } as GeolocationPosition)),
    );
    expect(await provider.current()).toEqual({ status: "granted", latitude: 9.9312, longitude: 76.2673 });
  });

  it("reports denied, unavailable and timed-out answers, and a missing API", async () => {
    const failing = (code: number) => createWebLocationProvider(geolocation((_ok, fail) => fail({ code } as GeolocationPositionError)));
    expect(await failing(1).current()).toEqual({ status: "denied" });
    expect(await failing(2).current()).toEqual({ status: "unavailable" });
    expect(await failing(3).current()).toEqual({ status: "timeout" });
    expect(await createWebLocationProvider(undefined).current()).toEqual({ status: "unavailable" });
  });

  it("times out when the browser never answers (an ignored prompt)", async () => {
    vi.useFakeTimers();
    const pending = createWebLocationProvider(geolocation(() => undefined), 10_000).current();
    vi.advanceTimersByTime(11_000);
    expect(await pending).toEqual({ status: "timeout" });
  });
});

describe("address search", () => {
  it("searches in Kerala and returns places with their pins", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => [{ lat: "10.0261", lon: "76.3086", display_name: "Edappally, Kochi, Kerala" }, { lat: "x", lon: "1" }],
    }));
    const places = await searchPlaces("Edappally", { baseUrl: "https://geo.example/", fetcher });
    expect(places).toEqual([{ latitude: 10.0261, longitude: 76.3086, label: "Edappally, Kochi, Kerala" }]);
    const url = new URL((fetcher.mock.calls[0] as unknown as [string])[0]);
    expect(url.origin + url.pathname).toBe("https://geo.example/search");
    expect(url.searchParams.get("q")).toBe("Edappally, Kerala");
    expect(url.searchParams.get("countrycodes")).toBe("in");
    expect(await searchPlaces("ab", { fetcher })).toEqual([]);
  });
});
