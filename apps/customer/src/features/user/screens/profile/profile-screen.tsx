import { useState } from "react";
import { useRouter, type Href } from "expo-router";
import { CalendarCheck, FileText, Heart, LifeBuoy, ListChecks, MessageSquare, Palette, Settings, ShieldCheck } from "lucide-react-native";
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
  const { account } = useUserSession();
  // RequireUser only renders this page once the profile is loaded and saved.
  const profile = useCustomerProfile().data?.profile;
  const [editOpen, setEditOpen] = useState(false);
  if (!profile) return null;

  const push = (path: string) => () => router.push(path as Href);
  const section = (name: string) => () => router.push(profileSectionHref(name));
  const menu: ProfileMenuRow[] = [
    { label: "Saved venues & vendors", icon: Heart, onPress: push("/user/favourites") },
    { label: "My enquiries", icon: MessageSquare, onPress: push("/user/enquiries") },
    { label: "My bookings", icon: CalendarCheck, onPress: push("/user/bookings") },
    { label: "Wedding checklist", icon: ListChecks, onPress: () => router.navigate("/user/checklist") },
    { label: "Help & support", icon: LifeBuoy, onPress: section("help") },
    { label: "Privacy policy", icon: ShieldCheck, onPress: section("privacy") },
    { label: "Terms & conditions", icon: FileText, onPress: section("terms") },
    // Log out and Delete account live there, out of the way of the everyday rows (as the web).
    { label: "Account settings", icon: Settings, onPress: push("/user/account-settings") },
    ...(__DEV__ ? [{ label: "Design system preview", icon: Palette, detail: "Development builds only", onPress: push("/dev/ui-preview") }] : []),
  ];

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
      sheet={<EditProfileSheet profile={profile} visible={editOpen} onClose={() => setEditOpen(false)} />}
    />
  );
}
