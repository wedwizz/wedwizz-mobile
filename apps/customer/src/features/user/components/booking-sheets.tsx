import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Button, FieldLabel, Sheet, StarPicker, TextField, space } from "@wedwizz/ui";
import { toApiError } from "@wedwizz/core/api/api-error";
import { REVIEW_MAX, reviewError } from "@/features/user/screens/bookings/booking-logic";

interface ReasonSheetProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: (reason: string | null, onError: (err: unknown) => void) => void;
  onClose: () => void;
}

/** Saying a booking wasn't made, or cancelling it: an optional reason the business sees (web ReasonSheet). */
export function ReasonSheet({ visible, title, body, confirmLabel, pending, onConfirm, onClose }: ReasonSheetProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const close = () => {
    setReason("");
    setError("");
    onClose();
  };
  const submit = () => {
    setError("");
    onConfirm(reason.trim() || null, (err) => setError(toApiError(err).message));
  };

  return (
    <Sheet visible={visible} title={title} onClose={close} scroll>
      <View style={styles.body}>
        <AppText variant="body" color="muted">
          {body}
        </AppText>
        <TextField label="Reason" note="optional, the business sees it" value={reason} onChangeText={setReason} maxLength={500} multiline />
        {error !== "" && (
          <AppText variant="label" color="danger" accessibilityRole="alert">
            {error}
          </AppText>
        )}
        <View style={styles.buttons}>
          <Button label="Back" variant="neutral" onPress={close} style={styles.flex} />
          <Button label={confirmLabel} variant="danger" loading={pending} onPress={submit} style={styles.flex} />
        </View>
      </View>
    </Sheet>
  );
}

interface ReviewSheetProps {
  businessName: string;
  visible: boolean;
  pending: boolean;
  onSubmit: (review: { rating: number; text: string }, onError: (err: unknown) => void) => void;
  onClose: () => void;
}

/** "Write a review": 1 to 5 stars and a few words, once, after the event (web ReviewSheet). */
export function ReviewSheet({ businessName, visible, pending, onSubmit, onClose }: ReviewSheetProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const close = () => {
    setRating(0);
    setText("");
    setError("");
    onClose();
  };
  const submit = () => {
    const problem = reviewError(rating, text);
    if (problem) return setError(problem);
    setError("");
    onSubmit({ rating, text: text.trim() }, (err) => setError(toApiError(err).message));
  };

  return (
    <Sheet visible={visible} title={`Review ${businessName}`} onClose={close} scroll>
      <View style={styles.body}>
        <View style={styles.group}>
          <FieldLabel label="Your rating" />
          <StarPicker value={rating} onChange={setRating} />
        </View>
        <TextField
          label="Your review"
          note="shown on their page with your first name"
          value={text}
          onChangeText={setText}
          maxLength={REVIEW_MAX}
          multiline
          hint="Reviews cannot be edited after posting."
        />
        {error !== "" && (
          <AppText variant="label" color="danger" accessibilityRole="alert">
            {error}
          </AppText>
        )}
        <Button label={pending ? "Posting..." : "Post review"} loading={pending} onPress={submit} fullWidth />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg, paddingBottom: space.sm },
  group: { gap: space.sm },
  buttons: { flexDirection: "row", gap: space.md },
  flex: { flex: 1 },
});
