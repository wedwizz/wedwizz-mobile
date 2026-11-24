import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type DimensionValue } from "react-native";
import { Sparkles, TriangleAlert, type LucideIcon } from "lucide-react-native";
import { Button } from "./button";
import { AppText } from "./text";
import { colors, radius, space } from "./tokens";

interface EmptyStateProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

/** Nothing to show yet (web EmptyState). */
export function EmptyState({ title, body, actionLabel, onAction, icon: Icon = Sparkles }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.circle, { backgroundColor: colors.tintPink }]}>
        <Icon size={28} color={colors.brand} />
      </View>
      <AppText variant="subheading" align="center" accessibilityRole="header">
        {title}
      </AppText>
      <AppText variant="body" color="muted" align="center">
        {body}
      </AppText>
      {actionLabel && onAction && <Button label={actionLabel} onPress={onAction} size="sm" style={styles.action} />}
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  body?: string;
  onRetry?: () => void;
}

/** Loading failed, with "Try again" (web ErrorState, same default texts). */
export function ErrorState({
  title = "Something went wrong",
  body = "We couldn't load this page. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <View style={[styles.circle, { backgroundColor: colors.dangerSoft }]}>
        <TriangleAlert size={28} color={colors.danger} />
      </View>
      <AppText variant="subheading" align="center">
        {title}
      </AppText>
      <AppText variant="body" color="muted" align="center">
        {body}
      </AppText>
      {onRetry && <Button label="Try again" variant="neutral" size="sm" onPress={onRetry} style={styles.action} />}
    </View>
  );
}

/** A grey block that gently pulses while content loads. */
export function Skeleton({ width = "100%", height, round = false }: { width?: DimensionValue; height: number; round?: boolean }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);
  return <Animated.View style={{ width, height, opacity, borderRadius: round ? radius.full : radius.sm, backgroundColor: colors.warm }} />;
}

/** Placeholder cards while a list loads (web LoadingState): a title bar, then cards in two columns. */
export function LoadingState({ cards = 4 }: { cards?: number }) {
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel="Loading" style={styles.loading}>
      <Skeleton width={190} height={26} round />
      <View style={styles.grid}>
        {Array.from({ length: cards }, (_, i) => (
          <View key={i} style={styles.cardSkeleton}>
            <Skeleton height={130} />
            <View style={styles.cardLines}>
              <Skeleton width="75%" height={14} round />
              <Skeleton width="50%" height={12} round />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: space.xxl, paddingVertical: space.xxxl + space.lg, gap: space.sm },
  circle: { width: 64, height: 64, borderRadius: radius.full, alignItems: "center", justifyContent: "center", marginBottom: space.sm },
  action: { marginTop: space.md },
  loading: { gap: space.xl },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  cardSkeleton: { width: "48%", flexGrow: 1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  cardLines: { padding: space.md, gap: space.sm },
});
