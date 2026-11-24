import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Check, Pencil, Star, Trash2 } from "lucide-react-native";
import { Card } from "./card";
import { IconButton } from "./icon-button";
import { SafeImage } from "./safe-image";
import { AppText } from "./text";
import { colors, radius, space, type ColorToken } from "./tokens";

interface TaskRowProps {
  title: string;
  category: string;
  /** "Due 12 Mar 2027", or null. */
  due: string | null;
  done: boolean;
  /** False while a new task is still being saved: it cannot be changed yet. */
  editable: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** One checklist task (web WeddingChecklistItem): round tick, title (struck through when done), category and due date, edit and delete. */
export function TaskRow({ title, category, due, done, editable, onToggle, onEdit, onDelete }: TaskRowProps) {
  return (
    <View style={styles.task}>
      <Pressable
        onPress={onToggle}
        disabled={!editable}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done, disabled: !editable }}
        accessibilityLabel={`Mark "${title}" as ${done ? "not done" : "done"}`}
        hitSlop={8}
        style={[styles.tick, done ? styles.tickDone : styles.tickOpen]}
      >
        {done && <Check size={15} strokeWidth={3} color={colors.white} />}
      </Pressable>
      <View style={styles.taskText}>
        <AppText variant="body" color={done ? "muted" : "ink"} style={done && styles.struck}>
          {title}
        </AppText>
        <View style={styles.taskMeta}>
          <View style={styles.category}>
            <AppText variant="caption" color="muted">
              {category}
            </AppText>
          </View>
          {due && (
            <AppText variant="caption" color="muted">
              {due}
            </AppText>
          )}
        </View>
      </View>
      <IconButton icon={Pencil} label={`Edit "${title}"`} onPress={onEdit} disabled={!editable} diameter={40} color={colors.muted} />
      <IconButton icon={Trash2} label={`Delete "${title}"`} onPress={onDelete} disabled={!editable} diameter={40} color={colors.muted} />
    </View>
  );
}

export interface CountItem {
  value: string;
  label: string;
  color?: ColorToken;
  /** Makes the count a button (profile: opens Saved, Enquiries, Bookings). */
  onPress?: () => void;
}

/**
 * Big numbers with a label under each, side by side (web checklist progress and the profile's counts).
 * `separate`: each in its own card; otherwise plain, to sit inside a card.
 */
export function CountRow({ items, separate = false }: { items: CountItem[]; separate?: boolean }) {
  return (
    <View style={[styles.counts, separate && styles.countsSeparate]}>
      {items.map((item) => {
        const body = (
          <>
            <AppText variant="title" color={item.color ?? "ink"} align="center">
              {item.value}
            </AppText>
            <AppText variant="caption" color="muted" align="center">
              {item.label}
            </AppText>
          </>
        );
        if (!separate) {
          return (
            <View key={item.label} style={styles.count} accessible accessibilityLabel={`${item.label}: ${item.value}`}>
              {body}
            </View>
          );
        }
        return (
          <Card key={item.label} padding={space.md} onPress={item.onPress} accessibilityLabel={`${item.label}: ${item.value}`} style={styles.count}>
            {body}
          </Card>
        );
      })}
    </View>
  );
}

/** Choosing 1 to 5 stars (web ReviewSheet's rating). */
export function StarPicker({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <View style={styles.stars} accessibilityRole="radiogroup" accessibilityLabel="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange(n)}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === n }}
          accessibilityLabel={`${n} star${n === 1 ? "" : "s"}`}
          style={({ pressed }) => [styles.star, pressed && styles.pressed]}
        >
          <Star size={30} color={n <= value ? colors.star : colors.lineStrong} fill={n <= value ? colors.star : "none"} />
        </Pressable>
      ))}
    </View>
  );
}

export interface MasonryItem {
  key: string;
  image: string;
  alt: string;
  /** Width over height: 3/4 tall, 1 square, 4/3 wide. */
  aspect: number;
  onPress: () => void;
  /** Over the photo's top right corner (the heart). */
  corner?: ReactNode;
}

/** Photos of different heights in two columns (web inspiration board's CSS columns). */
export function PhotoMasonry({ items }: { items: MasonryItem[] }) {
  // Each photo goes to the shorter column, as CSS columns would balance them.
  const columns: MasonryItem[][] = [[], []];
  const heights = [0, 0];
  for (const item of items) {
    const col = heights[0] <= heights[1] ? 0 : 1;
    columns[col].push(item);
    heights[col] += 1 / item.aspect;
  }
  return (
    <View style={styles.masonry}>
      {columns.map((column, c) => (
        <View key={c} style={styles.masonryColumn}>
          {column.map((item) => (
            <View key={item.key} style={styles.masonryCell}>
              <Pressable onPress={item.onPress} accessibilityRole="imagebutton" accessibilityLabel={`Open ${item.alt}`}>
                <SafeImage source={item.image} alt="" style={{ width: "100%", aspectRatio: item.aspect }} />
              </Pressable>
              {item.corner && <View style={styles.corner}>{item.corner}</View>}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** The six invitation looks (web INVITATION_TEMPLATES' Tailwind colours), by template id. */
export interface InvitationTheme {
  card: string;
  border: string;
  names: string;
  text: string;
  divider: string;
}

export const INVITATION_THEMES: Record<string, InvitationTheme> = {
  "blush-floral": { card: "#fff1f2", border: "#fecdd3", names: "#be123c", text: "rgba(136,19,55,0.75)", divider: "#fda4af" },
  "royal-gold": { card: "#fffbeb", border: "#fcd34d", names: "#92400e", text: "rgba(120,53,15,0.75)", divider: "#fbbf24" },
  "emerald-garden": { card: "#ecfdf5", border: "#a7f3d0", names: "#065f46", text: "rgba(6,78,59,0.75)", divider: "#6ee7b7" },
  "midnight-bloom": { card: "#0f172a", border: "#334155", names: "#fde68a", text: "#cbd5e1", divider: "#fcd34d" },
  "classic-ivory": { card: "#fafaf9", border: "#d6d3d1", names: "#292524", text: "#57534e", divider: "#a8a29e" },
  "lavender-mist": { card: "#f5f3ff", border: "#ddd6fe", names: "#5b21b6", text: "rgba(76,29,149,0.75)", divider: "#c4b5fd" },
};

const themeOf = (id: string): InvitationTheme => INVITATION_THEMES[id] ?? INVITATION_THEMES["classic-ivory"];

interface InvitationCardProps {
  themeId: string;
  partnerOne: string;
  partnerTwo: string;
  /** "Saturday, 14 February 2027" or "Date to be announced". */
  date: string;
  venue: string;
  message: string;
}

/** The invitation itself (web InvitationPreview), 3:4. Empty fields show the web's stand-in words. */
export function InvitationCard({ themeId, partnerOne, partnerTwo, date, venue, message }: InvitationCardProps) {
  const t = themeOf(themeId);
  return (
    <View style={[styles.invite, { backgroundColor: t.card, borderColor: t.border }]}>
      <AppText variant="caption" align="center" style={[styles.spaced, { color: t.text }]}>
        TOGETHER WITH THEIR FAMILIES
      </AppText>
      <AppText variant="title" align="center" style={[styles.names, { color: t.names }]}>
        {partnerOne || "Partner one"}
        {"\n"}
        <AppText variant="subheading" style={{ color: t.names }}>
          &amp;
        </AppText>
        {"\n"}
        {partnerTwo || "Partner two"}
      </AppText>
      <View style={[styles.inviteDivider, { backgroundColor: t.divider }]} />
      <AppText variant="meta" align="center" style={[styles.italic, { color: t.text }]}>
        {message || "Join us as we begin our new journey."}
      </AppText>
      <AppText variant="label" align="center" style={[styles.inviteDate, { color: t.names }]}>
        {date}
      </AppText>
      <AppText variant="meta" align="center" style={{ color: t.text }}>
        {venue || "Venue to be announced"}
      </AppText>
    </View>
  );
}

/** A small template to choose (web InvitationTemplateCard): "A & R", a line, "Save the date", the name under it. */
export function InvitationTemplateTile({ themeId, name, selected, onPress }: { themeId: string; name: string; selected: boolean; onPress: () => void }) {
  const t = themeOf(themeId);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${name} template`}
      style={[styles.tile, selected ? styles.tileSelected : styles.tileIdle]}
    >
      <View style={[styles.tileCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <AppText variant="subheading" style={{ color: t.names }}>
          A &amp; R
        </AppText>
        <View style={[styles.tileDivider, { backgroundColor: t.divider }]} />
        <AppText variant="caption" style={{ color: t.text, fontSize: 10 }}>
          Save the date
        </AppText>
      </View>
      <AppText variant="label" numberOfLines={1} style={styles.tileName}>
        {name}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  task: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: space.sm + 2 },
  tick: { width: 28, height: 28, borderRadius: radius.full, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  tickDone: { backgroundColor: colors.brand, borderColor: colors.brand },
  tickOpen: { backgroundColor: colors.white, borderColor: colors.lineStrong },
  taskText: { flex: 1, minWidth: 0, gap: space.xs, marginLeft: space.xs },
  struck: { textDecorationLine: "line-through" },
  taskMeta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: space.sm },
  category: { backgroundColor: colors.warm, borderRadius: radius.full, paddingHorizontal: space.sm, paddingVertical: space.xxs },
  counts: { flexDirection: "row" },
  countsSeparate: { gap: space.md },
  count: { flex: 1 },
  stars: { flexDirection: "row", gap: space.xs },
  star: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.full },
  pressed: { opacity: 0.6 },
  masonry: { flexDirection: "row", gap: space.md },
  masonryColumn: { flex: 1, gap: space.md },
  masonryCell: { borderRadius: radius.lg, overflow: "hidden" },
  corner: { position: "absolute", top: space.sm, right: space.sm },
  invite: {
    width: "100%",
    aspectRatio: 3 / 4,
    alignItems: "center",
    justifyContent: "center",
    padding: space.xxl,
    borderRadius: radius.lg,
    borderWidth: 2,
    boxShadow: "0 4px 12px rgba(20,20,20,0.12)",
  },
  spaced: { letterSpacing: 3 },
  names: { marginTop: space.lg },
  inviteDivider: { width: 64, height: 2, borderRadius: radius.full, marginVertical: space.xl },
  italic: { fontStyle: "italic", maxWidth: "85%" },
  inviteDate: { marginTop: space.xl },
  tile: { width: 132, padding: space.sm, borderRadius: radius.lg, borderWidth: 2 },
  tileSelected: { borderColor: colors.brand, backgroundColor: colors.soft },
  tileIdle: { borderColor: colors.line, backgroundColor: colors.white },
  tileCard: { aspectRatio: 3 / 4, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1 },
  tileDivider: { width: 32, height: 2, borderRadius: radius.full, marginVertical: space.sm },
  tileName: { marginTop: space.sm, paddingHorizontal: space.xs },
});
