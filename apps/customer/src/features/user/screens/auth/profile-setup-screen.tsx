import { useCallback, useState } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { toApiError } from "@wedwizz/core/api/api-error";
import { useSaveCustomerProfile } from "@/features/user/hooks/use-customer-profile";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { paramString, profileSectionHref } from "@/features/user/lib/auth-gate";
import {
  emptyProfileForm,
  serverFieldErrors,
  toSaveRequest,
  validateProfileForm,
  type ProfileForm,
  type ProfileFormErrors,
} from "@/features/user/lib/customer-profile";
import { ALL_KERALA } from "@/features/user/lib/location";
import { returnPath } from "@/features/user/lib/return-path";
import { RequireUser } from "@/features/user/routes/guards";
import { useUserStore } from "@/features/user/store/user-store";
import { firstStepWithError, phoneLabel, SETUP_STEPS, stepErrors, withoutEstimates } from "./profile-setup-logic";
import { ProfileSetupView } from "./profile-setup-view";

/**
 * Web profile-setup-page.tsx: first sign-in, the customer's profile. The /user layout sends customers here until it is saved.
 * The onboarding designs split the web's one form into three steps: Continue checks the step on screen, the last step saves.
 */
export function ProfileSetupScreen() {
  return (
    <RequireUser>
      <ProfileSetup />
    </RequireUser>
  );
}

function ProfileSetup() {
  const router = useRouter();
  // `from`: the page that asked for sign-in (e.g. a vendor whose heart was tapped while signed out).
  const from = paramString(useLocalSearchParams<{ from?: string }>().from);
  const location = useUserStore((s) => s.location);
  const setLocation = useUserStore((s) => s.setLocation);
  const account = useUserSession().account;
  const saveProfile = useSaveCustomerProfile();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileForm>(() => emptyProfileForm(location === ALL_KERALA ? "" : location));
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [error, setError] = useState("");

  // Android's back button goes to the previous step; on step 1 it does what it always did.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (step === 0) return false;
        setStep(step - 1);
        return true;
      });
      return () => sub.remove();
    }, [step]),
  );

  const save = async (values: ProfileForm) => {
    const invalid = validateProfileForm(values);
    setErrors(invalid);
    setError("");
    const wrongStep = firstStepWithError(invalid);
    if (wrongStep !== null) return setStep(wrongStep);
    try {
      await saveProfile.mutateAsync(toSaveRequest(values));
      setLocation(values.city);
      router.dismissTo(returnPath(from) as "/user/home");
    } catch (err) {
      const apiError = toApiError(err);
      const fieldErrors = serverFieldErrors(apiError.details);
      setErrors(fieldErrors);
      // A field error goes back to its step; anything else shows above the button.
      const fieldStep = firstStepWithError(fieldErrors);
      if (fieldStep !== null) setStep(fieldStep);
      else setError(apiError.message);
    }
  };

  const next = () => {
    if (step === SETUP_STEPS.length - 1) return void save(form);
    const here = stepErrors(validateProfileForm(form), step);
    setErrors(here);
    setError("");
    if (!Object.keys(here).length) setStep(step + 1);
  };

  const skipEstimates = () => {
    const values = withoutEstimates(form);
    setForm(values);
    void save(values);
  };

  return (
    <ProfileSetupView
      step={step}
      form={form}
      errors={errors}
      onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
      phone={account ? phoneLabel(account.phoneNumber) : null}
      error={error}
      saving={saveProfile.isPending}
      onBack={step > 0 ? () => setStep(step - 1) : undefined}
      onNext={next}
      onSkipEstimates={skipEstimates}
      onTerms={() => router.push(profileSectionHref("terms"))}
      onPrivacy={() => router.push(profileSectionHref("privacy"))}
    />
  );
}
