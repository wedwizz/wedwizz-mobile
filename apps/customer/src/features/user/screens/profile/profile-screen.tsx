import { useState } from "react";
import { Alert } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Bell, CalendarCheck, FileText, Heart, LifeBuoy, ListChecks, MessageSquare, Palette, ShieldCheck } from "lucide-react-native";
import { toApiError } from "@wedwizz/core/api/api-error";
import { EditProfileSheet } from "@/features/user/components/edit-profile-sheet";
import { useMyBookings } from "@/features/user/hooks/use-bookings";
import { useCustomerProfile } from "@/features/user/hooks/use-customer-profile";
import { useEnquiries } from "@/features/user/hooks/use-enquiries";
import { useFavourites } from "@/features/user/hooks/use-favourites";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { profileSectionHref } from "@/features/user/lib/auth-gate";
import { RequireUser } from "@/features/user/routes/guards";
import { countLabel, profileDetails, savedCount } from "./profile-logic";
import { ProfileView, type ProfileMenuRow } from "./profile-view";

/** Web profile-page.tsx, the Profile tab. Customers only. */
export function ProfileScreen() {
  return (
    <RequireUser inLayout>
      <Profile />
    </RequireUser>
  );
}

function Profile() {
  const router = useRouter();
  const favourites = useFavourites();
  const enquiries = useEnquiries();
  const bookings = useMyBookings();
  const { account, logout } = useUserSession();
  // RequireUser only renders this page once the profile is loaded and saved.
  const profile = useCustomerProfile().data?.profile;
  const [editOpen, setEditOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  if (!profile) return null;

  const push = (path: string) => () => router.push(path as Href);
  const section = (name: string) => () => router.push(profileSectionHref(name));
  const menu: ProfileMenuRow[] = [
    { label: "Saved venues & vendors", icon: Heart, onPress: push("/user/favourites") },
    { label: "My enquiries", icon: MessageSquare, onPress: push("/user/enquiries") },
    { label: "My bookings", icon: CalendarCheck, onPress: push("/user/bookings") },
    { label: "Wedding checklist", icon: ListChecks, onPress: () => router.navigate("/user/checklist") },
    { label: "Notification preferences", icon: Bell, onPress: section("notifications") },
    { label: "Help & support", icon: LifeBuoy, onPress: section("help") },
    { label: "Privacy policy", icon: ShieldCheck, onPress: section("privacy") },
    { label: "Terms & conditions", icon: FileText, onPress: section("terms") },
    ...(__DEV__ ? [{ label: "Design system preview", icon: Palette, detail: "Development builds only", onPress: push("/dev/ui-preview") }] : []),
  ];

  // Web: a "Log out?" confirmation, then sign out. The Profile tab's guard then shows welcome.
  const confirmLogout = () =>
    Alert.alert("Log out?", "You'll be signed out on this device and return to the welcome screen.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          setLoggingOut(true);
          logout()
            .catch((err: unknown) => Alert.alert("Couldn't log out", toApiError(err).message))
            .finally(() => setLoggingOut(false));
        },
      },
    ]);

  return (
    <ProfileView
      name={profile.name}
      place={`${profile.city}, Kerala`}
      onEdit={() => setEditOpen(true)}
      details={profileDetails(profile, account?.phoneNumber ?? null)}
      counts={[
        { value: String(savedCount(favourites.data)), label: "Saved", color: "brand", onPress: push("/user/favourites") },
        { value: countLabel(enquiries.data?.length), label: "Enquiries", color: "brand", onPress: push("/user/enquiries") },
        // The web shows a fixed sample "2" here; this is the real count.
        { value: countLabel(bookings.data?.length), label: "Bookings", color: "brand", onPress: push("/user/bookings") },
      ]}
      menu={menu}
      onLogout={confirmLogout}
      loggingOut={loggingOut}
      sheet={<EditProfileSheet profile={profile} visible={editOpen} onClose={() => setEditOpen(false)} />}
    />
  );
}
