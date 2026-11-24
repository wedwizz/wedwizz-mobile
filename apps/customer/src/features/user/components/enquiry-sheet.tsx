import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { AppText, Button, Checkbox, DateField, SelectField, Sheet, TextField, colors, radius, space } from "@wedwizz/ui";
import { toApiError } from "@wedwizz/core/api/api-error";
import type { BudgetRange } from "@wedwizz/core/api/types";
import { useCustomerProfile } from "@/features/user/hooks/use-customer-profile";
import { useStartEnquiry } from "@/features/user/hooks/use-enquiries";
import { BUDGET_RANGE_OPTIONS } from "@/features/user/lib/customer-profile";
import { enquiryMessage, needsGuestCount, todayKey } from "@/features/user/lib/enquiry-templates";
import { composeError } from "@/features/user/screens/detail/detail-logic";
import { useUserStore } from "@/features/user/store/user-store";
import type { EnquiryDraft } from "@/features/user/types/user.types";

const MAX_LENGTH = 2000;
const NO_BUDGET = "none";
const BUDGET_OPTIONS = [{ value: NO_BUDGET, label: "Prefer not to say" }, ...BUDGET_RANGE_OPTIONS];

/** The first message to a business, or an availability check: prefilled, editable, and sent with its fields (web ComposeForm). */
function ComposeForm({ draft }: { draft: EnquiryDraft }) {
  const router = useRouter();
  const closeEnquiry = useUserStore((s) => s.closeEnquiry);
  const profileBudget = useCustomerProfile().data?.profile?.budgetRange ?? null;
  const start = useStartEnquiry();
  const today = todayKey();
  const askGuests = needsGuestCount(draft.category);

  const [date, setDate] = useState(draft.eventDate ?? "");
  const [notFixed, setNotFixed] = useState(draft.source === "AVAILABILITY_CHECK" && draft.eventDate === null);
  const [guests, setGuests] = useState(draft.guestCount ? String(draft.guestCount) : "");
  const [budget, setBudget] = useState<string>(profileBudget ?? NO_BUDGET);
  // The text follows the date and guests until the customer edits it.
  const [edited, setEdited] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const eventDate = notFixed || !date ? null : date;
  const guestCount = askGuests && guests ? Number(guests) : null;
  const kind = draft.source === "AVAILABILITY_CHECK" ? "availability" : "message";
  const message = edited ? text : enquiryMessage({ businessName: draft.name, category: draft.category, eventDate, guestCount, kind });

  const submit = () => {
    const problem = composeError({ eventDate, guestCount, message, today });
    if (problem) return setError(problem);
    setError("");
    start.mutate(
      { slug: draft.slug, text: message.trim(), source: draft.source, eventDate, guestCount, budgetRange: budget === NO_BUDGET ? null : (budget as BudgetRange) },
      {
        onSuccess: ({ enquiry }) => {
          closeEnquiry();
          router.push(`/user/enquiries/${enquiry.enquiryId}` as Href);
        },
        onError: (err) => setError(toApiError(err).message),
      },
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
      <View style={styles.to}>
        <AppText variant="caption" color="muted">
          {draft.source === "AVAILABILITY_CHECK" ? "Checking availability with" : "Message to"}
        </AppText>
        <AppText variant="bodyStrong">{draft.name}</AppText>
      </View>
      {!notFixed && <DateField label="Event date" value={date} onChange={setDate} minDate={today} />}
      {askGuests && (
        <TextField
          label="Guests"
          note="optional"
          value={guests}
          onChangeText={(v) => setGuests(v.replace(/\D/g, ""))}
          keyboardType="number-pad"
          placeholder="e.g. 400"
          maxLength={6}
        />
      )}
      <Checkbox label="Date not fixed yet" checked={notFixed} onChange={setNotFixed} />
      <SelectField label="Approximate budget" note="optional" options={BUDGET_OPTIONS} value={budget} onChange={setBudget} placeholder="Prefer not to say" />
      <TextField
        label="Message"
        value={message}
        onChangeText={(v) => {
          setEdited(true);
          setText(v);
        }}
        multiline
        maxLength={MAX_LENGTH}
        hint="Your phone number stays hidden until you choose to share it in the chat."
      />
      {error !== "" && (
        <AppText variant="label" color="danger" accessibilityRole="alert">
          {error}
        </AppText>
      )}
      <Button label={start.isPending ? "Sending..." : "Send"} loading={start.isPending} onPress={submit} fullWidth />
    </ScrollView>
  );
}

/** The compose sheet (web EnquiryModal), opened from venue and vendor pages through the user store's openEnquiry. Mounted once, in the /user layout. */
export function EnquirySheet() {
  const draft = useUserStore((s) => s.enquiryDraft);
  const closeEnquiry = useUserStore((s) => s.closeEnquiry);
  return (
    <Sheet visible={!!draft} title={draft?.source === "AVAILABILITY_CHECK" ? "Check availability" : "Send a message"} onClose={closeEnquiry}>
      {draft && <ComposeForm key={`${draft.slug}-${draft.source}-${draft.eventDate}-${draft.guestCount}`} draft={draft} />}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  form: { gap: space.lg, paddingBottom: space.sm },
  to: { backgroundColor: colors.soft, borderRadius: radius.md, paddingHorizontal: space.md + 2, paddingVertical: space.md },
});
