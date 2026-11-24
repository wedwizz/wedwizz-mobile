import { useCallback, useState } from "react";
import { Linking, useWindowDimensions } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { MessageSquareText } from "lucide-react-native";
import { IconButton, space } from "@wedwizz/ui";
import { toApiError } from "@wedwizz/core/api/api-error";
import type { CatalogDetail, CatalogPackage } from "@wedwizz/core/api/types";
import { eventMonthLabel } from "@wedwizz/core/bookings/booking-view";
import { formatINR } from "@wedwizz/core/format";
import { PRICE_UNIT_LABEL } from "@wedwizz/core/packages/package-view";
import { AvailabilityCard } from "@/features/user/components/availability-card";
import { DetailContactBar, type ContactBusiness } from "@/features/user/components/contact";
import { FavouriteButton } from "@/features/user/components/favourite-button";
import { railCardSizes } from "@/features/user/lib/card-sizes";
import { ShareButton } from "@/features/user/components/share-button";
import { useCatalogList, useCatalogProfile, useProfileReviews, useRecordProfileView } from "@/features/user/hooks/use-catalog";
import { useEnquiries } from "@/features/user/hooks/use-enquiries";
import { useGoBack } from "@/features/user/hooks/use-go-back";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { paramString } from "@/features/user/lib/auth-gate";
import { categoryPluralLabel, toCategoryKey } from "@/features/user/lib/catalog-categories";
import { moreByOwnerTitle, shareProps, toCardView, toDetailView, type ListingDetailView } from "@/features/user/lib/catalog-view";
import { hasUnread } from "@/features/user/screens/home/home-logic";
import { heroPhotos, otherListings } from "./detail-logic";
import { DetailView, type DetailContent, type DetailRail, type DetailTab, type DetailViewProps } from "./detail-view";

/** Past this the photo has scrolled away: the status bar turns dark. */
const HERO_SCROLLED = 260;

const packageRows = (packages: CatalogPackage[]) =>
  packages.map((pkg) => ({ name: pkg.name, items: pkg.items, price: formatINR(pkg.price), unit: PRICE_UNIT_LABEL[pkg.priceUnit] }));

/** What both pages share (web: the two pages' common code and detail-chrome): loading, reviews, header icons, lightbox, tabs. */
function useDetailPage() {
  const router = useRouter();
  const goBack = useGoBack();
  const { width } = useWindowDimensions();
  const slug = paramString(useLocalSearchParams<{ slug?: string }>().slug);
  const query = useCatalogProfile(slug);
  const reviews = useProfileReviews(slug);
  const { status } = useUserSession();
  const signedIn = status === "authenticated";
  const enquiries = useEnquiries();
  const [tab, setTab] = useState<DetailTab>("gallery");
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);
  const [overPhoto, setOverPhoto] = useState(true);
  // Only while the page shows the listing: after a failed refetch the old data stays, but an error is shown.
  useRecordProfileView(slug, query.isSuccess);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(overPhoto && query.isSuccess ? "light" : "dark");
      return () => setStatusBarStyle("dark");
    }, [overPhoto, query.isSuccess]),
  );

  const reviewItems = (reviews.data?.pages ?? []).flatMap((page) => page.reviews);
  const reviewsContent: DetailContent["reviews"] = {
    state: reviews.isPending ? "loading" : !reviews.data ? "error" : "ready",
    items: reviewItems.map((r) => ({ id: r.reviewId, author: r.authorName, rating: r.rating, meta: `Event in ${eventMonthLabel(r.eventMonth)}`, text: r.text, reply: r.reply?.text ?? null })),
    hasMore: reviews.hasNextPage,
    loadingMore: reviews.isFetchingNextPage,
    onMore: () => void reviews.fetchNextPage(),
    onRetry: () => void reviews.refetch(),
  };

  const headerActions = (detail: CatalogDetail, view: ListingDetailView) => (
    <>
      <IconButton
        icon={MessageSquareText}
        label={signedIn ? "My enquiries" : "Messages, log in to see them"}
        variant="surface"
        dot={signedIn && hasUnread(enquiries.data)}
        onPress={() => (signedIn ? router.navigate("/user/enquiries" as Href) : router.push({ pathname: "/user/login", params: { from: "/user/enquiries" } }))}
      />
      <FavouriteButton id={view.slug} label={view.name} diameter={44} />
      <ShareButton {...shareProps({ slug: view.slug, name: view.name, category: detail.category, city: view.city })} />
    </>
  );

  const base = {
    onBack: goBack,
    tab,
    onChangeTab: setTab,
    lightbox,
    onOpenLightbox: (photos: string[], index: number) => setLightbox({ photos, index }),
    onCloseLightbox: () => setLightbox(null),
    onOpenListing: (card: { to: string }) => router.push(card.to as Href),
    renderFavourite: (card: { slug: string; name: string }) => <FavouriteButton id={card.slug} label={card.name} />,
    cardSizes: railCardSizes(width, space.screen),
    onScrollY: (y: number) => {
      const next = y < HERO_SCROLLED;
      if (next !== overPhoto) setOverPhoto(next);
    },
  };

  /** Loading, the web's not-found and error pages, or null once the listing is here. */
  const pending = (notFound: { title: string; body: string; actionLabel: string }): DetailViewProps["state"] | null => {
    if (query.isPending) return { kind: "loading" };
    if (query.isError) return toApiError(query.error).status === 404 ? { kind: "not-found", ...notFound } : { kind: "error", onRetry: () => void query.refetch() };
    return null;
  };

  return { router, query, reviewsContent, headerActions, base, pending };
}

const business = (detail: CatalogDetail, view: ListingDetailView): ContactBusiness => ({
  slug: view.slug,
  name: view.name,
  category: detail.category,
  contactChannels: detail.contactChannels,
});

/** Web venue-detail-page.tsx. */
export function VenueDetailScreen() {
  const page = useDetailPage();
  const { query, router } = page;
  const city = query.data?.city ?? undefined;
  const similar = useCatalogList({ category: "VENUE", ...(city ? { city } : {}), limit: 5 }, { enabled: !!query.data });

  const waiting = page.pending({ title: "Venue not found", body: "This venue may have been removed.", actionLabel: "Browse venues" });
  if (waiting || !query.data) {
    return <DetailView {...page.base} state={waiting ?? { kind: "loading" }} headerActions={null} availability={null} contactBar={null} />;
  }

  const venue = toDetailView(query.data);
  const others = otherListings(similar.data?.items, venue.slug, venue.moreFromOwner).map(toCardView);
  const rails: DetailRail[] = [
    // Being open about a group of venues under one owner builds trust.
    ...(venue.moreFromOwner.length > 0 ? [{ title: moreByOwnerTitle(venue.brand), kind: "venue" as const, cards: venue.moreFromOwner }] : []),
    ...(others.length > 0 ? [{ title: "Similar venues", kind: "venue" as const, cards: others, onViewAll: () => router.navigate("/user/venues" as Href) }] : []),
  ];
  const mapUrl = venue.mapUrl;
  const content: DetailContent = {
    name: venue.name,
    verified: venue.verified,
    subtitle: null,
    location: venue.area,
    onOpenMap: mapUrl ? () => void Linking.openURL(mapUrl) : null,
    rating: venue.rating,
    reviewCount: venue.reviewCount,
    heroPhotos: heroPhotos(venue.image, venue.photos),
    stats: venue.stats,
    photos: venue.photos,
    priceTitle: "Hall rent",
    price: { amount: venue.startingPrice, unit: venue.priceUnit },
    priceNotes: [
      ...(venue.platePrice !== null ? [`Vegetarian plate from ₹${venue.platePrice.toLocaleString("en-IN")}`] : []),
      ...(venue.capacity !== null ? [`Up to ${venue.capacity} guests`] : []),
      "Final quotes come from the venue.",
    ],
    packages: packageRows(query.data.packages),
    quoteNote: "Final quotes come from the business.",
    aboutTitle: "About this venue",
    description: venue.description,
    listTitle: "Facilities",
    listItems: venue.facilities,
    sections: venue.sections,
    reviews: page.reviewsContent,
    rails,
  };
  const contact = business(query.data, venue);
  return (
    <DetailView
      {...page.base}
      state={{ kind: "ready", content }}
      headerActions={page.headerActions(query.data, venue)}
      availability={<AvailabilityCard business={contact} />}
      contactBar={<DetailContactBar business={contact} />}
    />
  );
}

/** Web vendor-detail-page.tsx. */
export function VendorDetailScreen() {
  const page = useDetailPage();
  const { query, router } = page;
  const similar = useCatalogList({ category: query.data?.category, limit: 5 }, { enabled: !!query.data });

  const waiting = page.pending({ title: "Vendor not found", body: "This profile may have been removed.", actionLabel: "Go back" });
  if (waiting || !query.data) {
    return <DetailView {...page.base} state={waiting ?? { kind: "loading" }} headerActions={null} availability={null} contactBar={null} />;
  }

  const vendor = toDetailView(query.data);
  const category = query.data.category;
  const others = otherListings(similar.data?.items, vendor.slug).map(toCardView);
  const content: DetailContent = {
    name: vendor.name,
    verified: vendor.verified,
    subtitle: vendor.categoryLabel,
    // Service-based: where they are based; they travel to their service areas.
    location: vendor.city,
    onOpenMap: null,
    rating: vendor.rating,
    reviewCount: vendor.reviewCount,
    heroPhotos: heroPhotos(vendor.image, vendor.photos),
    stats: vendor.stats,
    photos: vendor.photos,
    priceTitle: "Starting price",
    price: { amount: vendor.startingPrice, unit: vendor.priceUnit, prefix: "From" },
    priceNotes: [],
    packages: packageRows(query.data.packages),
    quoteNote: "Final quotes come from the business.",
    aboutTitle: "About",
    description: vendor.description,
    listTitle: "Services",
    listItems: vendor.services,
    sections: vendor.sections,
    reviews: page.reviewsContent,
    rails:
      others.length > 0
        ? [
            {
              title: `More ${categoryPluralLabel(category).toLowerCase()}`,
              kind: "vendor",
              cards: others,
              onViewAll: () => router.navigate(`/user/vendors?category=${toCategoryKey(category)}` as Href),
            },
          ]
        : [],
  };
  const contact = business(query.data, vendor);
  return (
    <DetailView
      {...page.base}
      state={{ kind: "ready", content }}
      headerActions={page.headerActions(query.data, vendor)}
      availability={<AvailabilityCard business={contact} />}
      contactBar={<DetailContactBar business={contact} />}
    />
  );
}
