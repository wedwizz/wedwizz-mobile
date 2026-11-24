import { useEffect, useRef, useState, type ReactNode } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, ChevronLeft, ChevronRight, MessageCircle, Package, Phone, Star, X } from "lucide-react-native";
import { Button } from "./button";
import { IconButton } from "./icon-button";
import { SafeImage } from "./safe-image";
import { AppText } from "./text";
import { colors, radius, shadow, space } from "./tokens";

const pageOf = (e: NativeSyntheticEvent<NativeScrollEvent>, width: number) => Math.round(e.nativeEvent.contentOffset.x / width);

interface DetailHeroProps {
  photos: string[];
  /** e.g. the listing's name: photos are read as "<alt>, photo 2". */
  alt: string;
  onOpenPhoto: (index: number) => void;
  /** Icons over the photo: left (back) and right (chat, heart, share). */
  left: ReactNode;
  right: ReactNode;
  height?: number;
}

/** The detail design's top: photos to swipe under the status bar, dots and a "1/8" counter, icons over them. */
export function DetailHero({ photos, alt, onOpenPhoto, left, right, height = 300 }: DetailHeroProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const total = height + insets.top;
  return (
    <View style={{ height: total }}>
      {photos.length === 0 ? (
        <SafeImage source={null} alt={`${alt}: photos coming soon`} style={StyleSheet.absoluteFill} />
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(src) => src}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(pageOf(e, width))}
          renderItem={({ item, index: i }) => (
            <Pressable onPress={() => onOpenPhoto(i)} accessibilityRole="imagebutton" accessibilityLabel={`Open ${alt} photo ${i + 1} full screen`}>
              <SafeImage source={item} alt="" style={{ width, height: total }} />
            </Pressable>
          )}
        />
      )}
      <View style={styles.heroWash} pointerEvents="none" />
      <View style={[styles.heroBar, { top: insets.top + space.xs }]} pointerEvents="box-none">
        {left}
        <View style={styles.heroRight}>{right}</View>
      </View>
      {photos.length > 1 && (
        <>
          <View style={styles.heroDots} pointerEvents="none">
            {photos.slice(0, 8).map((src, i) => (
              <View key={src} style={[styles.heroDot, i === Math.min(index, 7) && styles.heroDotActive]} />
            ))}
          </View>
          <View style={styles.counter} pointerEvents="none">
            <AppText variant="label" color="white">
              {index + 1}/{photos.length}
            </AppText>
          </View>
        </>
      )}
    </View>
  );
}

interface LightboxProps {
  photos: string[];
  alt: string;
  /** The photo shown, or null when closed. */
  index: number | null;
  onClose: () => void;
}

/** Full-screen photos on black, swiped or stepped with arrows, with a counter (web Lightbox). */
export function Lightbox({ photos, alt, index, onClose }: LightboxProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<string>>(null);
  const [current, setCurrent] = useState(index ?? 0);
  useEffect(() => {
    if (index !== null) setCurrent(index);
  }, [index]);
  const go = (next: number) => {
    const wrapped = (next + photos.length) % photos.length;
    setCurrent(wrapped);
    list.current?.scrollToIndex({ index: wrapped, animated: true });
  };
  return (
    <Modal visible={index !== null} animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={styles.lightbox}>
        {index !== null && (
          <FlatList
            ref={list}
            data={photos}
            keyExtractor={(src) => src}
            horizontal
            pagingEnabled
            initialScrollIndex={index}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setCurrent(pageOf(e, width))}
            renderItem={({ item, index: i }) => (
              <View style={{ width, height }}>
                <SafeImage source={item} alt={`${alt}, photo ${i + 1}`} contentFit="contain" style={StyleSheet.absoluteFill} />
              </View>
            )}
          />
        )}
        <View style={[styles.lightboxTop, { top: insets.top + space.sm }]}>
          <AppText variant="label" color="white">
            {current + 1} / {photos.length}
          </AppText>
          <IconButton icon={X} label="Close" variant="overlay" onPress={onClose} />
        </View>
        {photos.length > 1 && (
          <View style={styles.lightboxArrows} pointerEvents="box-none">
            <IconButton icon={ChevronLeft} label="Previous photo" variant="overlay" onPress={() => go(current - 1)} />
            <IconButton icon={ChevronRight} label="Next photo" variant="overlay" onPress={() => go(current + 1)} />
          </View>
        )}
      </View>
    </Modal>
  );
}

/** The pink strip of key facts under the name (detail design); the web's venue stats (capacity, type, setting, catering). */
export function StatsStrip({ items }: { items: { label: string; value: string }[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.stats}>
      {items.map((item, i) => (
        <View key={item.label} style={[styles.stat, i % 2 === 1 && styles.statDivided]} accessible accessibilityLabel={`${item.label}: ${item.value}`}>
          <AppText variant="bodyStrong" numberOfLines={2}>
            {item.value}
          </AppText>
          <AppText variant="meta" color="muted">
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** Photos two to a row, each opening the lightbox (web portfolio grid). */
export function PhotoGrid({ photos, alt, onOpen }: { photos: string[]; alt: string; onOpen: (index: number) => void }) {
  return (
    <View style={styles.grid}>
      {photos.map((src, i) => (
        <Pressable key={src} onPress={() => onOpen(i)} accessibilityRole="imagebutton" accessibilityLabel={`Open ${alt} photo ${i + 1}`} style={styles.gridCell}>
          <SafeImage source={src} alt="" style={styles.gridPhoto} />
        </Pressable>
      ))}
    </View>
  );
}

export interface PackageRowItem {
  name: string;
  items: string[];
  /** "₹25,000". */
  price: string;
  /** "per event". */
  unit: string;
}

/** The packages design: an icon, the name, its items joined by "•", and the price in an outlined pill with its unit. */
export function PackageList({ packages }: { packages: PackageRowItem[] }) {
  return (
    <View>
      {packages.map((pkg, i) => (
        <View key={`${i}-${pkg.name}`} style={[styles.pkg, i > 0 && styles.pkgDivided]}>
          <View style={styles.pkgIcon}>
            <Package size={22} color={colors.brand} />
          </View>
          <View style={styles.pkgText}>
            <AppText variant="subheading">{pkg.name}</AppText>
            {pkg.items.length > 0 && (
              <AppText variant="meta" color="muted">
                {pkg.items.join("  •  ")}
              </AppText>
            )}
          </View>
          <View style={styles.pkgPrice}>
            <View style={styles.pricePill}>
              <AppText variant="buttonSmall" color="brand">
                {pkg.price}
              </AppText>
            </View>
            <AppText variant="caption" color="muted">
              {pkg.unit}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

/** A list with green ticks (web facilities and services). */
export function CheckList({ items }: { items: string[] }) {
  return (
    <View style={styles.checks}>
      {items.map((item) => (
        <View key={item} style={styles.checkRow}>
          <Check size={17} color={colors.ok} />
          <AppText variant="body" style={styles.flex}>
            {item}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** Label over value, one under another (web detail sections' <dl>). */
export function InfoRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <View style={styles.checks}>
      {rows.map((row) => (
        <View key={row.label}>
          <AppText variant="caption" color="muted">
            {row.label}
          </AppText>
          <AppText variant="body">{row.value}</AppText>
        </View>
      ))}
    </View>
  );
}

/** Read-only stars, ★★★★☆ for 4 (web Stars). */
export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={styles.stars} accessible accessibilityLabel={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} color={n <= rating ? colors.star : colors.line} fill={n <= rating ? colors.star : "none"} />
      ))}
    </View>
  );
}

interface ReviewCardProps {
  author: string;
  rating: number;
  /** "Event in March 2026". */
  meta: string;
  text: string;
  reply: string | null;
}

/** One review with the business's reply (web ReviewsSection item). */
export function ReviewCard({ author, rating, meta, text, reply }: ReviewCardProps) {
  return (
    <View style={styles.review}>
      <View style={styles.reviewTop}>
        <AppText variant="bodyStrong" style={styles.flex} numberOfLines={1}>
          {author}
        </AppText>
        <Stars rating={rating} />
      </View>
      <AppText variant="caption" color="muted">
        {meta}
      </AppText>
      <AppText variant="body" style={styles.reviewText}>
        {text}
      </AppText>
      {reply && (
        <View style={styles.reply}>
          <AppText variant="caption" color="muted">
            Reply from the business
          </AppText>
          <AppText variant="meta">{reply}</AppText>
        </View>
      )}
    </View>
  );
}

interface ContactAction {
  onPress: () => void;
  disabled?: boolean;
  /** Ringed after logging in from it: "Tap WhatsApp to continue." */
  highlighted?: boolean;
}

interface ContactBarProps {
  onMessage: () => void;
  messageDisabled?: boolean;
  /** Only when the business shows it. */
  whatsapp?: ContactAction;
  call?: ContactAction;
  note?: { text: string; tone: "error" | "resume" | "muted" } | null;
}

/** The pinned bar at the bottom of a detail page (design): Message, WhatsApp, Call, with a note above (web ContactPanel). */
export function ContactBar({ onMessage, messageDisabled, whatsapp, call, note }: ContactBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      {note && (
        <AppText
          variant={note.tone === "muted" ? "caption" : "label"}
          color={note.tone === "error" ? "danger" : note.tone === "resume" ? "brand" : "muted"}
          align="center"
          accessibilityRole={note.tone === "error" ? "alert" : undefined}
          accessibilityLiveRegion="polite"
        >
          {note.text}
        </AppText>
      )}
      <View style={styles.barRow}>
        <Button label="Message" iconLeft={MessageCircle} onPress={onMessage} disabled={messageDisabled} style={styles.flex} />
        {whatsapp && (
          <View style={[styles.ring, whatsapp.highlighted && styles.ringOn]}>
            <IconButton icon={MessageCircle} label="WhatsApp" variant="whatsapp" diameter={52} disabled={whatsapp.disabled} onPress={whatsapp.onPress} />
          </View>
        )}
        {call && (
          <View style={[styles.ring, call.highlighted && styles.ringOn]}>
            <IconButton icon={Phone} label="Call" variant="brandOutline" diameter={52} disabled={call.disabled} onPress={call.onPress} />
          </View>
        )}
      </View>
    </View>
  );
}

/** A tick box with its label (web checkbox, e.g. "Date not fixed yet"). */
export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!checked)} accessibilityRole="checkbox" accessibilityState={{ checked }} hitSlop={6} style={styles.checkbox}>
      <View style={[styles.box, checked && styles.boxOn]}>{checked && <Check size={14} color={colors.white} strokeWidth={3} />}</View>
      <AppText variant="body">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  heroWash: { ...StyleSheet.absoluteFill, backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.25) 100%)" },
  heroBar: { position: "absolute", left: space.md, right: space.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroRight: { flexDirection: "row", gap: space.sm },
  heroDots: { position: "absolute", bottom: space.lg, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: space.xs + 2 },
  heroDot: { width: 7, height: 7, borderRadius: radius.full, backgroundColor: "rgba(255,255,255,0.85)" },
  heroDotActive: { width: 18, backgroundColor: colors.brand },
  counter: { position: "absolute", bottom: space.md, right: space.lg, paddingHorizontal: space.md, paddingVertical: space.xs, borderRadius: radius.full, backgroundColor: colors.scrim },
  lightbox: { flex: 1, backgroundColor: "#000" },
  lightboxTop: { position: "absolute", left: space.lg, right: space.lg, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  lightboxArrows: { ...StyleSheet.absoluteFill, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.md },
  stats: { flexDirection: "row", flexWrap: "wrap", backgroundColor: colors.tintPink, borderRadius: radius.lg, paddingVertical: space.sm },
  stat: { width: "50%", paddingHorizontal: space.lg, paddingVertical: space.sm, gap: space.xxs },
  statDivided: { borderLeftWidth: 1, borderLeftColor: colors.lineStrong },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  gridCell: { width: "48.5%", flexGrow: 1, borderRadius: radius.md, overflow: "hidden" },
  gridPhoto: { width: "100%", aspectRatio: 4 / 3 },
  pkg: { flexDirection: "row", alignItems: "flex-start", gap: space.md, paddingVertical: space.lg },
  pkgDivided: { borderTopWidth: 1, borderTopColor: colors.lineStrong, borderStyle: "dashed" },
  pkgIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.tintPink, alignItems: "center", justifyContent: "center" },
  pkgText: { flex: 1, gap: space.xs },
  pkgPrice: { alignItems: "center", gap: space.xxs },
  pricePill: { borderWidth: 1.5, borderColor: colors.brand, borderRadius: radius.full, paddingHorizontal: space.md, paddingVertical: space.xs },
  checks: { gap: space.md },
  checkRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  stars: { flexDirection: "row", gap: 2 },
  review: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: space.lg, gap: space.xs },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: space.sm },
  reviewText: { marginTop: space.xs },
  reply: { marginTop: space.sm, backgroundColor: colors.soft, borderRadius: radius.md, padding: space.md, gap: space.xxs },
  bar: { gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, boxShadow: shadow.raised },
  barRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  ring: { borderRadius: radius.full, padding: 2, borderWidth: 2, borderColor: "transparent" },
  ringOn: { borderColor: colors.brand },
  checkbox: { flexDirection: "row", alignItems: "center", gap: space.sm, minHeight: 36 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.lineStrong, alignItems: "center", justifyContent: "center" },
  boxOn: { backgroundColor: colors.brand, borderColor: colors.brand },
});
