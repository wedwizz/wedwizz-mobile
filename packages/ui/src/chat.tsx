import { useState, type ReactNode } from "react";
import { FlatList, KeyboardAvoidingView, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Send } from "lucide-react-native";
import { Pill, type PillTone } from "./controls";
import { IconButton } from "./icon-button";
import { SafeImage } from "./safe-image";
import { AppText } from "./text";
import { colors, fonts, radius, shadow, space, type } from "./tokens";

interface InboxRowProps {
  name: string;
  thumbnail: string | null;
  time: string;
  preview: string;
  status: string;
  statusTone: PillTone;
  unread: number;
  onPress: () => void;
}

/** One conversation in My Enquiries (web inbox item): photo, name, time, last message (bold when unread), status, unread count. */
export function InboxRow({ name, thumbnail, time, preview, status, statusTone, unread, onPress }: InboxRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${status}${unread > 0 ? `, ${unread} unread` : ""}. ${preview}`}
      style={({ pressed }) => [styles.inbox, pressed && styles.pressed]}
    >
      <SafeImage source={thumbnail} alt="" style={styles.thumb} />
      <View style={styles.inboxText}>
        <View style={styles.inboxTop}>
          <AppText variant="cardTitle" numberOfLines={1} style={styles.flex}>
            {name}
          </AppText>
          <AppText variant="caption" color="muted">
            {time}
          </AppText>
        </View>
        <AppText variant={unread > 0 ? "label" : "meta"} color={unread > 0 ? "ink" : "muted"} numberOfLines={1}>
          {preview}
        </AppText>
        <View style={styles.inboxBottom}>
          <Pill label={status} tone={statusTone} />
          {unread > 0 && (
            <View style={styles.count}>
              <AppText variant="caption" color="white">
                {unread}
              </AppText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

/** A message: the customer's on the right in brand pink, the business's on the left (web thread bubble). */
export function ChatBubble({ mine, text, time, read }: { mine: boolean; text: string; time: string; read: boolean }) {
  return (
    <View style={[styles.bubbleRow, mine ? styles.right : styles.left]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <AppText variant="body" color={mine ? "white" : "ink"} selectable>
          {text}
        </AppText>
        <AppText variant="caption" color={mine ? "white" : "muted"} align="right" style={mine && styles.mineMeta}>
          {time}
          {read ? " · Read" : ""}
        </AppText>
      </View>
    </View>
  );
}

/** A centred grey line in a thread: a day ("Today") or a contact note ("You contacted them on WhatsApp · 10:42"). */
export function ChatNote({ text, strong = false }: { text: string; strong?: boolean }) {
  return (
    <AppText variant={strong ? "label" : "caption"} color="muted" align="center" style={styles.note}>
      {text}
    </AppText>
  );
}

interface ChatComposerProps {
  onSend: (text: string, clear: () => void) => void;
  sending: boolean;
  /** Shown instead of the box when the customer can't write (closed thread). */
  closedNote: string | null;
  error: string;
}

/** The box at the bottom of a thread with the Send button (web Composer). */
export function ChatComposer({ onSend, sending, closedNote, error }: ChatComposerProps) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim() || sending) return;
    onSend(text.trim(), () => setText(""));
  };
  return (
    <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      {closedNote ? (
        <AppText variant="meta" color="muted" align="center">
          {closedNote}
        </AppText>
      ) : (
        <View style={styles.composerRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a message"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Message"
            multiline
            maxLength={2000}
            style={styles.input}
          />
          <IconButton icon={Send} label="Send" variant="brand" disabled={!text.trim() || sending} onPress={send} />
        </View>
      )}
      {error !== "" && (
        <AppText variant="meta" color="danger" align="center" accessibilityRole="alert">
          {error}
        </AppText>
      )}
    </View>
  );
}

/** A soft box with a line of text and an optional action (thread banners: phone sharing, booking). */
export function Notice({ children, action, tone = "soft" }: { children: ReactNode; action?: ReactNode; tone?: "soft" | "ok" }) {
  return (
    <View style={[styles.notice, tone === "ok" && styles.noticeOk]}>
      <View style={styles.flex}>{children}</View>
      {action}
    </View>
  );
}

/** One line of a thread: a day label, a contact note, or a message (oldest first). */
export type ChatRow =
  | { type: "day"; key: string; label: string }
  | { type: "note"; key: string; text: string }
  | { type: "message"; key: string; mine: boolean; text: string; time: string; read: boolean };

interface ChatThreadProps {
  /** The bar at the top (back, business, status). */
  header: ReactNode;
  rows: ChatRow[];
  /** Above the first message (banners, "Load earlier messages"); scrolls with the thread. */
  top: ReactNode;
  /** The oldest message came into view: load earlier ones. */
  onReachTop?: () => void;
  composer: ReactNode;
}

/**
 * A conversation screen: header, the messages starting from the newest at the bottom (an inverted list, so it opens
 * at the end and stays there as messages arrive), and the composer, all above the keyboard.
 */
export function ChatThread({ header, rows, top, onReachTop, composer }: ChatThreadProps) {
  const reversed = [...rows].reverse();
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {header}
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <FlatList
          inverted
          data={reversed}
          keyExtractor={(row) => row.key}
          renderItem={({ item }) =>
            item.type === "day" ? (
              <ChatNote text={item.label} strong />
            ) : item.type === "note" ? (
              <ChatNote text={item.text} />
            ) : (
              <ChatBubble mine={item.mine} text={item.text} time={item.time} read={item.read} />
            )
          }
          ListFooterComponent={<View style={styles.top}>{top}</View>}
          onEndReached={onReachTop}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.thread}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          accessibilityLabel="Messages"
        />
        {composer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  top: { gap: space.md, paddingBottom: space.md },
  thread: { paddingHorizontal: space.lg, paddingVertical: space.md },
  flex: { flex: 1 },
  pressed: { opacity: 0.8 },
  inbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    boxShadow: shadow.card,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.md },
  inboxText: { flex: 1, gap: space.xxs },
  inboxTop: { flexDirection: "row", alignItems: "center", gap: space.sm },
  inboxBottom: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.xs },
  count: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: radius.full, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  bubbleRow: { flexDirection: "row", marginVertical: space.xs },
  right: { justifyContent: "flex-end" },
  left: { justifyContent: "flex-start" },
  bubble: { maxWidth: "80%", paddingHorizontal: space.md + 2, paddingVertical: space.sm + 2, borderRadius: radius.lg, gap: space.xxs },
  mine: { backgroundColor: colors.brand, borderBottomRightRadius: 6 },
  theirs: { backgroundColor: colors.soft, borderBottomLeftRadius: 6 },
  mineMeta: { opacity: 0.85 },
  note: { marginVertical: space.sm },
  composer: { gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.white },
  composerRow: { flexDirection: "row", alignItems: "flex-end", gap: space.sm },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 128,
    paddingHorizontal: space.md + 2,
    paddingTop: space.sm + 2,
    paddingBottom: space.sm + 2,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.lg,
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: type.body.fontSize,
  },
  notice: { flexDirection: "row", alignItems: "center", gap: space.md, backgroundColor: colors.soft, borderRadius: radius.md, paddingHorizontal: space.md + 2, paddingVertical: space.md },
  noticeOk: { backgroundColor: colors.tintMint },
});
