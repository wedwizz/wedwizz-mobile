import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useUserStore } from "@/features/user/store/user-store";
import type { NearMeStatus } from "@/features/user/lib/near-me";
import { roundPoint } from "@wedwizz/core/geo/geo";
import type { LocationProvider } from "@wedwizz/core/geo/location-provider";
import { createExpoLocationProvider } from "@wedwizz/core/native/location";

const phoneLocation = createExpoLocationProvider();

/**
 * "Near me": asks the device for its position only when called (a tap), keeps it rounded for this visit, and
 * reports why it couldn't when it can't. Tests can pass their own provider.
 */
export function useNearMe(provider: LocationProvider = phoneLocation) {
  const { point, setNearPoint } = useUserStore(useShallow((s) => ({ point: s.nearPoint, setNearPoint: s.setNearPoint })));
  const [status, setStatus] = useState<NearMeStatus>("idle");

  const request = async (): Promise<boolean> => {
    setStatus("asking");
    const result = await provider.current();
    if (result.status === "granted") {
      setNearPoint(roundPoint(result));
      setStatus("idle");
      return true;
    }
    setStatus(result.status);
    return false;
  };

  return { point, status, request, clear: () => setNearPoint(null), resetStatus: () => setStatus("idle") };
}
