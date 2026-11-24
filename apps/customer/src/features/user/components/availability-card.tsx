import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { CalendarCheck, CalendarX, CircleHelp, TriangleAlert, type LucideIcon } from "lucide-react-native";
import { AppText, Button, Card, Checkbox, DateField, TextField, colors, radius, space, type ColorToken } from "@wedwizz/ui";
import { availabilityMessage, capacityMessage, type AvailabilityTone } from "@wedwizz/core/availability/availability-view";
import { useAvailability } from "@/features/user/hooks/use-catalog";
import { useCustomerProfile } from "@/features/user/hooks/use-customer-profile";
import { useRequireLogin } from "@/features/user/hooks/use-require-login";
import { needsGuestCount, suggestedEventDate, todayKey } from "@/features/user/lib/enquiry-templates";
import { availabilityStep } from "@/features/user/screens/detail/detail-logic";
import { useUserStore } from "@/features/user/store/user-store";
import type { ContactBusiness } from "./contact";

const TONE: Record<AvailabilityTone, { icon: LucideIcon; color: ColorToken }> = {
  ok: { icon: CalendarCheck, color: "ok" },
  warn: { icon: CalendarX, color: "danger" },
  unknown: { icon: CircleHelp, color: "ink" },
};

/**
 * Web AvailabilityCard: a date (or "not fixed yet") and, for venues and caterers, a guest count. With a date it asks
 * the business's calendar (a warning only); "Ask <name>" always opens the compose sheet with a prefilled message.
 */
export function AvailabilityCard({ business }: { business: ContactBusiness }) {
  const openEnquiry = useUserStore((s) => s.openEnquiry);
  const weddingDate = useCustomerProfile().data?.profile?.weddingDate;
  const today = todayKey();
  const [date, setDate] = useState(() => suggestedEventDate(weddingDate, today) ?? "");
  const [notFixed, setNotFixed] = useState(false);
  const [guests, setGuests] = useState("");
  const [error, setError] = useState("");
  // The date and guests last checked; cleared when either changes, so a result never describes other inputs.
  const [checked, setChecked] = useState<{ date: string; guests?: number } | null>(null);
  const availability = useAvailability(business.slug, checked);
  const askGuests = needsGuestCount(business.category);
  const edit = (change: () => void) => {
    change();
    setError("");
    setChecked(null);
  };

  // Checking the calendar is open to anyone; asking needs an account. Signed out, the date and guests are kept and
  // the composer opens with them after logging in (the contact bar finishes it).
  const requireLogin = useRequireLogin();
  const ask = (eventDate: string | null, guestCount: number | null) => {
    const draft = { source: "AVAILABILITY_CHECK" as const, eventDate, guestCount };
    requireLogin({ type: "message", slug: business.slug, draft }, () => openEnquiry({ ...business, ...draft }));
  };

  const check = () => {
    const step = availabilityStep({ date, notFixed, guests, askGuests, today });
    if (step.kind === "error") return setError(step.message);
    setError("");
    if (step.kind === "ask") return ask(null, step.guestCount);
    setChecked(step.checked);
  };

  // Only a successful answer: after a failed refetch the cached one is kept, but it is no longer the answer.
  const result = availability.isSuccess ? availabilityMessage(availability.data, business.name) : null;
  const capacity = availability.isSuccess ? capacityMessage(availability.data.capacity) : null;
  const tone = result ? TONE[result.tone] : null;

  return (
    <Card>
      <View style={styles.body}>
        <View style={styles.title}>
          <CalendarCheck size={20} color={colors.brand} />
          <AppText variant="heading" accessibilityRole="header">
            Check availability
          </AppText>
        </View>
        {notFixed ? null : <DateField label="Event date" value={date} onChange={(v) => edit(() => setDate(v))} minDate={today} />}
        {askGuests && (
          <TextField
            label="Guests"
            note="optional"
            value={guests}
            onChangeText={(v) => edit(() => setGuests(v.replace(/\D/g, "")))}
            keyboardType="number-pad"
            placeholder="e.g. 400"
            maxLength={6}
          />
        )}
        <Checkbox label="Date not fixed yet" checked={notFixed} onChange={(v) => edit(() => setNotFixed(v))} />
        {error !== "" && (
          <AppText variant="label" color="danger" accessibilityRole="alert">
            {error}
          </AppText>
        )}

        {checked ? (
          <View style={styles.gap} accessibilityLiveRegion="polite">
            <View style={styles.result}>
              {availability.isPending ? (
                <AppText variant="meta" color="muted">
                  Checking the calendar...
                </AppText>
              ) : result && tone ? (
                <>
                  <View style={styles.resultTitle}>
                    <tone.icon size={17} color={colors[tone.color]} />
                    <AppText variant="bodyStrong" color={tone.color} style={styles.flex}>
                      {result.title}
                    </AppText>
                  </View>
                  <AppText variant="meta" color="muted">
                    {result.body}
                  </AppText>
                </>
              ) : (
                <AppText variant="meta" color="muted">
                  We couldn't check the calendar right now. You can still ask {business.name}.
                </AppText>
              )}
              {capacity && (
                <View style={styles.resultTitle}>
                  {capacity.warn && <TriangleAlert size={16} color={colors.danger} />}
                  <AppText variant={capacity.warn ? "label" : "meta"} color={capacity.warn ? "danger" : "muted"} style={styles.flex}>
                    {capacity.text}
                  </AppText>
                </View>
              )}
            </View>
            <Button label={`Ask ${business.name}`} onPress={() => ask(checked.date, checked.guests ?? null)} fullWidth />
          </View>
        ) : (
          <Button label={notFixed ? `Ask ${business.name}` : "Check availability"} variant="outline" onPress={check} fullWidth />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.md },
  title: { flexDirection: "row", alignItems: "center", gap: space.sm },
  gap: { gap: space.md },
  result: { backgroundColor: colors.soft, borderRadius: radius.md, padding: space.md + 2, gap: space.xs },
  resultTitle: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.xxs },
  flex: { flex: 1 },
});
