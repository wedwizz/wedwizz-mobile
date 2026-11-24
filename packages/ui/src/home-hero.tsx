import { useRef, useState, type ReactNode } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View, type ImageSourcePropType, type ScrollViewInstance } from "react-native";
import { ChevronDown, ChevronLeft, ChevronRight, MapPin, MessageSquareText, Search } from "lucide-react-native";
import { Button } from "./button";
import { IconButton } from "./icon-button";
import { SafeImage } from "./safe-image";
import { Skeleton } from "./states";
import { AppText } from "./text";
import { colors, fonts, radius, shadow, space, type } from "./tokens";

/*
 * Home's pieces, styled from the home reference (design 2026-11-24): white header with the logo and a city pill,
 * a search pill, the category strip, an inset photo banner, service cards and the plum "near you" banner.
 */

export interface HeroSlide {
  image: string | number;
  alt: string;
}

interface HomeHeaderProps {
  /** The logo mark (bundled image). */
  logo: ImageSourcePropType;
  cityLabel: string;
  onPressCity: () => void;
}

/** Logo and wordmark on the left, the chosen city in an outlined pill on the right (opens the city picker). */
export function HomeHeader({ logo, cityLabel, onPressCity }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brand} accessible accessibilityRole="image" accessibilityLabel="WedWizz, your wedding planner">
        <Image source={logo} style={styles.mark} />
        <View>
          <AppText color="navy" style={styles.wordmark}>
            WEDWIZZ
          </AppText>
          <AppText variant="caption" color="navy">
            Your Wedding Planner
          </AppText>
        </View>
      </View>
      <Pressable
        onPress={onPressCity}
        accessibilityRole="button"
        accessibilityLabel={`Location: ${cityLabel}. Change location`}
        style={({ pressed }) => [styles.city, pressed && styles.pressed]}
      >
        <MapPin size={20} color={colors.white} fill={colors.brand} />
        <AppText variant="bodyStrong" numberOfLines={1} style={styles.shrink}>
          {cityLabel}
        </AppText>
        <ChevronDown size={18} color={colors.ink} />
      </Pressable>
    </View>
  );
}

interface HomeSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  /** The keyboard's search key. */
  onSubmit: () => void;
  placeholder: string;
  /** Read for the text box (web aria-label). */
  inputLabel: string;
  /** The chosen category ("All services"); tapping it opens the choices (web <select>). */
  categoryLabel: string;
  onPressCategory: () => void;
  /** The message button beside the box: its spoken label, the unread dot, and where it goes. */
  chat: { label: string; dot: boolean; onPress: () => void };
}

/** One line: a rounded-rectangle box (search icon, text box, category choice) and a square message button the same height. */
export function HomeSearchBar({ value, onChangeText, onSubmit, placeholder, inputLabel, categoryLabel, onPressCategory, chat }: HomeSearchBarProps) {
  return (
    <View style={styles.searchRow}>
      <View style={styles.search} accessibilityRole="search">
        <Search size={22} color={colors.ink} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          accessibilityLabel={inputLabel}
          returnKeyType="search"
          style={styles.input}
        />
        <Pressable
          onPress={onPressCategory}
          accessibilityRole="button"
          accessibilityLabel={`Service category: ${categoryLabel}`}
          style={({ pressed }) => [styles.category, pressed && styles.pressed]}
        >
          <AppText variant="caption" numberOfLines={1} style={styles.shrink}>
            {categoryLabel}
          </AppText>
          <ChevronDown size={14} color={colors.ink} />
        </Pressable>
      </View>
      <ChatBoxButton {...chat} />
    </View>
  );
}

/** The square message button beside a search box (Home, Vendors): 52 px, same corners and border as the box, a dot when unread. */
export function ChatBoxButton({ label, dot, onPress }: { label: string; dot: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={dot ? `${label}, unread messages` : label}
      style={({ pressed }) => [styles.chat, pressed && styles.pressed]}
    >
      <MessageSquareText size={24} color={colors.ink} />
      {dot && <View style={styles.chatDot} />}
    </Pressable>
  );
}

/** A sideways row (the categories) with a round arrow on the right that scrolls it on; the arrow goes at the end. */
export function CategoryStrip({ children, accessibilityLabel }: { children: ReactNode; accessibilityLabel?: string }) {
  const scroller = useRef<ScrollViewInstance>(null);
  const [x, setX] = useState(0);
  const [view, setView] = useState(0);
  const [content, setContent] = useState(0);
  const atEnd = x + view >= content - 4;
  return (
    <View>
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
        accessibilityLabel={accessibilityLabel}
        onLayout={(e) => setView(e.nativeEvent.layout.width)}
        onContentSizeChange={(w) => setContent(w)}
        onScroll={(e) => setX(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={32}
      >
        {children}
      </ScrollView>
      {!atEnd && view > 0 && (
        <View style={styles.stripNext} pointerEvents="box-none">
          <IconButton
            icon={ChevronRight}
            label="More categories"
            variant="surface"
            diameter={36}
            onPress={() => scroller.current?.scrollTo({ x: Math.min(x + view * 0.7, content - view), animated: true })}
          />
        </View>
      )}
    </View>
  );
}

interface HeroBannerProps {
  /** One per slide: a URL or a bundled image (require), and what the photo shows (read by screen readers). */
  slides: HeroSlide[];
  index: number;
  onChangeIndex: (index: number) => void;
  /** The small pink pill above the title ("Plan Your"). */
  kicker: string;
  title: string;
  /** The title's last word(s), in brand pink on their own line ("Wedding"). */
  titleHighlight?: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}

/** A rounded photo card inset from the edges: dark on the left for the text, arrows on both sides, dots at the bottom. */
export function HeroBanner({ slides, index, onChangeIndex, kicker, title, titleHighlight, subtitle, actionLabel, onAction }: HeroBannerProps) {
  const count = slides.length;
  const go = (step: number) => onChangeIndex((index + step + count) % count);
  return (
    <View style={styles.banner}>
      <SafeImage key={index} source={slides[index]?.image ?? null} alt={slides[index]?.alt ?? ""} style={StyleSheet.absoluteFill} />
      <View style={styles.bannerWash} pointerEvents="none" />
      <View style={[styles.bannerCopy, count > 1 && styles.bannerCopyArrows]}>
        <View style={styles.kicker}>
          <AppText variant="label" color="white">
            {kicker}
          </AppText>
        </View>
        <AppText color="white" style={styles.bannerTitle} accessibilityRole="header">
          {title}
          {titleHighlight ? <AppText color="brand" style={styles.bannerTitle}>{`\n${titleHighlight}`}</AppText> : null}
        </AppText>
        <AppText variant="meta" color="white">
          {subtitle}
        </AppText>
        <Button label={actionLabel} variant="neutral" size="sm" iconRight={ChevronRight} onPress={onAction} style={styles.bannerAction} />
      </View>
      {count > 1 && (
        <>
          <View style={[styles.arrow, styles.arrowLeft]}>
            <IconButton icon={ChevronLeft} label="Previous photo" variant="overlay" diameter={32} onPress={() => go(-1)} />
          </View>
          <View style={[styles.arrow, styles.arrowRight]}>
            <IconButton icon={ChevronRight} label="Next photo" variant="overlay" diameter={32} onPress={() => go(1)} />
          </View>
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => onChangeIndex(i)}
                accessibilityRole="button"
                accessibilityLabel={`Show slide ${i + 1}`}
                accessibilityState={{ selected: i === index }}
                hitSlop={8}
                style={styles.dotHit}
              >
                <View style={[styles.dot, i === index && styles.dotActive]} />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

interface ServiceCardProps {
  label: string;
  /** A photo, or a bundled illustration (shown whole on a pink tint). */
  image: string | number | null;
  imageFit?: "cover" | "contain";
  /** "₹50,000"; null with `priceLoading` false shows `priceNote` instead. */
  price: string | null;
  priceLoading?: boolean;
  /** Shown instead of a price ("Price on request", "No listings yet"). */
  priceNote?: string;
  width: number;
  onPress: () => void;
}

/** "Popular services": a small card with a photo, the service name and its lowest "From" price. */
export function ServiceCard({ label, image, imageFit = "cover", price, priceLoading = false, priceNote, width, onPress }: ServiceCardProps) {
  const spoken = priceLoading ? label : price ? `${label}, from ${price}` : priceNote ? `${label}, ${priceNote}` : label;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      style={({ pressed }) => [styles.service, { width }, pressed && styles.pressed]}
    >
      <View style={[styles.servicePhoto, { height: Math.round(width * 0.68) }, imageFit === "contain" && styles.serviceTint]}>
        <SafeImage
          source={image}
          alt=""
          contentFit={imageFit}
          style={imageFit === "contain" ? styles.serviceIllustration : StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.serviceBody}>
        <AppText variant="label" numberOfLines={2} style={styles.serviceName}>
          {label}
        </AppText>
        {priceLoading ? (
          <Skeleton width="80%" height={12} round />
        ) : price ? (
          // Wraps rather than cutting the price off.
          <AppText variant="caption" numberOfLines={2}>
            From{" "}
            <AppText variant="label" color="brand">
              {price}
            </AppText>
          </AppText>
        ) : priceNote ? (
          <AppText variant="caption" color="muted" numberOfLines={2}>
            {priceNote}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

interface NearbyBannerProps {
  title: string;
  body: string;
  /** The "Near me" button (wired by the app). */
  action: ReactNode;
}

/** Plum banner with a map pin: title, a line of text and the action; the action drops under the text on narrow phones. */
export function NearbyBanner({ title, body, action }: NearbyBannerProps) {
  return (
    <View style={styles.nearby}>
      <View style={styles.nearbyIcon}>
        <MapPin size={30} color={colors.white} fill={colors.brand} />
      </View>
      <View style={styles.nearbyText}>
        <AppText variant="subheading" color="white" accessibilityRole="header">
          {title}
        </AppText>
        <AppText variant="meta" color="white" style={styles.nearbyBody}>
          {body}
        </AppText>
      </View>
      <View style={styles.nearbyAction}>{action}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.sm },
  brand: { flexDirection: "row", alignItems: "center", gap: space.sm, flexShrink: 1 },
  mark: { width: 44, height: 44, borderRadius: radius.sm },
  wordmark: { fontFamily: fonts.displayHeavy, fontSize: 24, lineHeight: 28, letterSpacing: 0.5 },
  city: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs + 2,
    flexShrink: 1,
    maxWidth: 170,
    height: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    boxShadow: shadow.card,
  },
  searchRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  search: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    height: 52,
    paddingLeft: space.lg,
    paddingRight: space.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    boxShadow: shadow.card,
  },
  chat: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    boxShadow: shadow.card,
  },
  chatDot: { position: "absolute", top: 10, right: 10, width: 10, height: 10, borderRadius: radius.full, backgroundColor: colors.brand, borderWidth: 2, borderColor: colors.white },
  input: { flex: 1, minWidth: 0, height: 44, color: colors.ink, fontFamily: fonts.regular, fontSize: type.body.fontSize, padding: 0 },
  category: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xxs,
    maxWidth: 110,
    height: 36,
    paddingHorizontal: space.sm + 2,
    borderRadius: radius.sm,
    backgroundColor: colors.warm,
  },
  strip: { gap: space.xs, paddingHorizontal: space.md, paddingVertical: space.xs },
  stripNext: { position: "absolute", right: space.sm, top: 0, bottom: 0, justifyContent: "center" },
  banner: { minHeight: 210, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.ink, justifyContent: "center" },
  // Dark behind the text on the left, the photo clear on the right (home reference).
  bannerWash: {
    ...StyleSheet.absoluteFill,
    backgroundImage: "linear-gradient(90deg, rgba(20,6,18,0.88) 0%, rgba(20,6,18,0.7) 42%, rgba(20,6,18,0.15) 72%, rgba(0,0,0,0) 100%)",
  },
  bannerCopy: { width: "64%", gap: space.xs + 2, paddingVertical: space.lg, paddingLeft: space.lg },
  bannerCopyArrows: { paddingLeft: space.xxxl + space.sm },
  kicker: { alignSelf: "flex-start", paddingHorizontal: space.md, paddingVertical: space.xxs + 1, borderRadius: radius.full, backgroundColor: colors.brand },
  bannerTitle: { fontFamily: fonts.displayHeavy, fontSize: 30, lineHeight: 33 },
  bannerAction: { alignSelf: "flex-start", marginTop: space.xs, borderWidth: 0 },
  arrow: { position: "absolute", top: 0, bottom: 0, justifyContent: "center" },
  arrowLeft: { left: space.sm },
  arrowRight: { right: space.sm },
  dots: { position: "absolute", bottom: space.sm, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: space.xxs },
  dotHit: { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: "rgba(255,255,255,0.9)" },
  dotActive: { backgroundColor: colors.brand },
  service: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, overflow: "hidden", boxShadow: shadow.card },
  servicePhoto: { width: "100%", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  serviceTint: { backgroundColor: colors.tintPink },
  serviceIllustration: { width: "70%", height: "80%" },
  serviceBody: { padding: space.sm, gap: space.xs },
  serviceName: { minHeight: 36 },
  nearby: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundImage: `linear-gradient(90deg, ${colors.plum} 0%, ${colors.plumDeep} 100%)`,
    backgroundColor: colors.plum,
  },
  nearbyIcon: { width: 52, height: 52, borderRadius: radius.full, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)" },
  nearbyText: { flex: 1, minWidth: 150, gap: space.xxs },
  nearbyBody: { opacity: 0.9 },
  nearbyAction: { marginLeft: "auto" },
  shrink: { flexShrink: 1 },
  pressed: { opacity: 0.75 },
});
