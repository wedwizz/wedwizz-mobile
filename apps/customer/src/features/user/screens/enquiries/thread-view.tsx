import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ArrowLeft, Phone } from "lucide-react-native";
import {
  AppText,
  Button,
  ChatComposer,
  ChatThread,
  EmptyState,
  ErrorState,
  IconButton,
  InlineLink,
  LoadingState,
  Notice,
  Pill,
  Screen,
  colors,
  space,
  type ChatRow,
  type PillTone,
} from "@wedwizz/ui";

export interface ThreadContent {
  name: string;
  /** Opens the business's page; null when it has none. */
  onOpenBusiness: (() => void) | null;
  details: string;
  status: string;
  statusTone: PillTone;
  /** "You shared your number with …", "Share my number", or nothing (closed). */
  phone: { kind: "shared"; text: string } | { kind: "ask"; text: string; onShare: () => void; sharing: boolean } | null;
  phoneError: string;
  /** The booking line with "My bookings", and/or "I booked them". */
  booking: { note: string | null; onMyBookings: () => void; propose: { text: string | null; onPress: () => void } | null } | null;
  rows: ChatRow[];
  hasEarlier: boolean;
  loadingEarlier: boolean;
  onLoadEarlier: () => void;
  closedNote: string | null;
  sending: boolean;
  sendError: string;
  onSend: (text: string, clear: () => void) => void;
}

export interface ThreadViewProps {
  onBack: () => void;
  state: { kind: "loading" } | { kind: "error"; onRetry: () => void } | { kind: "not-found" } | { kind: "ready"; content: ThreadContent };
  /** The "I booked them" sheet. */
  sheet: ReactNode;
}

/** Web enquiry-thread-page.tsx: header, phone sharing and booking banners, the messages, the composer. */
export function ThreadView({ onBack, state, sheet }: ThreadViewProps) {
  if (state.kind !== "ready") {
    return (
      <Screen>
        <View style={styles.backRow}>
          <IconButton icon={ArrowLeft} label="Back to my enquiries" onPress={onBack} />
        </View>
        {state.kind === "loading" && <LoadingState cards={2} />}
        {state.kind === "error" && <ErrorState onRetry={state.onRetry} />}
        {state.kind === "not-found" && <EmptyState title="Conversation not found" body="It may belong to another account." actionLabel="My enquiries" onAction={onBack} />}
      </Screen>
    );
  }
  const c = state.content;

  const header = (
    <View style={styles.header}>
      <IconButton icon={ArrowLeft} label="Back to my enquiries" onPress={onBack} />
      <Pressable
        onPress={c.onOpenBusiness ?? undefined}
        disabled={!c.onOpenBusiness}
        accessibilityRole={c.onOpenBusiness ? "link" : undefined}
        accessibilityLabel={c.onOpenBusiness ? `${c.name}, open their page` : c.name}
        style={styles.who}
      >
        <AppText variant="subheading" numberOfLines={1}>
          {c.name}
        </AppText>
        {c.details !== "" && (
          <AppText variant="caption" color="muted" numberOfLines={1}>
            {c.details}
          </AppText>
        )}
      </Pressable>
      <Pill label={c.status} tone={c.statusTone} />
    </View>
  );

  const top = (
    <>
      {c.hasEarlier && <Button label={c.loadingEarlier ? "Loading..." : "Load earlier messages"} variant="link" disabled={c.loadingEarlier} onPress={c.onLoadEarlier} />}
      {c.phone?.kind === "shared" && (
        <Notice tone="ok">
          <AppText variant="meta" color="ok">
            {c.phone.text}
          </AppText>
        </Notice>
      )}
      {c.phone?.kind === "ask" && (
        <Notice action={<Button label="Share my number" variant="outline" size="sm" iconLeft={Phone} loading={c.phone.sharing} onPress={c.phone.onShare} />}>
          <AppText variant="meta" color="muted">
            {c.phone.text}
          </AppText>
        </Notice>
      )}
      {c.phoneError !== "" && (
        <AppText variant="meta" color="danger" align="center" accessibilityRole="alert">
          {c.phoneError}
        </AppText>
      )}
      {c.booking && (
        <Notice action={c.booking.propose ? <Button label="I booked them" variant="outline" size="sm" onPress={c.booking.propose.onPress} /> : undefined}>
          {c.booking.note && (
            <AppText variant="meta">
              {c.booking.note} <InlineLink label="My bookings" color="brand" onPress={c.booking.onMyBookings} />
            </AppText>
          )}
          {c.booking.propose?.text && (
            <AppText variant="meta" color="muted">
              {c.booking.propose.text}
            </AppText>
          )}
        </Notice>
      )}
    </>
  );

  return (
    <>
      <ChatThread
        header={header}
        rows={c.rows}
        top={top}
        onReachTop={c.hasEarlier && !c.loadingEarlier ? c.onLoadEarlier : undefined}
        composer={<ChatComposer onSend={c.onSend} sending={c.sending} closedNote={c.closedNote} error={c.sendError} />}
      />
      {sheet}
    </>
  );
}

const styles = StyleSheet.create({
  backRow: { paddingVertical: space.sm, marginLeft: -space.sm },
  header: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingHorizontal: space.sm, paddingRight: space.lg, paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: colors.line },
  who: { flex: 1, minWidth: 0 },
});
