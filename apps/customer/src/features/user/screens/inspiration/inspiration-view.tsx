import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { ArrowLeft, Lightbulb } from "lucide-react-native";
import { AppText, ChipGroup, EmptyState, IconButton, PhotoMasonry, SafeImage, Screen, Sheet, radius, space, type MasonryItem } from "@wedwizz/ui";

export interface InspirationViewProps {
  onBack: () => void;
  filters: { value: string; label: string }[];
  filter: string;
  onFilter: (filter: string) => void;
  items: MasonryItem[];
  onBrowseAll: () => void;
  /** The idea opened large (web dialog), or null. */
  open: { title: string; category: string; image: string; aspect: number; heart: ReactNode } | null;
  onClose: () => void;
}

/** Web inspiration-page.tsx: category chips with Saved, the photo board, one idea opened large. */
export function InspirationView(p: InspirationViewProps) {
  return (
    <Screen>
      <View style={styles.back}>
        <IconButton icon={ArrowLeft} label="Go back" onPress={p.onBack} />
      </View>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          Inspiration Board
        </AppText>
        <AppText variant="meta" color="muted">
          Browse ideas and save the ones you love.
        </AppText>
      </View>
      <ChipGroup accessibilityLabel="Inspiration category" options={p.filters} value={p.filter} onChange={p.onFilter} />
      <View style={styles.board}>
        {p.items.length === 0 ? (
          <EmptyState icon={Lightbulb} title="No saved ideas yet" body="Tap the heart on any photo to save it to your board." actionLabel="Browse all ideas" onAction={p.onBrowseAll} />
        ) : (
          <PhotoMasonry items={p.items} />
        )}
      </View>

      <Sheet visible={p.open !== null} title={p.open?.title ?? "Inspiration"} onClose={p.onClose} scroll>
        {p.open && (
          <View style={styles.open}>
            <SafeImage source={p.open.image} alt={p.open.title} style={[styles.photo, { aspectRatio: p.open.aspect }]} />
            <View style={styles.openRow}>
              <AppText variant="body" color="muted" style={styles.flex}>
                {p.open.category}
              </AppText>
              {p.open.heart}
            </View>
          </View>
        )}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { paddingTop: space.sm, marginLeft: -space.sm },
  header: { gap: space.xs, marginBottom: space.lg },
  board: { marginTop: space.xl },
  open: { gap: space.md, paddingBottom: space.sm },
  photo: { width: "100%", borderRadius: radius.lg },
  openRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  flex: { flex: 1 },
});
