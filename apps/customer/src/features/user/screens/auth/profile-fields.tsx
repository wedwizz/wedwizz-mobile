import { StyleSheet, View } from "react-native";
import { AppText, ChipGroup, DateField, FieldLabel, SelectField, TextField, space, todayKey } from "@wedwizz/ui";
import type { BudgetRange, GuestRange, WeddingRole } from "@wedwizz/core/api/types";
import {
  BUDGET_RANGE_OPTIONS,
  GUEST_RANGE_OPTIONS,
  WEDDING_ROLE_OPTIONS,
  type ProfileForm,
  type ProfileFormErrors,
} from "@/features/user/lib/customer-profile";
import { KERALA_CITIES } from "@/features/user/lib/location";

interface ProfileFieldsProps {
  form: ProfileForm;
  errors: ProfileFormErrors;
  onChange: (patch: Partial<ProfileForm>) => void;
}

const CITY_OPTIONS = KERALA_CITIES.map((c) => ({ value: c as string, label: c }));
// The web's selects start with "Not sure yet" (empty), so a choice can be taken back.
const GUEST_OPTIONS: { value: GuestRange | ""; label: string }[] = [{ value: "", label: "Not sure yet" }, ...GUEST_RANGE_OPTIONS];
const BUDGET_OPTIONS: { value: BudgetRange | ""; label: string }[] = [{ value: "", label: "Not sure yet" }, ...BUDGET_RANGE_OPTIONS];

/** The profile form's inputs (web components/profile/profile-fields.tsx), shared by setup and the profile's edit sheet. */
export function ProfileFields({ form, errors, onChange }: ProfileFieldsProps) {
  return (
    <View style={styles.fields}>
      <TextField
        label="Full name"
        required
        value={form.name}
        error={errors.name}
        maxLength={80}
        onChangeText={(name) => onChange({ name })}
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
      />
      <View style={styles.group}>
        <FieldLabel label="I am the" required />
        <ChipGroup<WeddingRole>
          accessibilityLabel="I am the"
          options={WEDDING_ROLE_OPTIONS}
          value={form.weddingRole as WeddingRole}
          onChange={(weddingRole) => onChange({ weddingRole })}
        />
        {errors.weddingRole && (
          <AppText variant="meta" color="danger" accessibilityLiveRegion="polite">
            {errors.weddingRole}
          </AppText>
        )}
      </View>
      <TextField
        label="Email address"
        note="optional"
        value={form.email}
        error={errors.email}
        onChangeText={(email) => onChange({ email })}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <SelectField
        label="City"
        required
        options={CITY_OPTIONS}
        value={form.city}
        onChange={(city) => onChange({ city })}
        placeholder="Select city"
        error={errors.city}
      />
      {/* The server refuses a past date; the calendar starts at today. */}
      <DateField
        label="Wedding date"
        note="optional"
        value={form.weddingDate}
        minDate={todayKey()}
        onChange={(weddingDate) => onChange({ weddingDate })}
        error={errors.weddingDate}
      />
      <TextField
        label="Partner's name"
        note="optional"
        value={form.partnerName}
        error={errors.partnerName}
        maxLength={80}
        onChangeText={(partnerName) => onChange({ partnerName })}
        autoCapitalize="words"
      />
      <SelectField<GuestRange | "">
        label="Guests"
        note="optional"
        options={GUEST_OPTIONS}
        value={form.guestRange}
        onChange={(guestRange) => onChange({ guestRange })}
        placeholder="Not sure yet"
      />
      <SelectField<BudgetRange | "">
        label="Budget"
        note="optional"
        options={BUDGET_OPTIONS}
        value={form.budgetRange}
        onChange={(budgetRange) => onChange({ budgetRange })}
        placeholder="Not sure yet"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fields: { gap: space.lg + 2 },
  group: { gap: space.sm },
});
