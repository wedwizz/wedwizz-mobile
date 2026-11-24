import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "./card";
import { Price } from "./price";
import { SafeImage } from "./safe-image";
import { AppText } from "./text";
import { colors, radius, space } from "./tokens";

interface ProductCardProps {
  name: string;
  image: string | null;
  /** "Invitations & Gifts". */
  category: string;
  price: number;
  originalPrice?: number;
  /** "20% off · sample" on the photo. */
  badge?: string;
  onPress: () => void;
  favourite?: ReactNode;
}

/** A market item (web MarketCard): square photo, category, name, price with the earlier price crossed out. */
export function ProductCard({ name, image, category, price, originalPrice, badge, onPress, favourite }: ProductCardProps) {
  return (
    <View>
      <Card padding={0} onPress={onPress} accessibilityLabel={`${name}, view details`}>
        <View>
          <SafeImage source={image} alt={name} style={styles.photo} />
          {badge && (
            <View style={styles.badge}>
              <AppText variant="caption" color="white">
                {badge}
              </AppText>
            </View>
          )}
        </View>
        <View style={styles.body}>
          <AppText variant="caption" color="muted" numberOfLines={1}>
            {category.toUpperCase()}
          </AppText>
          <AppText variant="cardTitle" numberOfLines={2}>
            {name}
          </AppText>
          <Price amount={price} originalAmount={originalPrice} />
        </View>
      </Card>
      {favourite && <View style={styles.favourite}>{favourite}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { width: "100%", aspectRatio: 1 },
  badge: { position: "absolute", left: space.sm + 2, bottom: space.sm + 2, backgroundColor: colors.brand, borderRadius: radius.full, paddingHorizontal: space.sm + 2, paddingVertical: space.xxs + 1 },
  body: { padding: space.md, gap: space.xs },
  favourite: { position: "absolute", top: space.sm + 2, right: space.sm + 2 },
});
