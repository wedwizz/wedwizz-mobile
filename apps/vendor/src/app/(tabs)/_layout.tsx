import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { CalendarDays, Ellipsis, House, MessageCircle, Users, type LucideIcon } from "lucide-react-native";
import { colors } from "@wedwizz/ui";

// The same five tabs as the vendor website's bottom bar (../frontend/src/config/nav.config.ts).
function tab(title: string, Icon: LucideIcon) {
  return {
    title,
    tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => <Icon color={color} size={size} />,
  };
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.text }}>
      <Tabs.Screen name="index" options={tab("Home", House)} />
      <Tabs.Screen name="leads" options={tab("Leads", Users)} />
      <Tabs.Screen name="bookings" options={tab("Bookings", CalendarDays)} />
      <Tabs.Screen name="messages" options={tab("Messages", MessageCircle)} />
      <Tabs.Screen name="more" options={tab("More", Ellipsis)} />
    </Tabs>
  );
}
