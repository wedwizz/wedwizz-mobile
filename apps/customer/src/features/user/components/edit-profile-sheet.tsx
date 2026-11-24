import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Button, Sheet, space } from "@wedwizz/ui";
import { toApiError } from "@wedwizz/core/api/api-error";
import type { CustomerProfile } from "@wedwizz/core/api/types";
import { useSaveCustomerProfile } from "@/features/user/hooks/use-customer-profile";
import { serverFieldErrors, toProfileForm, toSaveRequest, validateProfileForm, type ProfileFormErrors } from "@/features/user/lib/customer-profile";
import { ProfileFields } from "@/features/user/screens/auth/profile-fields";

/** "Edit profile": the setup form's fields, filled in (web profile-page EditForm). */
export function EditProfileSheet({ profile, visible, onClose }: { profile: CustomerProfile; visible: boolean; onClose: () => void }) {
  return (
    <Sheet visible={visible} title="Edit profile" onClose={onClose} scroll>
      {visible && <EditForm profile={profile} onSaved={onClose} />}
    </Sheet>
  );
}

function EditForm({ profile, onSaved }: { profile: CustomerProfile; onSaved: () => void }) {
  const saveProfile = useSaveCustomerProfile();
  const [draft, setDraft] = useState(() => toProfileForm(profile));
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [error, setError] = useState("");

  const submit = async () => {
    const next = validateProfileForm(draft);
    setErrors(next);
    setError("");
    if (Object.keys(next).length) return;
    try {
      await saveProfile.mutateAsync(toSaveRequest(draft));
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      const fieldErrors = serverFieldErrors(apiError.details);
      setErrors(fieldErrors);
      if (!Object.keys(fieldErrors).length) setError(apiError.message);
    }
  };

  return (
    <View style={styles.form}>
      <ProfileFields form={draft} errors={errors} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
      {error !== "" && (
        <AppText variant="label" color="danger" accessibilityRole="alert">
          {error}
        </AppText>
      )}
      <Button label={saveProfile.isPending ? "Saving…" : "Save changes"} loading={saveProfile.isPending} onPress={() => void submit()} fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.xl, paddingBottom: space.sm },
});
