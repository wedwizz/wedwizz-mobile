import type { ReactNode } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import {
  AppText,
  CheckList,
  ContactBar,
  DetailHero,
  EmptyState,
  IconButton,
  Lightbox,
  Pill,
  Price,
  Screen,
  SectionHeader,
  colors,
  radius,
  space,
} from "@wedwizz/ui";

export interface MarketItemContent {
  name: string;
  photos: string[];
  category: string;
  price: number;
  originalPrice?: number;
  /** "20% off · sample", or null. */
  discount: string | null;
  description: string;
  includes: string[];
  related: { key: string; node: ReactNode }[];
  onViewAllRelated: () => void;
}

export interface MarketItemViewProps {
  onBack: () => void;
  /** Null when no item has this id. */
  content: MarketItemContent | null;
  heart: ReactNode;
  lightboxIndex: number | null;
  onOpenPhoto: (index: number) => void;
  onCloseLightbox: () => void;
  onScrollY: (y: number) => void;
}

/** Web market-detail-page.tsx, on the detail pages' layout: photos, category, name, price, description, what's included, "You may also like". */
export function MarketItemView(p: MarketItemViewProps) {
  const { width } = useWindowDimensions();
  if (!p.content) {
    return (
      <Screen>
        <View style={styles.backRow}>
          <IconButton icon={ArrowLeft} label="Go back" onPress={p.onBack} />
        </View>
        <EmptyState title="Item not found" body="This listing may have been removed." actionLabel="Go back" onAction={p.onBack} />
      </Screen>
    );
  }
  const c = p.content;
  const gridCard = (width - space.screen * 2 - space.md) / 2;

  return (
    <Screen
      padded={false}
      edges={[]}
      onScrollY={p.onScrollY}
      // Market items have no business behind them yet, so they cannot be messaged.
      footer={<ContactBar onMessage={() => undefined} messageDisabled note={{ text: "Enquiries for market items are coming soon", tone: "muted" }} />}
    >
      <DetailHero
        photos={c.photos}
        alt={c.name}
        onOpenPhoto={p.onOpenPhoto}
        left={<IconButton icon={ArrowLeft} label="Go back" variant="surface" onPress={p.onBack} />}
        right={p.heart}
      />
      <View style={styles.sheet}>
        <View style={styles.nameBlock}>
          <AppText variant="caption" color="muted">
            {c.category.toUpperCase()}
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            {c.name}
          </AppText>
          <View style={styles.priceRow}>
            <Price amount={c.price} originalAmount={c.originalPrice} />
            {c.discount && <Pill label={c.discount} tone="action" />}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Description" />
          <AppText variant="body">{c.description}</AppText>
        </View>
        <View style={styles.section}>
          <SectionHeader title="What's included" />
          <CheckList items={c.includes} />
        </View>

        {c.related.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="You may also like" onAction={c.onViewAllRelated} />
            <View style={styles.grid}>
              {c.related.map((card) => (
                <View key={card.key} style={{ width: gridCard }}>
                  {card.node}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
      <Lightbox photos={c.photos} alt={c.name} index={p.lightboxIndex} onClose={p.onCloseLightbox} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: { paddingVertical: space.sm, marginLeft: -space.sm },
  // The white page slides over the bottom of the photo (detail design).
  sheet: {
    marginTop: -space.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.white,
    paddingHorizontal: space.screen,
    paddingTop: space.xl,
    paddingBottom: space.xl,
    gap: space.xxl,
  },
  nameBlock: { gap: space.xs },
  priceRow: { flexDirection: "row", alignItems: "center", gap: space.md, marginTop: space.xs },
  section: { gap: space.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
});
