import { useRouter } from "expo-router";
import { Tabs, type BottomTabBarProps } from "expo-router/js-tabs";
import { ClipboardCheck, House, Landmark, User, Users } from "lucide-react-native";
import { BottomTabBar, type BottomTabItem } from "@wedwizz/ui";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { guestTabTarget } from "@/features/user/lib/auth-gate";

// The five tabs from the design, at the web's paths (/user/home, /user/venues, ...). Pages without a tab (market, favourites, enquiries, bookings,
// invitations, inspiration) stay reachable from Home, the chat icon and Profile.
const items: BottomTabItem[] = [
  { key: "home", label: "Home", icon: House },
  { key: "venues", label: "Venues", icon: Landmark },
  { key: "vendors", label: "Vendors", icon: Users },
  { key: "checklist", label: "Checklist", icon: ClipboardCheck },
  { key: "profile", label: "Profile", icon: User },
];

/**
 * Connects the design's tab bar (@wedwizz/ui) to the navigator: same press and long-press events as the default bar.
 * A guest's tap on Profile or Checklist opens login instead, coming back to the tab (web navTarget).
 */
function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const router = useRouter();
  const { status } = useUserSession();
  const routeKey = (name: string) => state.routes.find((r) => r.name === name)?.key;
  return (
    <BottomTabBar
      items={items}
      activeKey={state.routes[state.index]?.name ?? "home"}
      onPress={(name) => {
        const key = routeKey(name);
        if (!key) return;
        const focused = state.routes[state.index]?.key === key;
        const event = emitter.emit({ type: "tabPress", target: key, canPreventDefault: true });
        if (focused || event.defaultPrevented) return;
        const guestTarget = guestTabTarget(name, status);
        if (guestTarget) router.push(guestTarget);
        else navigateToTab(key);
      }}
      onLongPress={(name) => {
        const key = routeKey(name);
        if (key) emitter.emit({ type: "tabLongPress", target: key });
      }}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      {items.map((item) => (
        <Tabs.Screen key={item.key} name={item.key} options={{ title: item.label }} />
      ))}
    </Tabs>
  );
}
