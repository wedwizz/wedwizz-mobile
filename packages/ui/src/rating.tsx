import { StyleSheet, View } from "react-native";
import { Star } from "lucide-react-native";
import { AppText } from "./text";
import { colors, radius, shadow, space } from "./tokens";

interface RatingProps {
  /** Null while a listing has no reviews yet: shows "New" (web RatingDisplay). */
  rating: number | null;
  reviews?: number;
  /** "pill" is a white badge for photos; "inline" is plain text. */
  variant?: "inline" | "pill";
  /** Text after the count, e.g. "reviews" on the detail page: "(342 reviews)". */
  reviewsLabel?: string;
}

export function Rating({ rating, reviews, variant = "inline", reviewsLabel }: RatingProps) {
  const spoken =
    rating === null ? "New, no reviews yet" : `Rated ${rating.toFixed(1)} out of 5${reviews !== undefined ? `, ${reviews} reviews` : ""}`;
  return (
    <View style={[styles.row, variant === "pill" && styles.pill]} accessible accessibilityLabel={spoken}>
      <Star size={14} color={colors.star} fill={colors.star} />
      <AppText variant="label">{rating === null ? "New" : rating.toFixed(1)}</AppText>
      {rating !== null && reviews !== undefined && (
        <AppText variant="meta" color="muted">
          ({reviews}
          {reviewsLabel ? ` ${reviewsLabel}` : ""})
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.xs },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs,
    boxShadow: shadow.card,
  },
});
