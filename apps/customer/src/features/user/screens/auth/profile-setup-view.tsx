import { StyleSheet, View } from "react-native";
import { ArrowRight, CalendarDays, Users, Wallet } from "lucide-react-native";
import type { BudgetRange, GuestRange, WeddingRole } from "@wedwizz/core/api/types";
import {
  AppText,
  Button,
  ChoiceGrid,
  EstimateCard,
  InfoNote,
  InlineLink,
  InsetDateField,
  InsetSelectField,
  InsetTextField,
  OnboardingStepLayout,
  ReadOnlyRow,
  StopSlider,
  Stepper,
  space,
  todayKey,
} from "@wedwizz/ui";
import type { ProfileForm, ProfileFormErrors } from "@/features/user/lib/customer-profile";
import { KERALA_CITIES } from "@/features/user/lib/location";
import {
  BUDGET_STOPS,
  GUEST_STOPS,
  ROLE_TILES,
  SETUP_STEPS,
  budgetSummary,
  guestStepperLabel,
  guestSummary,
  stopIndex,
} from "./profile-setup-logic";

const CITY_OPTIONS = KERALA_CITIES.map((c) => ({ value: c as string, label: c }));

export interface ProfileSetupViewProps {
  /** 0, 1 or 2. */
  step: number;
  form: ProfileForm;
  errors: ProfileFormErrors;
  onChange: (patch: Partial<ProfileForm>) => void;
  /** The signed-in number, shown on step 1; null while unknown. */
  phone: string | null;
  /** A save error that isn't about one field. */
  error: string;
  saving: boolean;
  /** Hidden on step 1: as on the web, setup has no way back into the app. */
  onBack?: () => void;
  /** Continue, or Start planning on the last step (saves). */
  onNext: () => void;
  /** "Skip for now" on the last step: saves without the estimates. */
  onSkipEstimates: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
}

/** Web profile-setup-page.tsx in the onboarding designs' three steps. */
export function ProfileSetupView(props: ProfileSetupViewProps) {
  const { step, saving } = props;
  const heading = SETUP_STEPS[step];
  const last = step === SETUP_STEPS.length - 1;
  return (
    <OnboardingStepLayout
      step={step + 1}
      total={SETUP_STEPS.length}
      onBack={props.onBack}
      kicker={heading.kicker}
      title={heading.title}
      lead={heading.lead}
      footer={
        <View>
          <View accessibilityLiveRegion="polite">
            {props.error !== "" && (
              <AppText variant="label" color="danger" style={styles.error} accessibilityRole="alert">
                {props.error}
              </AppText>
            )}
          </View>
          <Button
            label={last ? (saving ? "Saving…" : "Start planning") : "Continue"}
            variant="wine"
            iconRight={ArrowRight}
            disabled={saving}
            onPress={props.onNext}
            fullWidth
          />
        </View>
      }
    >
      {step === 0 && <AboutYou {...props} />}
      {step === 1 && <TheDay {...props} />}
      {step === 2 && <Estimates {...props} />}
    </OnboardingStepLayout>
  );
}

function AboutYou({ form, errors, onChange, phone }: ProfileSetupViewProps) {
  return (
    <>
      <ChoiceGrid<WeddingRole>
        accessibilityLabel="I am the"
        options={ROLE_TILES}
        value={form.weddingRole}
        onChange={(weddingRole) => onChange({ weddingRole })}
        error={errors.weddingRole}
      />
      <InsetTextField
        label="Full name"
        value={form.name}
        error={errors.name}
        maxLength={80}
        onChangeText={(name) => onChange({ name })}
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
      />
      <InsetTextField
        label="Email address"
        note="Optional"
        value={form.email}
        error={errors.email}
        onChangeText={(email) => onChange({ email })}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      {phone && <ReadOnlyRow label="Phone" value={phone} />}
    </>
  );
}

function TheDay({ form, errors, onChange }: ProfileSetupViewProps) {
  return (
    <>
      <InsetSelectField label="City" options={CITY_OPTIONS} value={form.city} onChange={(city) => onChange({ city })} placeholder="Select city" error={errors.city} />
      {/* The server refuses a past date; the calendar starts at today. */}
      <InsetDateField
        label="Wedding date"
        note="Optional"
        value={form.weddingDate}
        minDate={todayKey()}
        onChange={(weddingDate) => onChange({ weddingDate })}
        error={errors.weddingDate}
      />
      <InsetTextField
        label="Partner's name"
        note="Optional"
        value={form.partnerName}
        error={errors.partnerName}
        maxLength={80}
        onChangeText={(partnerName) => onChange({ partnerName })}
        autoCapitalize="words"
      />
      {form.weddingDate === "" && <InfoNote icon={CalendarDays} title="No date yet?" body="That's perfectly fine. You can still explore everything." />}
    </>
  );
}

function Estimates({ form, onChange, saving, onSkipEstimates, onTerms, onPrivacy }: ProfileSetupViewProps) {
  const guest = stopIndex(GUEST_STOPS, form.guestRange);
  const budget = stopIndex(BUDGET_STOPS, form.budgetRange);
  return (
    <>
      <EstimateCard icon={Users} label="Estimated guests" value={guestSummary(form.guestRange)}>
        <Stepper
          label="Estimated guests"
          value={guestStepperLabel(form.guestRange)}
          canDecrease={guest > 0}
          canIncrease={guest < GUEST_STOPS.length - 1}
          onDecrease={() => onChange({ guestRange: GUEST_STOPS[guest - 1] as GuestRange | "" })}
          onIncrease={() => onChange({ guestRange: GUEST_STOPS[guest + 1] as GuestRange | "" })}
        />
      </EstimateCard>
      <EstimateCard icon={Wallet} label="Estimated budget" value={budgetSummary(form.budgetRange)}>
        <StopSlider
          label="Estimated budget"
          count={BUDGET_STOPS.length}
          index={budget}
          onChange={(i) => onChange({ budgetRange: BUDGET_STOPS[i] as BudgetRange | "" })}
          valueText={budgetSummary(form.budgetRange)}
          startLabel="Not sure"
          endLabel="Above ₹10 lakh"
        />
      </EstimateCard>
      <Button label="Skip for now" variant="link" disabled={saving} onPress={onSkipEstimates} style={styles.skip} />
      <AppText variant="meta" color="muted" align="center" style={styles.legal}>
        By continuing you agree to our <InlineLink label="Terms" onPress={onTerms} /> and <InlineLink label="Privacy policy" onPress={onPrivacy} />.
      </AppText>
    </>
  );
}

const styles = StyleSheet.create({
  error: { marginBottom: space.md },
  skip: { alignSelf: "center", marginTop: space.sm },
  legal: { marginTop: space.md },
});
