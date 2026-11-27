import { Redirect } from "expo-router";
import { SAMPLE_FEATURES } from "@/features/user/lib/launch";
import { InspirationScreen } from "@/features/user/screens/inspiration/inspiration-screen";

/** Hidden for launch while it only has sample content (lib/launch.ts): old links go Home. */
export default function InspirationRoute() {
  return SAMPLE_FEATURES.inspiration ? <InspirationScreen /> : <Redirect href="/user/home" />;
}
