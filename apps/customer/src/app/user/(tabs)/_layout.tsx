import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { ClipboardCheck, House, Landmark, User, Users, type LucideIcon } from "lucide-react-native";
import { colors } from "@wedwizz/ui";

// The five tabs from the design, at the web's paths (/user/home, /user/venues, ...). Pages without a tab (market, favourites, enquiries, bookings,
// invitations, inspiration) stay reachable from Home, the chat icon and Profile.
// Step 4 restyles this bar to match the design (brand underline on the active tab).
function tab(title: string, Icon: LucideIcon) {
  return {
    title,
    tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => <Icon color={color} size={size} />,
  };
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.brand, tabBarInactiveTintColor: colors.ink }}>
      <Tabs.Screen name="home" options={tab("Home", House)} />
      <Tabs.Screen name="venues" options={tab("Venues", Landmark)} />
      <Tabs.Screen name="vendors" options={tab("Vendors", Users)} />
      <Tabs.Screen name="checklist" options={tab("Checklist", ClipboardCheck)} />
      <Tabs.Screen name="profile" options={tab("Profile", User)} />
    </Tabs>
  );
}
