import { useState } from "react";
import { useRouter, type Href } from "expo-router";
import { inboxTime, leadStatusLabel } from "@wedwizz/core/chat/chat-view";
import { useEnquiries } from "@/features/user/hooks/use-enquiries";
import { useGoBack } from "@/features/user/hooks/use-go-back";
import { RequireUser } from "@/features/user/routes/guards";
import { STATUS_TONE, inboxPreview } from "./chat-logic";
import { EnquiriesView } from "./enquiries-view";

/** Web enquiries-page.tsx. Customers only. Kept fresh while open (watch). */
export function EnquiriesScreen() {
  return (
    <RequireUser>
      <Enquiries />
    </RequireUser>
  );
}

function Enquiries() {
  const router = useRouter();
  const goBack = useGoBack();
  const query = useEnquiries({}, { watch: true });
  const [refreshing, setRefreshing] = useState(false);

  // Only when nothing loaded: a failed background refresh keeps showing the last inbox.
  const state = query.isPending ? "loading" : !query.data ? "error" : query.data.length === 0 ? "empty" : "items";

  return (
    <EnquiriesView
      onBack={goBack}
      state={state}
      items={(query.data ?? []).map((e) => ({
        id: e.enquiryId,
        name: e.business.name,
        thumbnail: e.business.thumbnailUrl,
        time: inboxTime(e.lastMessageAt),
        preview: inboxPreview(e.lastMessage),
        status: leadStatusLabel(e.status, "customer"),
        statusTone: STATUS_TONE[e.status],
        unread: e.unreadCount,
      }))}
      onOpen={(id) => router.push(`/user/enquiries/${id}` as Href)}
      onRetry={() => void query.refetch()}
      onExplore={() => router.navigate("/user/vendors" as Href)}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        void query.refetch().finally(() => setRefreshing(false));
      }}
    />
  );
}
