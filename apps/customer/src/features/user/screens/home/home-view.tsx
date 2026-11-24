import type { ReactNode } from "react";
import { StyleSheet, View, type ImageSourcePropType } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import {
  AppText,
  CategoryStrip,
  CategoryTile,
  HeroBanner,
  HomeHeader,
  HomeSearchBar,
  InlineLink,
  NearbyBanner,
  Rail,
  RailSkeleton,
  Screen,
  SectionHeader,
  ServiceCard,
  ToolTile,
  colors,
  space,
  type ColorToken,
  type HeroSlide,
} from "@wedwizz/ui";
import { VendorCard, VenueCard } from "@/features/user/components/listing-cards";
import type { ListingCardView } from "@/features/user/lib/catalog-view";
import type { CardSize } from "@/features/user/lib/card-sizes";
import type { ServicePrice } from "./home-logic";

/** What a rail shows (web HomeRail): skeletons, "Couldn't load… Try again", the empty text, or the cards. */
export type RailView =
  | { state: "loading" }
  | { state: "error"; onRetry: () => void }
  | { state: "empty"; text: string }
  | { state: "cards"; cards: ListingCardView[] };

export interface HomeCategoryTile {
  key: string;
  label: string;
  /** The category picture (bundled); null shows the icon instead. */
  image: number | null;
  icon: LucideIcon;
  tint: ColorToken;
  iconColor: ColorToken;
}

export interface PlannerTile {
  key: string;
  label: string;
  icon: LucideIcon;
  detail: string;
}

export interface ServiceTile {
  key: string;
  label: string;
  image: number | string | null;
  /** "contain" for an illustration (the category picture) until a photo is supplied. */
  imageFit: "cover" | "contain";
  price: ServicePrice;
}

export interface HomeViewProps {
  // Header and search
  logo: ImageSourcePropType;
  cityLabel: string;
  /** On the header's location button: the city, or "Near me" while sorting by distance. */
  locationButtonLabel: string;
  /** Near me is on: Featured Venues and Popular Vendors are the nearest first ("… near you"). */
  nearOn: boolean;
  onPressCity: () => void;
  signedIn: boolean;
  chatUnread: boolean;
  onPressChat: () => void;
  query: string;
  onChangeQuery: (text: string) => void;
  searchCategoryLabel: string;
  onPressSearchCategory: () => void;
  onSearch: () => void;
  // Categories and banner
  categories: HomeCategoryTile[];
  onPressCategory: (key: string) => void;
  slides: HeroSlide[];
  slide: number;
  onChangeSlide: (index: number) => void;
  onExplore: () => void;
  // Popular services
  services: ServiceTile[];
  serviceCardWidth: number;
  onPressService: (key: string) => void;
  onServicesViewAll: () => void;
  // Near you
  /** "Near me" / "Near you ✕" (wired by the app). */
  nearControl: ReactNode;
  // Listings
  featured: RailView;
  popular: RailView;
  onViewAllVenues: () => void;
  onViewAllVendors: () => void;
  onOpenListing: (card: ListingCardView) => void;
  /** The wired heart for a card (favourites + login gate). */
  renderFavourite: (card: ListingCardView) => ReactNode;
  /** Card sizes (lib/card-sizes.ts): venues two across, vendors as the vendor rails. */
  cardSizes: { venue: CardSize; vendor: CardSize };
  // Wedding planner
  planner: PlannerTile[];
  onPressPlanner: (key: string) => void;
  onPlannerViewAll: () => void;
  // Screen
  refreshing: boolean;
  onRefresh: () => void;
  /** Sheets (city, category, near me), rendered by the screen. */
  sheets: ReactNode;
}

/** Web home-page.tsx in the home reference's look (2026-11-24). Content is the web's; the services row is the reference's. */
export function HomeView(props: HomeViewProps) {
  const { cityLabel } = props;
  return (
    // The search row (second child) stays pinned under the status bar while the page scrolls.
    <Screen padded={false} refreshing={props.refreshing} onRefresh={props.onRefresh} stickyHeaderIndices={[1]}>
      <HomeHeader logo={props.logo} cityLabel={props.locationButtonLabel} onPressCity={props.onPressCity} />

      <View style={[styles.searchRow, styles.padded]}>
        <HomeSearchBar
          value={props.query}
          onChangeText={props.onChangeQuery}
          onSubmit={props.onSearch}
          placeholder="Search for venues, vendors, services…"
          inputLabel="Search venues and wedding services"
          categoryLabel={props.searchCategoryLabel}
          onPressCategory={props.onPressSearchCategory}
          chat={{ label: props.signedIn ? "My enquiries" : "Messages, log in to see them", dot: props.chatUnread, onPress: props.onPressChat }}
        />
      </View>

      {/* Categories */}
      <View style={styles.categories}>
        <CategoryStrip accessibilityLabel="Service categories">
          {props.categories.map((c) => (
            <CategoryTile key={c.key} label={c.label} image={c.image} icon={c.icon} tint={c.tint} iconColor={c.iconColor} onPress={() => props.onPressCategory(c.key)} />
          ))}
        </CategoryStrip>
      </View>

      {/* Hero: the web's title and line on the reference's photo card */}
      <View style={[styles.banner, styles.inset]}>
        <HeroBanner
          slides={props.slides}
          index={props.slide}
          onChangeIndex={props.onChangeSlide}
          kicker="Plan Your"
          title="Dream"
          titleHighlight="Wedding"
          subtitle="Discover beautiful venues and trusted wedding professionals, all in one place."
          actionLabel="Explore Now"
          onAction={props.onExplore}
        />
      </View>

      {/* Popular services: each category's lowest price in the city */}
      <View style={styles.section} accessibilityLabel="Popular services">
        <View style={styles.padded}>
          <SectionHeader title="Popular Services for Your Wedding" onAction={props.onServicesViewAll} />
        </View>
        <Rail>
          {props.services.map((s) => (
            <ServiceCard
              key={s.key}
              label={s.label}
              image={s.image}
              imageFit={s.imageFit}
              width={props.serviceCardWidth}
              price={s.price.state === "price" ? s.price.text : null}
              priceLoading={s.price.state === "loading"}
              priceNote={s.price.state === "note" ? s.price.text : undefined}
              onPress={() => props.onPressService(s.key)}
            />
          ))}
        </Rail>
      </View>

      {/* Near you: asks for the location only when the customer taps "Near me" */}
      <View style={[styles.section, styles.inset]}>
        <NearbyBanner
          title="Nearby vendors"
          body="See vendors sorted by how far they are from you, or keep browsing by city."
          action={props.nearControl}
        />
      </View>

      {/* Featured venues */}
      <View style={styles.section} accessibilityLabel="Featured venues">
        <View style={styles.padded}>
          <SectionHeader title={props.nearOn ? "Featured Venues near you" : `Featured Venues in ${cityLabel}`} onAction={props.onViewAllVenues} />
        </View>
        <ListingRail rail={props.featured} kind="venue" {...props} />
      </View>

      {/* Popular vendors */}
      <View style={styles.section} accessibilityLabel="Popular vendors">
        <View style={styles.padded}>
          <SectionHeader title={props.nearOn ? "Popular Vendors near you" : `Popular Vendors in ${cityLabel}`} onAction={props.onViewAllVendors} />
        </View>
        <ListingRail rail={props.popular} kind="vendor" {...props} />
      </View>

      {/* Wedding planner */}
      <View style={[styles.section, styles.padded]}>
        <SectionHeader title="Your Wedding Planner" subtitle="Stay organized and enjoy the journey!" onAction={props.onPlannerViewAll} />
        <View style={styles.tools}>
          {props.planner.map((t) => (
            <ToolTile key={t.key} label={t.label} icon={t.icon} detail={t.detail} onPress={() => props.onPressPlanner(t.key)} />
          ))}
        </View>
      </View>

      <AppText variant="caption" color="muted" align="center" style={[styles.padded, styles.disclaimer]}>
        Sample listings for demonstration only. Prices and availability are not real.
      </AppText>
      {props.sheets}
    </Screen>
  );
}

function ListingRail({
  rail,
  kind,
  cardSizes,
  onOpenListing,
  renderFavourite,
}: { rail: RailView; kind: "venue" | "vendor" } & Pick<HomeViewProps, "cardSizes" | "onOpenListing" | "renderFavourite">) {
  const size = cardSizes[kind];
  if (rail.state === "loading") return <RailSkeleton cardWidth={size.width} imageHeight={size.imageHeight} />;
  if (rail.state === "error") {
    return (
      <AppText variant="meta" color="muted" style={styles.padded}>
        Couldn’t load this right now. <InlineLink label="Try again" color="brand" onPress={rail.onRetry} />
      </AppText>
    );
  }
  if (rail.state === "empty") {
    return (
      <AppText variant="meta" color="muted" style={styles.padded}>
        {rail.text}
      </AppText>
    );
  }
  return (
    <Rail>
      {rail.cards.map((card) =>
        kind === "venue" ? (
          <VenueCard key={card.slug} card={card} width={size.width} imageHeight={size.imageHeight} onPress={() => onOpenListing(card)} favourite={renderFavourite(card)} />
        ) : (
          <VendorCard key={card.slug} card={card} width={size.width} imageHeight={size.imageHeight} onPress={() => onOpenListing(card)} favourite={renderFavourite(card)} />
        ),
      )}
    </Rail>
  );
}

const styles = StyleSheet.create({
  padded: { paddingHorizontal: space.screen },
  // The banners sit closer to the edges than the text (home reference).
  inset: { paddingHorizontal: space.lg },
  // White behind it, so the page scrolls under it cleanly when it is pinned.
  searchRow: { paddingVertical: space.sm, backgroundColor: colors.white },
  categories: { marginTop: space.sm },
  banner: { marginTop: space.lg },
  section: { marginTop: space.xxl },
  tools: { flexDirection: "row", gap: space.sm },
  disclaimer: { marginTop: space.xxxl },
});
