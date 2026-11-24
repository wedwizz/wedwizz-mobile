import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Button, DateField, Sheet, TextField, space } from "@wedwizz/ui";
import { toApiError } from "@wedwizz/core/api/api-error";
import { todayKey } from "@/features/user/lib/enquiry-templates";
import { proposeBookingError } from "@/features/user/screens/enquiries/chat-logic";

interface ProposeBookingSheetProps {
  businessName: string;
  visible: boolean;
  /** The thread's event date, used when it isn't in the past. */
  defaultDate: string | null;
  pending: boolean;
  onSubmit: (payload: { eventDate: string; amount: number | null }, onError: (err: unknown) => void) => void;
  onClose: () => void;
}

/** "I booked them": the event date and, if agreed, the amount. The business then confirms it (web ProposeBookingSheet). */
export function ProposeBookingSheet({ businessName, visible, defaultDate, pending, onSubmit, onClose }: ProposeBookingSheetProps) {
  const today = todayKey();
  const [date, setDate] = useState(defaultDate && defaultDate >= today ? defaultDate : "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const problem = proposeBookingError(date, amount, today);
    if (problem) return setError(problem);
    setError("");
    onSubmit({ eventDate: date, amount: amount.trim() ? Number(amount) : null }, (err) => setError(toApiError(err).message));
  };

  return (
    <Sheet
      visible={visible}
      title="I booked them"
      onClose={() => {
        setError("");
        onClose();
      }}
    >
      <View style={styles.body}>
        <AppText variant="body" color="muted">
          {businessName} will be asked to confirm. Once you both have, you can review them after the event.
        </AppText>
        <DateField label="Event date" value={date} onChange={setDate} minDate={today} />
        <TextField
          label="Amount agreed (₹)"
          note="optional"
          value={amount}
          onChangeText={(v) => setAmount(v.replace(/\D/g, ""))}
          keyboardType="number-pad"
          placeholder="e.g. 150000"
          maxLength={10}
        />
        {error !== "" && (
          <AppText variant="label" color="danger" accessibilityRole="alert">
            {error}
          </AppText>
        )}
        <Button label={pending ? "Sending..." : "Ask them to confirm"} loading={pending} onPress={submit} fullWidth />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg, paddingBottom: space.sm },
});
