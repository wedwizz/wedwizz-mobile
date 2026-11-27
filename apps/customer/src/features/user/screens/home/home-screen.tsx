import { useCallback, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { CalendarCheck, Heart, Lightbulb, Mail } from "lucide-react-native";
import { OptionSheet, space } from "@wedwizz/ui";
import { CitySheet } from "@/features/user/components/city-sheet";
import { FavouriteButton } from "@/features/user/components/favourite-button";
import { NearMeButton } from "@/features/user/components/near-me";
import { HOME_CATEGORIES } from "@/features/user/data/categories";
import { CATEGORY_IMAGES, PLANNER_IMAGES } from "@/features/user/data/category-images";
import { HOME_HERO_SLIDES } from "@/features/user/data/home-hero";
import { isHiddenSamplePath } from "@/features/user/lib/launch";
import { SERVICE_PHOTOS } from "@/features/user/data/service-photos";
import { useCatalogList, useCatalogLists } from "@/features/user/hooks/use-catalog";
import { useChecklist } from "@/features/user/hooks/use-checklist";
import { useEnquiries } from "@/features/user/hooks/use-enquiries";
import { useFavourites } from "@/features/user/hooks/use-favourites";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { guestTabTarget } from "@/features/user/lib/auth-gate";
import { railCardSizes, serviceCardWidth } from "@/features/user/lib/card-sizes";
import { toCardView } from "@/features/user/lib/catalog-view";
import { locationLabel } from "@/features/user/lib/location";
import { useUserStore } from "@/features/user/store/user-store";
import { LOGO } from "@/features/user/screens/auth/auth-assets";
import { POPULAR_SERVICES, SEARCH_CATEGORIES, cheapestQuery, featuredVenuesQuery, hasUnread, homeSearchPath, plannerCounts, popularVendorsQuery, servicePrice } from "./home-logic";
import { HomeView, type HomeCategoryTile, type PlannerTile, type RailView, type ServiceTile } from "./home-view";

/** The reference puts every category picture on the same soft pink. */
const CATEGORIES: HomeCategoryTile[] = HOME_CATEGORIES.map((c) => ({
  key: c.key,
  label: c.label,
  icon: c.icon,
  image: CATEGORY_IMAGES[c.key] ?? null,
  tint: "tintPink",
  iconColor: "brandDark",
}));

/** How long each banner photo shows before the next one. */
const HERO_AUTOPLAY_MS = 5000;

/** Web home-page.tsx (+ the header's city picker, the "Near me" sheet and the planner shortcuts). */
export function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { status } = useUserSession();
  const signedIn = status === "authenticated";
  const location = useUserStore((s) => s.location);
  const nearPoint = useUserStore((s) => s.nearPoint);
  const checklist = useChecklist();
  const favourites = useFavourites();
  const enquiries = useEnquiries();
  const [slide, setSlide] = useState(0);
  // The banner moves on every few seconds and starts again after the last photo. A tap on an arrow or dot restarts
  // the wait; it stops while another screen is open.
  useFocusEffect(
    useCallback(() => {
      if (HOME_HERO_SLIDES.length < 2) return;
      const timer = setTimeout(() => setSlide((slide + 1) % HOME_HERO_SLIDES.length), HERO_AUTOPLAY_MS);
      return () => clearTimeout(timer);
    }, [slide]),
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sheet, setSheet] = useState<"city" | "category" | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const counts = plannerCounts(checklist.data, favourites.data);
  // With Near me on: nearest venues first, then the rest (as the Venues page).
  const featured = useCatalogList(featuredVenuesQuery(location, nearPoint));
  // With Near me on: nearest vendors first, then the rest.
  const popular = useCatalogList(popularVendorsQuery(location, nearPoint));
  // "From ₹…" on each service card: its cheapest listing in the city (one small request each).
  const cheapest = useCatalogLists(POPULAR_SERVICES.map((s) => cheapestQuery(s.category, location)));

  const go = (path: string) => router.navigate(path as Href);
  const label = locationLabel(location);

  const rail = (q: typeof featured, emptyText: string): RailView => {
    if (q.isPending) return { state: "loading" };
    if (q.isError) return { state: "error", onRetry: () => void q.refetch() };
    if (q.data.items.length === 0) return { state: "empty", text: emptyText };
    return { state: "cards", cards: q.data.items.map(toCardView) };
  };

  const services: ServiceTile[] = POPULAR_SERVICES.map((s, i) => {
    const photo = SERVICE_PHOTOS[s.key];
    return {
      key: s.key,
      label: s.label,
      image: photo ?? CATEGORY_IMAGES[s.key] ?? null,
      imageFit: photo ? "cover" : "contain",
      price: servicePrice(cheapest[i] ?? { isPending: true, isError: false }),
    };
  });

  const planner: PlannerTile[] = (
    [
      // Order and lines from the web; colours and pictures from the planner reference (2026-11-26).
      { key: "/user/checklist", label: "Checklist", icon: CalendarCheck, detail: `${counts.tasks} items • ${counts.done} completed`, tone: "pink" },
      { key: "/user/favourites", label: "Shortlisted Vendors", icon: Heart, detail: `${counts.saved} saved`, tone: "peach" },
      { key: "/user/invitations", label: "Digital Invites", icon: Mail, detail: "Create now", tone: "lavender" },
      { key: "/user/inspiration", label: "Inspiration Board", icon: Lightbulb, detail: "Save ideas", tone: "teal" },
    ] as const
  )
    // Digital Invites and Inspiration Board stay out while they are hidden sample features (lib/launch.ts).
    .filter((t) => !isHiddenSamplePath(t.key))
    .map((t) => ({ ...t, image: PLANNER_IMAGES[t.key] ?? null }));
  // The Checklist tab needs an account: a guest goes to login, coming back to it (as the tab bar does).
  const openChecklist = () => {
    const guestTarget = guestTabTarget("checklist", status);
    if (guestTarget) router.push(guestTarget);
    else go("/user/checklist");
  };

  const refresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      featured.refetch(),
      popular.refetch(),
      ...cheapest.map((q) => q.refetch()),
      ...(signedIn ? [checklist.refetch(), favourites.refetch(), enquiries.refetch()] : []),
    ]);
    setRefreshing(false);
  };

  return (
    <HomeView
      logo={LOGO}
      cityLabel={label}
      // "Near me" while results are sorted by distance from the customer.
      locationButtonLabel={nearPoint ? "Near me" : label}
      nearOn={!!nearPoint}
      onPressCity={() => setSheet("city")}
      signedIn={signedIn}
      chatUnread={signedIn && hasUnread(enquiries.data)}
      onPressChat={() => (signedIn ? go("/user/enquiries") : router.push({ pathname: "/user/login", params: { from: "/user/enquiries" } }))}
      query={query}
      onChangeQuery={setQuery}
      searchCategoryLabel={SEARCH_CATEGORIES.find((c) => c.value === category)?.label ?? "All services"}
      onPressSearchCategory={() => setSheet("category")}
      onSearch={() => go(homeSearchPath(category, query))}
      categories={CATEGORIES}
      onPressCategory={(key) => {
        const to = HOME_CATEGORIES.find((c) => c.key === key)?.to;
        if (to) go(to);
      }}
      slides={HOME_HERO_SLIDES}
      slide={slide}
      onChangeSlide={setSlide}
      onExplore={() => go("/user/venues")}
      services={services}
      serviceCardWidth={serviceCardWidth(width)}
      onPressService={(key) => {
        const to = POPULAR_SERVICES.find((s) => s.key === key)?.to;
        if (to) go(to);
      }}
      onServicesViewAll={() => go("/user/vendors")}
      nearControl={<NearMeButton variant="banner" />}
      featured={rail(featured, `No venues listed in ${label} yet.`)}
      popular={rail(popular, `No vendors listed in ${label} yet.`)}
      onViewAllVenues={() => go("/user/venues")}
      onViewAllVendors={() => go("/user/vendors")}
      onOpenListing={(card) => router.push(card.to as Href)}
      renderFavourite={(card) => <FavouriteButton id={card.slug} label={card.name} />}
      // Featured Venues use the Popular Vendors card size, so both rails match.
      cardSizes={{ venue: railCardSizes(width, space.screen).vendor, vendor: railCardSizes(width, space.screen).vendor }}
      planner={planner}
      onPressPlanner={(key) => (key === "/user/checklist" ? openChecklist() : router.push(key as Href))}
      onPlannerViewAll={openChecklist}
      refreshing={refreshing}
      onRefresh={() => void refresh()}
      sheets={
        <>
          <CitySheet visible={sheet === "city"} onClose={() => setSheet(null)} />
          <OptionSheet
            visible={sheet === "category"}
            title="Service category"
            options={SEARCH_CATEGORIES}
            value={category}
            onSelect={setCategory}
            onClose={() => setSheet(null)}
          />
        </>
      }
    />
  );
}
