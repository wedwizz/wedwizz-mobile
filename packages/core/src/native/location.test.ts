import { afterEach, describe, expect, it, vi } from "vitest";
import { createExpoLocationProvider, LAST_KNOWN_MAX_AGE_MS, type ExpoLocationLike } from "./location";

vi.mock("expo-location", () => ({ Accuracy: { Balanced: 3 } }));

const at = (latitude: number, longitude: number) => ({ coords: { latitude, longitude } }) as Awaited<ReturnType<ExpoLocationLike["getCurrentPositionAsync"]>>;

function fake(overrides: Partial<Record<keyof ExpoLocationLike, unknown>> = {}): ExpoLocationLike {
  return {
    hasServicesEnabledAsync: async () => true,
    requestForegroundPermissionsAsync: async () => ({ status: "granted" }),
    getLastKnownPositionAsync: async () => null,
    getCurrentPositionAsync: async () => at(9.9312, 76.2673),
    ...overrides,
  } as ExpoLocationLike;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("phone location provider", () => {
  it("returns a fresh fix once the user allows it", async () => {
    expect(await createExpoLocationProvider(fake()).current()).toEqual({ status: "granted", latitude: 9.9312, longitude: 76.2673 });
  });

  it("uses a fix from the last 5 minutes when there is one, like the web's maximumAge", async () => {
    const getLastKnownPositionAsync = vi.fn(async () => at(10, 76));
    const getCurrentPositionAsync = vi.fn();
    const result = await createExpoLocationProvider(fake({ getLastKnownPositionAsync, getCurrentPositionAsync })).current();
    expect(result).toEqual({ status: "granted", latitude: 10, longitude: 76 });
    expect(getLastKnownPositionAsync).toHaveBeenCalledWith({ maxAge: LAST_KNOWN_MAX_AGE_MS });
    expect(getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("asks for a coarse fix, not navigation accuracy", async () => {
    const getCurrentPositionAsync = vi.fn(async () => at(1, 2));
    await createExpoLocationProvider(fake({ getCurrentPositionAsync })).current();
    expect(getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 3 });
  });

  it("reports denied, unavailable and failures as statuses, never rejecting", async () => {
    expect(await createExpoLocationProvider(fake({ requestForegroundPermissionsAsync: async () => ({ status: "denied" }) })).current()).toEqual({ status: "denied" });
    expect(await createExpoLocationProvider(fake({ hasServicesEnabledAsync: async () => false })).current()).toEqual({ status: "unavailable" });
    const failing = fake({
      getCurrentPositionAsync: async () => {
        throw new Error("no fix");
      },
    });
    expect(await createExpoLocationProvider(failing).current()).toEqual({ status: "unavailable" });
  });

  it("times out when no fix arrives in time", async () => {
    vi.useFakeTimers();
    const pending = createExpoLocationProvider(fake({ getCurrentPositionAsync: () => new Promise(() => undefined) }), 10_000).current();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await pending).toEqual({ status: "timeout" });
  });
});
