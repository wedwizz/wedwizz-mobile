import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ArrowLeft, BadgeCheck, ChevronRight, MapPin } from "lucide-react-native";
import {
  AppText,
  Button,
  Card,
  CheckList,
  DetailHero,
  EmptyState,
  ErrorState,
  IconButton,
  InfoRows,
  Lightbox,
  LoadingState,
  PackageList,
  PhotoGrid,
  Price,
  Rail,
  Rating,
  ReviewCard,
  Screen,
  SectionHeader,
  SegmentedTabs,
  StatsStrip,
  colors,
  radius,
  space,
  type PackageRowItem,
} from "@wedwizz/ui";
import { VendorCard, VenueCard } from "@/features/user/components/listing-cards";
import type { ListingCardView } from "@/features/user/lib/catalog-view";
import type { CardSize } from "@/features/user/lib/card-sizes";

export type DetailTab = "gallery" | "packages" | "about" | "reviews";

const TABS: { value: DetailTab; label: string }[] = [
  { value: "gallery", label: "Gallery" },
  { value: "packages", label: "Packages" },
  { value: "about", label: "About" },
  { value: "reviews", label: "Reviews" },
];

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  meta: string;
  text: string;
  reply: string | null;
}

export interface DetailRail {
  title: string;
  onViewAll?: () => void;
  kind: "venue" | "vendor";
  cards: ListingCardView[];
}

export interface DetailContent {
  name: string;
  verified: boolean;
  /** The vendor's category ("Photographer"); venues have none. */
  subtitle: string | null;
  /** Venue area or vendor city. */
  location: string;
  onOpenMap: (() => void) | null;
  rating: number | null;
  reviewCount: number;
  heroPhotos: string[];
  stats: { label: string; value: string }[];
  // Gallery
  photos: string[];
  // Packages
  priceTitle: string;
  price: { amount: number | null; unit: string; prefix?: string };
  priceNotes: string[];
  packages: PackageRowItem[];
  quoteNote: string;
  // About
  aboutTitle: string;
  description: string | null;
  listTitle: string;
  listItems: string[];
  sections: { title: string; rows: { label: string; value: string }[] }[];
  // Reviews
  reviews: { state: "loading" | "error" | "ready"; items: ReviewItem[]; hasMore: boolean; loadingMore: boolean; onMore: () => void; onRetry: () => void };
  rails: DetailRail[];
}

export interface DetailViewProps {
  state: { kind: "loading" } | { kind: "error"; onRetry: () => void } | { kind: "not-found"; title: string; body: string; actionLabel: string } | { kind: "ready"; content: DetailContent };
  onBack: () => void;
  /** Chat, heart and share over the photo (wired by the app). */
  headerActions: ReactNode;
  tab: DetailTab;
  onChangeTab: (tab: DetailTab) => void;
  /** The photo open full screen, from the hero (heroPhotos) or the gallery (photos). */
  lightbox: { photos: string[]; index: number } | null;
  onOpenLightbox: (photos: string[], index: number) => void;
  onCloseLightbox: () => void;
  availability: ReactNode;
  /** The Message / WhatsApp / Call bar. */
  contactBar: ReactNode;
  onOpenListing: (card: ListingCardView) => void;
  renderFavourite: (card: ListingCardView) => ReactNode;
  /** Rail card sizes, as on Home (lib/card-sizes.ts). */
  cardSizes: { venue: CardSize; vendor: CardSize };
  onScrollY: (y: number) => void;
}

/** Web venue / vendor detail pages in the vendor-detail designs' look: photos, name block, stats, tabs, availability, contact bar. */
export function DetailView(props: DetailViewProps) {
  const { state } = props;
  if (state.kind !== "ready") {
    return (
      <Screen>
        <View style={styles.backRow}>
          <IconButton icon={ArrowLeft} label="Go back" onPress={props.onBack} />
        </View>
        {state.kind === "loading" && <LoadingState cards={2} />}
        {state.kind === "error" && <ErrorState onRetry={state.onRetry} />}
        {state.kind === "not-found" && <EmptyState title={state.title} body={state.body} actionLabel={state.actionLabel} onAction={props.onBack} />}
      </Screen>
    );
  }

  const c = state.content;
  return (
    <Screen padded={false} edges={[]} footer={props.contactBar} onScrollY={props.onScrollY}>
      <DetailHero
        photos={c.heroPhotos}
        alt={c.name}
        onOpenPhoto={(i) => props.onOpenLightbox(c.heroPhotos, i)}
        left={<IconButton icon={ArrowLeft} label="Go back" variant="surface" onPress={props.onBack} />}
        right={props.headerActions}
      />

      <View style={styles.sheet}>
        <View style={styles.nameBlock}>
          <View style={styles.nameRow}>
            <AppText variant="title" accessibilityRole="header" style={styles.shrink}>
              {c.name}
            </AppText>
            {c.verified && <BadgeCheck size={24} color={colors.white} fill={colors.brand} accessibilityLabel="Verified" />}
          </View>
          {c.subtitle && (
            <AppText variant="body" color="muted">
              {c.subtitle}
            </AppText>
          )}
          <View style={styles.metaRow}>
            <Pressable
              onPress={c.onOpenMap ?? undefined}
              disabled={!c.onOpenMap}
              accessibilityRole={c.onOpenMap ? "link" : undefined}
              accessibilityLabel={c.onOpenMap ? `${c.location}, open in maps` : c.location}
              style={styles.location}
            >
              <MapPin size={16} color={colors.ink} />
              <AppText variant="body" numberOfLines={1} style={styles.shrink}>
                {c.location}
              </AppText>
              {c.onOpenMap && <ChevronRight size={16} color={colors.muted} />}
            </Pressable>
            <View style={styles.metaDivider} />
            <Rating rating={c.rating} reviews={c.reviewCount} reviewsLabel="reviews" />
          </View>
        </View>

        <StatsStrip items={c.stats} />
        <SegmentedTabs options={TABS} value={props.tab} onChange={props.onChangeTab} />

        <View style={styles.tabBody}>
          {props.tab === "gallery" && <GalleryTab c={c} onOpen={(i) => props.onOpenLightbox(c.photos, i)} />}
          {props.tab === "packages" && <PackagesTab c={c} />}
          {props.tab === "about" && <AboutTab c={c} />}
          {props.tab === "reviews" && <ReviewsTab c={c} />}
        </View>

        {props.availability}
      </View>

      {c.rails.map((rail) => (
        <View key={rail.title} style={styles.rail}>
          <View style={styles.padded}>
            <SectionHeader title={rail.title} onAction={rail.onViewAll} />
          </View>
          <Rail>
            {rail.cards.map((card) =>
              rail.kind === "venue" ? (
                <VenueCard key={card.slug} card={card} width={props.cardSizes.venue.width} imageHeight={props.cardSizes.venue.imageHeight} onPress={() => props.onOpenListing(card)} favourite={props.renderFavourite(card)} />
              ) : (
                <VendorCard key={card.slug} card={card} width={props.cardSizes.vendor.width} imageHeight={props.cardSizes.vendor.imageHeight} onPress={() => props.onOpenListing(card)} favourite={props.renderFavourite(card)} />
              ),
            )}
          </Rail>
        </View>
      ))}

      <Lightbox photos={props.lightbox?.photos ?? []} alt={c.name} index={props.lightbox?.index ?? null} onClose={props.onCloseLightbox} />
    </Screen>
  );
}

function GalleryTab({ c, onOpen }: { c: DetailContent; onOpen: (index: number) => void }) {
  if (c.photos.length === 0) {
    return (
      <View style={styles.soon}>
        <AppText variant="meta" color="muted">
          Photos coming soon
        </AppText>
      </View>
    );
  }
  return <PhotoGrid photos={c.photos} alt={c.name} onOpen={onOpen} />;
}

function PackagesTab({ c }: { c: DetailContent }) {
  return (
    <View style={styles.gap}>
      <Card tone="tint">
        <AppText variant="meta" color="muted">
          {c.priceTitle}
        </AppText>
        <Price amount={c.price.amount} unit={c.price.unit} prefix={c.price.prefix} />
        {c.priceNotes.map((note) => (
          <AppText key={note} variant="meta" color="muted">
            {note}
          </AppText>
        ))}
      </Card>
      {c.packages.length > 0 && (
        <Card>
          <SectionHeader title="Packages" />
          <PackageList packages={c.packages} />
        </Card>
      )}
      <AppText variant="caption" color="muted">
        {c.quoteNote}
      </AppText>
    </View>
  );
}

function AboutTab({ c }: { c: DetailContent }) {
  const empty = !c.description && c.listItems.length === 0 && c.sections.length === 0;
  return (
    <View style={styles.sections}>
      {empty && (
        <AppText variant="meta" color="muted">
          No details added yet.
        </AppText>
      )}
      {c.description && (
        <View style={styles.gapSm}>
          <SectionHeader title={c.aboutTitle} />
          <AppText variant="body">{c.description}</AppText>
        </View>
      )}
      {c.listItems.length > 0 && (
        <View>
          <SectionHeader title={c.listTitle} />
          <CheckList items={c.listItems} />
        </View>
      )}
      {c.sections.map((section) => (
        <View key={section.title}>
          <SectionHeader title={section.title} />
          <InfoRows rows={section.rows} />
        </View>
      ))}
    </View>
  );
}

function ReviewsTab({ c }: { c: DetailContent }) {
  const r = c.reviews;
  return (
    <View style={styles.gap}>
      <View style={styles.gapSm}>
        <Rating rating={c.rating} reviews={c.reviewCount} />
        <AppText variant="caption" color="muted">
          From customers with a booking confirmed by both sides.
        </AppText>
      </View>
      {r.state === "loading" && (
        <AppText variant="meta" color="muted">
          Loading reviews...
        </AppText>
      )}
      {r.state === "error" && <Button label="Couldn't load reviews. Try again" variant="link" onPress={r.onRetry} />}
      {r.state === "ready" && r.items.length === 0 && (
        <AppText variant="meta" color="muted">
          No reviews yet.
        </AppText>
      )}
      {r.items.map((review) => (
        <ReviewCard key={review.id} author={review.author} rating={review.rating} meta={review.meta} text={review.text} reply={review.reply} />
      ))}
      {r.hasMore && <Button label={r.loadingMore ? "Loading..." : "Show more reviews"} variant="link" disabled={r.loadingMore} onPress={r.onMore} />}
    </View>
  );
}

const styles = StyleSheet.create({
  backRow: { paddingVertical: space.sm, marginLeft: -space.sm },
  padded: { paddingHorizontal: space.screen },
  // The white page slides over the bottom of the photo (design).
  sheet: {
    marginTop: -space.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.white,
    paddingHorizontal: space.screen,
    paddingTop: space.xl,
    gap: space.lg,
  },
  nameBlock: { gap: space.xs },
  nameRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  shrink: { flexShrink: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: space.md, marginTop: space.xs },
  location: { flexDirection: "row", alignItems: "center", gap: space.xs, flexShrink: 1, minHeight: 32 },
  metaDivider: { width: 1, height: 18, backgroundColor: colors.lineStrong },
  tabBody: { minHeight: 120 },
  soon: { height: 160, borderRadius: radius.lg, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  gap: { gap: space.lg },
  gapSm: { gap: space.xs },
  sections: { gap: space.xl },
  rail: { marginTop: space.xxl },
});
