import { Home, ShoppingBag, Store, User, Users, type LucideIcon } from "lucide-react-native";

export interface UserNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Shows a small "new" dot. */
  dot?: boolean;
  /** Needs a customer account: a guest's tap opens login, then comes back here. */
  requiresAccount?: boolean;
}

/** The customer navigation: exactly five destinations. */
export const USER_NAV: UserNavItem[] = [
  { to: "/user/home", label: "Home", icon: Home },
  { to: "/user/venues", label: "Venues", icon: Store },
  { to: "/user/vendors", label: "Vendors", icon: Users },
  { to: "/user/market", label: "Market", icon: ShoppingBag, dot: true },
  { to: "/user/profile", label: "Profile", icon: User, requiresAccount: true },
];

/** Where a nav item goes: for a guest, an item that needs an account opens login, coming back to it afterwards. */
export function navTarget(item: UserNavItem, guest: boolean): { to: string; state?: { from: string } } {
  return guest && item.requiresAccount ? { to: "/user/login", state: { from: item.to } } : { to: item.to };
}
