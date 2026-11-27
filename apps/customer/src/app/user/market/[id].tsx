import { Redirect } from "expo-router";
import { SAMPLE_FEATURES } from "@/features/user/lib/launch";
import { MarketItemScreen } from "@/features/user/screens/market/market-item-screen";

/** Hidden for launch while it only has sample content (lib/launch.ts): old links go Home. */
export default function MarketItemRoute() {
  return SAMPLE_FEATURES.market ? <MarketItemScreen /> : <Redirect href="/user/home" />;
}
