import { StyleSheet, View } from "react-native";
import { ArrowLeft, MessageSquare } from "lucide-react-native";
import { AppText, IconButton, InboxRow, ResultsList, space, type PillTone } from "@wedwizz/ui";

export interface InboxItem {
  id: string;
  name: string;
  thumbnail: string | null;
  time: string;
  preview: string;
  status: string;
  statusTone: PillTone;
  unread: number;
}

export interface EnquiriesViewProps {
  onBack: () => void;
  state: "loading" | "error" | "empty" | "items";
  items: InboxItem[];
  onOpen: (id: string) => void;
  onRetry: () => void;
  onExplore: () => void;
  refreshing: boolean;
  onRefresh: () => void;
}

/** Web enquiries-page.tsx: the customer's conversations, most recent first. */
export function EnquiriesView(props: EnquiriesViewProps) {
  const header = (
    <View style={styles.header}>
      <View style={styles.back}>
        <IconButton icon={ArrowLeft} label="Go back" onPress={props.onBack} />
      </View>
      <AppText variant="title" accessibilityRole="header">
        My Enquiries
      </AppText>
      <AppText variant="meta" color="muted">
        Your conversations with venues and vendors.
      </AppText>
    </View>
  );
  return (
    <ResultsList
      header={header}
      state={props.state}
      items={props.items}
      keyOf={(item) => item.id}
      renderItem={(item) => (
        <InboxRow
          name={item.name}
          thumbnail={item.thumbnail}
          time={item.time}
          preview={item.preview}
          status={item.status}
          statusTone={item.statusTone}
          unread={item.unread}
          onPress={() => props.onOpen(item.id)}
        />
      )}
      onRetry={props.onRetry}
      empty={{ icon: MessageSquare, title: "No enquiries yet", body: "Message a venue or vendor from their page.", actionLabel: "Explore vendors", onAction: props.onExplore }}
      hasMore={false}
      loadingMore={false}
      loadMoreFailed={false}
      onLoadMore={() => undefined}
      refreshing={props.refreshing}
      onRefresh={props.onRefresh}
    />
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xxs, paddingBottom: space.sm },
  back: { marginLeft: -space.sm, paddingTop: space.xs, marginBottom: space.sm },
});
