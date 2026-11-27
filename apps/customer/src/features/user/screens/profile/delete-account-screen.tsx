import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { toApiError } from "@wedwizz/core/api/api-error";
import { deleteCustomerAccount } from "@/features/user/api/customer-profile.api";
import { useMyBookings } from "@/features/user/hooks/use-bookings";
import { useUserSession } from "@/features/user/hooks/use-user-session";
import { todayKey } from "@/features/user/lib/enquiry-templates";
import { RequireUser } from "@/features/user/routes/guards";
import { upcomingBookingCount, upcomingBookingsWarning } from "./delete-account-logic";
import { DeleteAccountView } from "./delete-account-view";

/** Web delete-account-page.tsx (/user/delete-account). Customers only. */
export function DeleteAccountScreen() {
  // Once deleted, the guard must not send the now-guest to welcome with a way back to this page.
  const [deleted, setDeleted] = useState(false);
  if (deleted) return null;
  return (
    <RequireUser>
      <DeleteAccount onDeleted={() => setDeleted(true)} />
    </RequireUser>
  );
}

function DeleteAccount({ onDeleted }: { onDeleted: () => void }) {
  const router = useRouter();
  const bookings = useMyBookings();
  const { logout } = useUserSession();
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteCustomerAccount();
    } catch (err) {
      setDeleting(false);
      Alert.alert("Couldn’t delete your account", toApiError(err).message);
      return;
    }
    // The account is gone: leave for Home as a guest, then drop this device's tokens (the server already ended the sessions).
    onDeleted();
    router.replace("/user/home");
    await logout();
    Alert.alert("Account deleted", "Your WedWizz account has been deleted.");
  };

  const confirm = () =>
    Alert.alert("Delete your account?", "This can’t be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void remove() },
    ]);

  return (
    <DeleteAccountView
      backLabel={router.canGoBack() ? "Back" : "Account settings"}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/user/account-settings"))}
      bookingsWarning={upcomingBookingsWarning(upcomingBookingCount(bookings.data, todayKey()))}
      deleting={deleting}
      onDelete={confirm}
    />
  );
}
