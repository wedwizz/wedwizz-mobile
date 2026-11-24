import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ArrowLeft, CalendarCheck } from "lucide-react-native";
import { AppText, Button, Card, EmptyState, ErrorState, IconButton, LoadingState, Pill, Screen, Stars, colors, radius, space, type ButtonVariant, type PillTone } from "@wedwizz/ui";

export interface BookingsViewProps {
  onBack: () => void;
  state: { kind: "loading" } | { kind: "error"; onRetry: () => void } | { kind: "empty"; onEnquiries: () => void } | { kind: "ready"; cards: ReactNode[] };
  refreshing: boolean;
  onRefresh: () => void;
  /** The dispute, cancel and review sheets. */
  sheets: ReactNode;
}

/** Web bookings-page.tsx: title, the rule for when a booking counts, one card per booking. */
export function BookingsView({ onBack, state, refreshing, onRefresh, sheets }: BookingsViewProps) {
  return (
    <Screen refreshing={refreshing} onRefresh={state.kind === "ready" || state.kind === "empty" ? onRefresh : undefined}>
      <View style={styles.back}>
        <IconButton icon={ArrowLeft} label="Go back" onPress={onBack} />
      </View>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          My Bookings
        </AppText>
        <AppText variant="meta" color="muted">
          A booking counts once you and the business have both confirmed it.
        </AppText>
      </View>
      {state.kind === "loading" && <LoadingState cards={2} />}
      {state.kind === "error" && <ErrorState onRetry={state.onRetry} />}
      {state.kind === "empty" && (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings yet"
          body={'When you book a venue or vendor, tap "I booked them" in your chat with them.'}
          actionLabel="My enquiries"
          onAction={state.onEnquiries}
        />
      )}
      {state.kind === "ready" && <View style={styles.list}>{state.cards}</View>}
      {sheets}
    </Screen>
  );
}

export interface BookingCardViewProps {
  name: string;
  /** Opens the business's page; null when it has none. */
  onOpenBusiness: (() => void) | null;
  /** "Photographer · Sat, 14 Feb 2027". */
  meta: string;
  status: string;
  tone: PillTone;
  amount: string;
  note: string;
  review: { rating: number; text: string; hidden: boolean; reply: string | null } | null;
  actions: { label: string; variant: ButtonVariant; onPress: () => void; disabled?: boolean }[];
  error: string;
}

/** One booking (web BookingCard). */
export function BookingCardView(p: BookingCardViewProps) {
  return (
    <Card>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Pressable onPress={p.onOpenBusiness ?? undefined} disabled={!p.onOpenBusiness} accessibilityRole={p.onOpenBusiness ? "link" : undefined}>
            <AppText variant="cardTitle" numberOfLines={1}>
              {p.name}
            </AppText>
          </Pressable>
          <AppText variant="meta" color="muted">
            {p.meta}
          </AppText>
        </View>
        <Pill label={p.status} tone={p.tone} />
      </View>
      <AppText variant="price" style={styles.amount}>
        {p.amount}
      </AppText>
      <AppText variant="meta" color="muted" style={styles.note}>
        {p.note}
      </AppText>

      {p.review && (
        <View style={styles.review}>
          <View style={styles.reviewTop}>
            <AppText variant="caption" color="muted">
              Your review
            </AppText>
            <Stars rating={p.review.rating} />
          </View>
          <AppText variant="body">{p.review.text}</AppText>
          {p.review.hidden && (
            <AppText variant="caption" color="muted">
              Hidden by WedWizz: it does not appear on their page.
            </AppText>
          )}
          {p.review.reply && (
            <View style={styles.reply}>
              <AppText variant="body">
                <AppText variant="bodyStrong">Reply: </AppText>
                {p.review.reply}
              </AppText>
            </View>
          )}
        </View>
      )}

      {p.actions.length > 0 && (
        <View style={styles.actions}>
          {p.actions.map((a) => (
            <Button key={a.label} label={a.label} variant={a.variant} size="sm" disabled={a.disabled} onPress={a.onPress} />
          ))}
        </View>
      )}
      {p.error !== "" && (
        <AppText variant="meta" color="danger" accessibilityRole="alert" style={styles.note}>
          {p.error}
        </AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  back: { paddingTop: space.sm, marginLeft: -space.sm },
  header: { gap: space.xs, marginBottom: space.xl },
  list: { gap: space.md, paddingBottom: space.xxl },
  top: { flexDirection: "row", alignItems: "flex-start", gap: space.md },
  flex: { flex: 1, minWidth: 0 },
  amount: { marginTop: space.sm },
  note: { marginTop: space.xs },
  review: { marginTop: space.md, gap: space.xs, padding: space.md, borderRadius: radius.md, backgroundColor: colors.warm },
  reviewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reply: { marginTop: space.xs, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.line },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.md },
});
