import { Redirect } from "expo-router";
import { SAMPLE_FEATURES } from "@/features/user/lib/launch";
import { InvitationsScreen } from "@/features/user/screens/invitations/invitations-screen";

/** Hidden for launch while it only has sample content (lib/launch.ts): old links go Home. */
export default function InvitationsRoute() {
  return SAMPLE_FEATURES.invitations ? <InvitationsScreen /> : <Redirect href="/user/home" />;
}
