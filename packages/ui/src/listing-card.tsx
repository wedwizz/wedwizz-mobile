import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BadgeCheck, ChevronRight, MapPin } from "lucide-react-native";
import { Card } from "./card";
import { Price } from "./price";
import { Rating } from "./rating";
import { SafeImage } from "./safe-image";
import { AppText } from "./text";
import { colors, space } from "./tokens";

export interface ListingCardProps {
  name: string;
  /** First photo, or null for the placeholder. */
  image: string | null;
  /** Read for the photo, e.g. "<name> wedding venue" (web alt). */
  imageAlt: string;
  /** Under the name: the vendor's category ("Photographers"). Venues have none. */
  subtitle?: string;
  /** Area, city or distance ("Kochi, Kerala", "3.2 km away"). */
  location: string;
  rating: number | null;
  reviewCount?: number;
  /** Null: "Price on request". */
  price: number | null;
  priceUnit?: string;
  pricePrefix?: string;
  /** Small text after the price, e.g. "Up to 500 guests". */
  note?: string;
  verified?: boolean;
  onPress: () => void;
  /** "View details" or "View profile" for screen readers (web aria-label). */
  actionLabel: string;
  /** The heart, wired by the app (favourites + login gate). */
  favourite?: ReactNode;
  /** Fixed width for horizontal rows (rails); grids leave it out. */
  width?: number;
  imageHeight?: number;
  style?: StyleProp<ViewStyle>;
}

/** Venue and vendor card from the home design: photo, heart, name, location · rating, brand price and an arrow. Content as the web's VenueCard / VendorCard. */
export function ListingCard({
  name,
  image,
  imageAlt,
  subtitle,
  location,
  rating,
  reviewCount,
  price,
  priceUnit,
  pricePrefix,
  note,
  verified = false,
  onPress,
  actionLabel,
  favourite,
  width,
  imageHeight = 140,
  style,
}: ListingCardProps) {
  return (
    <View style={[width !== undefined && { width }, style]}>
      <Card padding={0} onPress={onPress} accessibilityLabel={`${name}, ${actionLabel}`}>
        <SafeImage source={image} alt={imageAlt} style={{ height: imageHeight, width: "100%" }} />
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <AppText variant="cardTitle" numberOfLines={1} style={styles.shrink}>
              {name}
            </AppText>
            {verified && <BadgeCheck size={16} color={colors.white} fill={colors.brand} accessibilityLabel="Verified" />}
          </View>
          {subtitle && (
            <AppText variant="meta" color="muted" numberOfLines={1}>
              {subtitle}
            </AppText>
          )}
          <View style={styles.metaRow}>
            <MapPin size={14} color={colors.muted} />
            <AppText variant="meta" color="muted" numberOfLines={1} style={styles.shrink}>
              {location}
            </AppText>
            <AppText variant="meta" color="muted">
              ·
            </AppText>
            <Rating rating={rating} reviews={reviewCount} />
          </View>
          <View style={styles.priceRow}>
            <View style={styles.shrink}>
              <Price amount={price} unit={priceUnit} prefix={pricePrefix} />
              {note && (
                <AppText variant="meta" color="muted">
                  {note}
                </AppText>
              )}
            </View>
            <ChevronRight size={20} color={colors.brand} />
          </View>
        </View>
      </Card>
      {favourite && <View style={styles.favourite}>{favourite}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: space.md, gap: space.xs },
  nameRow: { flexDirection: "row", alignItems: "center", gap: space.xs + 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: space.xs },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.sm, marginTop: space.xs },
  shrink: { flexShrink: 1 },
  // Outside the card's button so tapping the heart doesn't open the listing.
  favourite: { position: "absolute", top: space.sm + 2, right: space.sm + 2 },
});
