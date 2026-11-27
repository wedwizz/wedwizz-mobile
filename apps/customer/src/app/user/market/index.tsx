import { Redirect } from "expo-router";
import { SAMPLE_FEATURES } from "@/features/user/lib/launch";
import { MarketScreen } from "@/features/user/screens/market/market-screen";

/** Hidden for launch while it only has sample content (lib/launch.ts): old links go Home. */
export default function MarketRoute() {
  return SAMPLE_FEATURES.market ? <MarketScreen /> : <Redirect href="/user/home" />;
}
