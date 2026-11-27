import { isHiddenSamplePath } from "@/features/user/lib/launch";
import {
  Brush,
  CalendarHeart,
  Camera,
  ConciergeBell,
  Ellipsis,
  Flower2,
  Gift,
  Landmark,
  Music,
  type LucideIcon,
} from "lucide-react-native";
import type { MarketCategoryKey } from "@/features/user/types/user.types";

// Vendor tiles use the category keys from lib/catalog-categories.
export interface HomeCategory {
  key: string;
  label: string;
  icon: LucideIcon;
  tintClass: string;
  iconClass: string;
  to: string;
}

const ALL_HOME_CATEGORIES: HomeCategory[] = [
  { key: "venues", label: "Venues", icon: Landmark, tintClass: "bg-tint-pink", iconClass: "text-brand-dark", to: "/user/venues" },
  { key: "photographers", label: "Photographers", icon: Camera, tintClass: "bg-tint-peach", iconClass: "text-orange-800", to: "/user/vendors?category=photographers" },
  { key: "makeup", label: "Makeup Artists", icon: Brush, tintClass: "bg-tint-pink", iconClass: "text-rose-700", to: "/user/vendors?category=makeup" },
  { key: "decorators", label: "Decorators", icon: Flower2, tintClass: "bg-tint-lavender", iconClass: "text-purple-700", to: "/user/vendors?category=decorators" },
  { key: "planners", label: "Wedding Planners", icon: CalendarHeart, tintClass: "bg-tint-mint", iconClass: "text-emerald-800", to: "/user/vendors?category=planners" },
  { key: "catering", label: "Catering", icon: ConciergeBell, tintClass: "bg-tint-peach", iconClass: "text-orange-900", to: "/user/vendors?category=catering" },
  { key: "music", label: "Music & Artists", icon: Music, tintClass: "bg-tint-sky", iconClass: "text-sky-700", to: "/user/vendors?category=music" },
  { key: "invites", label: "Invites & Gifts", icon: Gift, tintClass: "bg-tint-pink", iconClass: "text-rose-600", to: "/user/market?category=invitations" },
  { key: "more", label: "More", icon: Ellipsis, tintClass: "bg-tint-sand", iconClass: "text-neutral-700", to: "/user/vendors" },
];

/** Without the tiles that lead to a hidden sample feature ("Invites & Gifts" opens the market). */
export const HOME_CATEGORIES: HomeCategory[] = ALL_HOME_CATEGORIES.filter((c) => !isHiddenSamplePath(c.to));

export const MARKET_CATEGORIES: { key: MarketCategoryKey | "all" | "deals"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "essentials", label: "Essentials" },
  { key: "invitations", label: "Invitations & Gifts" },
  { key: "decor", label: "Decor Packages" },
  { key: "photography", label: "Photography" },
  { key: "bridal", label: "Bridal Services" },
  { key: "deals", label: "Deals" },
];
