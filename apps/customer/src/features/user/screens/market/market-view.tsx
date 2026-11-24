import type { ReactNode } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { ArrowLeft, ShoppingBag } from "lucide-react-native";
import { AppText, ChipGroup, EmptyState, IconButton, Notice, Rail, Screen, SearchField, SectionHeader, space } from "@wedwizz/ui";

export interface MarketCardNode {
  key: string;
  node: ReactNode;
}

export interface MarketViewProps {
  onBack: () => void;
  search: string;
  onChangeSearch: (text: string) => void;
  chips: { value: string; label: string }[];
  category: string;
  onChangeCategory: (category: string) => void;
  body:
    | { kind: "browse"; rails: { title: string; onViewAll: () => void; cards: MarketCardNode[] }[]; recent: MarketCardNode[] }
    | { kind: "results"; cards: MarketCardNode[] }
    | { kind: "empty"; onShowEverything: () => void };
}

/** Web market-page.tsx: search, category chips, then the rails and Recently viewed, or the matching items two per row. */
export function MarketView(p: MarketViewProps) {
  const { width } = useWindowDimensions();
  // Web rail: 62% of the screen per card, so the next one peeks in.
  const railCard = Math.round(width * 0.62);
  const gridCard = (width - space.screen * 2 - space.md) / 2;

  return (
    <Screen>
      <View style={styles.back}>
        <IconButton icon={ArrowLeft} label="Go back" onPress={p.onBack} />
      </View>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          Wedding Market
        </AppText>
        <AppText variant="meta" color="muted">
          Packages, essentials and gifting for your big day.
        </AppText>
      </View>
      <View style={styles.controls}>
        <SearchField value={p.search} onChangeText={p.onChangeSearch} placeholder="Search packages and products" accessibilityLabel="Search the market" />
        <ChipGroup accessibilityLabel="Market category" options={p.chips} value={p.category} onChange={p.onChangeCategory} />
      </View>

      {p.body.kind === "browse" && (
        <View style={styles.sections}>
          {p.body.rails.map((rail) => (
            <View key={rail.title} style={styles.section}>
              <SectionHeader title={rail.title} onAction={rail.onViewAll} />
              <Rail accessibilityLabel={rail.title}>
                {rail.cards.map((card) => (
                  <View key={card.key} style={{ width: railCard }}>
                    {card.node}
                  </View>
                ))}
              </Rail>
            </View>
          ))}
          <View style={styles.section}>
            <SectionHeader title="Recently viewed" />
            {p.body.recent.length === 0 ? (
              <Notice>
                <AppText variant="meta" color="muted">
                  Items you open will appear here for this session.
                </AppText>
              </Notice>
            ) : (
              <Rail accessibilityLabel="Recently viewed">
                {p.body.recent.map((card) => (
                  <View key={card.key} style={{ width: railCard }}>
                    {card.node}
                  </View>
                ))}
              </Rail>
            )}
          </View>
        </View>
      )}
      {p.body.kind === "results" && (
        <View style={styles.grid}>
          {p.body.cards.map((card) => (
            <View key={card.key} style={{ width: gridCard }}>
              {card.node}
            </View>
          ))}
        </View>
      )}
      {p.body.kind === "empty" && (
        <EmptyState icon={ShoppingBag} title="Nothing found" body="Try a different search or category." actionLabel="Show everything" onAction={p.body.onShowEverything} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { paddingTop: space.sm, marginLeft: -space.sm },
  header: { gap: space.xs, marginBottom: space.lg },
  controls: { gap: space.md },
  sections: { gap: space.xxxl, marginTop: space.xxl },
  section: { gap: space.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md, marginTop: space.xl },
});
